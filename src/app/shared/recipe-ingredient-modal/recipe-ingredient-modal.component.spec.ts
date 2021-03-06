import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Ingredient } from '@ingredient';
import { UserIngredient } from '@userIngredient';
import { UOMConversion } from '@UOMConverson';
import { RecipeIngredientService } from '@recipeIngredientService';
import { ModalComponent } from 'src/app/shared/modal/modal.component';

import { RecipeIngredientModalComponent } from './recipe-ingredient-modal.component';
import { RecipeIngredientModal } from '@recipeIngredientModal';

describe('RecipeIngredientModalComponent', () => {
  let component: RecipeIngredientModalComponent;
  let fixture: ComponentFixture<RecipeIngredientModalComponent>;
  let recipeIngredientServce: RecipeIngredientService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        RecipeIngredientModalComponent,
        ModalComponent
      ],
      providers: [
        UOMConversion
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecipeIngredientModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    recipeIngredientServce = TestBed.inject(RecipeIngredientService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('select', () => {
    it('should add when selected', () => {
      component.selectionCount = 0;

      component.select(true);

      expect(component.selectionCount).toEqual(1);
    });

    it('should subtract when unselected', () => {
      component.selectionCount = 1;

      component.select(false);

      expect(component.selectionCount).toEqual(0);
    });
  });

  describe('add', () => {
    const userIngredient = new UserIngredient({});
    const defaultShoppingList = 'default';

    beforeEach(() => {
      const recipeIngredientModal = new RecipeIngredientModal(
        (_self, _ingredients) => {},
        [new Ingredient({})],
        userIngredient,
        defaultShoppingList,
        this
      );
      recipeIngredientServce.setModal(recipeIngredientModal);

      spyOn(recipeIngredientServce, 'getModal');
    });

    it('should use all ingredients', () => {
      component.params.ingredients = [new Ingredient({})];

      spyOn(component.params, 'function');
      spyOn(component.modal, 'close');

      component.add();

      expect(component.params.function).toHaveBeenCalledWith(this, component.params.ingredients, component.params.userIngredient, component.params.defaultShoppingList);
      expect(component.modal.close).toHaveBeenCalled();
    });

    it('should use only selected ingredients', () => {
      const ingredient1 = new Ingredient({});
      ingredient1.selected = true;

      const ingredient2 = new Ingredient({});
      ingredient2.selected = false;

      component.params.ingredients = [ingredient1, ingredient2];

      spyOn(component.params, 'function');
      spyOn(component.modal, 'close');

      component.add();

      expect(component.params.function).toHaveBeenCalledWith(this, [ingredient1], component.params.userIngredient, component.params.defaultShoppingList);
      expect(component.modal.close).toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('should close the modal', () => {
      spyOn(component.modal, 'close');

      component.cancel();

      expect(component.modal.close).toHaveBeenCalled();
    });
  });
});
