export interface Collection {
  id: string;
  title: string;
  description: string;
  images: Array<string>;
}

export interface Image {
  id: string;
  is_translated: boolean;
  collection: string;
  image_url: string;
  audio_url: string;
  transcript: string;
}
