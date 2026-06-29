import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { User } from '../../../../../models/user';
import { Roles } from '../../../../../enums/enums';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css',
})
export class UserFormComponent implements OnInit {
  @Input() user: User | null = null;
  @Input() isSubmitting: boolean = false;
  @Input() errorMessage: string | undefined;
  @Input() successMessage: string | undefined;
  @Output() submit = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  roles = Object.values(Roles);

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
    if (this.user) {
      this.populateForm(this.user);
    }
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', [Validators.required]],
    });
  }

  private populateForm(user: User): void {
    this.form.patchValue({
      username: user.username,
      email: user.email,
      role: user.role,
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    this.submit.emit(this.form.value);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
