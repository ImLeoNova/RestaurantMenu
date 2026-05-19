import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgIf } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { RegisterResponse } from '../../interfaces/interfaces';

@Component({
  selector: 'app-register-auth',
  standalone: true,
  imports: [FormsModule, NgIf, ReactiveFormsModule, RouterLink],
  templateUrl: './register-auth.component.html',
  styleUrl: './register-auth.component.css',
})
export class RegisterAuthComponent {
  isHover: boolean = false;
  fromCOMPONENT: string = 'not';
  registerForm: FormGroup = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(5),
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(5),
    ]),
    passwordConfirm: new FormControl('', [
      Validators.required,
      Validators.minLength(5),
    ]),
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  successMessage: string | undefined = undefined;
  errorMessage: string | undefined = undefined;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
  ) {}

  submit() {
    if (this.registerForm.valid) {
      this.errorMessage = undefined;
      const username: string = this.registerForm.controls['username'].value;
      const password: string = this.registerForm.controls['password'].value;
      const passwordConfirm: string =
        this.registerForm.controls['passwordConfirm'].value;
      const email: string = this.registerForm.controls['email'].value;
      if (password == passwordConfirm) {
        this.errorMessage = undefined;
        const userModel = new User(username, password, email, 'user', '');
        this.userService
          .registerUser(userModel)
          .subscribe((response: RegisterResponse) => {
            this.successMessage = 'با موفقیت ثبت نام کردید .';
            setTimeout(() => {
              this.router.navigate(['/authentication/login']);
            }, 700);
          });
      } else {
        this.errorMessage = 'رمز وارد شده با رمز تایید مطابقت ندارد';
      }
    } else {
      this.errorMessage = 'فرم را کامل پر کنید';
    }
  }
}
