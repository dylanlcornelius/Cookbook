import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserIngredientService } from '@userIngredientService';
import { IngredientService } from '@ingredientService';
import { UserIngredient } from '../shared/user-ingredient.model';
import { MatTableDataSource } from '@angular/material/table';
import { NotificationType } from '@notifications';
import { UserItemService } from '@userItemService';
import { UserItem } from '../shared/user-item.model';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CurrentUserService } from 'src/app/user/shared/current-user.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from 'src/app/shared/notification-modal/notification.service';
import { Notification } from 'src/app/shared/notification-modal/notification.model';

// TODO: icons for notification modal
@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.scss']
})
export class ShoppingListComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  loading = true;
  validationModalParams;
  notificationModalParams;
  isCompleted = false;

  uid: string;
  simplifiedView: boolean;

  itemForm: FormGroup;

  id: string;
  ingredientsDataSource;
  ingredients;

  itemsDataSource;
  itemsId: string;

  constructor(
    private formBuilder: FormBuilder,
    private currentUserService: CurrentUserService,
    private userIngredientService: UserIngredientService,
    private ingredientService: IngredientService,
    private userItemService: UserItemService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit() {
    this.load();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  load() {
    this.itemForm = this.formBuilder.group({
      'name': [null],
    });

    this.currentUserService.getCurrentUser().pipe(takeUntil(this.unsubscribe$)).subscribe(user => {
      this.simplifiedView = user.simplifiedView;
      this.uid = user.uid;

      this.userIngredientService.getUserIngredient(this.uid).pipe(takeUntil(this.unsubscribe$)).subscribe(userIngredients => {
        this.id = userIngredients.id;
        this.ingredientService.getIngredients().pipe(takeUntil(this.unsubscribe$)).subscribe(ingredients => {
          const myIngredients = [];

          ingredients.forEach(ingredient => {
            if (userIngredients && userIngredients.ingredients) {
              userIngredients.ingredients.forEach(myIngredient => {
                if (myIngredient.id === ingredient.id) {
                  myIngredients.push({
                    id: myIngredient.id,
                    name: ingredient.name,
                    uom: ingredient.uom,
                    pantryQuantity: myIngredient.pantryQuantity,
                    cartQuantity: myIngredient.cartQuantity
                  });
                }
              });
            }
          });
          this.ingredientsDataSource = new MatTableDataSource(myIngredients);
          this.ingredientsDataSource.filterPredicate = (data, filter) => data.cartQuantity != filter;
          this.applyFilter();
          this.ingredients = ingredients;

          this.userItemService.getUserItem(this.uid).pipe(takeUntil(this.unsubscribe$)).subscribe(userItems => {
            this.itemsId = userItems.id;
            this.itemsDataSource = new MatTableDataSource(userItems.items);
            this.loading = false;
          });
        });
      });
    });
  }

  applyFilter() {
    this.ingredientsDataSource.filter = '0';
  }

  packageIngredientData() {
    const userIngredients = [];
    this.ingredientsDataSource.data.forEach(data => {
      userIngredients.push({id: data.id, pantryQuantity: data.pantryQuantity, cartQuantity: data.cartQuantity});
    });
    return new UserIngredient({
      uid: this.uid, 
      ingredients: userIngredients,
      id: this.id
    });
  }

  removeIngredient(id) {
    const data = this.ingredientsDataSource.data.find(x => x.id === id);
    const ingredient = this.ingredients.find(x => x.id === id);
    if (Number(data.cartQuantity) > 0 && ingredient && ingredient.amount) {
      data.cartQuantity = Number(data.cartQuantity) - Number(ingredient.amount);
      this.userIngredientService.putUserIngredient(this.packageIngredientData());
    }
  }

  addIngredient(id) {
    const data = this.ingredientsDataSource.data.find(x => x.id === id);
    const ingredient = this.ingredients.find(x => x.id === id);
    if (ingredient && ingredient.amount) {
      data.cartQuantity = Number(data.cartQuantity) + Number(ingredient.amount);
      this.userIngredientService.putUserIngredient(this.packageIngredientData());
    }
  }

  addIngredientToPantry(id) {
    this.applyFilter();
    const isCompleted = this.ingredientsDataSource.data.filter(x => x.cartQuantity > 0).length === 1;
    const data = this.ingredientsDataSource.data.find(x => x.id === id);
    if (Number(data.cartQuantity > 0)) {
      data.pantryQuantity = Number(data.pantryQuantity) + Number(data.cartQuantity);
      data.cartQuantity = 0;
      this.userIngredientService.buyUserIngredient(this.packageIngredientData(), 1, isCompleted);
      this.applyFilter();
      this.notificationService.setNotification(new Notification(NotificationType.SUCCESS, 'Ingredient added!'));
      if (this.ingredientsDataSource.filteredData.length === 0 && this.itemsDataSource.data.length === 0) {
        this.isCompleted = true;
      }
    }
  }

  packageItemData() {
    const userItems = [];
    this.itemsDataSource.data.forEach(data => {
      userItems.push({name: data.name || ''});
    });
    return new UserItem({
      uid: this.uid,
      items: userItems,
      id: this.itemsId
    });
  }

  addItem(form) {
    if (!form.name || !form.name.toString().trim()) {
      return;
    }

    const userItems = this.packageItemData();
    userItems.items.push({name: form.name.toString().trim()});
    this.userItemService.putUserItem(userItems);

    this.itemForm.reset();
    this.notificationService.setNotification(new Notification(NotificationType.SUCCESS, 'Item added!'));
  }

  removeItem(index) {
    this.itemsDataSource.data = this.itemsDataSource.data.filter((_x, i) =>  i !== index);
    this.isCompleted = this.ingredientsDataSource.filteredData.length === 0 && this.itemsDataSource.data.length === 0;

    this.userItemService.buyUserItem(this.packageItemData(), 1, this.isCompleted);
    this.notificationService.setNotification(new Notification(NotificationType.SUCCESS, 'Item removed!'));
  }

  addAllToPantry() {
    this.validationModalParams = {
      function: this.addAllToPantryEvent,
      self: this,
      text: 'Complete shopping list?'
    };
  }

  addAllToPantryEvent(self) {
    self.ingredientsDataSource.data.forEach(ingredient => {
      if (Number(ingredient.cartQuantity) > 0) {
        ingredient.pantryQuantity = Number(ingredient.pantryQuantity) + Number(ingredient.cartQuantity);
        ingredient.cartQuantity = 0;
      }
    });
    self.userIngredientService.buyUserIngredient(self.packageIngredientData(), self.ingredientsDataSource.filteredData.length, false);

    const itemsCount = self.itemsDataSource.data.length;
    self.itemsDataSource.data = [];
    self.userItemService.buyUserItem(self.packageItemData(), itemsCount, false);

    self.applyFilter();
    self.notificationService.setNotification(new Notification(NotificationType.SUCCESS, 'Shopping list completed!'));
    self.isCompleted = true;
  }
}
