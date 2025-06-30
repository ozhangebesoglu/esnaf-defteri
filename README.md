# ButcherTrack Mobile (Esnaf Defteri)

ButcherTrack Mobile, modern kasaplar ve küçük et işletmeleri için özel olarak tasarlanmış, kapsamlı ve kullanıcı dostu bir mobil ciro, stok ve cari hesap takip uygulamasıdır. Bu uygulama, günlük operasyonları basitleştirmek, veri doğruluğunu artırmak ve işletme sahiplerine anlık finansal ve envanter bilgileri sunmak için geliştirilmiştir.

Uygulama, Next.js, React, ShadCN UI, Tailwind CSS ve yapay zeka destekli işlemler için Google Gemini (Genkit aracılığıyla) gibi modern web teknolojileri kullanılarak oluşturulmuştur.

## ✨ Temel Özellikler

-   **Anasayfa Paneli:** Günlük satışlar, toplam alacak/borç ve müşteri sayısı gibi kilit metriklerin anlık özetini sunar. Satış ve gider dağılımı grafikleriyle finansal durumu görselleştirir.
-   **Satış Yönetimi:** Hem veresiye (borç) hem de peşin satışları kolayca kaydedin. Müşteri bazlı satış geçmişini ve ödemeleri takip edin.
-   **Ürün ve Stok Yönetimi:** Ürünleri (kırmızı et, beyaz et, şarküteri vb.) kategorilere ayırın, fiyat ve maliyet bilgilerini yönetin. Manuel stok hareketleri (bozulma, yeni giriş vb.) ekleyin. Düşük stok seviyeleri için otomatik uyarılar alın.
-   **Müşteri Yönetimi (CRM):** Müşteri bilgilerini ve cari hesap bakiyelerini (borç/alacak) yönetin. Müşteriye özel işlem geçmişini detaylı olarak görüntüleyin.
-   **Gider Takibi:** Kira, fatura, maaş gibi işletme giderlerini kategorize ederek kaydedin. Gider dağılımı raporları ile harcamalarınızı analiz edin.
-   **Kasa Yönetimi:** Günlük nakit giriş ve çıkışlarını takip edin. Gün sonunda kasa sayımı yaparak güncel bakiyeyi doğrulayın ve kasa geçmişini kaydedin.
-   **Yapay Zeka Asistanı:** Türkçe doğal dil komutları ile uygulama içinde işlem yapın (örn., "Ahmet Yılmaz'a 250 liralık satış ekle", "2kg kıymayı stoktan düş"). Asistan, konuşma geçmişini hatırlayarak akıcı bir deneyim sunar.
-   **Tamamen Duyarlı Tasarım:** Uygulama, masaüstü bilgisayarlardan tabletlere ve mobil telefonlara kadar tüm cihazlarda sorunsuz bir kullanıcı deneyimi sunar.

## 🎨 Stil ve Tasarım

-   **Ana Renk:** `#8B0000` (Koyu Kırmızı) - Taze eti çağrıştıran derin ve profesyonel bir ton.
-   **Arka Plan Rengi:** `#F5F5DC` (Yumuşak Bej) - Kasap kağıdını andıran sıcak ve temiz bir zemin.
-   **Vurgu Rengi:** `#A0522D` (Toprak Kahvesi) - Doğal ve ham malzemelere atıfta bulunan bir renk.
-   **Yazı Tipi:** 'Literata' - Okunabilirliği yüksek, hem modern hem de geleneksel bir his veren bir serif fontu.

## 🛠️ Teknik Altyapı

-   **Framework:** Next.js 15 (App Router)
-   **UI Kütüphanesi:** React
-   **Bileşenler:** ShadCN UI
-   **Stil:** Tailwind CSS
-   **Yapay Zeka:** Google Gemini (Genkit ile)
-   **Veritabanı & Kimlik Doğrulama:** Firebase (Firestore & Auth)
-   **Form Yönetimi:** React Hook Form & Zod
-   **Grafikler:** Recharts

## 🚀 Başlarken

Bu bir Firebase Studio projesidir. Geliştirmeye başlamak için projeyi klonlayın ve bağımlılıkları yükleyin:

```bash
npm install
npm run dev
```
