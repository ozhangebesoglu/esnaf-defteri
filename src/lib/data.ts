import { Order, Sale, StockAdjustment, Customer, MonitoringAlert, Product } from './types';

export const salesData: Sale[] = [
  { month: 'Oca', revenue: 4000 },
  { month: 'Şub', revenue: 3000 },
  { month: 'Mar', revenue: 5000 },
  { month: 'Nis', revenue: 4500 },
  { month: 'May', revenue: 6000 },
  { month: 'Haz', revenue: 5500 },
];

export const recentOrders: Order[] = [
  { id: 'ORD001', customer: 'Ahmet Yılmaz', items: 3, total: 125.50, status: 'Tamamlandı' },
  { id: 'ORD002', customer: 'Ayşe Kaya', items: 1, total: 45.00, status: 'Bekliyor' },
  { id: 'ORD003', customer: 'Mehmet Demir', items: 5, total: 210.25, status: 'Tamamlandı' },
  { id: 'ORD004', customer: 'Fatma Şahin', items: 2, total: 88.75, status: 'İptal Edildi' },
  { id: 'ORD005', customer: 'Mustafa Arslan', items: 4, total: 150.00, status: 'Tamamlandı' },
];

export const stockAdjustments: StockAdjustment[] = [
  { id: 'ADJ001', product: 'Antrikot', quantity: -2, reason: 'Son kullanma tarihi geçti', category: 'Bozulma', date: '2023-10-26' },
  { id: 'ADJ002', product: 'Kıyma', quantity: -5, reason: 'İlk sayımda yazım hatası', category: 'Veri Giriş Hatası', date: '2023-10-25' },
  { id: 'ADJ003', product: 'Tavuk Göğsü', quantity: 10, reason: 'Tedarikçiden fazla geldi', category: 'Hatalı Ürün Alımı', date: '2023-10-24' },
  { id: 'ADJ004', product: 'Kuzu Pirzola', quantity: -1, reason: 'Ambalaj hasarlı', category: 'Bozulma', date: '2023-10-23' },
];

export const customers: Customer[] = [
  { id: 'CUS001', name: 'Ahmet Yılmaz', email: 'ahmet.y@example.com', balance: 150.00 },
  { id: 'CUS002', name: 'Ayşe Kaya', email: 'ayse.k@example.com', balance: -75.50 },
  { id: 'CUS003', name: 'Mehmet Demir', email: 'mehmet.d@example.com', balance: 0.00 },
  { id: 'CUS004', name: 'Fatma Şahin', email: 'fatma.s@example.com', balance: 250.25 },
  { id: 'CUS005', name: 'Hüseyin Öztürk', email: 'huseyin.o@example.com', balance: -120.00 },
  { id: 'CUS006', name: 'Zeynep Aydın', email: 'zeynep.a@example.com', balance: 35.75 },
];

export const alerts: MonitoringAlert[] = [
  { id: 'ALT001', severity: 'high', title: 'Negatif Stok: Antrikot', description: 'Antrikot stok adedi -2. Lütfen hemen inceleyin.', timestamp: '2023-10-27 09:15' },
  { id: 'ALT002', severity: 'medium', title: 'Yüksek İndirim Uygulandı', description: 'ORD003 numaralı siparişe %50 indirim uygulandı, standart %20 limiti aşıldı.', timestamp: '2023-10-26 14:30' },
  { id: 'ALT003', severity: 'low', title: 'Gecikmiş Bakiye Uyarısı', description: 'Ayşe Kaya adlı müşterinin 30 günden uzun süredir 75.50 TL borcu bulunmaktadır.', timestamp: '2023-10-25 11:00' },
];

export const products: Product[] = [
  { id: 'PROD001', name: 'Antrikot', type: 'beef' },
  { id: 'PROD002', name: 'Kıyma', type: 'beef' },
  { id: 'PROD003', name: 'Kuzu Pirzola', type: 'pork' },
  { id: 'PROD004', name: 'Pastırma', type: 'pork' },
  { id: 'PROD005', name: 'Tavuk Göğsü', type: 'chicken' },
  { id: 'PROD006', name: 'Tavuk But', type: 'chicken' },
];
