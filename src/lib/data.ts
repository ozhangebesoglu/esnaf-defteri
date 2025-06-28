import { Order, Sale, StockAdjustment, Customer, MonitoringAlert, Product } from './types';

export const salesData: Sale[] = [
  { month: 'Jan', revenue: 4000 },
  { month: 'Feb', revenue: 3000 },
  { month: 'Mar', revenue: 5000 },
  { month: 'Apr', revenue: 4500 },
  { month: 'May', revenue: 6000 },
  { month: 'Jun', revenue: 5500 },
];

export const recentOrders: Order[] = [
  { id: 'ORD001', customer: 'John Doe', items: 3, total: 125.50, status: 'Fulfilled' },
  { id: 'ORD002', customer: 'Jane Smith', items: 1, total: 45.00, status: 'Pending' },
  { id: 'ORD003', customer: 'Bob Johnson', items: 5, total: 210.25, status: 'Fulfilled' },
  { id: 'ORD004', customer: 'Alice Williams', items: 2, total: 88.75, status: 'Cancelled' },
  { id: 'ORD005', customer: 'Charlie Brown', items: 4, total: 150.00, status: 'Fulfilled' },
];

export const stockAdjustments: StockAdjustment[] = [
  { id: 'ADJ001', product: 'Ribeye Steak', quantity: -2, reason: 'Went bad before sell-by date', category: 'Spoilage', date: '2023-10-26' },
  { id: 'ADJ002', product: 'Ground Beef', quantity: -5, reason: 'Typo in initial count', category: 'Data Entry Error', date: '2023-10-25' },
  { id: 'ADJ003', product: 'Chicken Breast', quantity: 10, reason: 'Extra in shipment', category: 'Received Product Error', date: '2023-10-24' },
  { id: 'ADJ004', product: 'Pork Chops', quantity: -1, reason: 'Damaged packaging', category: 'Spoilage', date: '2023-10-23' },
];

export const customers: Customer[] = [
  { id: 'CUS001', name: 'John Doe', email: 'john.d@example.com', balance: 50.00 },
  { id: 'CUS002', name: 'Jane Smith', email: 'jane.s@example.com', balance: -25.50 },
  { id: 'CUS003', name: 'Bob Johnson', email: 'bob.j@example.com', balance: 0.00 },
  { id: 'CUS004', name: 'Alice Williams', email: 'alice.w@example.com', balance: 100.25 },
];

export const alerts: MonitoringAlert[] = [
  { id: 'ALT001', severity: 'high', title: 'Negative Stock: Ribeye Steak', description: 'Inventory count for Ribeye Steak is -2. Please investigate immediately.', timestamp: '2023-10-27 09:15' },
  { id: 'ALT002', severity: 'medium', title: 'Large Discount Applied', description: 'Order #ORD003 received a 50% discount, exceeding the standard 20% limit.', timestamp: '2023-10-26 14:30' },
  { id: 'ALT003', severity: 'low', title: 'Pending balance alert', description: 'Customer Jane Smith has a pending balance of $25.50 for over 30 days.', timestamp: '2023-10-25 11:00' },
];

export const products: Product[] = [
  { id: 'PROD001', name: 'Ribeye Steak', type: 'beef' },
  { id: 'PROD002', name: 'Ground Beef', type: 'beef' },
  { id: 'PROD003', name: 'Pork Chops', type: 'pork' },
  { id: 'PROD004', name: 'Bacon', type: 'pork' },
  { id: 'PROD005', name: 'Chicken Breast', type: 'chicken' },
  { id: 'PROD006', name: 'Chicken Thighs', type: 'chicken' },
];
