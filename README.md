# نبض AI - Nabdh AI

دليلك الشامل لأفضل أدوات الذكاء الاصطناعي العربية والعالمية.
موقع Nabdh AI هو منصة متكاملة (PWA) للبحث، تصفح، ومقارنة أحدث أدوات الذكاء الاصطناعي. مبني باستخدام أحدث تقنيات الويب.

## 🚀 التقنيات المستخدمة (Tech Stack)

- **Frontend:** React 18, Vite, TypeScript
- **Styling:** Tailwind CSS, Radix UI (Shadcn/UI)
- **State Management:** React Query, Zustand
- **Backend & Auth:** Supabase
- **Routing:** React Router v6
- **PWA & Performance:** Vite PWA, Brotli Compression
- **Deployment:** Vercel / Netlify / Cloudflare Pages

## 🛠️ المتطلبات الأساسية (Prerequisites)

- Node.js (v18+)
- حساب في [Supabase](https://supabase.com/)

## ⚙️ طريقة التشغيل (How to run locally)

1. **تثبيت الحزم (Install dependencies):**
   ```bash
   npm install
   ```

2. **إعداد متغيرات البيئة (Setup Env Vars):**
   قم بنسخ ملف `.env.example` إلى `.env.local` وأضف مفاتيح Supabase الخاصة بك:
   ```bash
   cp .env.example .env.local
   ```
   > **ملاحظة:** لا تشارك مفاتيح `service_role` في هذا الملف، فقط `anon/publishable key`.

3. **تشغيل خادم التطوير (Run dev server):**
   ```bash
   npm run dev
   ```

4. **البناء للإنتاج (Build for production):**
   ```bash
   npm run build
   ```

5. **معاينة البناء (Preview build):**
   ```bash
   npm run preview
   ```

## 📦 متغيرات البيئة (.env variables)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

## 🚀 طريقة النشر (Deployment)

### Vercel / Netlify
المشروع معد مسبقًا للنشر على Vercel و Netlify:
- **Vercel:** يحتوي على ملف `vercel.json` للتوجيه الصحيح والكاش.
- **Netlify:** يحتوي على ملف `netlify.toml` مع إعدادات التوجيه للـ SPA.
- **SPA Fallback:** تأكد من توجيه كل الطلبات (`/*`) إلى `/index.html` في إعدادات المنصة.

### Termux / Android Notes
إذا كنت تشغل المشروع عبر Termux:
- يتم استخدام `npm install --no-optional` أو معالجة الحزم الاختيارية لتجنب فشل بناء `@rollup/rollup-android-arm64`.
- البناء يعمل بكفاءة عبر `node ./scripts/clean-dist.mjs && vite build`.

## 📜 الترخيص (License)
جميع الحقوق محفوظة - نبض AI.
