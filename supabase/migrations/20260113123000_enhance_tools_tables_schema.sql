-- إضافة عمود الـ Slug (للرابط: amiraq.org/tool/chatgpt بدلاً من الأرقام)
ALTER TABLE public.tools 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- إضافة عمود المستخدم (لربط الأداة بمن أضافها)
ALTER TABLE public.tools 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- إضافة حالة النشر (لنظام الموافقات الذي صممناه)
ALTER TABLE public.tools 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- إضافة حقول إحصائية (للسرعة بدلاً من حسابها كل مرة)
ALTER TABLE public.tools 
ADD COLUMN IF NOT EXISTS views_count BIGINT DEFAULT 0;

-- تحسين البحث (اختياري ولكنه مفيد)
CREATE INDEX IF NOT EXISTS tools_slug_idx ON public.tools (slug);
CREATE INDEX IF NOT EXISTS tools_category_idx ON public.tools (category);
