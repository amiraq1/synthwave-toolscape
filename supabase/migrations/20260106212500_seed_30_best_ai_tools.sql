-- Seed 30 Best AI Tools

INSERT INTO public.tools (title, description, url, category, pricing_type, features, supports_arabic, is_featured, is_published, image_url)
VALUES 
-- 1. أدوات النصوص والمحادثة
('ChatGPT', 'المساعد الأشهر عالمياً للكتابة، البرمجة، والبحث. يقدم إجابات ذكية ومحادثات طبيعية.', 'https://chatgpt.com', 'نصوص', 'Freemium', ARRAY['chat', 'writing', 'coding', 'analysis'], true, true, true, null),
('Google Gemini', 'منافس جوجل القوي، يتميز بالسرعة والارتباط بخدمات جوجل وتحديث المعلومات لحظياً.', 'https://gemini.google.com', 'نصوص', 'مجاني', ARRAY['google integration', 'real-time info', 'multimodal'], true, true, true, null),
('Claude AI', 'يتميز بأسلوب كتابة طبيعي جداً وقدرات تحليلية فائقة وفهم عميق للسياق.', 'https://claude.ai', 'نصوص', 'Freemium', ARRAY['long context', 'natural writing', 'coding'], true, true, true, null),
('DeepSeek', 'أداة صينية قوية جداً في البرمجة والتفكير المنطقي ومجانية تماماً.', 'https://deepseek.com', 'برمجة', 'مجاني', ARRAY['coding', 'logic', 'open source'], true, false, true, null),
('Perplexity AI', 'محرك بحث ذكي يقدم إجابات موثقة بالمصادر والمراجع لضمان دقة المعلومات.', 'https://perplexity.ai', 'نصوص', 'Freemium', ARRAY['search', 'citations', 'research'], true, true, true, null),
('QuillBot', 'أفضل أداة لإعادة صياغة النصوص وتحسين القواعد اللغوية وكتابة المحتوى بأساليب متعددة.', 'https://quillbot.com', 'نصوص', 'Freemium', ARRAY['paraphrasing', 'grammar check', 'summarizer'], true, false, true, null),
('WriteSonic', 'متخصص في كتابة المقالات التسويقية والمحتوى المتوافق مع SEO للمواقع والمدونات.', 'https://writesonic.com', 'نصوص', 'Freemium', ARRAY['seo writing', 'marketing copy', 'blog posts'], true, false, true, null),

-- 2. أدوات الصور والتصميم
('Leonardo.ai', 'منصة احترافية لتوليد الصور الفنية بجودة مذهلة يومياً مجاناً مع أدوات تحكم دقيقة.', 'https://leonardo.ai', 'صور', 'Freemium', ARRAY['image generation', 'art', 'canvas'], false, true, true, null),
('Adobe Firefly', 'أداة أدوبي الرسمية لتوليد وتعديل الصور بالذكاء الاصطناعي، آمنة تجارياً وذات جودة عالية.', 'https://firefly.adobe.com', 'صور', 'Freemium', ARRAY['text to image', 'generative fill', 'commercial safe'], false, true, true, null),
('Canva AI', 'أدوات ذكاء اصطناعي مدمجة في كانفا لتصميم الصور والعروض التقديمية بسهولة تامة.', 'https://canva.com', 'صور', 'Freemium', ARRAY['magic edit', 'presentations', 'social media'], false, true, true, null),
('Ideogram', 'متميز جداً في كتابة النصوص داخل الصور بشكل دقيق وتصميم الشعارات.', 'https://ideogram.ai', 'صور', 'Freemium', ARRAY['typography', 'logos', 'image generation'], false, false, true, null),
('Lexica Art', 'محرك بحث ومولد صور يعتمد على نموذج Stable Diffusion بتصاميم فنية مميزة.', 'https://lexica.art', 'صور', 'مجاني', ARRAY['search', 'stable diffusion', 'art'], false, false, true, null),
('Microsoft Designer', 'أداة مجانية تماماً من مايكروسوفت لتصميم المنشورات والصور والعروض التقديمية.', 'https://designer.microsoft.com', 'صور', 'مجاني', ARRAY['graphic design', 'dalle-3', 'social posts'], false, false, true, null),
('Remove.bg', 'الأداة الأسرع والأشهر لإزالة خلفيات الصور بضغطة واحدة وبدقة عالية.', 'https://remove.bg', 'صور', 'Freemium', ARRAY['background removal', 'fast', 'api'], false, false, true, null),

