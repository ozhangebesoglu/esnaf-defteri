
# ButcherTrack Mobile (Esnaf Defteri)

ButcherTrack Mobile, modern kasaplar ve küçük et işletmeleri gibi geleneksel esnafların dijital dönüşümünü hedefleyen, kapsamlı ve kullanıcı dostu bir mobil ciro, stok ve cari hesap takip uygulamasıdır. Bu uygulama, sadece bir prototip değil; güvenli, ölçeklenebilir ve yayına hazır bir üründür.

## Proje Hikayesi

### ✨ İlham Kaynağı (Inspiration)

İlhamımız, teknolojinin nimetlerinden en az yararlanan, ancak ekonominin bel kemiği olan küçük esnaflardı. Birçok kasap, manav veya yerel işletme, hala tüm hesaplarını, borç-alacak ilişkilerini ve stoklarını "veresiye defteri" olarak bilinen fiziksel bir defterde tutuyor. Bu geleneksel yöntem, hem hata yapmaya çok açık, hem de işletmenin finansal sağlığı hakkında anlık ve net bir görüş sunmaktan çok uzak. Amacımız, bu defteri bir kenara attıracak, kullanımı kolay, güçlü ve hatta akıllı bir dijital asistan sunarak esnafın hayatını kolaylaştırmaktı. Onlara, büyük zincir marketlerin sahip olduğu teknolojik gücü, ceplerine sığacak bir formatta sunmak istedik.

### 🎯 Ne Yapar? (What it does)

ButcherTrack, bir esnafın günlük operasyonlarını yönetmek için ihtiyaç duyduğu her şeyi tek bir platformda toplar:

*   **Anasayfa Paneli:** Günlük satışlar, toplam alacak/borç ve müşteri sayısı gibi kilit metriklerin anlık özetini sunar. Satış ve gider dağılımı grafikleriyle finansal durumu görselleştirir.
*   **Satış ve Müşteri Yönetimi:** Hem veresiye (borç) hem de peşin (nakit/visa) satışlar kolayca kaydedilir. Müşteriye özel işlem ve ödeme geçmişi detaylı olarak takip edilebilir.
*   **Stok Yönetimi:** Ürünler kategorilere ayrılır, fiyat ve maliyet bilgileri yönetilir. Stok girişleri, bozulma veya fire gibi manuel stok hareketleri kolayca eklenebilir. Düşük stok seviyeleri için otomatik uyarılar oluşturulur.
*   **Finans ve Kasa Yönetimi:** Kira, fatura, maaş gibi işletme giderleri kategorize edilerek takip edilir. Günlük nakit ve kart giriş/çıkışları izlenir ve gün sonunda kasa sayımı yapılarak finansal doğruluk sağlanır.
*   **Yapay Zeka Asistanı:** Uygulamanın en ayırt edici özelliği! Kullanıcılar, Türkçe doğal dil komutları ile uygulama içinde işlem yapabilir (örn., "Ahmet Yılmaz'a 250 liralık satış ekle", "2kg kıymayı stoktan düş", "Ayşe Kaya'dan 100 lira nakit ödeme aldım"). Asistan, konuşma geçmişini hatırlayarak akıcı bir deneyim sunar.

### 🛠️ Nasıl Geliştirdik? (How we built it)

Bu proje, modern web teknolojileri ve yapay zeka destekli bir geliştirme süreciyle hayata geçirildi. **Firebase Studio** ortamında, AI kodlama partneri ile diyalog kurarak, çevik bir yaklaşımla geliştirildi.

*   **Framework:** **Next.js 15 (App Router)** kullanarak sunucu bileşenleri (Server Components) ve sunucu eylemleri (Server Actions) ile yüksek performanslı ve modern bir yapı kurduk.
*   **UI ve Tasarım:** Arayüz için **React**, **ShadCN UI** bileşen kütüphanesi ve **Tailwind CSS** kullandık. Bu sayede hem estetik hem de tamamen duyarlı (responsive) bir tasarım elde ettik. Tüm cihazlarda sorunsuz bir kullanıcı deneyimi sunar.
*   **Yapay Zeka (AI):** Projenin kalbinde **Google Gemini** ve **Genkit** yer alıyor.
    *   Kullanıcı komutlarını anlamak ve veritabanı işlemlerini tetiklemek için `tool-use` yeteneğine sahip, sohbet geçmişini hatırlayan durumlu (stateful) bir AI asistanı oluşturduk.
    *   Asistanın, yapmadığı bir işlemi "yaptım" demesini engelleyen güvenlik kontrolleri eklendi.
    *   Tüm AI araçları, olası veritabanı hatalarını yakalayıp kullanıcıya anlaşılır mesajlar dönecek şekilde sağlamlaştırıldı.
*   **Veritabanı ve Güvenlik:** **Firebase**'in gücünden sonuna kadar yararlandık.
    *   **Firestore**'u NoSQL veritabanı olarak kullandık ve her kullanıcının verisini (`users/{userId}/{...}`) diğerlerinden tamamen izole edecek şekilde güvenli bir mimari oluşturduk.
    *   **Firestore Güvenlik Kuralları** ile her kullanıcının yalnızca kendi verilerine erişebileceğini sunucu tarafında garanti altına aldık.
    *   **Firebase Authentication**'ı güvenli kullanıcı yönetimi için kullandık.
