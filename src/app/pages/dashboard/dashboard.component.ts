import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { AuthState } from '../../state/app.state';
import { logout } from '../../state/auth.actions';
import { isTokenExpired } from '../../state/auth';
import { Router, RouterLink } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { JwtDecoded } from '../../interfaces/interfaces';
import { DashboardService } from '../../services/dashboard.service';
import { User } from '../../models/user';
import { Roles } from '../../enums/enums';
import { NgClass, NgIf } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { AgGridAngular } from 'ag-grid-angular'; // Angular Data Grid Component
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';

import { MatPaginator } from '@angular/material/paginator';
import { FoodMODEL } from '../../models/food-model';
import { CategoryService } from '../../services/category.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CategoryMODEL } from '../../models/category-model';
import { ApiResponse } from '../../models/api-response';
ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgClass, RouterLink, NgIf, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  token: string | null = null;
  user: User = new User('', '', '', '', '[]');
  nowPage: string = 'home';
  nowModal: string | undefined = undefined;
  imageADD: File | undefined = undefined;
  imgSRC: string | ArrayBuffer | null = null;

  errorMessage: string | undefined = undefined;
  // forms

  addFoodFORM: FormGroup = new FormGroup({
    foodName: new FormControl('', [Validators.required]),
    foodCategory: new FormControl('', Validators.required),
    foodDescription: new FormControl('', [Validators.required]),
    foodPrice: new FormControl('', [Validators.required]),
  });

  constructor(
    private store: Store<{ auth: AuthState }>,
    public categoryService: CategoryService,
    private router: Router,
    private dashboardService: DashboardService,
  ) {
    store
      .select((state) => state.auth)
      .subscribe((auth: AuthState) => {
        this.token = auth.token;
        if (this.token && !isTokenExpired(this.token)) {
          const decodedJWT: JwtDecoded = jwtDecode<JwtDecoded>(this.token);
          const userID: string = decodedJWT.user_id;
          dashboardService
            .userDATA(this.token, userID)
            .subscribe((userData: any) => {
              this.user = userData.data;
            });
        } else {
          this.store.dispatch(logout());
          this.router.navigate(['/login']);
        }
      });
  }

  input(event: any) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        this.imgSRC = reader.result;
      });

      reader.readAsDataURL(file);
    }
    this.imageADD = event.target.files[0];
  }

  addFood() {
    const foodName = this.addFoodFORM.get('foodName')?.value;
    const foodCategory = this.addFoodFORM.get('foodCategory')?.value;
    const foodDescription = this.addFoodFORM.get('foodDescription')?.value;
    const foodPrice = this.addFoodFORM.get('foodPrice')?.value;
    if (
      foodName == '' ||
      foodCategory == '' ||
      foodDescription == '' ||
      foodPrice == '' ||
      this.imgSRC !== null
    ) {
      this.errorMessage = 'لطفا فرم را پر کنید';
    } else {
      const foodModel: FoodMODEL = new FoodMODEL(
        '',
        foodName,
        foodDescription,
        foodCategory,
        foodPrice,
        '0',
      );
      this.dashboardService
        .addFood(this.token, foodModel, this.imageADD)
        .subscribe((response) => {});
    }
  }
  setPage(page: string) {
    this.nowPage = page;
  }

  protected readonly Roles = Roles;
  protected readonly console = console;
}
