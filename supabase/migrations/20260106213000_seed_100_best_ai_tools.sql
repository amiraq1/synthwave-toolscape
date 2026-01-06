-- Seed 100 Best AI Tools (The Ultimate Collection)

INSERT INTO public.tools (title, description, url, category, pricing_type, features, supports_arabic, is_featured, is_published, image_url)
VALUES 
-- =============================================
-- المجموعة الأولى (30 أداة - الأساسية)
-- =============================================
('ChatGPT', 'المساعد الأشهر عالمياً للكتابة، البرمجة، والبحث. يقدم إجابات ذكية ومحادثات طبيعية.', 'https://chatgpt.com', 'نصوص', 'Freemium', ARRAY['chat', 'writing', 'coding', 'analysis'], true, true, true, null),
('Google Gemini', 'منافس جوجل القوي، يتميز بالسرعة والارتباط بخدمات جوجل وتحديث المعلومات لحظياً.', 'https://gemini.google.com', 'نصوص', 'مجاني', ARRAY['google integration', 'real-time info', 'multimodal'], true, true, true, null),
('Claude AI', 'يتميز بأسلوب كتابة طبيعي جداً وقدرات تحليلية فائقة وفهم عميق للسياق.', 'https://claude.ai', 'نصوص', 'Freemium', ARRAY['long context', 'natural writing', 'coding'], true, true, true, null),
('DeepSeek', 'أداة صينية قوية جداً في البرمجة والتفكير المنطقي ومجانية تماماً.', 'https://deepseek.com', 'برمجة', 'مجاني', ARRAY['coding', 'logic', 'open source'], true, false, true, null),
('Perplexity AI', 'محرك بحث ذكي يقدم إجابات موثقة بالمصادر والمراجع لضمان دقة المعلومات.', 'https://perplexity.ai', 'نصوص', 'Freemium', ARRAY['search', 'citations', 'research'], true, true, true, null),
('QuillBot', 'أفضل أداة لإعادة صياغة النصوص وتحسين القواعد اللغوية وكتابة المحتوى بأساليب متعددة.', 'https://quillbot.com', 'نصوص', 'Freemium', ARRAY['paraphrasing', 'grammar check', 'summarizer'], true, false, true, null),
('WriteSonic', 'متخصص في كتابة المقالات التسويقية والمحتوى المتوافق مع SEO للمواقع والمدونات.', 'https://writesonic.com', 'نصوص', 'Freemium', ARRAY['seo writing', 'marketing copy', 'blog posts'], true, false, true, null),

('Leonardo.ai', 'منصة احترافية لتوليد الصور الفنية بجودة مذهلة يومياً مجاناً مع أدوات تحكم دقيقة.', 'https://leonardo.ai', 'صور', 'Freemium', ARRAY['image generation', 'art', 'canvas'], false, true, true, null),
('Adobe Firefly', 'أداة أدوبي الرسمية لتوليد وتعديل الصور بالذكاء الاصطناعي، آمنة تجارياً وذات جودة عالية.', 'https://firefly.adobe.com', 'صور', 'Freemium', ARRAY['text to image', 'generative fill', 'commercial safe'], false, true, true, null),
('Canva AI', 'أدوات ذكاء اصطناعي مدمجة في كانفا لتصميم الصور والعروض التقديمية بسهولة تامة.', 'https://canva.com', 'صور', 'Freemium', ARRAY['magic edit', 'presentations', 'social media'], false, true, true, null),
('Ideogram', 'متميز جداً في كتابة النصوص داخل الصور بشكل دقيق وتصميم الشعارات.', 'https://ideogram.ai', 'صور', 'Freemium', ARRAY['typography', 'logos', 'image generation'], false, false, true, null),
('Lexica Art', 'محرك بحث ومولد صور يعتمد على نموذج Stable Diffusion بتصاميم فنية مميزة.', 'https://lexica.art', 'صور', 'مجاني', ARRAY['search', 'stable diffusion', 'art'], false, false, true, null),
('Microsoft Designer', 'أداة مجانية تماماً من مايكروسوفت لتصميم المنشورات والصور والعروض التقديمية.', 'https://designer.microsoft.com', 'صور', 'مجاني', ARRAY['graphic design', 'dalle-3', 'social posts'], false, false, true, null),
('Remove.bg', 'الأداة الأسرع والأشهر لإزالة خلفيات الصور بضغطة واحدة وبدقة عالية.', 'https://remove.bg', 'صور', 'Freemium', ARRAY['background removal', 'fast', 'api'], false, false, true, null),

