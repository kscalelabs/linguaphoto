import { AxiosError, isAxiosError } from "axios";

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// eslint-disable-next-line
export const humanReadableError = (error: any | undefined) => {
  if (isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const request = axiosError.request,
      response = axiosError.response;
    if (response) {
      const detail = (response.data as any).detail; // eslint-disable-line
      if (typeof detail === "string") {
        return detail;
      }
      if (response.status === 400) {
        return "Invalid credentials.";
      } else if (response.status === 500) {
        return "An internal server error occurred.";
      } else {
        return "An unknown error occurred while handling the response.";
      }
    } else if (request) {
      return "An unknown error occurred while handling the request.";
    }
  }
  return "An unknown error occurred.";
};

export const IS_DEV = process.env.REACT_APP_DEV_MODE == "local";
