export interface LoginResponse {
  message: string;
  statusCode:number;
  token: string;
}

export interface RegisterResponse {
  message: string;
  statusCode:number;
}

export interface aiConversation_History {
  role:string,
  content:string
}

export interface AIResponse {
  message:string;
}

export interface FoodResponse {
  message:string;
}

export interface JwtDecoded {
  user_id:string;
  exp: number;
}
