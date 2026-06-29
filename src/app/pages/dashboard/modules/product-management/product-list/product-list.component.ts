import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FoodMODEL } from '../../../../../models/food-model';
import { ProductService } from '../../../../../services/product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
export class ProductListComponent implements OnInit {
  @Input() products: FoodMODEL[] = [];
  @Input() isLoading: boolean = false;
  @Output() editProduct = new EventEmitter<FoodMODEL>();
  @Output() deleteProduct = new EventEmitter<FoodMODEL>();
  @Output() searchProducts = new EventEmitter<string>();

  searchKeyword: string = '';

  constructor(public productService: ProductService) {}

  ngOnInit(): void {}

  onSearch(): void {
    this.searchProducts.emit(this.searchKeyword);
  }

  onEditClick(product: FoodMODEL): void {
    this.editProduct.emit(product);
  }

  onDeleteClick(product: FoodMODEL): void {
    this.deleteProduct.emit(product);
  }

  getProductImageURL(productId: string): string {
    return this.productService.getProductImageURL(productId);
  }
}
