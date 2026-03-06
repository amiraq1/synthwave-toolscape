DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'title_en'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN title_en TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'content_en'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN content_en TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'excerpt_en'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN excerpt_en TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'published_at'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN published_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END
$$;

-- Create a new migration file to insert the blog posts
INSERT INTO public.posts (
    title,
    title_en,
    slug,
    content,
    content_en,
    excerpt,
    excerpt_en,
    image_url,
    author_id,
    is_published,
    published_at,
    created_at,
    updated_at
) VALUES 
-- Post 1: Claude vs ChatGPT
(
    'صراع العمالقة: Claude 3.5 ضد ChatGPT - أيهما الأفضل للمستخدم العربي؟',
    'Clash of Titans: Claude 3.5 vs ChatGPT - Which is Better for Arab Users?',
    'claude-vs-chatgpt-arabic-comparison',
    'في عالم الذكاء الاصطناعي المتسارع، لم يعد السؤال "هل أستخدم الذكاء الاصطناعي؟" بل أصبح "أي نموذج يجب أن أستخدم؟".

لسنوات، تربع **ChatGPT** من OpenAI على العرش بلا منازع. ولكن في الآونة الأخيرة، ظهر منافس شرس هدد هذه الهيمنة: **Claude 3.5** من شركة Anthropic.

في هذا المقال، سنضع العملاقين وجهاً لوجه في اختبار حقيقي يركز على ما يهمنا كمستخدمين عرب: اللغة، الدقة، والسعر.

## 1. دعم اللغة العربية: الفصاحة مقابل الترجمة
هذه هي النقطة الفاصلة للكثيرين.

* **ChatGPT 4o:** ممتاز وقوي، لكنه أحياناً يعاني من "نبرة المترجم". تشعر أن النص مترجم من الإنجليزية، وقد يخطئ في بعض القواعد النحوية المعقدة أو التشكيل.
* **Claude 3.5 Sonnet:** هنا يتألق Claude! يتميز بلغة عربية "أدبية" وسلسة جداً. مفرداته أغنى، ويفهم السياق الثقافي بشكل أفضل، وحتى أنه يجيد كتابة الشعر والخواطر العربية بشكل يتفوق فيه بوضوح على GPT.

**الفائز في اللغة:** 🏆 **Claude 3.5**

## 2. البرمجة وكتابة الأكواد (Coding)
إذا كنت مبرمجاً، فالخيار صعب.

* **ChatGPT:** يتميز في شرح الكود وتصحيح الأخطاء (Debugging) بفضل قاعدة معرفته الواسعة.
* **Claude 3.5:** أثبتت الاختبارات الأخيرة (Benchmark 2026) أن Claude 3.5 Sonnet يتفوق في كتابة كود نظيف (Clean Code) وحل المشكلات المنطقية المعقدة من المحاولة الأولى، خاصة في مشاريع الويب الحديثة (React/Next.js).

**الفائز في البرمجة:** 🤝 **تعادل (مع تفوق طفيف لـ Claude في السرعة)**

## 3. "الننافذة السياقية" (ذاكرة النموذج)
هل حاولت يوماً إرسال ملف PDF طويل لـ ChatGPT ونسي ما في بدايته؟

* **ChatGPT 4o:** يمتلك ذاكرة ممتازة، لكنها محدودة مقارنة بمنافسه.
* **Claude 3.5:** يمتلك نافذة سياقية ضخمة (200K token). يمكنك حرفياً إعطاؤه كتاباً كاملاً وسيجيبك عن أي تفصيل صغير فيه بدقة متناهية ودون "هلوسة".

**الفائز في الذاكرة:** 🏆 **Claude 3.5**

## 4. الميزات المتعددة (الصوت والصورة)
* **ChatGPT 4o:** هو "وحش" متعدد الوسائط. يمكنك التحدث معه صوتياً، يرسم لك صوراً (DALL-E 3)، ويحلل ملفات Excel. إنه مساعد شامل.
* **Claude 3.5:** يركز على النص وتحليل الصور والوثائق فقط. لا يرسم صوراً ولا يمتلك وضعاً صوتياً متطوراً مثل GPT-4o.

**الفائز في الميزات:** 🏆 **ChatGPT 4o**

## الخلاصة: أيهما تختار؟

القرار يعتمد على "وظيفتك":

1.  اختر **Claude 3.5** إذا كنت:
    * كاتب محتوى أو مسوق (لغته العربية ساحرة).
    * مبرمج تبحث عن حلول سريعة وذكية.
    * باحث أو طالب تحتاج لتلخيص ملفات ضخمة.

2.  اختر **ChatGPT 4o** إذا كنت:
    * تريد "كل شيء في مكان واحد" (رسم، بحث، صوت).
    * تستخدمه للمحادثات اليومية والمهام العامة.
    * تحتاج لتحليل البيانات والرسوم البيانية.

في **نبض AI**، قمنا بتوفير روابط مباشرة لكلا الأداتين لتقوم بتجربتهما بنفسك. لا تنسَ زيارة صفحة المقارنة لترهما جنباً إلى جنب!',
    'In the fast-paced world of AI, the question is no longer "Should I use AI?" but rather "Which model should I use?".

For years, OpenAI''s **ChatGPT** has reigned supreme. But recently, a fierce competitor has threatened this dominance: **Claude 3.5** from Anthropic.

In this article, we pit the two giants against each other in a real-world test focusing on what matters to us as users: Language, Accuracy, and Price.

## 1. Arabic Language Support: Fluency vs. Translation
This is the deal-breaker for many.

* **ChatGPT 4o:** Excellent and powerful, but sometimes suffers from "translator tone". You feel the text is translated from English, and it may miss some complex grammar or diacritics.
* **Claude 3.5 Sonnet:** Here Claude shines! It features very smooth, "literary" Arabic. Its vocabulary is richer, understands cultural context better, and even excels at writing Arabic poetry and thoughts, clearly outperforming GPT.

**Language Winner:** 🏆 **Claude 3.5**

## 2. Coding
If you are a programmer, the choice is tough.

* **ChatGPT:** Excels at explaining code and debugging thanks to its vast knowledge base.
* **Claude 3.5:** Recent tests (Benchmark 2026) prove Claude 3.5 Sonnet excels at writing Clean Code and solving complex logic problems on the first try, especially in modern web projects (React/Next.js).

**Coding Winner:** 🤝 **Draw (with a slight edge for Claude in speed)**

## 3. Context Window (Model Memory)
Ever tried sending a long PDF to ChatGPT and it forgot what was at the beginning?

* **ChatGPT 4o:** Has excellent memory, but limited compared to its rival.
* **Claude 3.5:** Has a massive context window (200K tokens). You can literally give it a whole book and it will answer any small detail with extreme accuracy and without "hallucinations".

**Memory Winner:** 🏆 **Claude 3.5**

## 4. Multimodal Features (Voice & Image)
* **ChatGPT 4o:** A multimodal "beast". You can talk to it, it draws images (DALL-E 3), and analyzes Excel files. It''s a comprehensive assistant.
* **Claude 3.5:** Focuses on text and image/document analysis only. It doesn''t generate images nor has an advanced voice mode like GPT-4o.

**Features Winner:** 🏆 **ChatGPT 4o**

## Conclusion: Which to Choose?

The decision depends on your "job":

1.  Choose **Claude 3.5** if you are:
    * A content writer or marketer (its Arabic is magical).
    * A programmer looking for fast, smart solutions.
    * A researcher or student needing to summarize huge files.

2.  Choose **ChatGPT 4o** if you are:
    * Wanting "everything in one place" (drawing, search, voice).
    * Using it for daily conversations and general tasks.
    * Needing to analyze data and charts.

At **Pulse AI**, we provided direct links for both tools for you to try yourself. Don''t forget to visit the comparison page to see them side by side!',
    'مقارنة شاملة بين أقوى نموذجين للذكاء الاصطناعي حالياً: ChatGPT 4o و Claude 3.5 Sonnet. أيهما الأفضل في اللغة العربية والبرمجة؟',
    'A comprehensive comparison between the two most powerful AI models today: ChatGPT 4o and Claude 3.5 Sonnet. Which is better for Arabic and coding?',
    '/blog/claude_vs_chatgpt.png',
    (SELECT id FROM auth.users LIMIT 1),
    true,
    NOW(),
    NOW(),
    NOW()
),
-- Post 2: Free AI Art Tools
(
    'وداعاً Midjourney؟ إليك أفضل 5 أدوات مجانية لتوليد الصور في 2026',
    'Goodbye Midjourney? Top 5 Free AI Image Generators in 2026',
    'best-free-ai-art-tools-2026',
    'لطالما كان Midjourney هو الملك المتوج في عالم توليد الصور. ولكن، مع إلغاء الخطط المجانية وصعوبة استخدامه عبر Discord، بدأ الجميع بالبحث عن البديل.

الخبر السار؟ عام 2026 هو عام "توليد الصور المجاني". ظهرت أدوات تنافس دقة Midjourney، بل وتتفوق عليه في سهولة الاستخدام (وكتابة النصوص داخل الصور).

إليك قائمتنا المختارة لأفضل 5 أدوات مجانية يجب عليك تجربتها اليوم:

## 1. Leonardo.ai (الخيار الشامل)
إذا كنت تريد أداة تمنحك تحكماً كاملاً مثل Photoshop ولكن بقوة الذكاء الاصطناعي، فـ Leonardo هو خيارك الأول.
* **المميزات:** يمنحك 150 عملة يومياً (تكفي لـ 30-50 صورة)، يحتوي على نماذج متخصصة للأنمي والواقعية، وميزة "Canvas" للتعديل على الصور.
* **الحكم:** أفضل بديل احترافي مجاني.

## 2. Microsoft Designer (Bing Image Creator)
الأداة الأسهل والأسرع، والمدعومة بنظام DALL-E 3 القوي من OpenAI.
* **المميزات:** مجاني تماماً، يفهم العربية (يمكنك أن تكتب له "قطة تشرب القهوة في بغداد" وسيفهمك!)، ومدمج داخل متصفح Edge.
* **الحكم:** الأفضل للمبتدئين والاستخدام السريع.

## 3. Ideogram 2.0 (ملك النصوص)
مشكلة الذكاء الاصطناعي الأزلية كانت "الكتابة داخل الصور" (تظهر الحروف مشوهة). Ideogram حل هذه المشكلة.
* **المميزات:** يمكنك تصميم شعارات (Logos) أو تيشيرتات بكتابات واضحة ودقيقة جداً.
* **الحكم:** الأداة رقم 1 للمصممين وأصحاب المتاجر الإلكترونية.

## 4. Recraft (للتصاميم الفيكتور)
هل تحتاج أيقونات أو رسومات لموقعك بصيغة SVG قابلة للتكبير؟ Midjourney لا يفعل ذلك، لكن Recraft يفعل!
* **المميزات:** أول أداة ذكاء اصطناعي تولد ملفات Vector حقيقية. تصميماتها نظيفة جداً ومناسبة للشركات والهوية البصرية.
* **الحكم:** كنز لمصممي الجرافيك والويب.

## 5. Freepik AI (المكتبة الضخمة)
موقع Freepik الشهير أطلق أداته الخاصة مؤخراً.
* **المميزات:** يوفر توليد فوري للصور بجودة عالية (Real-time generation) ومكتبة ضخمة من الأصول الجاهزة للتعديل.
* **الحكم:** ممتاز للمصممين الذين يستخدمون Freepik بالفعل.',
    'Midjourney has long been the crowned king of image generation. But with free plans gone and Discord friction, everyone is looking for alternatives.

Good news? 2026 is the year of "Free Image Generation". Tools have emerged that rival Midjourney''s quality, and even surpass it in ease of use (and text rendering).

Here is our curated list of top 5 free tools you must try today:

## 1. Leonardo.ai (All-Rounder)
If you want control like Photoshop but with AI power, Leonardo is your first choice.
* **Pros:** 150 daily credits, specialized models for anime/realism, and "Canvas" editor.
* **Verdict:** Best professional free alternative.

## 2. Microsoft Designer (Bing Image Creator)
The easiest and fastest, powered by OpenAI''s DALL-E 3.
* **Pros:** Completely free, understands Arabic prompts, integrated into Edge.
* **Verdict:** Best for beginners and quick use.

## 3. Ideogram 2.0 (Text King)
AI''s eternal problem was "text in images". Ideogram solved it.
* **Pros:** Design logos or t-shirts with clear, accurate text.
* **Verdict:** #1 tool for designers and merch sellers.

## 4. Recraft (Vector Design)
Need scalable SVG icons? Midjourney can''t do that, Recraft can!
* **Pros:** Generates true Vector files. Clean designs suitable for corporate branding.
* **Verdict:** A treasure for graphic and web designers.

## 5. Freepik AI (The Massive Library)
Famous Freepik launched its own tool.
* **Pros:** Real-time generation and huge library of editable assets.
* **Verdict:** Great for designers already using Freepik.',
    'وداعاً Midjourney! تعرف على أفضل 5 أدوات مجانية لتوليد الصور بالذكاء الاصطناعي في 2026 تنافس الجودة والاحترافية.',
    'Goodbye Midjourney! Meet the top 5 free AI image generators in 2026 that rival pro quality.',
    '/blog/ai_art_tools.png',
    (SELECT id FROM auth.users LIMIT 1),
    true,
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (slug) DO NOTHING;
