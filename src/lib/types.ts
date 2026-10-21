export interface Review {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail?: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand?: string;
  sku?: string;
  tags?: string[];
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  returnPolicy?: string;
  minimumOrderQuantity?: number;
  reviews?: Review[];
  images: string[];
  thumbnail: string;
}

export interface ProductPage {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface Category {
  slug: string;
  name: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
  role: "admin" | "moderator" | "user";
  phone?: string;
  address?: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface ServerCart {
  id: number;
  total: number;
  discountedTotal: number;
  totalQuantity: number;
  products: { id: number; title: string; price: number; quantity: number; total: number; discountedTotal: number }[];
}

export type SortId = "featured" | "price-asc" | "price-desc" | "rating" | "discount" | "title";
