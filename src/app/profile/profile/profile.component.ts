import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import { UserService } from '@userService';
import { ActionService } from '@actionService';
import { User } from 'src/app/user/shared/user.model';
import { Notification } from '@notifications';
import { ActionLabel } from '../shared/action.enum';
import { ErrorMatcher } from '../../util/error-matcher';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements AfterViewInit {
  loading: Boolean = true;
  notificationModalParams;

  selectedIndex = 0;

  userForm: FormGroup;
  uid: string;
  id: string;

  actions = {};
  actionsLength = 0;
  week = {pageIndex: 0};

  monthActions = {};
  monthActionsLength = 0;
  month = {pageIndex: 0};

  actionsLabels = [
    'Login',
    'Create Recipe', 'Update Recipe', 'Delete Recipe',
    'Create Ingredient', 'Update Ingredient', 'Delete Ingredient',
    'Create Item', 'Update Item', 'Delete Item',
    'Buy Ingredient', 'Complete Shopping List',
  ];
  actionsColors = [
    '#CCCCCC',
    '#9ef533', '#de33f5', '#f73434',
    '#57f533', '#f533d5', '#f76f34',
    '#33f57a', '#f53397', '#f7a634',
    '#3394f5', '#5733f5',
  ];

  matcher = new ErrorMatcher();

  @ViewChild('weekPaginator') weekPaginator: MatPaginator;
  @ViewChild('monthPaginator') monthPaginator: MatPaginator;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private actionService: ActionService
  ) {
    this.selectedIndex = this.route.snapshot.data.selectedTabIndex;
  }

  ngAfterViewInit() {
    this.userService.getCurrentUser().subscribe(user => {
      this.uid = user.uid;
      this.initializeUserForm();

      this.actionService.getActions(this.uid).then((userAction) => {
        const actions = this.sortActions(userAction.actions);

        let index = 0;
        let monthIndex = 0;
        let currentMonth = -1;
        let monthActionArray = [];
        actions.forEach((action, i) => {
          const actionData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

          Object.keys(action.data).forEach(actionKey => {
            actionData[this.actionsLabels.indexOf(ActionLabel[actionKey])] = action.data[actionKey];
          });

          this.actions[index] = {
            data: actionData,
            date: action.month + '/' + action.day + '/' + action.year,
          };

          if ((currentMonth !== action.month) || actions.length - 1 === i) {
            const date = new Date().setMonth(currentMonth - 1);
            const monthName = new Date(date).toLocaleString('default', {month: 'long'});

            if (i !== 0) {
              if (actions.length - 1 === i ) {
                monthActionArray.push({
                  data: actionData,
                  label: action.month + '/' + action.day + '/' + action.year
                });
              }
              this.monthActions[monthIndex] = {
                data: monthActionArray,
                date: monthName
              };

              monthActionArray = [];
              monthIndex++;
            }

            currentMonth = action.month;
          }

          monthActionArray.push({
            data: actionData,
            label: action.month + '/' + action.day + '/' + action.year
          });

          index++;
        });

        this.actionsLength = Object.keys(this.actions).length;
        this.monthActionsLength = Object.keys(this.monthActions).length;

        this.week.pageIndex = this.actionsLength - 1;
        this.month.pageIndex = this.monthActionsLength - 1;
        // TODO: weekPaginator is undefined
        this.weekPaginator.pageIndex = this.actionsLength - 1;
        this.monthPaginator.pageIndex = this.monthActionsLength - 1;
      });
    });
  }

  sortActions(userActions) {
    const dateArray = Object.keys(userActions).map(key => {
      return key.split('/').map(Number);
    });

    dateArray.sort((a, b) => a[0] - b[0]);
    dateArray.sort((a, b) => a[1] - b[1]);
    dateArray.sort((a, b) => a[2] - b[2]);

    return dateArray.map(date => {
      return {
        day: date[0],
        month: date[1],
        year: date[2],
        data: userActions[date[0] + '/' + date[1] + '/' + date[2]]
      };
    });
  }

  initializeUserForm() {
    this.loading = true;

    this.userService.getUser(this.uid).subscribe((user: User) => {
      this.userForm = this.formBuilder.group({
        uid: [this.uid],
        firstName : [user.firstName, Validators.required],
        lastName : [user.lastName, Validators.required],
        role: [user.role],
        theme: [user.theme],
        simplifiedView: [user.simplifiedView],
        id: [user.id]
      });

      this.loading = false;
    });
  }

  onFormSubmit(form) {
    const user = new User(
      form.uid,
      form.firstName,
      form.lastName,
      form.role,
      form.theme,
      form.simplifiedView,
      form.id
    );

    this.userService.putUser(user).subscribe(() => {
      this.userService.setCurrentUser(user);

      this.notificationModalParams = {
        self: self,
        type: Notification.SUCCESS,
        text: 'Profile Information Updated!'
      };

      this.initializeUserForm();
    }, (err) => {
      console.error(err);

      this.initializeUserForm();
    });
  }
}
