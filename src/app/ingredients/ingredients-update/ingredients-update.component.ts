import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IngredientService } from '../ingredient.service';
import {
  FormControl,
  FormGroupDirective,
  FormBuilder,
  FormGroup,
  NgForm,
  Validators,
  FormArray } from '@angular/forms';
import { UOM } from '../uom.emun';

@Component({
  selector: 'app-ingredients-update',
  templateUrl: './ingredients-update.component.html',
  styleUrls: ['./ingredients-update.component.css']
})
export class IngredientsUpdateComponent implements OnInit {

  loading: Boolean = true;
  ingredientsForm: FormGroup;
  id: string;
  name: string;
  category: string;
  amount: string;
  uom: Array<UOM>;
  calories: number;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private ingredientService: IngredientService,
    private formBuilder: FormBuilder
  ) {
    this.uom = Object.values(UOM);
  }

  ngOnInit() {
    this.getIngredient(this.route.snapshot.params['id']);
    this.ingredientsForm = this.formBuilder.group({
      'name': [null, Validators.required],
      'category': [null],
      'amount': [null, [Validators.required, Validators.min(0), Validators.pattern('(^[0-9]{1})+(.[0-9]{0,2})?$')]],
      'uom': [null, Validators.required],
      'calories': [null, [Validators.min(1), Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
    });
  }

  getIngredient(id) {
    this.ingredientService.getIngredient(id)
      .subscribe(data => {
        this.id = data.id;
        this.ingredientsForm.setValue({
          name: data.name,
          category: data.category,
          amount: data.amount || '',
          uom: data.uom || '',
          calories: data.calories
        });
        this.loading = false;
      });
  }

  onFormSubmit(form: NgForm) {
    this.ingredientService.putIngredient(this.id, form)
      .subscribe(res => {
        // this.router.navigate(['/recipes']);
        this.router.navigate(['/ingredients-detail/', this.id]);
      }, (err) => {
        console.error(err);
      });
  }

  ingredientsDetail() {
    this.router.navigate(['/ingredients-detail/', this.id]);
  }
}
