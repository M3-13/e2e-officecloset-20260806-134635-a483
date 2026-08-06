export interface WardrobeItemOut {
  id: number;
  name: string;
  category: string;
  description: string | null;
  image_url: string;
  thumbnail_url: string;
  created_at: string;
}

export const WARDROBE_CATEGORIES = [
  "Alle",
  "Oberteil",
  "Unterteil",
  "Kleid",
  "Schuhe",
  "Accessoire",
] as const;

export type WardrobeCategory = (typeof WARDROBE_CATEGORIES)[number];
