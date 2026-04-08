export type OrderStatus =
  | "Draft"
  | "Confirmed"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export type OrderRecord = {
  id: string;
  orderNo: string;
  customerName: string;
  orderDate: string;
  status: OrderStatus;
  currency: string;
  totalAmount: number;
  notes?: string | null;
  createdAt: string;
};

export type CreateOrderRequest = {
  customerName: string;
  orderDate?: string | null;
  status?: OrderStatus | null;
  currency: string;
  totalAmount: number;
  notes?: string | null;
};

export type UpdateOrderRequest = {
  customerName: string;
  orderDate: string;
  status: OrderStatus;
  currency: string;
  totalAmount: number;
  notes?: string | null;
};
