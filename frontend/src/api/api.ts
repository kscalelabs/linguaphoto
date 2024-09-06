import { AxiosInstance } from "axios";
import { Collection } from "types/model";

export interface Image {
  filename: string;
  s3_url: string;
}

export interface CollectionCreateFragment {
  title: string;
  description: string;
}
export class api {
  public api: AxiosInstance;

  constructor(api: AxiosInstance) {
    this.api = api;
  }
  public async test(): Promise<string> {
    const response = await this.api.get(`/`);
    return response.data.message;
  }
  public async handleUpload(formData: FormData): Promise<Image> {
    try {
      const response = await this.api.post("/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error uploading the file", error);
      return { s3_url: "", filename: "" };
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
  public async getAllCollections(): Promise<Array<Collection> | null> {
    const response = await this.api.get(`/get_collections`);
    return response.data;
  }
}
