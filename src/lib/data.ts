import { Sale, MonitoringAlert } from './types';

export const salesData: Sale[] = [
  { month: 'Oca', revenue: 4000 },
  { month: 'Şub', revenue: 3000 },
  { month: 'Mar', revenue: 5000 },
  { month: 'Nis', revenue: 4500 },
  { month: 'May', revenue: 6000 },
  { month: 'Haz', revenue: 5500 },
];

// This is now just mock data and not used for core functionality
export const initialAlerts: MonitoringAlert[] = [
  { id: 'ALT001', severity: 'high', title: 'Negatif Stok: Antrikot', description: 'Antrikot stok adedi -2. Lütfen hemen inceleyin.', timestamp: new Date('2023-10-27T09:15:32').toISOString() },
  { id: 'ALT002', severity: 'medium', title: 'Yüksek İndirim Uygulandı', description: 'ORD003 numaralı siparişe %50 indirim uygulandı, standart %20 limiti aşıldı.', timestamp: new Date('2023-10-26T14:30:15').toISOString() },
  { id: 'ALT003', severity: 'low', title: 'Gecikmiş Bakiye Uyarısı', description: 'Ayşe Kaya adlı müşterinin 30 günden uzun süredir 75.50 TL borcu bulunmaktadır.', timestamp: new Date('2023-10-25T11:00:00').toISOString() },
];
