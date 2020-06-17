import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdminDashboardComponent } from './admin-dashboard.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { ConfigService } from '../shared/config.service';
import { UserService } from '@userService';
import { RecipeService } from '@recipeService';
import { IngredientService } from '@ingredientService';
import { UserIngredientService } from '@userIngredientService';
import { UserItemService } from '@userItemService';
import { of } from 'rxjs';
import { Config } from '../shared/config.model';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let configService: ConfigService;
  let userService: UserService;
  let recipeService: RecipeService;
  let ingredientService: IngredientService;
  let userIngredientService: UserIngredientService;
  let userItemService: UserItemService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatTableModule
      ],
      declarations: [ AdminDashboardComponent ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    configService = TestBed.inject(ConfigService);
    userService = TestBed.inject(UserService);
    recipeService = TestBed.inject(RecipeService);
    ingredientService = TestBed.inject(IngredientService);
    userIngredientService = TestBed.inject(UserIngredientService);
    userItemService = TestBed.inject(UserItemService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('load', () => {
    it('should load every collection', () => {
      spyOn(configService, 'getConfigs').and.returnValue(of([]));
      spyOn(userService, 'getUsers').and.returnValue(of([]));
      spyOn(recipeService, 'getRecipes').and.returnValue(of([]));
      spyOn(ingredientService, 'getIngredients').and.returnValue(of([]));
      spyOn(userIngredientService, 'getUserIngredients').and.returnValue(of([]));
      spyOn(userItemService, 'getUserItems').and.returnValue(of([]));

      component.load();

      expect(configService.getConfigs).toHaveBeenCalled();
      expect(userService.getUsers).toHaveBeenCalled();
      expect(recipeService.getRecipes).toHaveBeenCalled();
      expect(ingredientService.getIngredients).toHaveBeenCalled();
      expect(userIngredientService.getUserIngredients).toHaveBeenCalled();
      expect(userItemService.getUserItems).toHaveBeenCalled();
    });
  });

  describe('isArray', () => {
    it('should return true if an object is an array', () => {
      const result = component.isArray([]);

      expect(result).toBeTrue();
    });

    it('should return false if an object is not an array', () => {
      const result = component.isArray({});

      expect(result).toBeFalse();
    });
  });

  describe('addConfig', () => {
    it('should create a new config', () => {
      spyOn(configService, 'postConfig');

      component.addConfig();

      expect(configService.postConfig).toHaveBeenCalled();
    });
  });

  describe('removeConfig', () => {
    it('should delete a config with a name', () => {
      component.removeConfig('id', 'name');

      expect(component.validationModalParams).toBeDefined();
    });

    it('should delete a config without a name', () => {
      component.removeConfig('id', undefined);
      
      expect(component.validationModalParams).toBeDefined();
    });
  });
  
  describe('removeConfigEvent', () => {
    it('should delete a config', () => {
      spyOn(configService, 'deleteConfig');

      component.removeConfigEvent(component, 'id');

      expect(configService.deleteConfig).toHaveBeenCalled();
    });
  })

  describe('removeUser', () => {
    it('should remove a user with a first or last name', () => {
      component.removeUser('id', undefined, 'last');

      expect(component.validationModalParams).toBeDefined();
    });

    it('should remove a user without a first or last name', () => {
      component.removeUser('id', undefined, undefined);

      expect(component.validationModalParams).toBeDefined();
    });
  });

  describe('removeUserEvent', () => {
    it('should remove a user', () => {
      spyOn(userService, 'deleteUser');

      component.removeUserEvent(component, 'id');

      expect(userService.deleteUser).toHaveBeenCalled();
    });
  });

  describe('revert', () => {
    it('should revert all changes', () => {
      component.revert();

      expect(component.validationModalParams).toBeDefined();
    });
  });

  describe('revertEvent', () => {
    it('should revert all changes', () => {
      component.originalConfigs = [new Config({})];

      component.revertEvent(component);

      expect(component.notificationModalParams).toBeDefined();
      expect(component.configContext.dataSource).toEqual(component.originalConfigs);
    });
  });

  describe('save', () => {
    it('should save all changes', () => {
      component.save();

      expect(component.validationModalParams).toBeDefined();
    });
  });

  describe('saveEvent', () => {
    it('should save all changes', () => {
      spyOn(configService, 'putConfigs');
      spyOn(userService, 'putUsers');
      spyOn(recipeService, 'putRecipes');
      spyOn(ingredientService, 'putIngredients');
      spyOn(userIngredientService, 'putUserIngredients');
      spyOn(userItemService, 'putUserItems');

      component.saveEvent(component);

      expect(configService.putConfigs).toHaveBeenCalled();
      expect(userService.putUsers).toHaveBeenCalled();
      expect(recipeService.putRecipes).toHaveBeenCalled();
      expect(ingredientService.putIngredients).toHaveBeenCalled();
      expect(userIngredientService.putUserIngredients).toHaveBeenCalled();
      expect(userItemService.putUserItems).toHaveBeenCalled();
      expect(component.notificationModalParams).toBeDefined();
    });
  });
});
