// src/api/auth.ts
import axios from "axios";
import { Response, SigninData, SignupData } from "types/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL || "https://localhost:8080";

export const signup = async (data: SignupData): Promise<Response> => {
  const response = await axios.post(`${API_URL}/signup`, data);
  return response.data;
};
export const read_me = async (token: string): Promise<Response | null> => {
  try {
    const response = await axios.get(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch {
    return null;
  }
};
export const signin = async (data: SigninData): Promise<Response> => {
  const response = await axios.post(`${API_URL}/signin`, data);
  console.log(response);
  return response.data;
};
export const social_facebook_login = async (
  token: string,
): Promise<Response> => {
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
): Promise<Response> => {
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
