import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../../../../models/user';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css',
})
export class UserListComponent {
  @Input() users: User[] = [];
  @Input() isLoading: boolean = false;
  @Output() editUser = new EventEmitter<User>();
  @Output() deleteUser = new EventEmitter<User>();
  @Output() searchUsers = new EventEmitter<string>();

  searchKeyword: string = '';

  onSearch(): void {
    this.searchUsers.emit(this.searchKeyword);
  }

  onEditClick(user: User): void {
    this.editUser.emit(user);
  }

  onDeleteClick(user: User): void {
    this.deleteUser.emit(user);
  }
}
