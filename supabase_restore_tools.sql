
-- 1. تنظيف التكرارات (الاحتفاظ بنسخة واحدة فقط لكل رابط)
DELETE FROM public.tools
WHERE id NOT IN (
    SELECT MIN(id)
    FROM public.tools
    GROUP BY url
);

-- 2. إضافة قيد "عدم التكرار" على عمود الرابط (ضروري لعمل التحديث التلقائي)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tools_url_key') THEN
        ALTER TABLE public.tools ADD CONSTRAINT tools_url_key UNIQUE (url);
    END IF;
END $$;

-- 3. إضافة البيانات (مع تحديث الموجود بدلاً من الخطأ)
INSERT INTO public.tools (
    title, 
    description, 
    category, 
    url, 
    image_url, 
    pricing_type, 
    is_featured, 
    is_published, 
    features
) VALUES 
(
    'Midjourney',
    'أداة رائدة لإنشاء صور فنية مذهلة باستخدام الذكاء الاصطناعي.',
    'صناعة محتوى',
    'https://midjourney.com',
    '',
    'Paid',
    true,
    true,
    ARRAY['توليد صور فنية', 'جودة عالية', 'تحكم كامل']
),
(
    'RunwayML',
    'أداة متقدمة لتحرير وإنشاء الفيديوهات.',
    'صناعة محتوى',
    'https://runwayml.com',
    'https://cdn.simpleicons.org/runway/white',
    'Paid',
    true,
    true,
    ARRAY['تحرير فيديو', 'توليد فيديو من نص', 'مؤثرات بصرية']
),
(
    'GitHub Copilot',
    'مساعد برمجي ذكي يكتب الكود معك.',
    'تطوير وبرمجة',
    'https://github.com/features/copilot',
    'https://cdn.simpleicons.org/github/white',
    'Paid',
    true,
    true,
    ARRAY['إكمال تلقائي للكود', 'شرح الكود', 'دعم لغات متعددة']
),
(
    'Notion AI',
    'مساعد ذكي داخل نوتشن لتنظيم المهام وتلخيص الملاحظات.',
    'مساعدات إنتاجية',
    'https://notion.so',
    'https://cdn.simpleicons.org/notion/white',
    'Freemium',
    false,
    true,
    ARRAY['تلخيص', 'كتابة محتوى', 'تنظيم مهام']
),
(
    'Jasper',
    'كاتب آلي متقدم للتسويق والمحتوى.',
    'توليد نصوص',
    'https://jasper.ai',
    'https://cdn.simpleicons.org/jasper/white',
    'Paid',
    false,
    true,
    ARRAY['كتابة تسويقية', 'تحسين SEO', 'قوالب جاهزة']
),
(
    'Sora',
    'نموذج ذكي لتحويل النص إلى فيديو واقعي.',
    'صناعة محتوى',
    'https://openai.com/sora',
    'https://cdn.simpleicons.org/openai/white',
    'Paid',
    true,
    true,
    ARRAY['نص إلى فيديو', 'واقعية فائقة', 'إبداع غير محدود']
),
(
    'ChatGPT',
    'المساعد الأشهر عالمياً للكتابة والبحث.',
    'توليد نصوص',
    'https://chatgpt.com',
    'https://cdn.simpleicons.org/openai/white',
    'Freemium',
    true,
    true,
    ARRAY['محادثة طبيعية', 'كتابة أكواد', 'تحليل بيانات']
),
(
    'Google Gemini',
    'منافس جوجل القوي المرتبط بخدمات جوجل.',
    'توليد نصوص',
    'https://gemini.google.com',
    'https://cdn.simpleicons.org/google/white',
    'Free',
    true,
    true,
    ARRAY['بحث مباشر', 'تحليل صور', 'تكامل مع جوجل']
),
(
    'Claude AI',
    'ذكاء اصطناعي بأسلوب كتابة طبيعي ومنطق قوي.',
    'توليد نصوص',
    'https://claude.ai',
    'https://cdn.simpleicons.org/anthropic/white',
    'Freemium',
    true,
    true,
    ARRAY['ذاكرة طويلة', 'كتابة بشرية', 'منطق قوي']
),
(
    'Perplexity AI',
    'محرك بحث ذكي يقدم إجابات موثقة.',
    'تعليم وبحث',
    'https://perplexity.ai',
    'https://upload.wikimedia.org/wikipedia/commons/1/1d/Perplexity_AI_logo.jpg',
    'Freemium',
    true,
    true,
    ARRAY['بحث مع مصادر', 'دقة معلومات', 'بحث أكاديمي']
),
(
    'QuillBot',
    'أداة لإعادة الصياغة وتصحيح القواعد.',
    'توليد نصوص',
    'https://quillbot.com',
    'https://cdn.simpleicons.org/quillbot/white',
    'Freemium',
    false,
    true,
    ARRAY['إعادة صياغة', 'تصحيح لغوي', 'تلخيص']
),
(
    'WriteSonic',
    'كتابة مقالات تسويقية متوافقة مع SEO.',
    'توليد نصوص',
    'https://writesonic.com',
    'https://cdn.simpleicons.org/writesonic/white',
    'Freemium',
    false,
    true,
    ARRAY['مقالات SEO', 'إعلانات', 'بريد إلكتروني']
)
ON CONFLICT (url) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    image_url = EXCLUDED.image_url,
    pricing_type = EXCLUDED.pricing_type,
    is_featured = EXCLUDED.is_featured,
    is_published = EXCLUDED.is_published,
    features = EXCLUDED.features;
