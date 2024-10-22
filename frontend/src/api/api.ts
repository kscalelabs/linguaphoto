import { AxiosInstance } from "axios";
import { ImageType } from "types/model";

export interface CollectionCreateFragment {
  title: string;
  description: string;
}
// Define the types for the API response and request payload
export interface SubscriptionResponse {
  success: boolean;
  error?: string;
  requires_action?: boolean;
  payment_intent_client_secret?: string;
}
export class Api {
  public api: AxiosInstance;

  constructor(api: AxiosInstance) {
    this.api = api;
  }
  public async test(): Promise<string> {
    const response = await this.api.get(`/`);
    return response.data.message;
  }
  public async handleUpload(formData: FormData): Promise<ImageType | null> {
    try {
      const response = await this.api.post("image/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error uploading the file", error);
      return null;
    }
  }

  public async uploadImage(
    file: File,
    collection_id: string,
  ): Promise<ImageType> {
    const response = await this.api.post("image/upload", {
      file,
      id: collection_id,
    });
    return response.data;
  }
}
