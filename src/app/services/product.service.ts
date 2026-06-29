import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { FoodMODEL } from '../models/food-model';
import { ApiResponse } from '../models/api-response';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private API = environment.websiteAPI + '/api/product';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  // Add new product
  addProduct(formData: FormData): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.API}/add`, formData, {
      headers: this.getAuthHeaders(),
    });
  }

  // Get all products with optional filters
  getProducts(
    category?: string,
    search?: string,
  ): Observable<ApiResponse<FoodMODEL[]>> {
    let query = '';

    if (category) query += `?category=${category}`;
    if (search) query += (query ? '&' : '?') + `search=${search}`;

    return this.http.get<ApiResponse<FoodMODEL[]>>(`${this.API}/list${query}`);
  }

  // Get single product
  getSingleProduct(product_id: number): Observable<ApiResponse<FoodMODEL>> {
    return this.http.get<ApiResponse<FoodMODEL>>(`${this.API}/${product_id}`);
  }

  // Update product
  updateProduct(
    product_id: number,
    formData: FormData,
  ): Observable<ApiResponse<FoodMODEL>> {
    return this.http.put<ApiResponse<FoodMODEL>>(
      `${this.API}/${product_id}`,
      formData,
      {
        headers: this.getAuthHeaders(),
      },
    );
  }

  // Delete product
  deleteProduct(product_id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.API}/${product_id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Get categories from API
  getCategories(): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(`${this.API}/categories`);
  }

  // Get product image URL
  getProductImageURL(productID: string): string {
    return `${this.API}/image/${productID}`;
  }
}
