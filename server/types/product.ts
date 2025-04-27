export interface ScrapedProduct {
  name: string;
  price: number; // in cents
  imageUrl?: string;
  productUrl: string;
  store: string;
  isAvailable: boolean;
}