('Luma Dream Machine', 'توليد فيديوهات واقعية جداً من النصوص أو الصور بجودة سينمائية.', 'https://lumalabs.ai', 'فيديو', 'Freemium', ARRAY['text to video', 'image to video', 'high quality'], false, true, true, null),
('HeyGen', 'إنشاء فيديوهات لمتحدثين افتراضيين (Avatars) بجودة عالية ومزامنة دقيقة للشفاه.', 'https://heygen.com', 'فيديو', 'Freemium', ARRAY['avatars', 'talking head', 'translation'], false, false, true, null),
('ElevenLabs', 'أفضل أداة لتحويل النص إلى كلام بأصوات بشرية واقعية جداً وبلهجات متعددة.', 'https://elevenlabs.io', 'صوت', 'Freemium', ARRAY['text to speech', 'voice cloning', 'multilingual'], false, true, true, null),
('CapCut AI', 'أدوات ذكاء اصطناعي مدمجة لتحرير الفيديو وإضافة الترجمة والمؤثرات تلقائياً.', 'https://capcut.com', 'فيديو', 'مجاني', ARRAY['video editing', 'auto captions', 'effects'], false, true, true, null),
('Adobe Podcast', 'تحسين جودة الصوت المسجل وإزالة الضجيج ليصبح كأنه تم تسجيله في استوديو احترافي.', 'https://podcast.adobe.com', 'صوت', 'مجاني', ARRAY['audio enhancement', 'noise removal', 'mic check'], false, false, true, null),
('Vocal Remover', 'فصل صوت المغني عن الموسيقى في أي ملف صوتي بدقة عالية وبشكل مجاني.', 'https://vocalremover.org', 'صوت', 'مجاني', ARRAY['stem separation', 'karaoke', 'key finder'], false, false, true, null),

('Gamma App', 'إنشاء عروض تقديمية (PowerPoint) ومستندات ومواقع ويب كاملة في ثوانٍ عبر الوصف.', 'https://gamma.app', 'إنتاجية', 'Freemium', ARRAY['presentations', 'documents', 'web design'], false, true, true, null),
('Notion AI', 'مساعد ذكي داخل نوتشن لتنظيم المهام، تلخيص الملاحظات، وكتابة المحتوى.', 'https://notion.so', 'إنتاجية', 'Freemium', ARRAY['productivity', 'writing', 'summarization'], false, false, true, null),
('Humata AI', 'شات جي بي تي لملفات PDF. ارفع ملفك (مشروع، بحث، عقد) واسأله عن أي تفاصيل داخله.', 'https://humata.ai', 'دراسة وطلاب', 'Freemium', ARRAY['pdf chat', 'research', 'summarization'], false, false, true, null),
('Goblin.tools', 'مجموعة أدوات بسيطة تساعد الأشخاص (خاصة ذوي التشتت) في تنظيم وتكسير مهامهم المعقدة.', 'https://goblin.tools', 'إنتاجية', 'مجاني', ARRAY['task management', 'tone change', 'chef'], false, false, true, null),
('Consensus', 'محرك بحث علمي يبحث في ملايين الأوراق البحثية الموثقة ويجيب بناءً على العلم.', 'https://consensus.app', 'دراسة وطلاب', 'Freemium', ARRAY['research', 'science', 'academic'], false, true, true, null),
('Otter.ai', 'تسجيل الاجتماعات والمحاضرات وتحويل الكلام إلى نص مكتوب وتلخيصه تلقائياً.', 'https://otter.ai', 'إنتاجية', 'Freemium', ARRAY['meeting notes', 'transcription', 'summary'], false, false, true, null),

