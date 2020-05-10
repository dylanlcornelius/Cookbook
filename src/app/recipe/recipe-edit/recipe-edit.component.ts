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
import { UserService } from '@userService';

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.scss']
})
export class RecipeEditComponent implements OnInit {
  loading: Boolean = true;
  title: string;

  recipesForm: FormGroup;
  id: string;

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
    private userService: UserService,
    private recipeService: RecipeService,
    private ingredientService: IngredientService,
    private uomConversion: UOMConversion,
  ) {
    this.uoms = Object.values(UOM);
  }

  ngOnInit() {
    this.recipesForm = this.formBuilder.group({
      'name' : [null, Validators.required],
      'description' : [null],
      'time' : [''],
      'servings': ['', [Validators.min(1), Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
      'calories': ['', [Validators.min(1), Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
      'categories': this.formBuilder.array([]),
      'steps': this.formBuilder.array([
        this.initStep()
      ]),
      'ingredients': this.formBuilder.array([])
    });

    this.load();
  }

  load() {
    if (this.route.snapshot.params['id']) {
      this.recipeService.getRecipe(this.route.snapshot.params['id']).subscribe(data => {
        this.id = data.id;
        if (data.categories !== undefined) {
          for (let i = 0; i < data.categories.length; i++) {
            this.addCategory();
          }
        }
        if (data.steps !== undefined) {
          for (let i = 1; i < data.steps.length; i++) {
            this.addStep();
          }
        }
        this.addedIngredients = data.ingredients;
        this.ingredientService.getIngredients().subscribe(ingredients => {
          const added = [];
          this.addedIngredients.forEach(addedIngredient => {
            ingredients.forEach(ingredient => {
              if (ingredient.id === addedIngredient.id) {
                added.push({
                  id: ingredient.id,
                  name: ingredient.name,
                  quantity: addedIngredient.quantity || '',
                  uom: addedIngredient.uom || '',
                });
                ingredients = ingredients.filter(i => i.id !== addedIngredient.id);
              }
            });
          });

          for (let i = 0; i < added.length; i++) {
            this.addIngredient(i);
          }
          this.addedIngredients = added;
          this.recipesForm.patchValue({
            name: data.name,
            description: data.description,
            time: data.time,
            servings: data.servings,
            calories: data.calories,
            categories: data.categories,
            steps: data.steps,
            ingredients: added,
          });

          ingredients.forEach(ingredient => {
            ingredient.quantity = 0;
          });
          this.allAvailableIngredients = ingredients;
          this.availableIngredients = this.allAvailableIngredients;

          this.title = 'Edit a Recipe';
          this.loading = false;
        });
      });
    } else {
      this.ingredientService.getIngredients().subscribe(ingredients => {
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
    console.log('not spied');
    const control = <FormArray>this.recipesForm.controls['categories'];
    control.push(this.initCategory(category));
  }

  addCategoryEvent(event: MatChipInputEvent) {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
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

  dropAdded(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      this.removeIngredient(event.previousIndex);
      this.addIngredient(event.currentIndex, event.item.data);
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      this.addIngredient(event.currentIndex, event.item.data);
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
  }

  dropAvailable(event: CdkDragDrop<string[]>) {
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
    Object.values((<FormGroup> this.recipesForm.get('ingredients')).controls).forEach((ingredient: FormGroup) => {
      ingredient.removeControl('name');
    });
    this.userService.getCurrentUser().subscribe(user => {
      this.recipesForm.addControl('uid', new FormControl(user.uid));
      this.recipesForm.addControl('author', new FormControl(user.firstName + ' ' + user.lastName));

      if (this.route.snapshot.params['id']) {
        this.recipeService.putRecipe(this.id, this.recipesForm.value);
        this.router.navigate(['/recipe/detail/', this.id]);
      } else {
        const id = this.recipeService.postRecipe(this.recipesForm.value);
        this.router.navigate(['/recipe/detail/', id]);
      }
    });
  }
}
