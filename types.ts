
export interface ImageState {
  original: string | null;
  edited: string | null;
  mimeType: string | null;
}

export interface EditHistoryItem {
  id: string;
  timestamp: number;
  prompt: string;
  imageUrl: string;
}

export interface GeminiResponse {
  imageUrl: string | null;
  text: string | null;
}
