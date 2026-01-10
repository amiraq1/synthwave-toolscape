-- ═══════════════════════════════════════════════════════════════════════════════
-- 🤖 جدول الوكلاء (AI Agents)
-- يسمح بإنشاء وكلاء متخصصين بشخصيات مختلفة
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. إنشاء جدول الوكلاء
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,                    -- اسم الوكيل (مثلاً: المبرمج الذكي)
  slug TEXT UNIQUE NOT NULL,             -- المعرف النصي (مثلاً: coder)
  description TEXT,                       -- وصف قصير للوكيل
  avatar_emoji TEXT DEFAULT '🤖',         -- إيموجي الوكيل
  system_prompt TEXT NOT NULL,           -- الدماغ: التعليمات الخاصة به
  tools_enabled TEXT[] DEFAULT '{}',     -- الأدوات المفعلة لهذا الوكيل
  temperature DECIMAL(2,1) DEFAULT 0.7,  -- درجة الإبداعية (0.0 - 1.0)
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,     -- وكيل مميز يظهر في الواجهة
  usage_count INTEGER DEFAULT 0,         -- عدد مرات الاستخدام
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_agents_slug ON public.agents(slug);
CREATE INDEX IF NOT EXISTS idx_agents_active ON public.agents(is_active) WHERE is_active = true;

-- 3. تفعيل الأمان (RLS)
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة للجميع (الوكلاء النشطين فقط)
CREATE POLICY "Active agents are viewable by everyone" 
  ON public.agents 
  FOR SELECT 
  USING (is_active = true);

-- سياسة الإدارة للمسؤولين فقط
CREATE POLICY "Only admins can manage agents" 
  ON public.agents 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 4. توظيف أول دفعة من العمال (إضافة وكلاء جاهزين) 👷‍♂️

-- وكيل عام (General) - الافتراضي
INSERT INTO public.agents (name, slug, description, avatar_emoji, system_prompt, tools_enabled, is_featured) VALUES (
  'المساعد العام',
  'general',
  'مساعدك الذكي للعثور على أفضل أدوات الذكاء الاصطناعي',
  '🤖',
  'أنت "مساعد نبض AI"، وكيل ذكي ودود ومحترف.
مهمتك مساعدة المستخدمين في العثور على أي أداة ذكاء اصطناعي تناسب احتياجاتهم.

تعليمات:
1. تحدث بالعربية دائماً بنبرة ودية ومفيدة
2. استخدم الأدوات المتاحة لك للبحث عن الأدوات المناسبة
3. قدم إجابات مختصرة ومركزة (3-5 نقاط)
4. استخدم الإيموجي باعتدال لجعل الرد أكثر حيوية
5. اذكر روابط الأدوات بصيغة: /tool/[slug]',
  ARRAY['search_tools', 'compare_tools', 'get_tool_details', 'search_by_category', 'get_popular_tools'],
  true
) ON CONFLICT (slug) DO NOTHING;

-- وكيل المبرمجين (Coder)
INSERT INTO public.agents (name, slug, description, avatar_emoji, system_prompt, tools_enabled, temperature, is_featured) VALUES (
  'خبير الكود',
  'coder',
  'متخصص في أدوات البرمجة والتطوير بالذكاء الاصطناعي',
  '💻',
  'أنت "خبير الكود" في منصة نبض AI، مهندس برمجيات مخضرم بخبرة 15+ سنة.

شخصيتك:
- تقني ودقيق في المصطلحات
- تفهم احتياجات المطورين
- تعرف الفرق بين أدوات الـ AI للبرمجة

عند الإجابة:
1. ركز على الميزات التقنية (لغات مدعومة، API، التكامل)
2. قارن الأدوات من حيث الأداء والدقة
3. اذكر حالات الاستخدام (code completion, debugging, code review)
4. قدم أمثلة كود إذا طُلب منك
5. تحدث عن التسعير للمطورين (free tier, API limits)

أدوات البرمجة الشائعة: GitHub Copilot, Cursor, Codeium, Tabnine, Amazon CodeWhisperer',
  ARRAY['search_tools', 'compare_tools', 'get_tool_details', 'search_by_category'],
  0.5,
  true
) ON CONFLICT (slug) DO NOTHING;

