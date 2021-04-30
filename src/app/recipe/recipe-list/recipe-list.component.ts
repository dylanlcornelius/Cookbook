import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { RecipeService } from '@recipeService';
import { UserIngredientService } from '@userIngredientService';
import { UOMConversion } from 'src/app/ingredient/shared/uom.emun';
import { IngredientService } from '@ingredientService';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { ImageService } from '@imageService';
import { combineLatest, Subject } from 'rxjs';
import { CurrentUserService } from '@currentUserService';
import { takeUntil } from 'rxjs/operators';
import { Recipe } from '@recipe';
import { NotificationService } from '@notificationService';
import { FailureNotification, InfoNotification, SuccessNotification } from '@notification';
import { UtilService } from '@utilService';
import { User } from '@user';
import { RecipeHistoryService } from '@recipeHistoryService';
import { RecipeFilterService, AuthorFilter, CategoryFilter, RatingFilter, SearchFilter } from '@recipeFilterService';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.scss']
})
export class RecipeListComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  loading: Boolean = true;
  recipeIngredientModalParams;

  user: User;

  filtersList = [];
  searchFilter = '';

  dataSource;
  id: string;
  userIngredients;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private router: Router,
    private recipeService: RecipeService,
    private recipeFilterService: RecipeFilterService,
    private userIngredientService: UserIngredientService,
    private ingredientService: IngredientService,
    private recipeHistoryService: RecipeHistoryService,
    private uomConversion: UOMConversion,
    private imageService: ImageService,
    private currentUserService: CurrentUserService,
    private notificationService: NotificationService,
    private utilService: UtilService,
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  identify = this.utilService.identify;

  ngOnInit() {
    this.load();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  load() {
    const user$ = this.currentUserService.getCurrentUser();
    const recipes$ = this.recipeService.get();
    const ingredients$ = this.ingredientService.get();

    combineLatest([user$, recipes$, ingredients$]).pipe(takeUntil(this.unsubscribe$)).subscribe(([user, recipes, ingredients]) => {
      this.user = user;

      this.userIngredientService.get(this.user.defaultShoppingList).pipe(takeUntil(this.unsubscribe$)).subscribe(userIngredient => {
        this.id = userIngredient.id;
        this.userIngredients = userIngredient.ingredients;
        ingredients.forEach(ingredient => {
          userIngredient.ingredients.forEach(myIngredient => {
            if (ingredient.id === myIngredient.id) {
              myIngredient.uom = ingredient.uom;
              myIngredient.amount = ingredient.amount;
            }
          });

          recipes.forEach(recipe => {
            recipe.ingredients.forEach(recipeIngredient => {
              if (ingredient.id === recipeIngredient.id) {
                recipeIngredient.amount = ingredient.amount;
                recipeIngredient.name = ingredient.name;
              }
            });
          });
        });

        // account for deleted ingredients
        recipes.forEach(recipe => {
          recipe.ingredients.forEach(recipeIngredient => {
            if (!recipeIngredient.name) {
              recipeIngredient.name = null;
            }
          });
        });

        const filters = this.recipeFilterService.selectedFilters.slice();

        recipes = recipes.sort(this.sortRecipesByName);
        recipes = recipes.sort(this.sortRecipesByImages);
        this.dataSource = new MatTableDataSource(recipes);
        const ratings = [];
        [1, 2, 3].forEach(ratingOption => {
          const rating = ratingOption / 3 * 100;
          let displayValue = '';
          for (let i = 0; i < ratingOption; i++) {
            displayValue += '★';
          }
          
          const checked = filters.find(f => f.value === rating) !== undefined;
          ratings.push({ displayName: displayValue + ' & Up', name: rating, checked: checked, filter: new RatingFilter(rating) });
        });

        const categories = [];
        const authors = [];
        recipes.forEach(recipe => {
          recipe.count = this.getRecipeCount(recipe.id);
          this.imageService.download(recipe).then(url => {
            if (url) {
              recipe.image = url;
            }
          }, () => {});

          recipe.categories.forEach(({ category }) => {
            if (categories.find(c => c.name === category) === undefined) {
              const checked = filters.find(f => f.value === category) !== undefined;
              categories.push({ displayName: category, name: category, checked: checked, filter: new CategoryFilter(category) });
            }
          });

          if (authors.find(a => a.name === recipe.author) === undefined && recipe.author !== '') {
            const checked = filters.find(f => f.value === recipe.author) !== undefined;
            authors.push({ displayName: recipe.author, name: recipe.author, checked: checked, filter: new AuthorFilter(recipe.author) });
          }
        });
        this.dataSource = new MatTableDataSource(recipes);
        this.dataSource.filterPredicate = this.recipeFilterService.recipeFilterPredicate;

        authors.sort(({ name: a }, { name: b }) => a.localeCompare(b));
        categories.sort(({ name: a }, { name: b }) => a.localeCompare(b));
        this.filtersList = [
          { displayName: 'Authors', name: 'author', values: authors },
          { displayName: 'Categories', name: 'categories', values: categories },
          { displayName: 'Ratings', name: 'ratings', values: ratings }
        ];
        this.setSelectedFilterCount();
        this.dataSource.filter = filters;
        this.dataSource.paginator = this.paginator;

        this.loading = false;
      });
    });
  }

  getRecipeCount(id) {
    let recipeCount;
    let ingredientCount = 0;
    const recipe = this.dataSource.data.find(x => x.id === id);
    if (recipe.ingredients.length === 0 || this.userIngredients.length === 0) {
      return 0;
    }
    recipe.ingredients.forEach(recipeIngredient => {
      // handle deleted ingredients
      if (recipeIngredient.name === null) {
        ingredientCount++;
        return;
      }

      this.userIngredients.forEach(ingredient => {
        if (recipeIngredient.id === ingredient.id) {
          ingredientCount++;
          const value = this.uomConversion.convert(recipeIngredient.uom, ingredient.uom, Number(recipeIngredient.quantity));
          if (value && (Number(ingredient.pantryQuantity) / Number(value) < recipeCount || recipeCount === undefined)) {
            recipeCount = Math.floor(Number(ingredient.pantryQuantity) / Number(value));
          }
        }
      });
    });

    // user doesn't have all recipe ingredients
    if (ingredientCount !== recipe.ingredients.length || recipeCount === undefined) {
      return 0;
    }
    return recipeCount;
  }

  setSelectedFilterCount() {
    this.filtersList.forEach(filterList => {
      let i = 0;
      filterList.values.forEach(filter => {
        if (filter.checked) {
          i++;
        }
      });
      filterList.numberOfSelected = i;
    });
  }

  setFilters() {
    const filters = this.recipeFilterService.selectedFilters.slice();
    if (this.searchFilter) {
      filters.push(new SearchFilter(this.searchFilter));
    }
    this.dataSource.filter = filters;
  }

  filterSelected(selectedFilter) {
    if (selectedFilter.checked) {
      this.recipeFilterService.selectedFilters.push(selectedFilter.filter);
    } else {
      this.recipeFilterService.selectedFilters = this.recipeFilterService.selectedFilters.filter(f => selectedFilter.filter !== f );
    }

    this.setSelectedFilterCount();
    this.setFilters();
  }

  applyFilter(filterValue: string) {
    this.searchFilter = filterValue.trim().toLowerCase();
    this.setFilters();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  sortRecipesByName(a: Recipe, b: Recipe) {
    return a.name.localeCompare(b.name);
  }

  sortRecipesByImages(a: Recipe, b: Recipe) {
    if (a.hasImage && b.hasImage) {
      return 0;
    }
    
    if (a.hasImage) {
      return -1;
    }

    if (b.hasImage) {
      return 1;
    }

    return 0;
  }

  removeIngredients(id) {
    const currentRecipe = this.dataSource.data.find(x => x.id === id);
    if (currentRecipe.ingredients) {
      currentRecipe.ingredients.forEach(recipeIngredient => {
        this.userIngredients.forEach(ingredient => {
          if (recipeIngredient.id === ingredient.id) {
            const value = this.uomConversion.convert(recipeIngredient.uom, ingredient.uom, Number(recipeIngredient.quantity));
            if (value) {
              ingredient.pantryQuantity = Math.min(ingredient.pantryQuantity - Number(value), 0);
            } else {
              this.notificationService.setNotification(new FailureNotification('Calculation error!'));
            }
          }
        });
      });
      this.userIngredientService.formattedUpdate(this.userIngredients, this.user.defaultShoppingList, this.id);

      this.dataSource.data.forEach(recipe => {
        recipe.count = this.getRecipeCount(recipe.id);
      });

    }

    this.recipeHistoryService.add(this.user.defaultShoppingList, id);
    this.notificationService.setNotification(new SuccessNotification('Recipe cooked!'));
  }

  addIngredients(id) {
    const currentRecipe = this.dataSource.data.find(x => x.id === id);
    if (!Number.isNaN(currentRecipe.count) && currentRecipe.ingredients && currentRecipe.ingredients.length > 0) {
      this.recipeIngredientModalParams = {
        function: this.addIngredientsEvent,
        ingredients: currentRecipe.ingredients,
        self: this
      };
    } else if (currentRecipe.ingredients && currentRecipe.ingredients.length === 0) {
      this.notificationService.setNotification(new InfoNotification('Recipe has no ingredients'));
    }
  }

  addIngredientsEvent(self, ingredients) {
    ingredients.forEach(recipeIngredient => {
      let hasIngredient = false;
      self.userIngredients.forEach(ingredient => {
        if (recipeIngredient.id === ingredient.id) {
          const value = self.uomConversion.convert(recipeIngredient.uom, ingredient.uom, Number(recipeIngredient.quantity));
          if (value) {
            ingredient.cartQuantity += ingredient.amount * Math.ceil(Number(value) / ingredient.amount);
          } else {
            self.notificationService.setNotification(new FailureNotification('Calculation error!'));
          }
          hasIngredient = true;
        }
      });
      if (!hasIngredient) {
        self.userIngredients.push({
          id: String(recipeIngredient.id),
          pantryQuantity: 0,
          cartQuantity: Number(recipeIngredient.amount)
        });
      }
    });

    self.userIngredientService.formattedUpdate(self.userIngredients, self.user.defaultShoppingList, self.id);
    self.dataSource.data.forEach(recipe => {
      recipe.count = self.getRecipeCount(recipe.id);
    });

    self.notificationService.setNotification(new SuccessNotification('Added to list!'));
  }

  onRate(rating, recipe) {
    this.recipeService.rateRecipe(rating, this.user.uid, recipe);
  }
}
