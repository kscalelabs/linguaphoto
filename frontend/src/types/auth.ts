// src/types/auth.ts
export interface SignupData {
  email: string;
  username: string;
  password: string;
}
export interface SigninData {
  email: string;
  password: string;
}
export interface SignupResponse {
  username?: string;
  email?: string;
  phone?: string;
  bio?: string;
  error_message?: string;
  access_token?: string | null;
  link1?: string;
  link2?: string;
  link3?: string;
  link4?: string;
  avatar_url?: string;
}
export interface SignupResponseBusiness {
  name?: string;
  email?: string;
  bio?: string;
  error_message?: string;
  access_token?: string | null;
  avatar_url?: string;
}
