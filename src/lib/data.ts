import { Order, Sale, StockAdjustment, Customer, MonitoringAlert, Product, Expense, CashboxHistory, Supplier, Staff } from './types';

export const salesData: Sale[] = [
  { month: 'Oca', revenue: 4000 },
  { month: 'Şub', revenue: 3000 },
  { month: 'Mar', revenue: 5000 },
  { month: 'Nis', revenue: 4500 },
  { month: 'May', revenue: 6000 },
  { month: 'Haz', revenue: 5500 },
];

export const initialCustomers: Customer[] = [
  { id: 'CUS001', name: 'Ahmet Yılmaz', email: 'ahmet.y@example.com', balance: -150.00 },
  { id: 'CUS002', name: 'Ayşe Kaya', email: 'ayse.k@example.com', balance: 75.50 },
  { id: 'CUS003', name: 'Mehmet Demir', email: 'mehmet.d@example.com', balance: 0.00 },
  { id: 'CUS004', name: 'Fatma Şahin', email: 'fatma.s@example.com', balance: -250.25 },
  { id: 'CUS005', name: 'Hüseyin Öztürk', email: 'huseyin.o@example.com', balance: 120.00 },
  { id: 'CUS006', name: 'Zeynep Aydın', email: 'zeynep.a@example.com', balance: -35.75 },
];

export const initialOrders: Order[] = [
  { id: 'ORD001', customerId: 'CUS001', customerName: 'Ahmet Yılmaz', description: '1kg kıyma, 0.5kg kuşbaşı', items: 3, total: 125.50, status: 'Tamamlandı', date: new Date('2023-10-27T11:45:00').toISOString() },
  { id: 'ORD002', customerId: 'CUS002', customerName: 'Ayşe Kaya', description: '2 adet kasap sucuk', items: 1, total: 45.00, status: 'Bekliyor', date: new Date('2023-10-27T10:30:00').toISOString() },
  { id: 'ORD003', customerId: 'CUS003', customerName: 'Mehmet Demir', description: '5 adet tavuk but', items: 5, total: 210.25, status: 'Tamamlandı', date: new Date('2023-10-26T17:15:00').toISOString() },
  { id: 'ORD004', customerId: 'CUS004', customerName: 'Fatma Şahin', description: '1kg antrikot', items: 2, total: 88.75, status: 'İptal Edildi', date: new Date('2023-10-26T14:00:00').toISOString() },
  { id: 'ORD005', customerId: 'CUS005', customerName: 'Mustafa Arslan', description: '2kg kuzu pirzola', items: 4, total: 150.00, status: 'Tamamlandı', date: new Date('2023-10-25T16:20:00').toISOString() },
  { id: 'CSH001', customerId: 'CASH_SALE', customerName: 'Peşin Satış', description: 'Öğle Yemeği', items: 1, total: 250.00, status: 'Tamamlandı', date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString() },
  { id: 'CSH002', customerId: 'CASH_SALE', customerName: 'Peşin Satış', description: '1 adet sucuk, 2 ekmek', items: 2, total: 180.00, status: 'Tamamlandı', date: new Date().toISOString() },
];

export const initialStockAdjustments: StockAdjustment[] = [
  { id: 'ADJ001', productId: 'PROD001', productName: 'Antrikot', quantity: -2, description: 'Son kullanma tarihi geçti', category: 'Bozulma', date: new Date('2023-10-26T09:00:00').toISOString() },
  { id: 'ADJ002', productId: 'PROD002', productName: 'Kıyma', quantity: -5, description: 'İlk sayımda yazım hatası', category: 'Veri Giriş Hatası', date: new Date('2023-10-25T18:00:00').toISOString() },
  { id: 'ADJ003', productId: 'PROD006', productName: 'Tavuk Göğsü', quantity: 10, description: 'Tedarikçiden fazla geldi', category: 'Hatalı Ürün Alımı', date: new Date('2023-10-24T11:30:00').toISOString() },
  { id: 'ADJ004', productId: 'PROD003', productName: 'Kuzu Pirzola', quantity: -1, description: 'Ambalaj hasarlı', category: 'Bozulma', date: new Date('2023-10-23T15:00:00').toISOString() },
];

