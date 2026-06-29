import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { User } from '../models/user';
import { environment } from '../../environments/environment.development';
import { ApiResponse } from '../models/api-response';
import { LoginResponse, RegisterResponse } from '../interfaces/interfaces';
import { UpdateProfilePayload } from '../interfaces/UpdateProfilePayload';
import { ChangePasswordPayload } from '../interfaces/ChangePasswordPayload';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiBase: string = environment.websiteAPI;

  constructor(private http: HttpClient) {}

  private authHeaders(token: string | null): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  private jsonHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  // Auth
  registerUser(user: User): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${this.apiBase}/api/user/register`,
      { username: user.username, password: user.password, email: user.email },
      { headers: this.jsonHeaders() },
    );
  }

  loginUser(user: User): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(
      `${this.apiBase}/api/user/login`,
      { username: user.username, password: user.password },
      { headers: this.jsonHeaders() },
    );
  }

  isTokenValid(token: string | null): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(
      `${this.apiBase}/verify-token`,
      { token },
      { headers: this.jsonHeaders() },
    );
  }

  // Profile
  getMyProfile(token: string | null): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiBase}/api/user/me`, {
      headers: this.authHeaders(token),
    });
  }

  updateProfile(
    token: string | null,
    payload: UpdateProfilePayload,
  ): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(
      `${this.apiBase}/api/user/update-profile`,
      payload,
      { headers: this.authHeaders(token) },
    );
  }

  changePassword(
    token: string | null,
    payload: ChangePasswordPayload,
  ): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(
      `${this.apiBase}/api/user/change-password`,
      payload,
      { headers: this.authHeaders(token) },
    );
  }

  deleteMyAccount(token: string | null): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(
      `${this.apiBase}/api/user/delete-me`,
      { headers: this.authHeaders(token) },
    );
  }

  // Admin
  adminGetAllUsers(token: string | null): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(
      `${this.apiBase}/api/admin/users`,
      { headers: this.authHeaders(token) },
    );
  }

  adminCreateUser(
    token: string | null,
    user: User & { role?: 'user' | 'admin' },
  ): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.apiBase}/api/admin/user/create`,
      {
        username: user.username,
        password: user.password,
        email: user.email,
        role: user.role ?? 'user',
      },
      { headers: this.authHeaders(token) },
    );
  }

  adminUpdateUser(
    token: string | null,
    userId: string,
    payload: UpdateProfilePayload,
  ): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(
      `${this.apiBase}/api/admin/user/${userId}`,
      payload,
      { headers: this.authHeaders(token) },
    );
  }

  adminDeleteUser(
    token: string | null,
    userId: string | undefined,
  ): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(
      `${this.apiBase}/api/admin/user/${userId}`,
      { headers: this.authHeaders(token) },
    );
  }
}
