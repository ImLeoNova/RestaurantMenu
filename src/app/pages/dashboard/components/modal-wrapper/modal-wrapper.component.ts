import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalType } from '../../../../services/modal.service';

@Component({
  selector: 'app-modal-wrapper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-wrapper.component.html',
  styleUrl: './modal-wrapper.component.css',
})
export class ModalWrapperComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() type: ModalType = null;
  @Output() close = new EventEmitter<void>();

  onBackdropClick(): void {
    this.close.emit();
  }

  onCloseClick(): void {
    this.close.emit();
  }
}
