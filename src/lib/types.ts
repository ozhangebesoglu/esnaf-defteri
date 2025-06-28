export type Order = {
  id: string;
  customer: string;
  items: number;
  total: number;
  status: 'Tamamlandı' | 'Bekliyor' | 'İptal Edildi';
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
  category: 'Bozulma' | 'Hırsızlık' | 'Veri Giriş Hatası' | 'Hatalı Ürün Alımı' | 'İndirim' | 'Diğer';
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
  stock: number;
  lowStockThreshold: number;
};

export type Expense = {
  id: string;
  date: string;
  description: string;
  category: 'Kira' | 'Fatura' | 'Malzeme' | 'Maaş' | 'Diğer';
  amount: number;
};

export type CashboxHistory = {
  id: string;
  date: string;
  opening: number;
  cashIn: number;
  cashOut: number;
  closing: number;
  difference: number;
};
