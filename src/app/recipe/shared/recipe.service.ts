import { Injectable } from '@angular/core';
import { firebase } from '@firebase/app';
import '@firebase/firestore';
import { Observable } from 'rxjs';
import { Action } from '@actions';
import { Recipe } from './recipe.model';
import { FirestoreService } from '@firestoreService';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  ref = firebase.firestore().collection('recipes');

  private filters = [];

  get selectedFilters(): Array<String> { return this.filters; }
  set selectedFilters(filters: Array<String>) { this.filters = filters; }

  constructor(
    private firestoreService: FirestoreService
  ) {}

  getRecipes(): Observable<Recipe[]> {
    return new Observable(observable => {
      this.firestoreService.get(this.ref).subscribe(docs => {
        observable.next(docs.map(doc => {
          return new Recipe(doc);
        }));
      });
    });
  }

  getRecipe(id: string): Promise<Recipe> {
    return new Promise(resolve => {
      this.firestoreService.get(this.ref, id).subscribe(doc => {
        resolve(new Recipe(doc));
      })
    });
  }

  postRecipe(data): String {
    return this.firestoreService.post(this.ref, data, Action.CREATE_RECIPE);
  }

  putRecipes(id: string, data) {
    this.firestoreService.put(this.ref, id, data, Action.UPDATE_RECIPE);
  }

  deleteRecipes(id: string) {
    this.firestoreService.delete(this.ref, id, Action.DELETE_RECIPE);
  }
}
