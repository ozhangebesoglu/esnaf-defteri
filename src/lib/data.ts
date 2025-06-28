import { Order, Sale, StockAdjustment, Customer, MonitoringAlert, Product, Expense, CashboxHistory } from './types';

export const salesData: Sale[] = [
  { month: 'Oca', revenue: 4000 },
  { month: 'Şub', revenue: 3000 },
  { month: 'Mar', revenue: 5000 },
  { month: 'Nis', revenue: 4500 },
  { month: 'May', revenue: 6000 },
  { month: 'Haz', revenue: 5500 },
];

export const customers: Customer[] = [
  { id: 'CUS001', name: 'Ahmet Yılmaz', email: 'ahmet.y@example.com', balance: 150.00 },
  { id: 'CUS002', name: 'Ayşe Kaya', email: 'ayse.k@example.com', balance: -75.50 },
  { id: 'CUS003', name: 'Mehmet Demir', email: 'mehmet.d@example.com', balance: 0.00 },
  { id: 'CUS004', name: 'Fatma Şahin', email: 'fatma.s@example.com', balance: 250.25 },
  { id: 'CUS005', name: 'Hüseyin Öztürk', email: 'huseyin.o@example.com', balance: -120.00 },
  { id: 'CUS006', name: 'Zeynep Aydın', email: 'zeynep.a@example.com', balance: 35.75 },
];

export const recentOrders: Order[] = [
  { id: 'ORD001', customerId: 'CUS001', customerName: 'Ahmet Yılmaz', description: '1kg kıyma, 0.5kg kuşbaşı', items: 3, total: 125.50, status: 'Tamamlandı' },
  { id: 'ORD002', customerId: 'CUS002', customerName: 'Ayşe Kaya', description: '2 adet kasap sucuk', items: 1, total: 45.00, status: 'Bekliyor' },
  { id: 'ORD003', customerId: 'CUS003', customerName: 'Mehmet Demir', description: '5 adet tavuk but', items: 5, total: 210.25, status: 'Tamamlandı' },
  { id: 'ORD004', customerId: 'CUS004', customerName: 'Fatma Şahin', description: '1kg antrikot', items: 2, total: 88.75, status: 'İptal Edildi' },
  { id: 'ORD005', customerId: 'CUS005', customerName: 'Mustafa Arslan', description: '2kg kuzu pirzola', items: 4, total: 150.00, status: 'Tamamlandı' },
];

export const stockAdjustments: StockAdjustment[] = [
  { id: 'ADJ001', productId: 'PROD001', productName: 'Antrikot', quantity: -2, description: 'Son kullanma tarihi geçti', category: 'Bozulma', date: '2023-10-26' },
  { id: 'ADJ002', productId: 'PROD002', productName: 'Kıyma', quantity: -5, description: 'İlk sayımda yazım hatası', category: 'Veri Giriş Hatası', date: '2023-10-25' },
  { id: 'ADJ003', productId: 'PROD006', productName: 'Tavuk Göğsü', quantity: 10, description: 'Tedarikçiden fazla geldi', category: 'Hatalı Ürün Alımı', date: '2023-10-24' },
  { id: 'ADJ004', productId: 'PROD003', productName: 'Kuzu Pirzola', quantity: -1, description: 'Ambalaj hasarlı', category: 'Bozulma', date: '2023-10-23' },
];

export const alerts: MonitoringAlert[] = [
  { id: 'ALT001', severity: 'high', title: 'Negatif Stok: Antrikot', description: 'Antrikot stok adedi -2. Lütfen hemen inceleyin.', timestamp: '2023-10-27 09:15' },
  { id: 'ALT002', severity: 'medium', title: 'Yüksek İndirim Uygulandı', description: 'ORD003 numaralı siparişe %50 indirim uygulandı, standart %20 limiti aşıldı.', timestamp: '2023-10-26 14:30' },
  { id: 'ALT003', severity: 'low', title: 'Gecikmiş Bakiye Uyarısı', description: 'Ayşe Kaya adlı müşterinin 30 günden uzun süredir 75.50 TL borcu bulunmaktadır.', timestamp: '2023-10-25 11:00' },
];

export const products: Product[] = [
  { id: 'PROD001', name: 'Antrikot', type: 'beef', stock: 15, price: 850, cost: 600, lowStockThreshold: 5 },
  { id: 'PROD002', name: 'Kıyma', type: 'beef', stock: 50, price: 550, cost: 400, lowStockThreshold: 10 },
  { id: 'PROD003', name: 'Kuzu Pirzola', type: 'beef', stock: 12, price: 950, cost: 750, lowStockThreshold: 5 },
  { id: 'PROD004', name: 'Pastırma', type: 'pork', stock: 25, price: 1200, cost: 900, lowStockThreshold: 8 },
  { id: 'PROD005', name: 'Sucuk', type: 'pork', stock: 40, price: 450, cost: 300, lowStockThreshold: 15 },
  { id: 'PROD006', name: 'Tavuk Göğsü', type: 'chicken', stock: 4, price: 250, cost: 180, lowStockThreshold: 10 },
  { id: 'PROD007', name: 'Tavuk But', type: 'chicken', stock: 22, price: 180, cost: 120, lowStockThreshold: 10 },
];

export const expenses: Expense[] = [
  { id: 'EXP001', date: '2023-11-01', description: 'Kasım ayı dükkan kirası', category: 'Kira', amount: 5000.00 },
  { id: 'EXP002', date: '2023-10-30', description: 'Elektrik faturası', category: 'Fatura', amount: 450.75 },
  { id: 'EXP003', date: '2023-10-28', description: 'Ambalaj malzemeleri (poşet, streç film)', category: 'Malzeme', amount: 220.00 },
  { id: 'EXP004', date: '2023-10-25', description: 'Ali Usta\'nın haftalık ödemesi', category: 'Maaş', amount: 1500.00 },
  { id: 'EXP005', date: '2023-10-22', description: 'Temizlik malzemeleri', category: 'Diğer', amount: 85.50 },
];

export const cashboxHistory: CashboxHistory[] = [
  { id: 'CBH001', date: '26.10.2023', opening: 500.00, cashIn: 2350.50, cashOut: 450.00, closing: 2400.50, difference: 0 },
  { id: 'CBH002', date: '25.10.2023', opening: 450.25, cashIn: 1800.75, cashOut: 750.00, closing: 1501.00, difference: 1.00 },
  { id: 'CBH003', date: '24.10.2023', opening: 610.00, cashIn: 2100.00, cashOut: 200.00, closing: 2505.00, difference: -5.00 },
];
