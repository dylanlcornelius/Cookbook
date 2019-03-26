import { Component, OnInit } from '@angular/core';
import { UserIngredientService } from '../../shopping-list/user-ingredient.service';
import { UserService } from '../../user/user.service';
import { IngredientService } from '../../ingredients/ingredient.service';
import { CookieService } from 'ngx-cookie-service';
import { UserIngredient } from '../user-ingredient.modal';
import { MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.css']
})
export class ShoppingListComponent implements OnInit {

  loading = true;
  // TODO: Add data model for params
  validationModalParams;
  uid: string;
  id: string;
  displayedColumns = ['name', 'pantryQuantity', 'cartQuantity', 'buy'];
  dataSource;
  ingredients;

  constructor(
    private cookieService: CookieService,
    private userIngredientService: UserIngredientService,
    private userService: UserService,
    private ingredientService: IngredientService
  ) { }

  ngOnInit() {
    const loggedInCookie = this.cookieService.get('LoggedIn');
    const myIngredients = [];
    this.userService.getUser(loggedInCookie).subscribe(user => {
      this.uid = user.uid;
      this.userIngredientService.getUserIngredients(user.uid).subscribe(userIngredients => {
        this.id = userIngredients.id;
        this.ingredientService.getIngredients().subscribe(ingredients => {
          ingredients.forEach(ingredient => {
            if (userIngredients && userIngredients.ingredients) {
              userIngredients.ingredients.forEach(myIngredient => {
                if (myIngredient.id === ingredient.id) {
                  myIngredients.push({
                    id: myIngredient.id,
                    name: ingredient.name,
                    pantryQuantity: myIngredient.pantryQuantity,
                    cartQuantity: myIngredient.cartQuantity
                  });
                }
              });
            }
          });
          this.dataSource = new MatTableDataSource(myIngredients);
          // tslint:disable-next-line:triple-equals
          this.dataSource.filterPredicate = (data, filter) => data.cartQuantity != filter;
          this.applyFilter();
          this.ingredients = ingredients;
          this.loading = false;
        });
      });
    });
  }

  applyFilter() {
    this.dataSource.filter = '0';
  }

  packageData() {
    const userIngredients = [];
    this.dataSource.data.forEach(data => {
      userIngredients.push({id: data.id, pantryQuantity: data.pantryQuantity, cartQuantity: data.cartQuantity});
    });
    return new UserIngredient(this.uid, userIngredients, this.id);
  }

  removeIngredient(id) {
    const data = this.dataSource.data.find(x => x.id === id);
    const ingredient = this.ingredients.find(x => x.id === id);
    if (Number(data.cartQuantity) > 0 && ingredient && ingredient.amount) {
      data.cartQuantity = Number(data.cartQuantity) - Number(ingredient.amount);
      this.userIngredientService.putUserIngredient(this.packageData());
    }
  }

  addIngredient(id) {
    const data = this.dataSource.data.find(x => x.id === id);
    const ingredient = this.ingredients.find(x => x.id === id);
    if (ingredient && ingredient.amount) {
      data.cartQuantity = Number(data.cartQuantity) + Number(ingredient.amount);
      this.userIngredientService.putUserIngredient(this.packageData());
    }
  }

  addToPantry(id) {
    // TODO: add successful popup
    const data = this.dataSource.data.find(x => x.id === id);
    data.pantryQuantity = Number(data.pantryQuantity) + Number(data.cartQuantity);
    data.cartQuantity = 0;
    this.userIngredientService.buyUserIngredient(this.packageData(), 1);
    this.applyFilter();
  }

  addAllToPantry() {
    this.validationModalParams = {
      function: this.addAllToPantryEvent,
      self: this,
      text: 'Are you sure you want to buy all ingredients?'
    };
  }

  addAllToPantryEvent = function(self) {
    // TODO: add successful popup
    self.dataSource.data.forEach(data => {
      data.pantryQuantity = Number(data.pantryQuantity) + Number(data.cartQuantity);
      data.cartQuantity = 0;
    });
    self.userIngredientService.buyUserIngredient(self.packageData(), self.dataSource.filteredData.length);
    self.applyFilter();
  };
}
