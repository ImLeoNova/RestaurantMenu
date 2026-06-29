import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { CategoryService } from '../../services/category.service';
import { ProductService } from '../../services/product.service';
import { UserService } from '../../services/user.service';
import { ModalService, ModalState } from '../../services/modal.service';
import { FoodMODEL } from '../../models/food-model';
import { ApiResponse } from '../../models/api-response';
import { Observable } from 'rxjs';

// Components
import { ProductListComponent } from './modules/product-management/product-list/product-list.component';
import { ProductFormComponent } from './modules/product-management/product-form/product-form.component';
import { UserListComponent } from './modules/user-management/user-list/user-list.component';
import { UserFormComponent } from './modules/user-management/user-form/user-form.component';
import { ModalWrapperComponent } from './components/modal-wrapper/modal-wrapper.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ProductListComponent,
    ProductFormComponent,
    UserListComponent,
    UserFormComponent,
    ModalWrapperComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  token: string | null = null;
  user: User = new User('', '', '', '', '', '[]');
  nowPage: string = 'home';

  // Modal State
  modal$: Observable<ModalState>;
  modalState: ModalState = { type: null, data: null, isOpen: false };

  // Product Management
  products: FoodMODEL[] = [];
  filteredProducts: FoodMODEL[] = [];
  isLoadingProducts: boolean = false;
  isSubmittingProduct: boolean = false;
  productErrorMessage: string | undefined;
  productSuccessMessage: string | undefined;

  // User Management
  users: User[] = [];
  filteredUsers: User[] = [];
  isLoadingUsers: boolean = false;
  isSubmittingUser: boolean = false;
  userErrorMessage: string | undefined;
  userSuccessMessage: string | undefined;

  constructor(
    private store: Store<{ auth: AuthState }>,
    public categoryService: CategoryService,
    private router: Router,
    private dashboardService: DashboardService,
    public productService: ProductService,
    public userService: UserService,
    private modalService: ModalService,
  ) {
    this.modal$ = this.modalService.modal$;
    this.modal$.subscribe((state) => {
      this.modalState = state;
    });

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

  ngOnInit(): void {
    this.loadProducts();
  }

  // ===================== MODAL METHODS =====================
  openModal(type: any, data?: FoodMODEL | User): void {
    this.clearMessages();
    this.modalService.openModal(type, data);
  }

  closeModal(): void {
    this.modalService.closeModal();
    this.clearMessages();
  }

  clearMessages(): void {
    this.productErrorMessage = undefined;
    this.productSuccessMessage = undefined;
    this.userErrorMessage = undefined;
    this.userSuccessMessage = undefined;
  }

  // ===================== PAGE NAVIGATION =====================
  setPage(page: string): void {
    this.nowPage = page;
    if (page === 'products') {
      this.loadProducts(this.categoryService.nowCategory || undefined);
    }
  }

  // ===================== PRODUCT METHODS =====================
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

  onAddProduct(event: { formData: FormData; imageFile?: File }): void {
    this.productErrorMessage = undefined;
    this.productSuccessMessage = undefined;
    this.isSubmittingProduct = true;

    this.productService.addProduct(event.formData).subscribe({
      next: (response) => {
        this.isSubmittingProduct = false;
        this.productSuccessMessage = response.message || 'محصول با موفقیت ثبت شد';
        this.loadProducts(this.categoryService.nowCategory || undefined);
        setTimeout(() => this.closeModal(), 1500);
      },
      error: (err) => {
        this.isSubmittingProduct = false;
        this.productErrorMessage =
          err?.error?.message || 'خطا در ثبت محصول. دوباره تلاش کنید';
      },
    });
  }

  onEditProduct(event: { formData: FormData; imageFile?: File }): void {
    const product = this.modalState.data as FoodMODEL;
    if (!product) return;

    this.productErrorMessage = undefined;
    this.productSuccessMessage = undefined;
    this.isSubmittingProduct = true;

    this.productService.updateProduct(product.product_ID, event.formData).subscribe({
      next: (response) => {
        this.isSubmittingProduct = false;
        this.productSuccessMessage = response.message || 'محصول با موفقیت ویرایش شد';
        this.loadProducts(this.categoryService.nowCategory || undefined);
        setTimeout(() => this.closeModal(), 1500);
      },
      error: (err) => {
        this.isSubmittingProduct = false;
        this.productErrorMessage =
          err?.error?.message || 'خطا در ویرایش محصول. دوباره تلاش کنید';
      },
    });
  }

  onDeleteProduct(): void {
    const product = this.modalState.data as FoodMODEL;
    if (!product) return;

    this.productErrorMessage = undefined;
    this.productSuccessMessage = undefined;
    this.isSubmittingProduct = true;

    this.productService.deleteProduct(product.product_ID).subscribe({
      next: (response) => {
        this.isSubmittingProduct = false;
        this.productSuccessMessage = response.message || 'محصول با موفقیت حذف شد';
        this.loadProducts(this.categoryService.nowCategory || undefined);
        setTimeout(() => this.closeModal(), 1500);
      },
      error: (err) => {
        this.isSubmittingProduct = false;
        this.productErrorMessage =
          err?.error?.message || 'خطا در حذف محصول. دوباره تلاش کنید';
      },
    });
  }

  onProductSearch(keyword: string): void {
    this.loadProducts(this.categoryService.nowCategory || undefined, keyword);
  }

  onProductEdit(product: FoodMODEL): void {
    this.openModal('edit_product', product);
  }

  onProductDelete(product: FoodMODEL): void {
    this.openModal('delete_product', product);
  }

  // ===================== USER METHODS =====================
  loadUsers(): void {
    if (this.user.role === Roles.FOUNDER || this.user.role === Roles.ADMIN) {
      this.isLoadingUsers = true;
      this.userService.adminGetAllUsers(this.token).subscribe({
        next: (response: ApiResponse<User[]>) => {
          this.users = response.data;
          this.filteredUsers = response.data;
          this.isLoadingUsers = false;
        },
        error: () => {
          this.isLoadingUsers = false;
        },
      });
    }
  }

  onEditUser(formValue: any): void {
    const user = this.modalState.data as User;
    if (!user) return;

    this.userErrorMessage = undefined;
    this.userSuccessMessage = undefined;
    this.isSubmittingUser = true;

    this.userService
      .adminUpdateUser(this.token, user.user_ID, formValue)
      .subscribe({
        next: (response) => {
          this.isSubmittingUser = false;
          this.userSuccessMessage = response.message || 'کاربر با موفقیت ویرایش شد';
          this.loadUsers();
          setTimeout(() => this.closeModal(), 1500);
        },
        error: (err) => {
          this.isSubmittingUser = false;
          this.userErrorMessage =
            err?.error?.message || 'خطا در ویرایش کاربر. دوباره تلاش کنید';
        },
      });
  }

  onDeleteUser(): void {
    const user = this.modalState.data as User;
    if (!user) return;

    this.userErrorMessage = undefined;
    this.userSuccessMessage = undefined;
    this.isSubmittingUser = true;

    this.userService.adminDeleteUser(this.token, user.user_ID).subscribe({
      next: (response) => {
        this.isSubmittingUser = false;
        this.userSuccessMessage = response.message || 'کاربر با موفقیت حذف شد';
        this.loadUsers();
        setTimeout(() => this.closeModal(), 1500);
      },
      error: (err) => {
        this.isSubmittingUser = false;
        this.userErrorMessage =
          err?.error?.message || 'خطا در حذف کاربر. دوباره تلاش کنید';
      },
    });
  }

  onUserSearch(keyword: string): void {
    const q = keyword.trim().toLowerCase();
    this.filteredUsers = this.users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    );
  }

  onUserEdit(user: User): void {
    this.openModal('edit_user', user);
  }

  onUserDelete(user: User): void {
    this.openModal('delete_user', user);
  }

  // ===================== HELPERS =====================
  protected readonly Roles = Roles;
  protected readonly console = console;
}
