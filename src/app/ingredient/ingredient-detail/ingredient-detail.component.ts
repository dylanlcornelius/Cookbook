import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IngredientService } from '../shared/ingredient.service';
import { Notification } from 'src/app/shared/notification-modal/notification.enum';

@Component({
  selector: 'app-ingredient-detail',
  templateUrl: './ingredient-detail.component.html',
  styleUrls: ['./ingredient-detail.component.scss']
})
export class IngredientDetailComponent implements OnInit {

  loading: Boolean = true;
  validationModalParams;
  notificationModalParams;
  ingredient;

  constructor(private route: ActivatedRoute, private router: Router, private ingredientService: IngredientService) { }

  ngOnInit() {
    this.getIngredientDetails(this.route.snapshot.params['id']);
  }

  getIngredientDetails(id) {
    this.ingredientService.getIngredient(id)
      .subscribe(data => {
        this.ingredient = data;
        this.loading = false;
      });
  }

  deleteIngredient(id) {
    this.validationModalParams = {
      function: this.deleteEvent,
      id: id,
      self: this,
      text: 'Are you sure you want to delete ingredient ' + this.ingredient.name + '?'
    };
  }

  deleteEvent(self, id) {
    if (id) {
      self.ingredientService.deleteIngredients(id)
      .subscribe(res => {
        self.notificationModalParams = {
          self: self,
          type: Notification.SUCCESS,
          path: '/ingredient/list',
          text: 'Ingredient deleted!'
        };
      }, (err) => {
        console.error(err);
      });
    }
  }
}