('Cursor', 'محرر أكواد (Fork من VS Code) مدمج بالكامل مع الذكاء الاصطناعي لتجربة برمجة فائقة السرعة.', 'https://cursor.com', 'برمجة', 'Freemium', ARRAY['code editor', 'copilot', 'refactoring'], false, true, true, null),
('Blackbox AI', 'مساعد برمجي سريع جداً لكتابة الكود وحل المشكلات البرمجية وفهم المشاريع المعقدة.', 'https://blackbox.ai', 'برمجة', 'Freemium', ARRAY['coding assistant', 'autocomplete', 'debugging'], false, false, true, null),
('Vercel V0', 'توليد واجهات المستخدم (UI) باستخدام React و Tailwind و Shadcn UI عبر الوصف النصي.', 'https://v0.dev', 'برمجة', 'Freemium', ARRAY['ui generation', 'react', 'tailwind'], false, true, true, null),
('Phind', 'محرك بحث مخصص للمبرمجين يقدم حلولاً برمجية مباشرة مع أمثلة كود قابلة للنسخ.', 'https://phind.com', 'برمجة', 'مجاني', ARRAY['search', 'coding', 'solutions'], false, false, true, null),

-- =============================================
-- المجموعة الثانية (30 أداة - إضافية)
-- =============================================
('Copy.ai', 'متخصص في كتابة نصوص الإعلانات، منشورات التواصل، ورسائل البريد.', 'https://www.copy.ai', 'نصوص', 'Freemium', ARRAY['copywriting', 'marketing', 'social media'], true, false, true, null),
('Rytr', 'مساعد كتابة ذكي يدعم اللغة العربية بشكل جيد جداً وبأسعار مجانية.', 'https://rytr.me', 'نصوص', 'Freemium', ARRAY['writing assistant', 'arabic support', 'blogging'], true, false, true, null),
('Simplified', 'منصة متكاملة للتصميم، الكتابة، وجدولة المنشورات في مكان واحد.', 'https://simplified.com', 'إنتاجية', 'Freemium', ARRAY['all-in-one', 'social media', 'design'], true, false, true, null),
('HoppyCopy', 'متخصص في كتابة حملات البريد الإلكتروني التسويقية بذكاء.', 'https://www.hoppycopy.co', 'نصوص', 'Freemium', ARRAY['email marketing', 'newsletters', 'spam check'], false, false, true, null),
('AnswerThePublic', 'أداة لاكتشاف ما يبحث عنه الناس في جوجل لتحسين محتوى الـ SEO.', 'https://answerthepublic.com', 'نصوص', 'Freemium', ARRAY['seo research', 'keywords', 'content ideas'], false, false, true, null),
('Namelix', 'توليد أسماء تجارية وشعارات (Logos) مبتكرة باستخدام الذكاء الاصطناعي.', 'https://namelix.com', 'إنتاجية', 'مجاني', ARRAY['branding', 'business names', 'logos'], false, false, true, null),
('NotebookLM', 'أداة جوجل الثورية لتحليل مستنداتك وتحويلها إلى بودكاست أو ملخصات.', 'https://notebooklm.google', 'دراسة وطلاب', 'مجاني', ARRAY['research', 'podcast', 'summarization'], true, true, true, null),
('Elicit', 'مساعد بحث علمي يقوم باستخراج البيانات من الأوراق البحثية وتلخيصها.', 'https://elicit.com', 'دراسة وطلاب', 'Freemium', ARRAY['research assistant', 'data extraction', 'literature review'], false, false, true, null),
('Scholarcy', 'يقوم بقراءة الأوراق البحثية الطويلة وتلخيصها في بطاقات معلوماتية.', 'https://www.scholarcy.com', 'دراسة وطلاب', 'Freemium', ARRAY['summarization', 'flashcards', 'academic'], false, false, true, null),
('Scite.ai', 'يساعدك في التأكد من صحة الاستشهادات العلمية ومدى موثوقيتها.', 'https://scite.ai', 'دراسة وطلاب', 'Freemium', ARRAY['citations', 'fact checking', 'research'], false, false, true, null),
('ChatPDF', 'ارفع أي ملف PDF وتحدث معه لاستخراج المعلومات أو التلخيص.', 'https://www.chatpdf.com', 'دراسة وطلاب', 'Freemium', ARRAY['pdf chat', 'summarization', 'documents'], true, false, true, null),
('ResearchRabbit', 'أداة لاكتشاف الأبحاث المرتبطة بمجالك وتصور العلاقات بينها.', 'https://www.researchrabbit.ai', 'دراسة وطلاب', 'مجاني', ARRAY['research discovery', 'citations graph', 'academic'], false, false, true, null),
('Pebblely', 'تحويل صور المنتجات العادية إلى صور دعائية احترافية بخلفيات مذهلة.', 'https://pebblely.com', 'صور', 'Freemium', ARRAY['product photography', 'ecommerce', 'backgrounds'], false, false, true, null),
('Flair.ai', 'أداة تصميم مخصصة لصور المنتجات والعلامات التجارية (Branding).', 'https://flair.ai', 'صور', 'Freemium', ARRAY['branding', 'product design', 'mockups'], false, false, true, null),
('ClipDrop', 'مجموعة أدوات من Stability AI لتعديل الصور، إزالة الإضاءة، وتكبير الحجم.', 'https://clipdrop.co', 'صور', 'Freemium', ARRAY['image editing', 'relight', 'upscale'], false, false, true, null),
('Vectorizer.ai', 'تحويل الصور العادية (Pixel) إلى صور متجهة (Vector) بدقة عالية جداً.', 'https://vectorizer.ai', 'صور', 'Freemium', ARRAY['vectorize', 'svg', 'design'], false, false, true, null),
('Luma Genie', 'توليد نماذج ثلاثية الأبعاد (3D Models) من خلال الوصف النصي فقط.', 'https://lumalabs.ai/genie', 'صور', 'مجاني', ARRAY['text to 3d', 'modeling', 'prototyping'], false, true, true, null),
('InVideo AI', 'تحويل فكرة أو نص إلى فيديو كامل مع تعليق صوتي ومشاهد مناسبة.', 'https://invideo.io', 'فيديو', 'Freemium', ARRAY['text to video', 'editing', 'voiceover'], false, false, true, null),
('Zapier Central', 'بناء وكلاء ذكاء اصطناعي (AI Agents) لأتمتة مهامك عبر آلاف التطبيقات.', 'https://zapier.com/central', 'إنتاجية', 'Freemium', ARRAY['automation', 'agents', 'workflow'], false, true, true, null),
('Fireflies.ai', 'تسجيل وتلخيص الاجتماعات تلقائياً واستخراج بنود العمل (Action Items).', 'https://fireflies.ai', 'إنتاجية', 'Freemium', ARRAY['meeting notes', 'transcription', 'teams'], false, false, true, null),
('Tome', 'إنشاء قصص وعروض تقديمية تفاعلية بذكاء اصطناعي سردي مميز.', 'https://tome.app', 'إنتاجية', 'Freemium', ARRAY['storytelling', 'presentations', 'interactive'], false, false, true, null),
('Taskade', 'منصة لإدارة المهام مدمجة مع وكلاء ذكاء اصطناعي لتنظيم العمل الجماعي.', 'https://www.taskade.com', 'إنتاجية', 'Freemium', ARRAY['project management', 'agents', 'collaboration'], false, false, true, null),
('Superwhisper', 'أداة إملاء صوتي دقيقة جداً تحول كلامك إلى نص منسق في أي تطبيق.', 'https://superwhisper.com', 'إنتاجية', 'Freemium', ARRAY['dictation', 'voice to text', 'mac'], false, false, true, null),
('Scribe', 'تحويل أي عملية تقوم بها على الشاشة إلى دليل إرشادي (Step-by-step) تلقائياً.', 'https://scribehow.com', 'إنتاجية', 'Freemium', ARRAY['documentation', 'guides', 'screenshots'], false, false, true, null),
('ChefGPT', 'يقترح عليك وصفات طعام بناءً على المكونات المتوفرة لديك في الثلاجة.', 'https://www.chefgpt.xyz', 'إنتاجية', 'Freemium', ARRAY['cooking', 'recipes', 'lifestyle'], false, false, true, null),
('Poised', 'مدرب تواصل ذكي يساعدك في تحسين أسلوبك في التحدث أثناء الاجتماعات.', 'https://www.poised.com', 'إنتاجية', 'Freemium', ARRAY['communication', 'coaching', 'meetings'], false, false, true, null),
('Character.ai', 'التحدث مع شخصيات افتراضية أو تاريخية أو حتى شخصيات من صنعك.', 'https://character.ai', 'نصوص', 'مجاني', ARRAY['chat', 'entertainment', 'personas'], true, false, true, null),
('Futurepedia', 'أكبر دليل متجدد يومياً لأدوات الذكاء الاصطناعي.', 'https://www.futurepedia.io', 'دراسة وطلاب', 'مجاني', ARRAY['directory', 'news', 'discovery'], false, false, true, null),
('Aesthete', 'أداة لاكتشاف وتنسيق الألوان والخطوط بناءً على ذوقك الفني.', 'https://aesthete.ai', 'صور', 'مجاني', ARRAY['colors', 'fonts', 'design'], false, false, true, null),

