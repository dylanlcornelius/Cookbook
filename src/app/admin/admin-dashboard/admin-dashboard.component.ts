import { Component, OnInit } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { IngredientService } from '../../ingredients/ingredient.service';
import { RecipeService } from '../../recipes/recipe.service';
import { UserService } from '../../user/user.service';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { ConfigService } from '../config.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  // types: null, string, array droplist?
  // probably just only null for new records

  loading: Boolean = true;

  configsDisplayedColumns = ['key', 'name', 'value', 'delete'];
  configsDatasource = [];

  usersDisplayedColumns = ['key', 'firstName', 'lastName', 'roles', 'delete'];
  roleList = ['user', 'admin', 'pending'];
  usersDatasource = [];
  // usersForm: FormGroup;
  selectedRow: {};

  // ingredientsDisplayedColumns = ['name', 'type'];
  // ingredientsDatasource = [];
  // recipesDisplayedColumns = ['name', 'type'];
  // recipesDatasource = [];

  constructor(private formBuilder: FormBuilder,
    private configService: ConfigService,
    private userService: UserService,
    private ingredientService: IngredientService,
    private recipeService: RecipeService) {}

  ngOnInit() {
    this.configService.getConfigs().subscribe((result) => {
      this.configsDatasource = result;
      this.loading = false;
    });
    this.userService.getUsers().subscribe((result) => {
      this.usersDatasource = result;
    });
    // this.recipeService.getRecipes().subscribe((result) => {
    //   this.recipesDatasource = this.getCollectionData(result);
    // });
    // this.ingredientService.getIngredients().subscribe((result) => {
    //   this.ingredientsDatasource = this.getCollectionData(result);
    // });
  }

  getCollectionData(result) {
    const data = [];
    if (result.length > 0) {
      Object.entries(result[0]).forEach(([key, value]) => {
        let type = 'null';
        if (value instanceof String) {
          type = 'String';
        } else if (value instanceof Array) {
          type = 'Array';
        }
        data.push({name: key, type: type});
      });
    }
    return data;
  }

  // TODO: dynamically add, remove, init, revert, save datasources

  addConfig() {
    this.configService.postConfig({key: '', name: '', value: ''})
      .subscribe(() => {},
      (err) => {
        console.error(err);
      });
  }

  removeConfig(key) {
    // add verification
    this.configService.deleteConfig(key)
      .subscribe(() => {},
      (err) => {
        console.error(err);
      });
  }

  removeUser(key) {
    this.userService.deleteUser(key)
      .subscribe(() => {},
      (err) => {
        console.log(err);
      });
  }

  revert() {
    // add verification
    this.configService.getConfigs().subscribe((result) => {
      this.configsDatasource = result;
    });
    this.userService.getUsers().subscribe((result) => {
      this.usersDatasource = result;
    });
  }

  save() {
    // add verification
    this.configService.putConfigs(this.configsDatasource);
    this.userService.putUsers(this.usersDatasource);
  }
}
