export interface Collection {
  id: string;
  title: string;
  description: string;
  images: Array<string>;
  user: string;
  featured_image: string;
  publish_flag: boolean;
}

interface Transcription {
  text: string;
  pinyin: string;
  translation: string;
  audio_url: string;
}
export interface Image {
  id: string;
  is_translated: boolean;
  collection: string;
  image_url: string;
  transcriptions: Array<Transcription>;
}
