import { FoodMODEL } from './../../models/food-model';
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
  user: User = new User('', '', '', '', '', '[]');

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

  updateUserFORM: FormGroup = new FormGroup({
    user_id: new FormControl('', [Validators.required]),
    username: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required]),
    role: new FormControl('', [Validators.required]),
  });
  users: User[] = [];
  filteredUsers: User[] = [];
  isLoadingUsers: boolean = false;
  searchUserKeyword: string = '';
  selectedUser: User | null = null;

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
              this.loadUsers();
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

  public loadUsers() {
    if (this.user.role === Roles.FOUNDER || this.user.role === Roles.ADMIN) {
      this.userService.adminGetAllUsers(this.token).subscribe({
        next: (response: ApiResponse<User[]>) => {
          this.users = response.data;
          this.filteredUsers = response.data;
        },
      });
    }
  }

  openEditUserModal(u: User): void {
    this.selectedUser = u;
    this.updateUserFORM.patchValue({
      user_id: u.user_ID,
      username: u.username,
      email: u.email,
      role: u.role,
    });
    this.openModal('edit_user');
  }

  updateAdminUser(): void {
    this.errorMessage = undefined;
    this.successMessage = undefined;

    const { user_id, username, email, role } = this.updateUserFORM.value;

    if (!username || !email || !role) {
      this.errorMessage = 'لطفا تمام فیلدها را پر کنید';
      return;
    }

    this.isSubmitting = true;

    this.userService
      .adminUpdateUser(this.token, user_id, { username, email, role })
      .subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.successMessage = response.message || 'کاربر با موفقیت ویرایش شد';
          this.loadUsers();
          setTimeout(() => this.closeModal(), 1000);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err?.error?.message || 'خطا در ویرایش کاربر';
        },
      });
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

  openModal(modal: string, item?: FoodMODEL | User): void {
    this.errorMessage = undefined;
    this.successMessage = undefined;
    this.nowModal = modal;
    console.log('hi');

    if (modal === 'add') {
      this.resetAddForm();
    }

    if (
      (modal === 'update' || modal === 'remove') &&
      item instanceof FoodMODEL
    ) {
      this.selectedProduct = item;
    }

    if (modal === 'update' && item instanceof FoodMODEL) {
      this.prepareUpdateForm(item);
    }

    if (modal === 'delete_user') {
      this.selectedUser = item as any;
    }
  }

  closeModal(): void {
    this.nowModal = undefined;
    this.errorMessage = undefined;
    this.successMessage = undefined;
    this.selectedProduct = null;
    this.selectedUser = null;
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

  deleteAdminUser(user_ID: string | undefined) {
    this.errorMessage = undefined;
    this.successMessage = undefined;
    this.userService.adminDeleteUser(this.token, user_ID).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = response.message || 'کاربر با موفقیت حذف شد';
        this.loadUsers();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage =
          err?.error?.message || 'خطا در حذف کاربر. دوباره تلاش کنید';
      },
    });
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
