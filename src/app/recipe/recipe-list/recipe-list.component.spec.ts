import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { of } from 'rxjs/internal/observable/of';
import { UOMConversion } from 'src/app/ingredient/shared/uom.emun';
import { RecipeService } from '@recipeService';
import { UserIngredientService } from '@userIngredientService';
import { UserIngredient } from 'src/app/shopping/shared/user-ingredient.model';
import { IngredientService } from '@ingredientService';
import { ImageService } from 'src/app/util/image.service';
import { User } from 'src/app/user/shared/user.model';

import { RecipeListComponent } from './recipe-list.component';
import { Recipe } from '../shared/recipe.model';
import { Ingredient } from 'src/app/ingredient/shared/ingredient.model';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CurrentUserService } from 'src/app/user/shared/current-user.service';

describe('RecipeListComponent', () => {
  let component: RecipeListComponent;
  let fixture: ComponentFixture<RecipeListComponent>;
  let currentUserService: CurrentUserService;
  let recipeService: RecipeService;
  let userIngredientService: UserIngredientService;
  let uomConversion: UOMConversion;
  let ingredientService: IngredientService;
  let imageService: ImageService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        MatTableModule
      ],
      providers: [
        UOMConversion,
        CurrentUserService,
        RecipeService,
        UserIngredientService,
        IngredientService,
        ImageService
      ],
      declarations: [
        RecipeListComponent,
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecipeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    currentUserService = TestBed.inject(CurrentUserService);
    recipeService = TestBed.inject(RecipeService);
    userIngredientService = TestBed.inject(UserIngredientService);
    uomConversion = TestBed.inject(UOMConversion);
    ingredientService = TestBed.inject(IngredientService);
    imageService = TestBed.inject(ImageService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('load', () => {
    it('should initialize the recipes list', () => {
      const recipes = [
        new Recipe({
          ingredients: [{
            id: 'ingredientId'
          }],
          categories: [{
            category: 'category'
          },
          {
            category: 'category'
          }],
          author: 'author'
        })
      ];

      const userIngredient = new UserIngredient({
        ingredients: [{
          id: 'ingredientId'
        }]
      });

      const ingredients = [
        new Ingredient({
          id: 'ingredientId'
        }),
        new Ingredient({
          id: 'ingredientId2'
        })
      ];

      spyOn(currentUserService, 'getCurrentUser').and.returnValue(of(new User({})));
      spyOn(recipeService, 'getRecipes').and.returnValue(of(recipes));
      spyOn(userIngredientService, 'getUserIngredient').and.returnValue(of(userIngredient));
      spyOn(ingredientService, 'getIngredients').and.returnValue(of(ingredients));
      spyOn(component, 'getRecipeCount');
      spyOn(imageService, 'downloadFile').and.returnValue(Promise.resolve('url'));
      spyOn(component, 'setSelectedFilterCount');

      component.load();

      expect(currentUserService.getCurrentUser).toHaveBeenCalled();
      expect(recipeService.getRecipes).toHaveBeenCalled();
      expect(userIngredientService.getUserIngredient).toHaveBeenCalled();
      expect(ingredientService.getIngredients).toHaveBeenCalled();
      expect(component.getRecipeCount).toHaveBeenCalled();
      expect(imageService.downloadFile).toHaveBeenCalled();
      expect(component.setSelectedFilterCount).toHaveBeenCalled();
    });

    it('should handle falsey values', () => {
      const recipes = [
        new Recipe({
          ingredients: [{
            id: 'ingredientId'
          }],
          categories: [],
          author: ''
        })
      ];

      const userIngredient = new UserIngredient({
        ingredients: [{
          id: 'ingredientId'
        }]
      });

      const ingredients = [
        new Ingredient({
          id: 'ingredientId'
        }),
        new Ingredient({
          id: 'ingredientId2'
        })
      ];

      spyOn(currentUserService, 'getCurrentUser').and.returnValue(of(new User({})));
      spyOn(recipeService, 'getRecipes').and.returnValue(of(recipes));
      spyOn(userIngredientService, 'getUserIngredient').and.returnValue(of(userIngredient));
      spyOn(ingredientService, 'getIngredients').and.returnValue(of(ingredients));
      spyOn(component, 'getRecipeCount');
      spyOn(imageService, 'downloadFile').and.returnValue(Promise.resolve());
      spyOn(component, 'setSelectedFilterCount');

      component.load();

      expect(currentUserService.getCurrentUser).toHaveBeenCalled();
      expect(recipeService.getRecipes).toHaveBeenCalled();
      expect(userIngredientService.getUserIngredient).toHaveBeenCalled();
      expect(ingredientService.getIngredients).toHaveBeenCalled();
      expect(component.getRecipeCount).toHaveBeenCalled();
      expect(imageService.downloadFile).toHaveBeenCalled();
      expect(component.setSelectedFilterCount).toHaveBeenCalled();
    });
  });

  describe('getRecipeCount', () => {
    it('should count the available number of recipes', () => {
      component.dataSource = new MatTableDataSource([{
        id: 'id',
        count: 1,
        ingredients: [{
          id: 'ingredientId',
          uom: 'x',
          quantity: 10
        }]
      }]);

      component.userIngredients = [{
        id: 'ingredientId',
        uom: 'y',
        amount: 2,
        pantryQuantity: 10
      }];

      spyOn(uomConversion, 'convert').and.returnValue(5);

      const result = component.getRecipeCount('id');

      expect(result).toEqual(2);
      expect(uomConversion.convert).toHaveBeenCalled();
    });

    it('should handle duplicate ingredients', () => {
      component.dataSource = new MatTableDataSource([{
        id: 'id',
        count: 1,
        ingredients: [{
          id: 'ingredientId',
          uom: 'x',
          quantity: 10
        }]
      }]);

      component.userIngredients = [{
        id: 'ingredientId',
        uom: 'y',
        amount: 2,
        pantryQuantity: 10
      },
      {
        id: 'ingredientId',
        uom: 'y',
        amount: 2,
        pantryQuantity: 10
      }];

      spyOn(uomConversion, 'convert').and.returnValue(5);

      const result = component.getRecipeCount('id');

      expect(result).toEqual(0);
      expect(uomConversion.convert).toHaveBeenCalled();
    });

    it('should handle an invalid uom conversion', () => {
      component.dataSource = new MatTableDataSource([{
        id: 'id',
        count: 1,
        ingredients: [{
          id: 'ingredientId',
          uom: 'x',
          quantity: 10
        }]
      }]);

      component.userIngredients = [{
        id: 'ingredientId',
        uom: 'y',
        amount: 2,
        pantryQuantity: 10
      }];

      spyOn(uomConversion, 'convert').and.returnValue(false);

      const result = component.getRecipeCount('id');

      expect(result).toEqual('-');
      expect(uomConversion.convert).toHaveBeenCalled();
    });

    it('should skip unavailble ingredients', () => {
      component.dataSource = new MatTableDataSource([{
        id: 'id',
        count: 1,
        ingredients: [{
          id: 'ingredientId',
          uom: 'x',
          quantity: 10
        }]
      }]);

      component.userIngredients = [{
        id: 'ingredientId2',
        uom: 'y',
        amount: 2
      }];

      spyOn(uomConversion, 'convert');

      const result = component.getRecipeCount('id');

      expect(result).toEqual(0);
      expect(uomConversion.convert).not.toHaveBeenCalled();
    });

    it('should handle   no user ingredients', () => {
      component.dataSource = new MatTableDataSource([{
        id: 'id',
        count: 1,
        ingredients: [{
          id: 'ingredientId',
          uom: 'x',
          quantity: 10
        }]
      }]);

      component.userIngredients = [];

      spyOn(uomConversion, 'convert');

      const result = component.getRecipeCount('id');

      expect(result).toEqual(0);
      expect(uomConversion.convert).not.toHaveBeenCalled();
    });
  });

  describe('setSelectedFilterCount', () => {
    it('should count the number of checked filters and set the count', () => {
      component.filtersList = [
        {
          values: [
            {checked: true},
            {checked: false}
          ]
        }
      ];

      component.setSelectedFilterCount();

      expect(component.filtersList[0].numberOfSelected).toEqual(1);
    });
  });

  describe('setFilters', () => {
    it('should set the dataSource filter from the filters list', () => {
      component.dataSource = new MatTableDataSource();
      recipeService.selectedFilters = ['test'];
      component.searchFilter = undefined;

      component.setFilters();

      expect(component.dataSource.filter).toEqual(JSON.stringify(['test']));
    });

    it('should set the dataSource filter from the filters list and search filter', () => {
      component.dataSource = new MatTableDataSource();
      recipeService.selectedFilters = ['test'];
      component.searchFilter = 'filter';

      component.setFilters();

      expect(component.dataSource.filter).toEqual(JSON.stringify(['test', 'filter']));
    });
  });

  describe('filterSelected', () => {
    beforeEach(() => {
      spyOn(component, 'setFilters');
      spyOn(component, 'setSelectedFilterCount');
    });

    it('should apply a filter', () => {
      recipeService.selectedFilters = [];

      component.filterSelected({checked: true, name: 'test'});

      expect(recipeService.selectedFilters).toContain('test');
    });

    it('should unapply a filter', () => {
      recipeService.selectedFilters = ['test'];

      component.filterSelected({checked: false, name: 'test'});

      expect(recipeService.selectedFilters).not.toContain('test');
    });

    afterEach(() => {
      expect(component.setFilters).toHaveBeenCalled();
      expect(component.setSelectedFilterCount).toHaveBeenCalled();
    });
  });

  describe('applyFilter', () => {
    it('should apply a filter', () => {
      component.dataSource = new MatTableDataSource([]);

      spyOn(component, 'setFilters');

      component.applyFilter(' VALUE ');

      expect(component.searchFilter).toEqual('value');
      expect(component.setFilters).toHaveBeenCalled();
    });
  });

  describe('indentify', () => {
    it('should return an id', () => {
      const result = component.indentify(0, {id: 1});

      expect(result).toEqual(1);
    });
  });

  describe('packageData', () => {
    it('should create a user ingredient', () => {
      component.uid = 'uid';
      component.userIngredients = [{id: 'id', pantryQuantity: 1, cartQuantity: 2, extra: ''}];

      const result = component.packageData();

      expect(result.uid).toEqual('uid');
      expect(result.ingredients[0].id).toEqual('id');
    });
  });

  describe('removeIngredients', () => {
    it('should remove an ingredient from the pantry', () => {
      component.dataSource = new MatTableDataSource([{
        id: 'id',
        count: 1,
        ingredients: [{
          id: 'ingredientId',
          uom: 'x',
          quantity: 10
        }]
      }]);

      component.userIngredients = [{
        id: 'ingredientId',
        uom: 'y',
        amount: 2
      }];

      spyOn(uomConversion, 'convert').and.returnValue(5);
      spyOn(component, 'packageData').and.returnValue(new UserIngredient({}));
      spyOn(userIngredientService, 'putUserIngredient');
      spyOn(component, 'getRecipeCount');

      component.removeIngredients('id');

      expect(uomConversion.convert).toHaveBeenCalled();
      expect(component.packageData).toHaveBeenCalled();
      expect(userIngredientService.putUserIngredient).toHaveBeenCalled();
      expect(component.getRecipeCount).toHaveBeenCalled();
    });

    it('should show an error if the uom conversion is invalid', () => {
      component.dataSource = new MatTableDataSource([{
        id: 'id',
        count: 1,
        ingredients: [{
          id: 'ingredientId',
          uom: 'x',
          quantity: 10
        }]
      }]);

      component.userIngredients = [{
        id: 'ingredientId',
        uom: 'y',
        amount: 2
      }];

      spyOn(uomConversion, 'convert').and.returnValue(false);
      spyOn(component, 'packageData').and.returnValue(new UserIngredient({}));
      spyOn(userIngredientService, 'putUserIngredient');
      spyOn(component, 'getRecipeCount');

      component.removeIngredients('id');

      expect(uomConversion.convert).toHaveBeenCalled();
      expect(component.packageData).toHaveBeenCalled();
      expect(userIngredientService.putUserIngredient).toHaveBeenCalled();
      expect(component.getRecipeCount).toHaveBeenCalled();
    });

    it('should skip ingredients that are not available', () => {
      component.dataSource = new MatTableDataSource([{
        id: 'id',
        count: 1,
        ingredients: [{
          id: 'ingredientId',
          uom: 'x',
          quantity: 10
        }]
      }]);

      component.userIngredients = [{
        id: 'ingredientId2',
        uom: 'y',
        amount: 2
      }];

      spyOn(uomConversion, 'convert');
      spyOn(component, 'packageData').and.returnValue(new UserIngredient({}));
      spyOn(userIngredientService, 'putUserIngredient');
      spyOn(component, 'getRecipeCount');

      component.removeIngredients('id');

      expect(uomConversion.convert).not.toHaveBeenCalled();
      expect(component.packageData).toHaveBeenCalled();
      expect(userIngredientService.putUserIngredient).toHaveBeenCalled();
      expect(component.getRecipeCount).toHaveBeenCalled();
    });

    it('should do nothing if recipe count if NaN', () => {
      component.dataSource = new MatTableDataSource([{id: 'id'}]);

      spyOn(uomConversion, 'convert');
      spyOn(component, 'packageData');
      spyOn(userIngredientService, 'putUserIngredient');
      spyOn(component, 'getRecipeCount');

      component.removeIngredients('id');

      expect(uomConversion.convert).not.toHaveBeenCalled();
      expect(component.packageData).not.toHaveBeenCalled();
      expect(userIngredientService.putUserIngredient).not.toHaveBeenCalled();
      expect(component.getRecipeCount).not.toHaveBeenCalled();
    });
  });

  describe('addIngredients', () => {
    it('should add an ingredient to the cart', () => {
      component.dataSource = new MatTableDataSource([{
        id: 'id',
        count: 1,
        ingredients: [{
          id: 'ingredientId',
          uom: 'x',
          quantity: 10
        }]
      }]);

      component.userIngredients = [{
        id: 'ingredientId',
        uom: 'y',
        amount: 2
      }];

      spyOn(uomConversion, 'convert').and.returnValue(5);
      spyOn(component, 'packageData').and.returnValue(new UserIngredient({}));
      spyOn(userIngredientService, 'putUserIngredient');
      spyOn(component, 'getRecipeCount');

      component.addIngredients('id');

      expect(uomConversion.convert).toHaveBeenCalled();
      expect(component.packageData).toHaveBeenCalled();
      expect(userIngredientService.putUserIngredient).toHaveBeenCalled();
      expect(component.getRecipeCount).toHaveBeenCalled();
    });

    it('should show an error if the uom conversion is invalid', () => {
       component.dataSource = new MatTableDataSource([{
        id: 'id',
        count: 1,
        ingredients: [{
          id: 'ingredientId',
          uom: 'x',
          quantity: 10
        }]
      }]);

      component.userIngredients = [{
        id: 'ingredientId'
      }];
      
      spyOn(uomConversion, 'convert').and.returnValue(false);
      spyOn(component, 'packageData').and.returnValue(new UserIngredient({}));
      spyOn(userIngredientService, 'putUserIngredient');
      spyOn(component, 'getRecipeCount');

      component.addIngredients('id');

      expect(uomConversion.convert).toHaveBeenCalled();
      expect(component.packageData).toHaveBeenCalled();
      expect(userIngredientService.putUserIngredient).toHaveBeenCalled();
      expect(component.getRecipeCount).toHaveBeenCalled();
    });

    it('should skip ingredients that are not available', () => {
      component.dataSource = new MatTableDataSource([{
        id: 'id',
        count: 1,
        ingredients: [{
          id: 'ingredientId',
          uom: 'x',
          quantity: 10
        }]
      }]);

      component.userIngredients = [{
        id: 'ingredientId2'
      }];
      
      spyOn(uomConversion, 'convert');
      spyOn(component, 'packageData').and.returnValue(new UserIngredient({}));
      spyOn(userIngredientService, 'putUserIngredient');
      spyOn(component, 'getRecipeCount');

      component.addIngredients('id');

      expect(uomConversion.convert).not.toHaveBeenCalled();
      expect(component.packageData).toHaveBeenCalled();
      expect(userIngredientService.putUserIngredient).toHaveBeenCalled();
      expect(component.getRecipeCount).toHaveBeenCalled();
    });

    it('should do nothing if recipe count is NaN', () => {
      component.dataSource = new MatTableDataSource([{id: 'id'}]);

      spyOn(uomConversion, 'convert');
      spyOn(component, 'packageData');
      spyOn(userIngredientService, 'putUserIngredient');
      spyOn(component, 'getRecipeCount');

      component.addIngredients('id');

      expect(uomConversion.convert).not.toHaveBeenCalled();
      expect(component.packageData).not.toHaveBeenCalled();
      expect(userIngredientService.putUserIngredient).not.toHaveBeenCalled();
      expect(component.getRecipeCount).not.toHaveBeenCalled();
    });
  });

  describe('recipeFilterPredicate', () => {
    it('should filter by category', () => {
      const result = component.recipeFilterPredicate({'prop': [{category: 'category-test'}]}, "[\"test\"]");

      expect(result).toBeTrue();
    });

    it('should not filter by category', () => {
      const result = component.recipeFilterPredicate({'prop': [{category: 'category'}]}, "[\"test\"]");

      expect(result).toBeFalse();
    });

    it('should filter by search', () => {
      const result = component.recipeFilterPredicate({'prop': 'filter-test'}, "[\"test\"]");

      expect(result).toBeTrue();
    });

    it('should not filter', () => {
      const result = component.recipeFilterPredicate({'prop': 'filter'}, "[\"test\"]");

      expect(result).toBeFalse();
    });

    it('should filter by rating', () => {
      const result = component.recipeFilterPredicate({'meanRating': 0}, "[\"0\"]");

      expect(result).toBeTrue();
    });
  });

  describe('onRate', () => {
    it('should call the recipe service and rate a recipe', () => {
      spyOn(recipeService, 'rateRecipe');

      component.onRate(1, new Recipe({}));

      expect(recipeService.rateRecipe).toHaveBeenCalled();
    });
  });
});
