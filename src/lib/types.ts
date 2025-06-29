
export type FirestoreDoc = {
    id: string;
    userId: string;
}

export type Order = FirestoreDoc & {
  customerId: string;
  customerName: string; 
  description: string;
  items: number;
  total: number;
  status: 'Tamamlandı' | 'Bekliyor' | 'İptal Edildi';
  date: string;
};

export type Sale = {
  month: string;
  revenue: number;
};

export type StockAdjustment = FirestoreDoc & {
  productId: string;
  productName: string;
  quantity: number;
  description: string;
  category: 'Bozulma' | 'Hırsızlık' | 'Veri Giriş Hatası' | 'Hatalı Ürün Alımı' | 'İndirim' | 'Diğer';
  date: string;
};

export type Customer = FirestoreDoc & {
  name: string;
  email?: string;
  balance: number;
};

export type MonitoringAlert = FirestoreDoc & {
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  timestamp: string;
};

export type Product = FirestoreDoc & {
  name: string;
  type: 'beef' | 'processed' | 'chicken' | 'dairy';
  stock: number;
  price: number;
  cost: number;
  lowStockThreshold: number;
};

export type Expense = FirestoreDoc & {
  date: string;
  description: string;
  category: 'Kira' | 'Fatura' | 'Malzeme' | 'Maaş' | 'Diğer';
  amount: number;
};

export type CashboxHistory = FirestoreDoc & {
  date: string;
  opening: number;
  cashIn: number;
  cashOut: number;
  closing: number;
  difference: number;
};

export type Supplier = FirestoreDoc & {
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
};

export type Staff = FirestoreDoc & {
  name: string;
  position: string;
  salary: number;
  phone?: string;
};

export type Message = {
  role: 'user' | 'model' | 'tool';
  content: any; // string for user/model text, complex object for tool calls/responses
};

export type ChatHistory = FirestoreDoc & {
  messages: Message[];
};
