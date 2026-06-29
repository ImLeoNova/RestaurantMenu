import { Component, OnInit } from '@angular/core';
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
import { NgClass, NgFor, NgIf } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { ProductService } from '../../services/product.service';
import { FoodMODEL } from '../../models/food-model';
import { ApiResponse } from '../../models/api-response';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { UserService } from '../../services/user.service';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgClass, RouterLink, NgIf, ReactiveFormsModule, FormsModule, NgFor],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  token: string | null = null;
  user: User = new User('', '', '', '', '[]');

  nowPage: string = 'home';
  nowModal: string | undefined = undefined;

  imageADD: File | undefined = undefined;
  imgSRC: string | ArrayBuffer | null = null;

  updateImageFile: File | undefined = undefined;
  updateImgSRC: string | ArrayBuffer | null = null;

  errorMessage: string | undefined = undefined;
  successMessage: string | undefined = undefined;

  searchKeyword: string = '';

  products: FoodMODEL[] = [];
  filteredProducts: FoodMODEL[] = [];
  selectedProduct: FoodMODEL | null = null;

  isLoadingProducts: boolean = false;
  isSubmitting: boolean = false;

  addFoodFORM: FormGroup = new FormGroup({
    foodName: new FormControl('', [Validators.required]),
    foodCategory: new FormControl('', [Validators.required]),
    foodDescription: new FormControl('', [Validators.required]),
    foodPrice: new FormControl('', [Validators.required]),
  });

  updateFoodFORM: FormGroup = new FormGroup({
    product_id: new FormControl('', [Validators.required]),
    foodName: new FormControl('', [Validators.required]),
    foodCategory: new FormControl('', [Validators.required]),
    foodDescription: new FormControl('', [Validators.required]),
    foodPrice: new FormControl('', [Validators.required]),
  });
  users: User[] = [];
  filteredUsers: User[] = [];
  isLoadingUsers: boolean = false;
  searchUserKeyword: string = '';

  constructor(
    private store: Store<{ auth: AuthState }>,
    public categoryService: CategoryService,
    private router: Router,
    private dashboardService: DashboardService,
    public productService: ProductService,
    public userService: UserService,
  ) {
    this.store
      .select((state) => state.auth)
      .subscribe((auth: AuthState) => {
        this.token = auth.token;

        if (this.token && !isTokenExpired(this.token)) {
          const decodedJWT: JwtDecoded = jwtDecode<JwtDecoded>(this.token);
          const userID: string = decodedJWT.user_id;

          this.dashboardService.userDATA(this.token, userID).subscribe({
            next: (userData: any) => {
              this.user = userData.data;

              if (
                this.user.role === Roles.FOUNDER ||
                this.user.role === Roles.ADMIN
              ) {
                console.log(this.token);

                this.userService.getAllUsers(this.token).subscribe({
                  next: (response) => {
                    this.users = response.data.users;
                    this.filteredUsers = response.data.users;
                    console.log(this.filteredUsers);
                  },
                });
              }
            },
            error: () => {
              this.store.dispatch(logout());
              this.router.navigate(['/login']);
            },
          });
        } else {
          this.store.dispatch(logout());
          this.router.navigate(['/login']);
        }
      });
  }

  test(): void {
    console.log('Test');
  }
  ngOnInit(): void {
    this.loadProducts();
  }

  searchUsers(): void {
    const q = this.searchUserKeyword.trim().toLowerCase();
    this.filteredUsers = this.users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    );
  }

  loadProducts(category?: string, search?: string): void {
    this.isLoadingProducts = true;

    this.productService.getProducts(category, search).subscribe({
      next: (response: ApiResponse<FoodMODEL[]>) => {
        this.products = response.data || [];
        this.filteredProducts = [...this.products];
        this.isLoadingProducts = false;
      },
      error: () => {
        this.products = [];
        this.filteredProducts = [];
        this.isLoadingProducts = false;
      },
    });
  }

  setPage(page: string) {
    this.nowPage = page;

    if (page === 'products') {
      this.loadProducts(this.categoryService.nowCategory || undefined);
    }
  }

  openModal(modal: string, product?: FoodMODEL): void {
    this.errorMessage = undefined;
    this.successMessage = undefined;
    this.nowModal = modal;

    if (modal === 'add') {
      this.resetAddForm();
    }

    if ((modal === 'update' || modal === 'remove') && product) {
      this.selectedProduct = product;
    }

    if (modal === 'update' && product) {
      this.prepareUpdateForm(product);
    }
  }

  closeModal(): void {
    this.nowModal = undefined;
    this.errorMessage = undefined;
    this.successMessage = undefined;
    this.selectedProduct = null;
    this.updateImageFile = undefined;
    this.updateImgSRC = null;
  }

  input(event: any) {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (file) {
      this.imageADD = file;

      const reader = new FileReader();
      reader.addEventListener('load', () => {
        this.imgSRC = reader.result;
      });
      reader.readAsDataURL(file);
    }
  }

  updateInput(event: any) {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (file) {
      this.updateImageFile = file;

      const reader = new FileReader();
      reader.addEventListener('load', () => {
        this.updateImgSRC = reader.result;
      });
      reader.readAsDataURL(file);
    }
  }

  addFood() {
    this.errorMessage = undefined;
    this.successMessage = undefined;

    const foodName = this.addFoodFORM.get('foodName')?.value;
    const foodCategory = this.addFoodFORM.get('foodCategory')?.value;
    const foodDescription = this.addFoodFORM.get('foodDescription')?.value;
    const foodPrice = this.addFoodFORM.get('foodPrice')?.value;

    if (
      !foodName ||
      !foodCategory ||
      !foodDescription ||
      !foodPrice ||
      !this.imageADD
    ) {
      this.errorMessage =
        'لطفا فرم را کامل پر کنید و تصویر محصول را انتخاب کنید';
      return;
    }

    const formData = new FormData();
    formData.append('title', foodName);
    formData.append('description', foodDescription);
    formData.append('category', foodCategory);
    formData.append('price', foodPrice);
    formData.append('image', this.imageADD);

    this.isSubmitting = true;

    this.productService.addProduct(formData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = response.message || 'محصول با موفقیت ثبت شد';
        this.resetAddForm();
        this.loadProducts(this.categoryService.nowCategory || undefined);
        setTimeout(() => {
          this.closeModal();
        }, 1000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage =
          err?.error?.message || 'خطا در ثبت محصول. دوباره تلاش کنید';
      },
    });
  }

  prepareUpdateForm(product: FoodMODEL): void {
    this.selectedProduct = product;

    const productId = product.product_ID;
    const productIdStr = String(productId);

    this.updateFoodFORM.patchValue({
      product_id: productIdStr,
      foodName: (product as any).title,
      foodCategory: (product as any).category ?? '',
      foodDescription: (product as any).description ?? '',
      foodPrice: String((product as any).price ?? ''),
    });

    this.updateImgSRC =
      (product as any).image_url ||
      (product as any).image ||
      this.productService.getProductImageURL(productIdStr);
  }

  updateFood(): void {
    this.errorMessage = undefined;
    this.successMessage = undefined;

    const product_id = this.updateFoodFORM.get('product_id')?.value;
    const foodName = this.updateFoodFORM.get('foodName')?.value;
    const foodCategory = this.updateFoodFORM.get('foodCategory')?.value;
    const foodDescription = this.updateFoodFORM.get('foodDescription')?.value;
    const foodPrice = this.updateFoodFORM.get('foodPrice')?.value;

    if (!foodName || !foodCategory || !foodDescription || !foodPrice) {
      this.errorMessage = 'لطفا اطلاعات فرم ویرایش را کامل وارد کنید';
      return;
    }

    const formData = new FormData();
    formData.append('title', foodName);
    formData.append('description', foodDescription);
    formData.append('category', foodCategory);
    formData.append('price', foodPrice);

    if (this.updateImageFile) {
      formData.append('image', this.updateImageFile);
    }

    this.isSubmitting = true;

    this.productService.updateProduct(Number(product_id), formData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = response.message || 'محصول با موفقیت ویرایش شد';
        this.loadProducts(this.categoryService.nowCategory || undefined);
        setTimeout(() => {
          this.closeModal();
        }, 1000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage =
          err?.error?.message || 'خطا در ویرایش محصول. دوباره تلاش کنید';
      },
    });
  }
  deleteSelectedProduct(): void {
    this.errorMessage = undefined;
    this.successMessage = undefined;

    const product_id = this.selectedProduct?.product_ID;

    if (!product_id) {
      this.errorMessage = 'محصولی برای حذف انتخاب نشده است';
      return;
    }

    this.isSubmitting = true;

    this.productService.deleteProduct(Number(product_id)).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = response.message || 'محصول با موفقیت حذف شد';
        this.loadProducts(this.categoryService.nowCategory || undefined);
        setTimeout(() => {
          this.closeModal();
        }, 1000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage =
          err?.error?.message || 'خطا در حذف محصول. دوباره تلاش کنید';
      },
    });
  }

  searchProducts(): void {
    const category = this.categoryService.nowCategory || undefined;
    const search = this.searchKeyword?.trim() || undefined;

    this.loadProducts(category, search);
  }

  selectProductForUpdate(product: FoodMODEL): void {
    this.openModal('update', product);
  }

  selectProductForDelete(product: FoodMODEL): void {
    this.openModal('remove', product);
  }

  getProductsByCurrentCategory(): FoodMODEL[] {
    const currentCategory = this.categoryService.nowCategory;

    if (!currentCategory) return this.filteredProducts;

    return this.filteredProducts.filter(
      (item: any) => item.category === currentCategory,
    );
  }

  onCategoryChange(category: string): void {
    this.categoryService.nowCategory = category;
    this.loadProducts(category, this.searchKeyword || undefined);
  }

  resetAddForm(): void {
    this.addFoodFORM.reset();
    this.imageADD = undefined;
    this.imgSRC = null;
    this.errorMessage = undefined;
    this.successMessage = undefined;
  }

  protected readonly Roles = Roles;
  protected readonly console = console;
}
