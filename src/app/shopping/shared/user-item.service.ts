import { Injectable } from '@angular/core';
import { firebase } from '@firebase/app';
import '@firebase/firestore';
import { Observable } from 'rxjs';
import { ActionService } from '@actionService';
import { Action } from '@actions';
import { UserItem } from './user-item.model';
import { UserService } from '@userService';

@Injectable({
  providedIn: 'root'
})
export class UserItemService {
  ref = firebase.firestore().collection('user-items');

  constructor(
    private userService: UserService,
    private actionService: ActionService
  ) {}

  getUserItems(uid: string): Observable<UserItem> {
    const self = this;
    return new Observable((observer) => {
      this.ref.where('uid', '==', uid).get().then(function(querySnapshot) {
        if (querySnapshot.size > 0) {
          let userItem;
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            userItem = new UserItem(data.uid, data.items, doc.id);
          });
          observer.next(userItem);
        } else {
          self.postUserItem(new UserItem(uid, [])).subscribe(userItem => {
            observer.next(userItem);
          });
        }
      });
    });
  }

  postUserItem(userItem: UserItem): Observable<UserItem> {
    return new Observable((observer) => {
      this.ref.add(userItem).then((doc) => {
        userItem.id = doc.id;
        observer.next(userItem);
      });
    });
  }

  putUserItem(data: UserItem) {
    this.ref.doc(data.getId()).set(data.getObject())
    .catch(function(error) { console.error('error: ', error); });
  }

  buyUserItem(data: UserItem, actions: Number, isCompleted: boolean) {
    const self = this;
    this.userService.getCurrentUser().subscribe(user => {
      this.ref.doc(data.getId()).set(data.getObject()).then(() => {
        this.actionService.commitAction(user.uid, Action.BUY_INGREDIENT, actions).then(function () {
          if (isCompleted) {
            self.actionService.commitAction(user.uid, Action.COMPLETE_SHOPPING_LIST, 1);
          }
        });
      })
      .catch(function(error) { console.error('error: ', error); });
    });
  }
}
