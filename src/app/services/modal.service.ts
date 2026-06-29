import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FoodMODEL } from '../models/food-model';
import { User } from '../models/user';

export type ModalType =
  | 'add_product'
  | 'edit_product'
  | 'delete_product'
  | 'edit_user'
  | 'delete_user'
  | null;

export interface ModalState {
  type: ModalType;
  data?: FoodMODEL | User | null;
  isOpen: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private readonly modalState = new BehaviorSubject<ModalState>({
    type: null,
    data: null,
    isOpen: false,
  });

  public modal$: Observable<ModalState> = this.modalState.asObservable();

  constructor() {}

  openModal(type: ModalType, data?: FoodMODEL | User): void {
    this.modalState.next({
      type,
      data: data || null,
      isOpen: true,
    });
  }

  closeModal(): void {
    this.modalState.next({
      type: null,
      data: null,
      isOpen: false,
    });
  }

  getModalState(): ModalState {
    return this.modalState.getValue();
  }
}
