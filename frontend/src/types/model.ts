export interface Collection {
  id: string;
  title: string;
  description: string;
  images: Array<string>;
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
