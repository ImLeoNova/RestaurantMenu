import { Injectable } from '@angular/core';
import { CategoryMODEL } from '../models/category-model';
import { FoodMODEL } from '../models/food-model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { ApiResponse } from '../models/api-response';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  categorys: CategoryMODEL[] = [
    {
      title: ' همبرگر',
      category: 'burger',
      image: 'assets/web/others-image/burger_landing2.png',
    },
    {
      title: 'پیتزا',
      category: 'pizza',
      image: 'assets/web/others-image/pizza_landing.png',
    },
    {
      title: 'پاستا',
      category: 'pasta',
      image: 'assets/web/others-image/pasta_landing.png',
    },
    {
      title: 'استیک',
      category: 'steak',
      image: 'assets/web/others-image/steak_landing.png',
    },
    {
      title: 'تاکو',
      category: 'taco',
      image: 'assets/web/others-image/taco_landing.png',
    },
    {
      title: 'شاورما',
      category: 'shawarma',
      image: 'assets/web/others-image/kebab_landing.png',
    },
    {
      title: 'اسنک',
      category: 'snack',
      image: 'assets/web/others-image/snack_landing.png',
    },
    {
      title: 'پیش غذا',
      category: 'appetizer',
      image: 'assets/web/others-image/appetizer_landing.png',
    },
  ];

  foodItems: FoodMODEL[] = [];

  constructor(private http: HttpClient) {
    this.loadProducts().subscribe((response) => {
      this.foodItems = response.data;
      console.log(this.foodItems);
    });
  }

  loadProducts(): Observable<ApiResponse<FoodMODEL[]>> {
    return this.http.get<ApiResponse<FoodMODEL[]>>(
      environment.websiteAPI + '/api/product/list',
    );
  }

  nowCategory: string = this.categorys[0]['category'];

  public getCategories(): CategoryMODEL[] {
    return this.categorys;
  }

  public getFoodsByCategory(category: string): FoodMODEL[] {
    let foods: FoodMODEL[] = [];
    for (const food of this.foodItems) {
      if (food.category == category) {
        foods.push(food);
      }
    }
    return foods;
  }

  // Get category information with its name, which gives us the information defined for that category
  public getCATEGORY(categoryID: string): CategoryMODEL {
    // Find the category index in the presentation of categories
    const categoryINDEX = this.getCategories().findIndex(
      (x) => x.category == categoryID,
    );

    // Here, if we find the category using index, we return its information, and if it is not found, we return the Not Found value.
    return this.getCategories()[categoryINDEX] || 'not found';
  }
}
