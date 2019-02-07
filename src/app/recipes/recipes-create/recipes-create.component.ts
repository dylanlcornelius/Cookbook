import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormControl,
  FormGroupDirective,
  FormBuilder,
  FormGroup,
  NgForm,
  Validators,
  FormArray,
  NgModel} from '@angular/forms';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { RecipesService } from '../recipes.service';
import { IngredientsService} from '../../ingredients/ingredients.service';

@Component({
  selector: 'app-recipes-create',
  templateUrl: './recipes-create.component.html',
  styleUrls: ['./recipes-create.component.css']
})
export class RecipesCreateComponent implements OnInit {

  recipesForm: FormGroup;
  stepsForm: FormGroup;
  name: string;
  description: string;
  time: number;
  servings: number;
  calories: number;
  // quantity: number;
  steps: Array<{step: string}>;

  // TODO: get/show all ingredients,
  // make master-detail for recipes-ingredients service,
  // figure out how to save things from parent component
  addedIngredients = [];
  availableIngredients = [];

  constructor(private router: Router,
    private recipesService: RecipesService,
    private ingredientsService: IngredientsService,
    private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.initIngredients();

    this.recipesForm = this.formBuilder.group({
      'name': [null, Validators.required],
      'description' : [null],
      'time': ['', [Validators.min(1), Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
      'servings': ['', [Validators.min(1), Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
      'calories': ['', [Validators.min(1), Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
      // 'quantity': ['', [Validators.min(1), Validators.pattern(/^-?(0|[1-9]\d*)?$/)]]
      'steps': this.formBuilder.array([
        this.initStep()
      ]),
    });
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

  initIngredients() {
    this.ingredientsService.getIngredients()
      .subscribe(data => {
        // data.forEach(d => {
        //   this.ingredients.push({key: d.key, value: false});
        // });
        this.availableIngredients = data;
        // console.log(this.availableIngredients);
      });
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
  }

  // TODO: combine submitForm and onFormSubmit into one?
  submitForm() {
    this.recipesForm.addControl('ingredients', new FormArray(this.addedIngredients.map(c => new FormControl({name: c.name, key: c.key}))));
    this.onFormSubmit(this.recipesForm.value);
  }

  onFormSubmit(form: NgForm) {
    this.recipesService.postRecipes(form)
      .subscribe(res => {
        const id = res['key'];
        this.router.navigate(['/recipes-detail/', id]);
      }, (err) => {
        console.error(err);
      });
  }
}
