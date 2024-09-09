import { AxiosInstance } from "axios";
import { Collection, Image } from "types/model";

export interface CollectionCreateFragment {
  title: string;
  description: string;
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
  public async handleUpload(formData: FormData): Promise<Image | null> {
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
  public async getAllCollections(): Promise<Array<Collection> | null> {
    const response = await this.api.get(`/get_collections`);
    return response.data;
  }
  public async uploadImage(file: File, collection_id: string): Promise<Image> {
    const response = await this.api.post("/upload", {
      file,
      id: collection_id,
    });
    return response.data;
  }
  public async getImages(collection_id: string): Promise<Array<Image>> {
    const response = await this.api.get(
      `/get_images?collection_id=${collection_id}`,
    );
    return response.data;
  }
}
