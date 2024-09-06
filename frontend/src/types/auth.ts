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
export interface Response {
  username?: string;
  email?: string;
  token?: string | null;
}