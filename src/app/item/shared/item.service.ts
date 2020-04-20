import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { firebase } from '@firebase/app';
import '@firebase/firestore';
import { ActionService } from '@actionService';
import { Action } from '@actions';
import { Item } from './item.model';
import { UserService } from '@userService';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  ref = firebase.firestore().collection('items');

  constructor(
    private userService: UserService,
    private actionService: ActionService,
  ) {}

  getItems(): Observable<Item[]> {
    return new Observable((observer) => {
      this.ref.onSnapshot((querySnapshot) => {
        const ingredients = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          ingredients.push(new Item(data.uid || '', data.name || '', doc.id));
        });
        observer.next(ingredients);
      });
    });
  }

  getItem(id: string): Observable<Item> {
    return new Observable((observer) => {
      this.ref.doc(id).get().then((doc) => {
        const data = doc.data();
        observer.next(new Item(data.uid || '', data.name || '', doc.id));
      });
    });
  }

  postItem(data): Observable<Item> {
    return new Observable((observer) => {
      this.ref.add(data).then((doc) => {
        this.userService.getCurrentUser().subscribe(user => {
          this.actionService.commitAction(user.uid, Action.CREATE_ITEM, 1);
        });
        observer.next(new Item(data.uid || '', data.name || '', doc.id));
      });
    });
  }

  putItem(id: string, data): Observable<Item> {
    return new Observable((observer) => {
      this.ref.doc(data.getId()).set(data.getObject()).then(() => {
        this.userService.getCurrentUser().subscribe(user => {
          this.actionService.commitAction(user.uid, Action.UPDATE_ITEM, 1);
        });
        observer.next();
      });
    });
  }

  deleteItem(id: string): Observable<{}> {
    return new Observable((observer) => {
      this.ref.doc(id).delete().then(() => {
        this.userService.getCurrentUser().subscribe(user => {
          this.actionService.commitAction(user.uid, Action.DELETE_ITEM, 1);
        });
        observer.next();
      });
    });
  }
}
