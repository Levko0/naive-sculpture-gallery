export type SculptureStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD';

export type ContactChannel = 'TELEGRAM' | 'EMAIL';

export type OrderStatus = 'PENDING_COORDINATION' | 'PAID' | 'SHIPPED' | 'CANCELLED';

export type Language = 'UA' | 'EN';

export interface PhotoItem {
  url: string;
  alt_ua?: string;
  alt_en?: string;
  is_cover: boolean;
  display_order: number;
  width?: number;
  height?: number;
}

export interface SculptureDimensions {
  height_cm: number;
  width_cm: number;
  depth_cm: number;
  weight_kg: number;
}

export interface Sculpture {
  id: string;
  slug: string;
  title_ua: string;
  title_en: string;
  story_ua: string;
  story_en: string;
  material_ua: string;
  material_en: string;
  technique_ua: string;
  technique_en: string;
  year: number;
  edition_ua: string;
  edition_en: string;
  price_uah: number;
  price_eur?: number;
  price_usd?: number;
  dimensions: SculptureDimensions;
  photos: PhotoItem[];
  status: SculptureStatus;
  display_order: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface SculptureInput {
  title_ua: string;
  title_en: string;
  slug: string;
  story_ua: string;
  story_en: string;
  material_ua: string;
  material_en: string;
  technique_ua: string;
  technique_en: string;
  year: number;
  edition_ua: string;
  edition_en: string;
  price_uah: number;
  price_eur?: number;
  price_usd?: number;
  dimensions: SculptureDimensions;
  photos: PhotoItem[];
  status: SculptureStatus;
  display_order: number;
  is_featured: boolean;
}

export interface Order {
  id: string;
  reservation_code: string;
  sculpture_id: string;
  sculpture_title_ua: string;
  sculpture_title_en: string;
  price_uah: number;
  is_inquiry: boolean;
  buyer_name: string;
  contact_channel: ContactChannel;
  telegram_handle?: string;
  email?: string;
  delivery_city_country: string;
  delivery_method: string;
  comment?: string;
  status: OrderStatus;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderInput {
  sculpture_id: string;
  is_inquiry?: boolean;
  buyer_name: string;
  contact_channel: ContactChannel;
  telegram_handle?: string;
  email?: string;
  delivery_city_country: string;
  delivery_method: string;
  comment?: string;
  website_hp?: string;
}

export interface PresignedUploadResponse {
  upload_url: string;
  file_key: string;
  public_url: string;
}
