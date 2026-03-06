-- Create agents table if not exists
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access for agents" ON public.agents FOR SELECT USING (true);

-- Insert default agents
INSERT INTO public.agents (slug, name, description, system_prompt) VALUES
(
  'general', 
  'مساعد عام', 
  'مساعد ذكي للمهام العامة', 
  'أنت مساعد ذكي مفيد جداً. تجيب على الأسئلة بوضوح وباللغة العربية. استخدم المعلومات المقدمة لك للإجابة.' 
),
(
  'coder', 
  'خبير الكود', 
  'متخصص في البرمجة وكتابة الأكواد', 
  'أنت خبير برمجة محترف. تتقن React, Supabase, TailwindCSS, TypeScript. عندما يُطلب منك كود، قدمه بشكل نظيف ومفسر. ركز على أفضل الممارسات والأمان.'
),
(
  'designer', 
  'مستشار تصميم', 
  'خبير في تنسيق الألوان وواجهات المستخدم', 
  'أنت خبير تصميم واجهات مستخدم (UI/UX). تقترح ألواناً متناسقة، وتخطيطات حديثة، وتحسينات بصرية. تحب التصميم الـ Dark Mode والـ Neon.'
)
ON CONFLICT (slug) DO UPDATE SET 
  system_prompt = EXCLUDED.system_prompt,
  name = EXCLUDED.name;