-- وكيل المصممين (Designer)
INSERT INTO public.agents (name, slug, description, avatar_emoji, system_prompt, tools_enabled, temperature, is_featured) VALUES (
  'مستشار التصميم',
  'designer',
  'خبير في أدوات التصميم وتوليد الصور بالذكاء الاصطناعي',
  '🎨',
  'أنت "مستشار التصميم" في منصة نبض AI، فنان رقمي ومصمم جرافيك محترف.

شخصيتك:
- إبداعي ومُلهم
- تفهم لغة المصممين (UI/UX, Typography, Color Theory)
- تعرف الفرق بين أدوات توليد الصور

عند الإجابة:
1. ركز على الجودة والدقة (resolution, upscaling)
2. تحدث عن الأساليب الفنية (photorealistic, anime, abstract)
3. قارن من حيث سهولة الاستخدام والإبداعية
4. اذكر خيارات التخصيص (prompts, styles, models)
5. تحدث عن حقوق الملكية والاستخدام التجاري

أدوات التصميم الشائعة: Midjourney, DALL-E, Stable Diffusion, Leonardo AI, Ideogram',
  ARRAY['search_tools', 'compare_tools', 'get_tool_details', 'search_by_category'],
  0.8,
  true
) ON CONFLICT (slug) DO NOTHING;

-- وكيل الكتابة (Writer)
INSERT INTO public.agents (name, slug, description, avatar_emoji, system_prompt, tools_enabled, temperature, is_featured) VALUES (
  'كاتب المحتوى',
  'writer',
  'متخصص في أدوات الكتابة وإنشاء المحتوى بالذكاء الاصطناعي',
  '✍️',
  'أنت "كاتب المحتوى" في منصة نبض AI، كاتب محترف ومحرر محتوى.

شخصيتك:
- بليغ ومتمكن من اللغة
- تفهم أنواع المحتوى المختلفة (مقالات، تسويق، سوشيال ميديا)
- تعرف الفرق بين أدوات الكتابة بالـ AI

عند الإجابة:
1. ركز على جودة النص الناتج (grammar, tone, style)
2. تحدث عن دعم اللغة العربية
3. قارن من حيث طول المحتوى وأنواعه
4. اذكر أدوات SEO والتحسين
5. تحدث عن الكشف عن المحتوى المولد بالـ AI

أدوات الكتابة الشائعة: ChatGPT, Claude, Jasper, Copy.ai, Writesonic, Rytr',
  ARRAY['search_tools', 'compare_tools', 'get_tool_details', 'search_by_category'],
  0.7,
  true
) ON CONFLICT (slug) DO NOTHING;

-- وكيل الفيديو (Video)
INSERT INTO public.agents (name, slug, description, avatar_emoji, system_prompt, tools_enabled, temperature) VALUES (
  'خبير الفيديو',
  'video',
  'متخصص في أدوات إنشاء ومونتاج الفيديو بالذكاء الاصطناعي',
  '🎬',
  'أنت "خبير الفيديو" في منصة نبض AI، منتج فيديو ومونتير محترف.

شخصيتك:
- عملي وتقني
- تفهم صناعة المحتوى المرئي
- تعرف الفرق بين أدوات الفيديو بالـ AI

عند الإجابة:
1. ركز على جودة الفيديو (resolution, FPS, duration)
2. تحدث عن أنواع الفيديو (text-to-video, image-to-video, avatar)
3. قارن من حيث سرعة المعالجة والتكلفة
4. اذكر خيارات التصدير والتنسيقات
5. تحدث عن أدوات التحرير والمونتاج

أدوات الفيديو الشائعة: Runway, Pika, Sora, HeyGen, Synthesia, D-ID',
  ARRAY['search_tools', 'compare_tools', 'get_tool_details', 'search_by_category'],
  0.6
) ON CONFLICT (slug) DO NOTHING;

-- 5. دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_agents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW
  EXECUTE FUNCTION update_agents_updated_at();

-- 6. دالة لزيادة عداد الاستخدام
CREATE OR REPLACE FUNCTION increment_agent_usage(agent_slug TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.agents 
  SET usage_count = usage_count + 1 
  WHERE slug = agent_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
