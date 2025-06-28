export type Order = {
  id: string;
  customer: string;
  items: number;
  total: number;
  status: 'Fulfilled' | 'Pending' | 'Cancelled';
};

export type Sale = {
  month: string;
  revenue: number;
};

export type StockAdjustment = {
  id: string;
  product: string;
  quantity: number;
  reason: string;
  category: 'Spoilage' | 'Theft' | 'Data Entry Error' | 'Received Product Error' | 'Discount' | 'Other';
  date: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  balance: number;
};

export type MonitoringAlert = {
  id: string;
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  timestamp: string;
};

export type Product = {
  id: string;
  name: string;
  type: 'beef' | 'pork' | 'chicken';
};
