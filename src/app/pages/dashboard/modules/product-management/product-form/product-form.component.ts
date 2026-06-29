import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FoodMODEL } from '../../../../../models/food-model';
import { CategoryService } from '../../../../../services/category.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css',
})
export class ProductFormComponent implements OnInit {
  @Input() product: FoodMODEL | null = null;
  @Input() isSubmitting: boolean = false;
  @Input() errorMessage: string | undefined;
  @Input() successMessage: string | undefined;
  @Output() submit = new EventEmitter<{
    formData: FormData;
    imageFile?: File;
  }>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  imageFile: File | undefined;
  imageSrc: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    public categoryService: CategoryService,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    if (this.product) {
      this.populateForm(this.product);
    }
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      foodName: ['', [Validators.required]],
      foodCategory: ['', [Validators.required]],
      foodDescription: ['', [Validators.required]],
      foodPrice: ['', [Validators.required]],
    });
  }

  private populateForm(product: FoodMODEL): void {
    this.form.patchValue({
      foodName: (product as any).title || '',
      foodCategory: (product as any).category || '',
      foodDescription: (product as any).description || '',
      foodPrice: String((product as any).price || ''),
    });
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.imageFile = file;
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        this.imageSrc = reader.result;
      });
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    const { foodName, foodCategory, foodDescription, foodPrice } =
      this.form.value;
    const formData = new FormData();
    formData.append('title', foodName);
    formData.append('category', foodCategory);
    formData.append('description', foodDescription);
    formData.append('price', foodPrice);

    if (this.imageFile) {
      formData.append('image', this.imageFile);
    }

    this.submit.emit({
      formData,
      imageFile: this.imageFile,
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }

  clearImage(): void {
    this.imageFile = undefined;
    this.imageSrc = null;
  }
}
