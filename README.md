## 🎬 YouTube Clone

🔗 [GitHub Repository](https://github.com/quetrea/youtube-clone)

Modern bir video paylaşım platformu klonu. Gerçek zamanlı video yükleme, akıcı kullanıcı deneyimi ve gelişmiş erişilebilirlik ile inşa edildi. Performans odaklı ve ölçeklenebilir bir mimariye sahiptir.

---

### 🚀 Teknoloji Yığını

#### ⚙️ Backend
- **Hono.js** – Minimal ve hızlı bir web framework
- **tRPC** – Tip güvenli API iletişimi
- **Drizzle ORM** – TypeScript destekli, hafif ORM
- **Neon Database** – Serverless PostgreSQL altyapısı
- **Mux (Node SDK)** – Video yükleme ve streaming altyapısı

#### 🎨 Frontend
- **Next.js 15** – React tabanlı, SSR/SSG destekli framework
- **Tailwind CSS** + **tailwindcss-animate** – Modern UI tasarımı
- **Radix UI** – Erişilebilir ve ölçeklenebilir UI bileşenleri
- **Framer Motion** – Animasyonlar için güçlü araç

#### 🛠️ Diğer Özellikler
- **Clerk Auth** – Gelişmiş kimlik doğrulama
- **UploadThing** – Dosya yükleme sistemi
- **Upstash Redis + RateLimit** – Rate limiting ve önbellekleme
- **zod + react-hook-form** – Form yönetimi ve validasyon
- **React Query** – Veri önbellekleme ve fetch yönetimi
- **Sonner** – Bildirimler ve toast mesajları

---

### 📸 Özellikler
- ✅ Video yükleme ve izleme (MUX destekli)
- ✅ Kullanıcı kaydı ve girişi (Clerk)
- ✅ Yorumlar, toast bildirimler, error-boundary desteği
- ✅ Dashboard ve kullanıcı kontrol paneli
- ✅ Mobil uyumlu ve erişilebilir UI

---

### 📄 Kurulum

```bash
git clone https://github.com/quetrea/youtube-clone.git
cd youtube-clone
bun install
bun run dev:all
