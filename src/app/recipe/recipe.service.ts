import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { firebase } from '@firebase/app';
import '@firebase/firestore';
import { CookieService } from 'ngx-cookie-service';
import { ActionService } from 'src/app/profile/action.service';
import { Action } from '../profile/action.enum';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {

  ref = firebase.firestore().collection('recipes');

  constructor(
    private cookieService: CookieService,
    private actionService: ActionService,
  ) { }

  getRecipes(): Observable<any> {
    return new Observable((observer) => {
      this.ref.onSnapshot((querySnapshot) => {
        const recipes = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          recipes.push({
            id: doc.id,
            name: data.name || '',
            description: data.description || '',
            time: data.time || '',
            calories: data.calories || '',
            servings: data.servings || '',
            quantity: data.quantity || '',
            categories: data.categories || [],
            steps: data.steps || [],
            ingredients: data.ingredients || [],
            user: data.user || '',
          });
        });
        observer.next(recipes);
      });
    });
  }

  getRecipe(id: string): Observable<any> {
    return new Observable((observer) => {
      this.ref.doc(id).get().then((doc) => {
        const data = doc.data();
        observer.next({
          id: doc.id,
          name: data.name || '',
          description: data.description || '',
          time: data.time || '',
          calories: data.calories || '',
          servings: data.servings || '',
          quantity: data.quantity || '',
          categories: data.categories || [],
          steps: data.steps || [],
          ingredients: data.ingredients || [],
          user: data.user || '',
        });
      });
    });
  }

  postRecipe(data): Observable<any> {
    return new Observable((observer) => {
      this.ref.add(data).then((doc) => {
        this.actionService.commitAction(this.cookieService.get('LoggedIn'), Action.CREATE_RECIPE, 1);
        observer.next({
          id: doc.id
        });
      });
    });
  }

  putRecipes(id: string, data): Observable<any> {
    return new Observable((observer) => {
      this.ref.doc(id).set(data).then(() => {
        this.actionService.commitAction(this.cookieService.get('LoggedIn'), Action.UPDATE_RECIPE, 1);
        observer.next();
      });
    });
  }

  deleteRecipes(id: string): Observable<{}> {
    return new Observable((observer) => {
      this.ref.doc(id).delete().then(() => {
        this.actionService.commitAction(this.cookieService.get('LoggedIn'), Action.DELETE_RECIPE, 1);
        observer.next();
      });
    });
  }
}