-- 3. أدوات الفيديو والصوت
('Luma Dream Machine', 'توليد فيديوهات واقعية جداً من النصوص أو الصور بجودة سينمائية.', 'https://lumalabs.ai', 'فيديو', 'Freemium', ARRAY['text to video', 'image to video', 'high quality'], false, true, true, null),
('HeyGen', 'إنشاء فيديوهات لمتحدثين افتراضيين (Avatars) بجودة عالية ومزامنة دقيقة للشفاه.', 'https://heygen.com', 'فيديو', 'Freemium', ARRAY['avatars', 'talking head', 'translation'], false, false, true, null),
('ElevenLabs', 'أفضل أداة لتحويل النص إلى كلام بأصوات بشرية واقعية جداً وبلهجات متعددة.', 'https://elevenlabs.io', 'صوت', 'Freemium', ARRAY['text to speech', 'voice cloning', 'multilingual'], false, true, true, null),
('CapCut AI', 'أدوات ذكاء اصطناعي مدمجة لتحرير الفيديو وإضافة الترجمة والمؤثرات تلقائياً.', 'https://capcut.com', 'فيديو', 'مجاني', ARRAY['video editing', 'auto captions', 'effects'], false, true, true, null),
('Adobe Podcast', 'تحسين جودة الصوت المسجل وإزالة الضجيج ليصبح كأنه تم تسجيله في استوديو احترافي.', 'https://podcast.adobe.com', 'صوت', 'مجاني', ARRAY['audio enhancement', 'noise removal', 'mic check'], false, false, true, null),
('Vocal Remover', 'فصل صوت المغني عن الموسيقى في أي ملف صوتي بدقة عالية وبشكل مجاني.', 'https://vocalremover.org', 'صوت', 'مجاني', ARRAY['stem separation', 'karaoke', 'key finder'], false, false, true, null),

-- 4. أدوات الإنتاجية والدراسة
('Gamma App', 'إنشاء عروض تقديمية (PowerPoint) ومستندات ومواقع ويب كاملة في ثوانٍ عبر الوصف.', 'https://gamma.app', 'إنتاجية', 'Freemium', ARRAY['presentations', 'documents', 'web design'], false, true, true, null),
('Notion AI', 'مساعد ذكي داخل نوتشن لتنظيم المهام، تلخيص الملاحظات، وكتابة المحتوى.', 'https://notion.so', 'إنتاجية', 'Freemium', ARRAY['productivity', 'writing', 'summarization'], false, false, true, null),
('Humata AI', 'شات جي بي تي لملفات PDF. ارفع ملفك (مشروع، بحث، عقد) واسأله عن أي تفاصيل داخله.', 'https://humata.ai', 'دراسة وطلاب', 'Freemium', ARRAY['pdf chat', 'research', 'summarization'], false, false, true, null),
('Goblin.tools', 'مجموعة أدوات بسيطة تساعد الأشخاص (خاصة ذوي التشتت) في تنظيم وتكسير مهامهم المعقدة.', 'https://goblin.tools', 'إنتاجية', 'مجاني', ARRAY['task management', 'tone change', 'chef'], false, false, true, null),
('Consensus', 'محرك بحث علمي يبحث في ملايين الأوراق البحثية الموثقة ويجيب بناءً على العلم.', 'https://consensus.app', 'دراسة وطلاب', 'Freemium', ARRAY['research', 'science', 'academic'], false, true, true, null),
('Otter.ai', 'تسجيل الاجتماعات والمحاضرات وتحويل الكلام إلى نص مكتوب وتلخيصه تلقائياً.', 'https://otter.ai', 'إنتاجية', 'Freemium', ARRAY['meeting notes', 'transcription', 'summary'], false, false, true, null),

-- 5. أدوات البرمجة والتطوير
('Cursor', 'محرر أكواد (Fork من VS Code) مدمج بالكامل مع الذكاء الاصطناعي لتجربة برمجة فائقة السرعة.', 'https://cursor.com', 'برمجة', 'Freemium', ARRAY['code editor', 'copilot', 'refactoring'], false, true, true, null),
('Blackbox AI', 'مساعد برمجي سريع جداً لكتابة الكود وحل المشكلات البرمجية وفهم المشاريع المعقدة.', 'https://blackbox.ai', 'برمجة', 'Freemium', ARRAY['coding assistant', 'autocomplete', 'debugging'], false, false, true, null),
('Vercel V0', 'توليد واجهات المستخدم (UI) باستخدام React و Tailwind و Shadcn UI عبر الوصف النصي.', 'https://v0.dev', 'برمجة', 'Freemium', ARRAY['ui generation', 'react', 'tailwind'], false, true, true, null),
('Phind', 'محرك بحث مخصص للمبرمجين يقدم حلولاً برمجية مباشرة مع أمثلة كود قابلة للنسخ.', 'https://phind.com', 'برمجة', 'مجاني', ARRAY['search', 'coding', 'solutions'], false, false, true, null);