-- =============================================
-- المجموعة الثالثة (30 أداة - متقدمة)
-- =============================================
('Julius AI', 'محلل بيانات ذكي، ارفع ملف Excel واطلب منه رسم بياني أو تحليل إحصائي عبر الدردشة.', 'https://julius.ai', 'إنتاجية', 'Freemium', ARRAY['data analysis', 'charts', 'excel'], false, false, true, null),
('Tableau Public', 'النسخة المجانية من أقوى أداة لتحليل وتصور البيانات (Data Visualization).', 'https://public.tableau.com', 'إنتاجية', 'مجاني', ARRAY['visualization', 'analytics', 'dashboards'], false, false, true, null),
('Akkio', 'منصة ذكاء اصطناعي "بدون كود" لبناء نماذج تنبؤية وتحليل بيانات الأعمال.', 'https://www.akkio.com', 'إنتاجية', 'Freemium', ARRAY['no-code', 'prediction', 'business'], false, false, true, null),
('Rows AI', 'جداول بيانات (Spreadsheets) مدمجة بالذكاء الاصطناعي لتحليل البيانات تلقائياً.', 'https://rows.com', 'إنتاجية', 'Freemium', ARRAY['spreadsheets', 'analysis', 'automation'], false, false, true, null),
('ChatTerm', 'أداة لتحويل لغة SQL المعقدة إلى لغة بشرية بسيطة والعكس.', 'https://chatterm.com', 'برمجة', 'مجاني', ARRAY['sql', 'database', 'conversion'], false, false, true, null),
('MonkeyLearn', 'تحليل مشاعر النصوص (Sentiment Analysis) واستخراج الكلمات المفتاحية بذكاء.', 'https://monkeylearn.com', 'نصوص', 'Freemium', ARRAY['sentiment analysis', 'keywords', 'nlp'], false, false, true, null),
('WolframAlpha', 'المحرك الحسابي الأشهر لحل المعادلات الرياضية والهندسية المعقدة.', 'https://www.wolframalpha.com', 'دراسة وطلاب', 'Freemium', ARRAY['math', 'engineering', 'calculation'], true, false, true, null),
('Autodesk FormIt', 'أداة تصميم معماري ثلاثي الأبعاد تعتمد على الذكاء الاصطناعي في المراحل الأولية.', 'https://formit.autodesk.com', 'صور', 'مجاني', ARRAY['architecture', '3d modeling', 'design'], false, false, true, null),
('Onshape', 'منصة CAD سحابية مدمجة بأدوات ذكاء اصطناعي لتحسين التصاميم الميكانيكية.', 'https://www.onshape.com', 'صور', 'Freemium', ARRAY['cad', 'mechanical', 'engineering'], false, false, true, null),
('SimScale', 'محاكاة هندسية سحابية تعتمد على الذكاء الاصطناعي لتحليل الإجهادات.', 'https://www.simscale.com', 'برمجة', 'Freemium', ARRAY['simulation', 'engineering', 'cae'], false, false, true, null),
('KiCad AI Plugins', 'إضافات ذكاء اصطناعي لمساعدة مهندسي الإلكترونيات في تصميم الدوائر المطبوعة.', 'https://www.kicad.org', 'صور', 'مجاني', ARRAY['electronics', 'pcb', 'design'], false, false, true, null),
('Coursera AI Courses', 'أداة تعليمية للوصول إلى مساقات الذكاء الاصطناعي من كبرى الجامعات مجاناً.', 'https://www.coursera.org', 'دراسة وطلاب', 'Freemium', ARRAY['courses', 'education', 'learning'], false, false, true, null),
('Krea.ai', 'توليد وتحسين الصور في الوقت الحقيقي أثناء الرسم أو التحريك.', 'https://www.krea.ai', 'صور', 'Freemium', ARRAY['real-time', 'drawing', 'enhancement'], true, false, true, null),
('Magnific AI', 'أقوى أداة في العالم لزيادة دقة وتفاصيل الصور (Upscaling) بشكل لا يصدق.', 'https://magnific.ai', 'صور', 'Freemium', ARRAY['upscaling', 'enhancement', 'details'], true, false, true, null),
('Pika Labs', 'منصة متطورة لتحويل النصوص والصور إلى فيديوهات سينمائية قصيرة.', 'https://pika.art', 'فيديو', 'Freemium', ARRAY['text to video', 'animation', 'cinematic'], true, false, true, null),
('Suno AI', 'توليد أغاني كاملة (كلمات، لحن، وغناء) بجودة مذهلة عبر الوصف فقط.', 'https://suno.com', 'صوت', 'Freemium', ARRAY['music generation', 'songs', 'vocals'], true, true, true, null),
('Udio', 'منافس قوي لـ Suno في توليد الموسيقى والأغاني بجودة استوديو احترافية.', 'https://www.udio.com', 'صوت', 'Freemium', ARRAY['music', 'high quality', 'composition'], true, true, true, null),
('Spline AI', 'تصميم كائنات ومشاهد ثلاثية الأبعاد (3D) تفاعلية باستخدام الوصف النصي.', 'https://spline.design', 'صور', 'Freemium', ARRAY['3d', 'web design', 'interactive'], false, false, true, null),
('Codeium', 'بديل مجاني وقوي لـ GitHub Copilot يدعم أكثر من 70 لغة برمجة.', 'https://codeium.com', 'برمجة', 'مجاني', ARRAY['coding', 'copilot', 'autocomplete'], true, false, true, null),
('Tabnine', 'مساعد برمجي يعتمد على الذكاء الاصطناعي لإكمال الكود وضمان الخصوصية.', 'https://www.tabnine.com', 'برمجة', 'Freemium', ARRAY['privacy', 'enterprise', 'coding'], false, false, true, null),
('Hugging Face', 'منصة GitHub للذكاء الاصطناعي، للوصول إلى آلاف النماذج والأدوات مفتوحة المصدر.', 'https://huggingface.co', 'برمجة', 'مجاني', ARRAY['models', 'datasets', 'open source'], true, false, true, null),
('Replit Ghostwriter', 'بيئة برمجة سحابية مدمجة بمساعد ذكي لكتابة وتصحيح الأكواد.', 'https://replit.com', 'برمجة', 'Freemium', ARRAY['ide', 'cloud', 'coding'], false, false, true, null),
('Mintlify', 'توليد وثائق البرمجة (Documentation) تلقائياً من الكود المصدري.', 'https://mintlify.com', 'برمجة', 'Freemium', ARRAY['documentation', 'automation', 'dev tools'], false, false, true, null),
('Pieces for Developers', 'أداة لتنظيم وحفظ مقتطفات الكود باستخدام الذكاء الاصطناعي.', 'https://pieces.app', 'برمجة', 'مجاني', ARRAY['snippets', 'organization', 'workflow'], false, false, true, null),
('Ada Health', 'تطبيق ذكاء اصطناعي لتشخيص الأعراض الصحية وتقديم نصائح طبية أولية.', 'https://ada.com', 'إنتاجية', 'مجاني', ARRAY['health', 'diagnosis', 'symptoms'], false, false, true, null),
('Woebot Health', 'مساعد نفسي افتراضي يعتمد على العلاج المعرفي السلوكي (CBT).', 'https://woebothealth.com', 'إنتاجية', 'مجاني', ARRAY['mental health', 'therapy', 'chat'], false, false, true, null),
('MealPractice', 'مخطط وجبات ذكي يساعدك في تنظيم أكلك بناءً على أهدافك الصحية.', 'https://mealpractice.com', 'إنتاجية', 'Freemium', ARRAY['nutrition', 'meal planning', 'diet'], false, false, true, null),
('Fitbod', 'يستخدم الذكاء الاصطناعي لتصميم تمارين رياضية مخصصة لك بناءً على تقدمك.', 'https://fitbod.me', 'إنتاجية', 'Freemium', ARRAY['fitness', 'workout', 'training'], false, false, true, null),
('Sleep Cycle', 'تحليل أنماط النوم باستخدام الذكاء الاصطناعي لتحسين جودة راحتك.', 'https://www.sleepcycle.com', 'إنتاجية', 'Freemium', ARRAY['sleep', 'tracking', 'alarm'], false, false, true, null),
('Yuka', 'مسح المنتجات الغذائية والتجميلية لتقييم تأثيرها الصحي بذكاء.', 'https://yuka.io', 'إنتاجية', 'مجاني', ARRAY['scanning', 'health', 'products'], false, false, true, null),

