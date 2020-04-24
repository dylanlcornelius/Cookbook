import { Injectable } from '@angular/core';
import { firebase } from '@firebase/app';
import '@firebase/firestore';
import { Observable } from 'rxjs';
import { Action } from '@actions';
import { Item } from './item.model';
import { FirestoreService } from '@firestoreService';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  ref = firebase.firestore().collection('items');

  constructor(
    private firestoreService: FirestoreService
  ) {}

  getItems(): Observable<Item[]> {
    return new Observable(observable => {
      this.firestoreService.get(this.ref).subscribe(docs => {
        observable.next(docs.map(doc => {
          return new Item(doc);
        }));
      });
    });
  }

  getItem(id: string): Promise<Item> {
    return new Promise(resolve => {
      this.firestoreService.get(this.ref, id).subscribe(doc => {
        resolve(new Item(doc));
      });
    });
  }

  postItem(data): String {
    return this.firestoreService.post(this.ref, data, Action.CREATE_ITEM);
  }

  putItem(id: string, data) {
    this.firestoreService.put(this.ref, id, data, Action.UPDATE_ITEM);
  }

  deleteItem(id: string) {
    this.firestoreService.delete(this.ref, id, Action.DELETE_ITEM);
  }
}
