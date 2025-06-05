## 🎬 YouTube Clone

🔗 [View on GitHub](https://github.com/quetrea/youtube-clone)

A feature-rich video-sharing platform inspired by YouTube. Built for performance, scalability, and user experience. Supports video upload, streaming, account management, and dynamic UI interactions.

---

### 🚀 Tech Stack Overview

#### 🔧 Backend
- **Hono.js** – Lightning-fast web framework
- **tRPC** – End-to-end type-safe APIs
- **Drizzle ORM** – TypeScript-first ORM for SQL
- **Neon Database** – Serverless PostgreSQL solution
- **Mux** – Video upload, transcoding & streaming
- **SuperJSON** – Rich data serialization

#### 🎨 Frontend
- **Next.js 15** – Modern React full-stack framework
- **React 19** – Latest version of React
- **Tailwind CSS** + `tailwindcss-animate` – Utility-first CSS with smooth animations
- **Radix UI** – Accessible and composable components
- **Framer Motion** – UI animation engine
- **Lucide Icons** – Clean icon set
- **cmdk** – Command palette component
- **UploadThing** – Seamless file upload experience
- **Vaul** – Drawer/modal interactions
- **Embla Carousel** – Custom carousels for featured content
- **Sonner** – Toast notification system

#### 📦 State & Form Management
- **React Query** – Server state management
- **React Hook Form + Zod** – Type-safe form handling and validation
- **Zustand** – Lightweight global state

---

### 📂 Scripts

```bash
# Start development server
bun run dev:all

# Start Next.js only
bun run dev

# Expose webhook listener with ngrok
bun run dev:webhook
