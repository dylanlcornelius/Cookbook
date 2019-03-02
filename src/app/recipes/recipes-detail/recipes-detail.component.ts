import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipeService } from '../recipe.service';
import { IngredientService} from '../../ingredients/ingredient.service';

@Component({
  selector: 'app-recipes-detail',
  templateUrl: './recipes-detail.component.html',
  styleUrls: ['./recipes-detail.component.css']
})
export class RecipesDetailComponent implements OnInit {

  loading: Boolean = true;
  recipe = {};

  constructor(private route: ActivatedRoute,
    private router: Router,
    private recipeService: RecipeService,
    private ingredientService: IngredientService) { }

  ngOnInit() {
    this.getRecipeDetails(this.route.snapshot.params['id']);
  }

  getRecipeDetails(id) {
    this.recipeService.getRecipe(id)
      .subscribe(data => {
        // console.log(data);
        this.recipe = data;
        this.loading = false;
        // console.log(this.recipe);
      });
  }

  deleteRecipe(id) {
    this.recipeService.deleteRecipes(id)
      .subscribe(res => {
        this.router.navigate(['/recipes-list']);
      }, (err) => {
        console.error(err);
      });
  }

  // initIngredients() {
  //   this.ingredientService.getIngredients()
  //     .subscribe(data => {
  //       // data.forEach(d => {
  //       //   this.ingredients.push({key: d.key, value: false});
  //       // });
  //       this.availableIngredients = data;
  //       // console.log(this.ingredients);
  //       console.log(this.availableIngredients);
  //     });
  // }
}
