import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { UserItemService } from './user-item.service';
import { UserItem } from './user-item.model';
import { User } from 'src/app/user/shared/user.model';
import { of } from 'rxjs/internal/observable/of';
import { ActionService } from '@actionService';
import { FirestoreService } from '@firestoreService';
import { CurrentUserService } from 'src/app/user/shared/current-user.service';

describe('UserItemService', () => {
  let service: UserItemService;
  let currentUserService: CurrentUserService;
  let actionService: ActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserItemService);
    currentUserService = TestBed.inject(CurrentUserService);
    actionService = TestBed.inject(ActionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get', () => {
    it('should return an existing user item record', () => {
      spyOn(FirestoreService.prototype, 'getRef');
      spyOn(FirestoreService.prototype, 'get').and.returnValue(of([{}]));
      spyOn(service, 'create');

      service.get('uid').subscribe(doc => {
        expect(doc).toBeDefined();
      });

      expect(FirestoreService.prototype.getRef).toHaveBeenCalled();
      expect(FirestoreService.prototype.get).toHaveBeenCalled();
      expect(service.create).not.toHaveBeenCalled();
    });

    it('should create a user item record and return it', fakeAsync(() => {
      spyOn(FirestoreService.prototype, 'getRef');
      spyOn(FirestoreService.prototype, 'get').and.returnValue(of([]));
      spyOn(service, 'create');

      service.get('uid').subscribe(doc => {
        expect(doc).toBeDefined();
      });

      tick();
      expect(FirestoreService.prototype.getRef).toHaveBeenCalled();
      expect(FirestoreService.prototype.get).toHaveBeenCalled();
      expect(service.create).toHaveBeenCalled();
    }));

    it('should get all documents', () => {
      spyOn(FirestoreService.prototype, 'getRef');
      spyOn(FirestoreService.prototype, 'get').and.returnValue(of([{}]));

      service.get().subscribe(docs => {
        expect(docs).toBeDefined();
      });

      expect(FirestoreService.prototype.getRef).toHaveBeenCalled();
      expect(FirestoreService.prototype.get).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a user item record', () => {
      spyOn(FirestoreService.prototype, 'getRef');
      spyOn(FirestoreService.prototype, 'create');

      service.create(new UserItem({}));

      expect(FirestoreService.prototype.getRef).toHaveBeenCalled();
      expect(FirestoreService.prototype.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a user item record', () => {
      const userItem = new UserItem({});

      spyOn(FirestoreService.prototype, 'getRef');
      spyOn(FirestoreService.prototype, 'update');
      spyOn(userItem, 'getId');
      spyOn(userItem, 'getObject');

      service.update(userItem);

      expect(FirestoreService.prototype.getRef).toHaveBeenCalled();
      expect(FirestoreService.prototype.update).toHaveBeenCalled();
      expect(userItem.getId).toHaveBeenCalled();
      expect(userItem.getObject).toHaveBeenCalled();
    });

    it('should update user item records', () => {
      spyOn(FirestoreService.prototype, 'getRef');
      spyOn(FirestoreService.prototype, 'updateAll');

      service.update([new UserItem({})]);

      expect(FirestoreService.prototype.getRef).toHaveBeenCalled();
      expect(FirestoreService.prototype.updateAll).toHaveBeenCalled();
    });
  });

  describe('buyUserItem', () => {
    it('should update a user item record', () => {
      const userItem = new UserItem({});

      spyOn(currentUserService, 'getCurrentUser').and.returnValue(of(new User({})));
      spyOn(service, 'update');
      spyOn(actionService, 'commitAction');

      service.buyUserItem(userItem, 1, false);

      expect(currentUserService.getCurrentUser).toHaveBeenCalled();
      expect(service.update).toHaveBeenCalled();
      expect(actionService.commitAction).toHaveBeenCalledTimes(1);
    });

    it('should update a user item record and mark it as completed', () => {
      const userItem = new UserItem({});

      spyOn(currentUserService, 'getCurrentUser').and.returnValue(of(new User({})));
      spyOn(service, 'update');
      spyOn(actionService, 'commitAction');

      service.buyUserItem(userItem, 1, true);

      expect(currentUserService.getCurrentUser).toHaveBeenCalled();
      expect(service.update).toHaveBeenCalled();
      expect(actionService.commitAction).toHaveBeenCalledTimes(2);
    });
  });
});
