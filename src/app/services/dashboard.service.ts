import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { FoodMODEL } from '../models/food-model';
import { FoodResponse } from '../interfaces/interfaces';
import { ApiResponse } from '../models/api-response';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  apiLink: string = environment.websiteAPI;

  constructor(private http: HttpClient) {}

  userDATA(
    token: string | null,
    userId: string,
  ): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(
      this.apiLink + '/api/user/userinfo/',
      {
        userID: userId,
      },
      {
        headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
      },
    );
  }

  addFood(
    token: string | null,
    foodModel: FoodMODEL,
    image: File | undefined,
  ): Observable<FoodResponse> {
    const formData: FormData = new FormData();
    formData.append('title', foodModel.title);
    formData.append('category', foodModel.category);
    formData.append('description', foodModel.description);
    formData.append('price', foodModel.price);
    // @ts-ignore
    formData.append('file', image, image.name);

    return this.http.post<FoodResponse>(
      this.apiLink + '/api/product/add',
      formData,
      {
        headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
      },
    );
  }
}