export const initialAlerts: MonitoringAlert[] = [
  { id: 'ALT001', severity: 'high', title: 'Negatif Stok: Antrikot', description: 'Antrikot stok adedi -2. Lütfen hemen inceleyin.', timestamp: new Date('2023-10-27T09:15:32').toISOString() },
  { id: 'ALT002', severity: 'medium', title: 'Yüksek İndirim Uygulandı', description: 'ORD003 numaralı siparişe %50 indirim uygulandı, standart %20 limiti aşıldı.', timestamp: new Date('2023-10-26T14:30:15').toISOString() },
  { id: 'ALT003', severity: 'low', title: 'Gecikmiş Bakiye Uyarısı', description: 'Ayşe Kaya adlı müşterinin 30 günden uzun süredir 75.50 TL borcu bulunmaktadır.', timestamp: new Date('2023-10-25T11:00:00').toISOString() },
];

export const initialProducts: Product[] = [
  { id: 'PROD001', name: 'Antrikot', type: 'beef', stock: 15, price: 850, cost: 600, lowStockThreshold: 5 },
  { id: 'PROD002', name: 'Kıyma', type: 'beef', stock: 50, price: 550, cost: 400, lowStockThreshold: 10 },
  { id: 'PROD003', name: 'Kuzu Pirzola', type: 'beef', stock: 12, price: 950, cost: 750, lowStockThreshold: 5 },
  { id: 'PROD004', name: 'Pastırma', type: 'processed', stock: 25, price: 1200, cost: 900, lowStockThreshold: 8 },
  { id: 'PROD005', name: 'Sucuk', type: 'processed', stock: 40, price: 450, cost: 300, lowStockThreshold: 15 },
  { id: 'PROD006', name: 'Tavuk Göğsü', type: 'chicken', stock: 4, price: 250, cost: 180, lowStockThreshold: 10 },
  { id: 'PROD007', name: 'Tavuk But', type: 'chicken', stock: 22, price: 180, cost: 120, lowStockThreshold: 10 },
  { id: 'PROD008', name: 'Yoğurt (Tam Yağlı)', type: 'dairy', stock: 30, price: 80, cost: 60, lowStockThreshold: 10 },
];

export const initialExpenses: Expense[] = [
  { id: 'EXP001', date: new Date('2023-11-01').toISOString(), description: 'Kasım ayı dükkan kirası', category: 'Kira', amount: 5000.00 },
  { id: 'EXP002', date: new Date('2023-10-30').toISOString(), description: 'Elektrik faturası', category: 'Fatura', amount: 450.75 },
  { id: 'EXP003', date: new Date('2023-10-28').toISOString(), description: 'Ambalaj malzemeleri (poşet, streç film)', category: 'Malzeme', amount: 220.00 },
  { id: 'EXP004', date: new Date('2023-10-25').toISOString(), description: 'Ali Usta\'nın haftalık ödemesi', category: 'Maaş', amount: 1500.00 },
  { id: 'EXP005', date: new Date('2023-10-22').toISOString(), description: 'Temizlik malzemeleri', category: 'Diğer', amount: 85.50 },
];

export const initialCashboxHistory: CashboxHistory[] = [
  { id: 'CBH001', date: new Date('2023-10-26').toISOString(), opening: 500.00, cashIn: 2350.50, cashOut: 450.00, closing: 2400.50, difference: 0 },
  { id: 'CBH002', date: new Date('2023-10-25').toISOString(), opening: 450.25, cashIn: 1800.75, cashOut: 750.00, closing: 1501.00, difference: 1.00 },
  { id: 'CBH003', date: new Date('2023-10-24').toISOString(), opening: 610.00, cashIn: 2100.00, cashOut: 200.00, closing: 2505.00, difference: -5.00 },
];

export const initialSuppliers: Supplier[] = [
    { id: 'SUP001', name: 'Merkez Et A.Ş.', contactPerson: 'Hakan Güçlü', phone: '0555 111 2233', email: 'hakan@merkezet.com' },
    { id: 'SUP002', name: 'Baharat Kralı Ltd.', contactPerson: 'Zeynep Bahar', phone: '0533 444 5566', email: 'zeynep@baharatkrali.com' },
    { id: 'SUP003', name: 'Ambalaj Dünyası', contactPerson: 'Ahmet Kutu', phone: '0544 777 8899', email: 'ahmet@ambalajdunyasi.com' },
];

export const initialStaff: Staff[] = [
    { id: 'STA001', name: 'Ali Veli', position: 'Kasap Ustası', salary: 25000, phone: '0532 987 6543' },
    { id: 'STA002', name: 'Ayşe Fatma', position: 'Tezgahtar', salary: 18000, phone: '0535 123 4567' },
];
