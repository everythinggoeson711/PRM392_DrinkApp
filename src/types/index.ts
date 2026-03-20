export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Product {
  id: number;
  name: string;
  price: number | string;
  imageUrl?: string;
  categoryId?: number;
  category?: Category;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId?: number;
  product?: Product;
  quantity: number;
  size?: string;
  sugarLevel?: string;
  iceLevel?: string;
  toppings?: string;
  price: number | string;
}

export interface Order {
  id: number;
  userId?: number;
  customerName: string;
  phone: string;
  address?: string;
  totalAmount: number | string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  items?: OrderItem[];
}

export interface Payment {
  id: number;
  orderId: number;
  paymentCode: string;
  amount: number | string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED';
  qrUrl?: string;
  sepayTransactionId?: string;
  paidAt?: string;
  createdAt: string;
}
