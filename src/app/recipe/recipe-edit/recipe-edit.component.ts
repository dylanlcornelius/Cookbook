import { Component, OnInit } from '@angular/core';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Router, ActivatedRoute } from '@angular/router';
import { RecipeService } from '@recipeService';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  NgForm,
  Validators,
  FormArray
} from '@angular/forms';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { IngredientService} from '../../ingredient/shared/ingredient.service';
import { MatChipInputEvent } from '@angular/material/chips';
import { UOM, UOMConversion } from 'src/app/ingredient/shared/uom.emun';
import { ErrorMatcher } from '../../util/error-matcher';
import { combineLatest } from 'rxjs';
import { Recipe } from '../shared/recipe.model';
import { CurrentUserService } from 'src/app/user/shared/current-user.service';

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.scss']
})
export class RecipeEditComponent implements OnInit {
  loading: Boolean = true;
  title: string;

  recipe: Recipe;
  recipesForm: FormGroup;

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  addedIngredients = [];
  allAvailableIngredients = [];
  availableIngredients = [];

  uoms: Array<UOM>;

  matcher = new ErrorMatcher();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private currentUserService: CurrentUserService,
    private recipeService: RecipeService,
    private ingredientService: IngredientService,
    private uomConversion: UOMConversion,
  ) {
    this.uoms = Object.values(UOM);
  }

  ngOnInit() {
    this.recipesForm = this.formBuilder.group({
      'name': [null, Validators.required],
      'link': [null],
      'description': [null],
      'time': [''],
      'servings': ['', [Validators.min(1), Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
      'calories': ['', [Validators.min(1), Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
      'categories': this.formBuilder.array([]),
      'steps': this.formBuilder.array([this.initStep()]),
      'ingredients': this.formBuilder.array([])
    });

    this.load();
  }

  load() {
    const ingredients$ = this.ingredientService.getIngredients();

    if (this.route.snapshot.params['id']) {
      const recipe$ = this.recipeService.getRecipe(this.route.snapshot.params['id']);

      combineLatest(recipe$, ingredients$).subscribe(([recipe, ingredients]) => {
        this.recipe = recipe;

        recipe.categories.forEach(() => {
          this.addCategory();
        });
        recipe.steps.forEach(() => {
          this.addStep();
        });

        // figure out already added ingredients
        this.addedIngredients = this.ingredientService.buildRecipeIngredients(recipe.ingredients, ingredients);
        for (let i = 0; i < this.addedIngredients.length; i++) {
          this.addIngredient(i);
        }

        this.recipesForm.patchValue({
          name: recipe.name,
          link: recipe.link,
          description: recipe.description,
          time: recipe.time,
          servings: recipe.servings,
          calories: recipe.calories,
          categories: recipe.categories,
          steps: recipe.steps,
          ingredients: this.addedIngredients,
        });

        // figure out available ingredients
        this.allAvailableIngredients = ingredients.reduce((result, ingredient) => {
          const currentIngredient = this.addedIngredients.find(addedIngredient => addedIngredient.id === ingredient.id);
          if (!currentIngredient) {
            result.push({
              ...ingredient,
              quantity: 0
            })
          }
          return result;
        }, []);
        this.availableIngredients = this.allAvailableIngredients;

        this.title = 'Edit a Recipe';
        this.loading = false;
      });
    } else {
      ingredients$.subscribe(ingredients => {
        ingredients.forEach(ingredient => {
          this.allAvailableIngredients.push({
            id: ingredient.id,
            name: ingredient.name,
            amount: ingredient.amount,
            uom: ingredient.uom,
            quantity: 0
          });
        });

        this.availableIngredients = this.allAvailableIngredients;

        this.title = 'Add a new Recipe';
        this.loading = false;
      });
    }
  }

  initCategory(category: string) {
    return this.formBuilder.group({
      category: category
    });
  }

  addCategory(category?: string) {
    const control = <FormArray>this.recipesForm.controls['categories'];
    control.push(this.initCategory(category));
  }

  addCategoryEvent(event) {
    const input = event.input;
    const value = event.value;

    if (value && value.trim()) {
      this.addCategory(value.trim());
    }

    if (input) {
      input.value = '';
    }
  }

  removeCategory(i: number) {
    const control = <FormArray>this.recipesForm.controls['categories'];
    control.removeAt(i);
  }

  initStep() {
    return this.formBuilder.group({
      step: [null]
    });
  }

  addStep() {
    const control = <FormArray>this.recipesForm.controls['steps'];
    control.push(this.initStep());
  }

  removeStep(i: number) {
    const control = <FormArray>this.recipesForm.controls['steps'];
    control.removeAt(i);
  }

  dropAdded(event) {
    if (event.previousContainer === event.container) {
      this.removeIngredient(event.previousIndex);
      this.addIngredient(event.currentIndex, event.item.data);
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      this.addIngredient(event.currentIndex, event.item.data);
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
  }

  dropAvailable(event) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
      this.removeIngredient(event.previousIndex);
    }
  }

  initIngredient() {
    return this.formBuilder.group({
      id: [null],
      quantity: [null, [Validators.required, Validators.min(0.00001), Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      uom: [null, [Validators.required]],
      name: [null],
    });
  }

  addIngredient(index, data?) {
    const control = <FormArray>this.recipesForm.controls['ingredients'];
    const ingredientControl = this.initIngredient();
    if (data) {
      ingredientControl.patchValue({
        id: data.id,
        name: data.name,
        quantity: data.quantity,
        uom: data.uom,
      });
    }
    control.insert(index, ingredientControl);
  }

  removeIngredient(i: number) {
    const control = <FormArray>this.recipesForm.controls['ingredients'];
    control.removeAt(i);
  }

  getUOMs(uom: UOM) {
    if (uom) {
      return this.uomConversion.relatedUOMs(uom);
    }
  }

  applyIngredientFilter(filterValue: string) {
    const filter = filterValue.trim().toLowerCase();

    this.availableIngredients = this.allAvailableIngredients.filter(ingredient => {
      return ingredient.name.toLowerCase().includes(filter) && !this.addedIngredients.find(addedIngredient => {
          return ingredient.id === addedIngredient.id;
      });
    });
  }

  submitForm() {
    this.currentUserService.getCurrentUser().subscribe(user => {
      const form = this.recipesForm.value;

      form.meanRating = this.recipe.meanRating;
      form.ratings = this.recipe.ratings;
      form.uid = user.uid;
      form.author = user.firstName + ' ' + user.lastName;
      form.ingredients.forEach(ingredient => {
        delete ingredient.name;
      });

      if (this.route.snapshot.params['id']) {
        this.recipeService.putRecipe(this.recipe.id, form);
        this.router.navigate(['/recipe/detail/', this.recipe.id]);
      } else {
        const id = this.recipeService.postRecipe(form);
        this.router.navigate(['/recipe/detail/', id]);
      }
    });
  }
}
