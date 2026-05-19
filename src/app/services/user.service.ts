import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {User} from "../models/user";
import {environment} from "../../environments/environment.development";
import {Observable} from "rxjs";
import {LoginResponse, RegisterResponse} from "../interfaces/interfaces";
import {ApiResponse} from "../models/api-response";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  apiLINK:string = environment.websiteAPI

  constructor(private http: HttpClient) { }

  registerUser(user:User):Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(this.apiLINK+"/api/user/add",{
      username:user.username,
      password:user.password,
      email:user.email
    },{
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    })
  }

  loginUser(user:User):Observable<ApiResponse<LoginResponse>>{
    return this.http.post<ApiResponse<LoginResponse>>(this.apiLINK+"/api/user/login",{
      username: user.username,
      password: user.password,
    },{
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    })
  }

  isTokenValid(token: string | null) {
    return this.http.post(`${environment.websiteAPI}/verify-token`, { "token":token })
  }
}
