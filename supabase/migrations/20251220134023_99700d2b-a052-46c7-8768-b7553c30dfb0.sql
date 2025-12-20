-- Create tools table
CREATE TABLE public.tools (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  url TEXT NOT NULL,
  image_url TEXT,
  pricing_type TEXT NOT NULL DEFAULT 'مجاني',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (tools directory is public)
CREATE POLICY "Anyone can view tools" 
ON public.tools 
FOR SELECT 
USING (true);

-- Insert initial mock data
INSERT INTO public.tools (title, description, category, url, image_url, pricing_type, is_featured) VALUES
('ChatGPT', 'مساعد ذكي للمحادثات والكتابة والإجابة على الأسئلة بشكل احترافي.', 'نصوص', 'https://chat.openai.com', '🤖', 'مجاني', true),
('Midjourney', 'أداة رائدة لإنشاء صور فنية مذهلة باستخدام الذكاء الاصطناعي.', 'صور', 'https://midjourney.com', '🎨', 'مدفوع', true),
('Jasper', 'منصة متكاملة لكتابة المحتوى التسويقي والإبداعي بسرعة فائقة.', 'نصوص', 'https://jasper.ai', '✍️', 'مدفوع', false),
('RunwayML', 'أداة متقدمة لتحرير وإنشاء الفيديوهات باستخدام الذكاء الاصطناعي.', 'فيديو', 'https://runwayml.com', '🎬', 'مدفوع', true),
('GitHub Copilot', 'مساعد برمجي ذكي يكتب الكود معك ويقترح حلولاً برمجية فورية.', 'برمجة', 'https://github.com/features/copilot', '💻', 'مدفوع', false),
('Notion AI', 'مساعد ذكي متكامل مع Notion لتنظيم المهام وكتابة المحتوى.', 'إنتاجية', 'https://notion.so', '📝', 'مدفوع', false);