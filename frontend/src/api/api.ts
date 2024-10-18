import { AxiosInstance } from "axios";
import { Collection, ImageType } from "types/model";

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
      const response = await this.api.post("/upload/", formData, {
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
  public async createCollection(
    data: CollectionCreateFragment,
  ): Promise<Collection | null> {
    const response = await this.api.post("/create_collection", data);
    return response.data;
  }
  public async getCollection(id: string): Promise<Collection | null> {
    const response = await this.api.get(`/get_collection?id=${id}`);
    return response.data;
  }
  public async editCollection(data: Collection): Promise<null> {
    await this.api.post(`/edit_collection`, data);
    return null;
  }
  public async getAllCollections(): Promise<Array<Collection> | []> {
    const response = await this.api.get(`/get_collections`);
    return response.data;
  }
  public async deleteCollection(collection_id: string): Promise<null> {
    await this.api.get(`/delete_collection?id=${collection_id}`);
    return null;
  }
  public async deleteImage(image_id: string): Promise<null> {
    await this.api.get(`/delete_image?id=${image_id}`);
    return null;
  }
  public async uploadImage(
    file: File,
    collection_id: string,
  ): Promise<ImageType> {
    const response = await this.api.post("/upload", {
      file,
      id: collection_id,
    });
    return response.data;
  }
  public async getImages(collection_id: string): Promise<Array<ImageType>> {
    const response = await this.api.get(
      `/get_images?collection_id=${collection_id}`,
    );
    return response.data;
  }
  public async translateImages(
    images: Array<string>,
  ): Promise<Array<ImageType>> {
    const response = await this.api.post("/translate", images, {
      timeout: 300000,
    });
    return response.data;
  }

  public async createSubscription(
    payment_method_id: string,
    email: string,
    name: string,
  ): Promise<SubscriptionResponse> {
    // Send payment method to the backend for subscription creation
    const { data } = await this.api.post("/create_subscription", {
      payment_method_id,
      email,
      name,
    });
    return data;
  }
}
