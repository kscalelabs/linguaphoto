// src/api/auth.ts
import axios from "axios";
import {
  SigninData,
  SignupData,
  SignupResponse,
  SignupResponseBusiness,
} from "types/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL || "https://localhost:8080";

export const signup = async (data: SignupData): Promise<SignupResponse> => {
  const response = await axios.post(`${API_URL}/signup`, data);
  return response.data;
};
export const read_me = async (token: string): Promise<SignupResponse> => {
  const response = await axios.get(`${API_URL}/api/user/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
export const read_me_business = async (
  token: string,
): Promise<SignupResponseBusiness> => {
  const response = await axios.get(`${API_URL}/api/business/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
export const signin = async (data: SigninData): Promise<SignupResponse> => {
  const params = new URLSearchParams();
  params.append("username", data.email);
  params.append("password", data.password);
  const response = await axios.post(`${API_URL}/api/user/token`, params);
  console.log(response);
  return response.data;
};
export const social_facebook_login = async (
  token: string,
): Promise<SignupResponse> => {
  console.log(token);
  const response = await axios.post(
    `${API_URL}/api/facebook/callback`,
    {
      token: token,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  return response.data;
};
export const social_Instagram_login = async (
  token: string,
): Promise<SignupResponse> => {
  const response = await axios.post(
    `${API_URL}/api/instagram/callback`,
    {
      token: token,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  return response.data;
};
