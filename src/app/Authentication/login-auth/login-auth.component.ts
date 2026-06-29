import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { jwtDecode } from 'jwt-decode';
import { Store } from '@ngrx/store';
import { loginSuccess } from '../../state/auth.actions';
import { AuthState } from '../../state/app.state';
import { LoginResponse } from '../../interfaces/interfaces';
import { RegisterAuthComponent } from '../register-auth/register-auth.component';
import { FatalLinkerError } from '@angular/compiler-cli/linker';
import { ApiResponse } from '../../models/api-response';

@Component({
  selector: 'app-login-auth',
  standalone: true,
  imports: [
    RouterLink,
    NgIf,
    ReactiveFormsModule,
    RegisterAuthComponent,
    NgClass,
  ],
  templateUrl: './login-auth.component.html',
  styleUrl: './login-auth.component.css',
})
export class LoginAuthComponent {
  isHover: boolean = false;
  errorMessage: string | undefined = undefined;
  successMessage: string | undefined = undefined;
  fromCOMPONENT: string = 'not';
  hidePass: boolean = true;

  loginForm: FormGroup = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(5),
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(5),
    ]),
  });

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<{ auth: AuthState }>,
  ) {}

  submit() {
    const username = this.loginForm.controls['username'].value;
    const password = this.loginForm.controls['password'].value;
    const userModel = new User('', username, password, '', '', '[]');

    this.userService.loginUser(userModel).subscribe(
      (response: ApiResponse<LoginResponse>) => {
        // getting JWT token
        const token = response.data.token;

        // Decoding JWT Token
        const tokenDecode = jwtDecode(token);
        this.errorMessage = undefined;
        this.successMessage = 'با موفقیت وارد شدید.';

        // Add Token To Store
        this.store.dispatch(loginSuccess({ token: token }));

        // Here we go to the login page after login
        setTimeout(() => {
          // const storeToken = this.store.select(state => state.auth.token)
          // this.store.subscribe(state => console.log(state));
          this.router.navigate(['/dashboard']);
        }, 600);
      },
      (error) => {
        const statusCode = error.status;

        if (statusCode === 400) {
          this.errorMessage = 'نام کاربری یا رمز عبور اشتباه است';
          this.successMessage = undefined;
        }
      },
    );
  }
}