*   **Form Yönetimi ve Doğrulama:** Kullanıcı girişlerini yönetmek için **React Hook Form** ve veri şemalarını doğrulamak için **Zod** kütüphanelerini kullandık.
*   **Hata Yönetimi:** Uygulama genelindeki tüm veritabanı işlemlerine, olası hataları yakalayıp kullanıcıya anlaşılır bildirimler gösteren `try...catch` blokları eklendi.

### 🧗‍♀️ Karşılaştığımız Zorluklar ve Çözümleri (Challenges & Solutions)

*   **Güvenlik ve Yetkilendirme:** En büyük zorluk, **Firestore Güvenlik Kuralları**'nı doğru bir şekilde yapılandırarak her kullanıcının verisini diğerinden tamamen izole etmekti. İlk başta genel kurallar, AI asistanının bile yetki hataları almasına neden oluyordu.
    *   **Çözüm:** Veritabanı mimarisini, tüm kullanıcı verilerini `users/{userId}` koleksiyonu altına taşıyarak yeniden tasarladık. Ardından, her kullanıcının yalnızca kendi `{userId}` yolu altındaki belgelere erişmesine izin veren (`allow read, write: if request.auth.uid == userId;`) kesin ve net güvenlik kuralları yazdık. Bu, sorunu kökünden çözdü.
*   **Yapay Zeka Halüsinasyonları:** AI asistanı, bazen bir veritabanı işlemi yapmamasına rağmen "Tamam, ekledim" gibi yanıltıcı cevaplar verebiliyordu.
    *   **Çözüm:** AI akışına bir güvenlik kontrolü ekledik. Eğer modelin cevabı bir onay ifadesi içeriyor ancak herhangi bir araç (tool) çağrısı yapmıyorsa, bu cevap engelleniyor ve kullanıcıdan daha net bir komut vermesi isteniyor.
*   **Dayanıksız Veritabanı İşlemleri:** Uygulama içindeki fonksiyonlar, ağ hatası veya başka bir sorun olduğunda çöküyor ve kullanıcıya bir bildirim göstermiyordu.
    *   **Çözüm:** Hem istemci tarafındaki (`dashboard/page.tsx`) hem de AI araçlarındaki (`esnaf-tools.ts`) tüm veritabanı operasyonlarını `try...catch` blokları içine aldık. Herhangi bir hata durumunda, kullanıcıya `toast` bildirimi ile anlaşılır bir hata mesajı gösterilmesini sağladık.

### 🏆 Gurur Duyduğumuz Başarılar (Accomplishments that we're proud of)

*   **Gerçek Bir Probleme Çözüm Üretmek:** Teknolojiyi, geleneksel bir iş modeline sahip esnafın hayatını kolaylaştıracak somut bir çözüme dönüştürmüş olmaktan gurur duyuyoruz.
*   **Güvenilir ve Zeki AI Asistanı:** Karmaşık formlar yerine, "Ahmet'e 500 liralık mal sattım" gibi basit bir cümleyle işlem yapılabilmesini sağlayan AI asistanı, projemizin en yenilikçi ve gurur duyduğumuz yönü. Artık daha sağlam ve güvenilir.
*   **Production-Ready Bir Uygulama:** Bu proje, sadece bir prototip değil. Detaylı güvenlik kuralları, kapsamlı hata yönetimi, izole veri mimarisi ve tamamen duyarlı arayüzü ile yayına hazır, bütünlüklü bir uygulama. AI destekli bir geliştirme ortamında bu kadar kısa sürede bu olgunluk seviyesine ulaşmak büyük bir başarı.

### 📚 Öğrendiklerimiz (What we learned)

*   **AI, Arayüzün Kendisidir:** Yapay zekanın sadece bir "özellik" değil, aynı zamanda kullanıcı arayüzünün kendisi olabileceğini öğrendik. Doğru tasarlandığında, AI asistanı karmaşık formların ve menülerin yerini alabilir.
*   **Backend Güvenliği Her Şeydir:** Özellikle serverless bir mimaride, veritabanı güvenlik kurallarının ve veri izolasyonunun uygulamanın en kritik katmanı olduğunu ve en başından dikkatle tasarlanması gerektiğini tecrübe ettik.
*   **Kullanıcı Güveni ve Hata Yönetimi:** Bir işlemin sessizce başarısız olmasının, kullanıcı güvenini sarsan en kötü şeylerden biri olduğunu gördük. Sağlam hata yönetimi ve net geri bildirimler, profesyonel bir uygulamanın olmazsa olmazıdır.

### 🚀 Gelecek Planları (What's next for ButcherTrack)

ButcherTrack için vizyonumuz büyük!
*   **Tahminsel Analiz:** Satış verilerini analiz ederek hangi ürünlerin ne zaman daha çok satılacağı veya hangi ürünlerin stoklarının tükenmek üzere olduğu hakkında tahminde bulunan AI özellikleri.
*   **Tedarikçi Yönetimi:** Tedarikçilere sipariş verme ve gelen faturaları işleme modülü.
*   **Otomatik Hatırlatmalar:** Müşterilere borçları için SMS veya WhatsApp üzerinden otomatik hatırlatmalar gönderme.
*   **Sesli Komut:** Yazmak yerine, konuşarak AI asistanı ile etkileşime geçme özelliği.
