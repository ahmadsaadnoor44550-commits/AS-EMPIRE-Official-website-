export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number; // in PKR
  discountPrice?: number; // in PKR
  stock: number;
  isAvailable: boolean;
  images: string[];
  specifications?: Record<string, string>;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category?: string;
}

export type OrderStatus = 'Pending Confirmation' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string; // e.g. ASE-2026-9821
  customerId?: string; // UID if customer is registered
  customerName: string;
  phone: string;
  address: string;
  city: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharges: number;
  deliveryMethod?: 'courier' | 'pickup';
  totalAmount: number;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StoreSettings {
  storeName: string;
  ownerName: string;
  tagline: string;
  whatsappNumber: string; // Real owner WhatsApp e.g. 03330916398
  contactEmail: string;
  contactPhone: string;
  businessAddress: string;
  logoUrl?: string;
  bannerUrl?: string;
  announcement?: string;
  aboutText?: string;
  ownerIntro?: string;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  paymentInstructions?: string;
  easyPaisaAccount?: string;
  jazzCashAccount?: string;
  bankAccountDetails?: string;
  categories: string[];
  updatedAt?: string;
}

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'customer' | 'owner';
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
