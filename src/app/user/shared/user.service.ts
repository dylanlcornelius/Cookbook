import { Injectable } from '@angular/core';
import { firebase } from '@firebase/app';
import '@firebase/firestore';
import { Observable, BehaviorSubject } from 'rxjs';
import { User } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  ref = firebase.firestore().collection('users');

  private currentUser = new BehaviorSubject<User>(new User({}));
  private isloggedIn = new BehaviorSubject<boolean>(false);
  private isGuest = new BehaviorSubject<boolean>(false);

  getCurrentUser(): Observable<User> { return this.currentUser.asObservable(); }
  setCurrentUser(currentUser: User) { this.currentUser.next(currentUser); }

  getIsLoggedIn() { return this.isloggedIn.asObservable(); }
  setIsLoggedIn(isloggedIn: boolean) { this.isloggedIn.next(isloggedIn); }

  getIsGuest() { return this.isGuest.asObservable(); }
  setIsGuest(isGuest: boolean) { this.isGuest.next(isGuest); }

  constructor() {}

  getUsers(): Observable<User[]> {
    return new Observable(observable => {
      this.ref.onSnapshot((querySnapshot) => {
        const users = [];
        querySnapshot.forEach((doc) => {
          users.push(new User({
            ...doc.data(),
            id: doc.id
          }));
        });
        observable.next(users);
      });
    });
  }

  getUser(uid: string): Promise<User> {
    return new Promise(resolve => {
      this.ref.where('uid', '==', uid).get().then(function(querySnapshot) {
        const users = [];
        querySnapshot.forEach((doc) => {
          users.push(new User({
            ...doc.data(),
            id: doc.id
          }));
        });
        resolve(users[0]);
      });
    });
  }

  postUser(data: User): string {
    const newDoc = this.ref.doc();
    newDoc.set(data.getObject());
    return newDoc.id;
  }

  putUser(data: User) {
    this.ref.doc(data.getId()).set(data.getObject());
  }

  putUsers(data: Array<User>) {
    data.forEach(d => {
      this.ref.doc(d.getId()).set(d.getObject());
    });
  }

  deleteUser(id: string) {
    this.ref.doc(id).delete();
  }
}
