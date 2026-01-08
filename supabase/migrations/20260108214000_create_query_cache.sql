-- إنشاء جدول لتخزين نتائج التضمين (Embeddings) مؤقتاً
CREATE TABLE IF NOT EXISTS query_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_text TEXT NOT NULL,
  embedding VECTOR(768), -- تأكد من مطابقة الحجم لنموذج Gemini
  created_at TIMESTAMPTZ DEFAULT now()
);

-- فهرس لتسريع البحث عن النص (نستخدم Hash Index لأنه أسرع للمطابقة التامة)
CREATE INDEX IF NOT EXISTS idx_query_cache_text ON query_cache USING HASH (query_text);
