---
description: خطة تحسين جودة الأدوات المدرجة في موقع نبض
---

# 🎯 خطة تحسين الجودة الشاملة لمشروع نبض AI

## المرحلة 1: إصلاح أخطاء TypeScript ✅ (مكتملة)

### الملفات التي تم إصلاحها:

1. **مكونات المحتوى:**
   - `src/components/ReviewSection.tsx` (3 errors)
   - `src/components/SimilarTools.tsx` (1 error)
   - `src/components/ToolsTimeline.tsx` (1 error)
   - `src/components/TrendingTools.tsx` (1 error)

2. **مكونات الإدارة:**
   - `src/components/admin/AdminToolsTable.tsx` (2 errors)
   - `src/components/admin/AdminUsersTable.tsx` (3 errors)

3. **مكونات Workflow:**
   - `src/components/workflow/NodeConfigDialog.tsx` (2 errors)
   - `src/components/workflow/NodeSettings.tsx` (2 errors)

4. **الصفحات:**
   - `src/pages/AgentsMarketplace.tsx` (1 error)
   - `src/pages/Auth.tsx` (1 error)
   - `src/pages/Blog.tsx` (1 error)
   - `src/pages/BlogPost.tsx` (1 error)
   - `src/pages/Settings.tsx` (2 errors)

5. **Hooks:**
   - `src/hooks/useReviews.ts` (1 error)

6. **Supabase Functions:**
   - `supabase/functions/chat-agent/index.ts` (2 errors)
   - `supabase/functions/semantic-search/index.ts` (1 error)
   - `supabase/functions/sitemap/index.ts` (1 error)

### خطوات الإصلاح:
// turbo
1. استيراد الأنواع من `src/types/index.ts` في كل ملف
2. استبدال `any` بالنوع المناسب (Tool, Profile, Review, etc.)
3. إضافة أنواع جديدة للأنواع غير المعرفة

---

## المرحلة 2: تحسينات SEO ✅ (مكتملة)

- [x] إنشاء صور OG ديناميكية من Supabase Edge Function
- [x] تحديث `index.html` لاستخدام صور OG ديناميكية
- [x] إضافة دعم hreflang للتبديل بين اللغات
- [x] تحسين meta descriptions
- [x] إضافة Twitter Cards محسنة

---

## المرحلة 3: تحسينات الأداء ✅ (مكتملة)

- [x] إنشاء `src/utils/performance.ts` مع:
  - [x] تحسين الصور (getOptimizedImageUrl)
  - [x] Intersection Observer Hook
  - [x] Debounce & Throttle utilities
  - [x] Virtual List للقوائم الطويلة
  - [x] Battery-aware features
  - [x] Web Vitals reporting

---

## المرحلة 4: إمكانية الوصول (Accessibility) ✅ (مكتملة)

- [x] إنشاء `src/hooks/useAccessibility.ts` مع:
  - [x] Screen reader announcements
  - [x] Focus trap للـ modals
  - [x] اختصارات لوحة المفاتيح (`/` للبحث، `Esc` للإغلاق)
  - [x] Skip to content functionality
  - [x] Reduced motion detection
  - [x] High contrast detection

---

## المرحلة 5: تحسينات إضافية (مستقبلاً)

### أ) تحسين الخطوط:
```typescript
// في tailwind.config.ts
fontFamily: {
  display: ['Cairo', 'sans-serif'],
  body: ['IBM Plex Sans Arabic', 'sans-serif'],
  mono: ['Fira Code', 'monospace'],
},
```

### ب) إعادة تفعيل Sentry:
```typescript
// في main.tsx - بعد التأكد من عدم وجود مشاكل
Sentry.init({
  dsn: "...",
  tracesSampleRate: 0.1, // تقليل العينات
  replaysSessionSampleRate: 0.05,
});
```

### ج) تحسين QueryClient:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});
```

---

## ملخص الإنجازات

| المعيار | قبل | بعد | تحسن |
|---------|-----|-----|------|
| أخطاء ESLint | 94 | 0 | ✅ 100% |
| ملفات Types | 0 | 1 (شامل) | ✅ جديد |
| SEO Hooks | أساسي | متقدم | ✅ محسن |
| Performance Utils | 0 | 1 (شامل) | ✅ جديد |
| Accessibility Hooks | 0 | 1 (شامل) | ✅ جديد |
| OG Images | ثابتة | ديناميكية | ✅ محسن |

---

## الأوامر المهمة

```bash
# فحص الأخطاء
// turbo
npm run lint

# بناء المشروع
// turbo
npm run build

# تشغيل محلياً
npm run dev
```

---

**آخر تحديث:** 2026-01-13
**المسؤول:** فريق ULTRATHINK