-- =============================================
-- المجموعة الرابعة (10 أدوات - الختامية)
-- =============================================
('Napkin AI', 'تحويل النصوص والأفكار المعقدة إلى رسومات بيانية وتوضيحية (Visuals) فوراً.', 'https://www.napkin.ai', 'صور', 'Freemium', ARRAY['visualization', 'diagrams', 'storytelling'], false, false, true, null),
('n8n', 'أداة أتمتة سير عمل (Workflow Automation) قوية جداً ومفتوحة المصدر كبديل لـ Zapier.', 'https://n8n.io', 'إنتاجية', 'Freemium', ARRAY['automation', 'workflow', 'open source'], false, false, true, null),
('HeyGen Interactive Avatar', 'إنشاء متحدث افتراضي يتفاعل مع المستخدمين في الوقت الحقيقي (Real-time).', 'https://www.heygen.com/interactive-avatar', 'فيديو', 'Freemium', ARRAY['interactive', 'avatar', 'real-time'], true, false, true, null),
('Civitai', 'أكبر مجتمع ونظام لمشاركة نماذج توليد الصور مفتوحة المصدر (Stable Diffusion).', 'https://civitai.com', 'صور', 'مجاني', ARRAY['models', 'stable diffusion', 'community'], false, false, true, null),
('Rose.ai', 'منصة بيانات سحابية تستخدم الذكاء الاصطناعي للعثور على البيانات الاقتصادية وتصورها.', 'https://rose.ai', 'إنتاجية', 'Freemium', ARRAY['data', 'finance', 'visualization'], false, false, true, null),
('Descript', 'تحرير الفيديو والصوت عبر تعديل النص المكتوب؛ احذف كلمة من النص لتُحذف من الفيديو!', 'https://www.descript.com', 'فيديو', 'Freemium', ARRAY['editing', 'transcription', 'audio'], false, false, true, null),
('Veed.io (Eye Contact)', 'أداة ذكاء اصطناعي تقوم بتعديل حركة عينيك في الفيديو لتبدو كأنك تنظر للكاميرا دائماً.', 'https://www.veed.io', 'فيديو', 'Freemium', ARRAY['eye contact', 'video editing', 'correction'], false, false, true, null),
('Gamma (AI Website)', 'لإنشاء مواقع ويب كاملة بصفحة واحدة وتصميم مذهل عبر الوصف الكتابي فقط.', 'https://gamma.app', 'إنتاجية', 'Freemium', ARRAY['website builder', 'no-code', 'design'], false, false, true, null),
('Perplexity Pages', 'تحويل نتائج البحث العميقة إلى مقالات منسقة ومنظمة بشكل جميل للنشر الفوري.', 'https://www.perplexity.ai', 'نصوص', 'مجاني', ARRAY['publishing', 'articles', 'research'], true, false, true, null),
('Manus AI', 'وكيل ذكاء اصطناعي عام قادر على تنفيذ مهام معقدة وشاملة نيابة عنك.', 'https://manus.im', 'إنتاجية', 'مجاني', ARRAY['agent', 'automation', 'tasks'], true, true, true, null);
