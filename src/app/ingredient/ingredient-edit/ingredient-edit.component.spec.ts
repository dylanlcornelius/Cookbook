import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, NgForm } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IngredientService } from '@ingredientService';

import { IngredientEditComponent } from './ingredient-edit.component';
import { Ingredient } from '../shared/ingredient.model';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IngredientDetailComponent } from '../ingredient-detail/ingredient-detail.component';
import { of } from 'rxjs';

describe('IngredientEditComponent', () => {
  let component: IngredientEditComponent;
  let fixture: ComponentFixture<IngredientEditComponent>;
  let ingredientService: IngredientService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([
          {path: 'ingredient/detail/:id', component: IngredientDetailComponent}
        ]),
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatSelectModule,
        BrowserAnimationsModule
      ],
      declarations: [ IngredientEditComponent ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IngredientEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    ingredientService = TestBed.inject(IngredientService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get an ingredient', () => {
    const route = TestBed.inject(ActivatedRoute);
    route.snapshot.params = {id: 'testId'};

    spyOn(ingredientService, 'getIngredient').and.returnValue(of(new Ingredient({})));

    fixture = TestBed.createComponent(IngredientEditComponent);
    fixture.detectChanges();

    expect(ingredientService.getIngredient).toHaveBeenCalled();
  });

  describe('onFormSubmit', () => {
    it('should update an ingredient', () => {
      component.id = 'testId';
      const route = TestBed.inject(ActivatedRoute);
      route.snapshot.params = {id: 'testId'};
      const router = TestBed.inject(Router);

      spyOn(ingredientService, 'putIngredient');
      spyOn(router, 'navigate');

      component.onFormSubmit(new NgForm([], []));

      expect(ingredientService.putIngredient).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalled();
    });

    it('should create an ingredient', () => {
      const router = TestBed.inject(Router);

      spyOn(ingredientService, 'postIngredient').and.returnValue('testId');
      spyOn(router, 'navigate');

      component.onFormSubmit(new NgForm([], []));

      expect(ingredientService.postIngredient).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalled();
    });
  });
});
