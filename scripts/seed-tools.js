
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

console.log(`Trying to load .env from: ${envPath}`);

if (fs.existsSync(envPath)) {
    const result = dotenv.config({ path: envPath });
    if (result.error) {
        console.error('Error parsing .env file:', result.error);
    } else {
        console.log('Dotenv loaded successfully.');
    }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Prioritize Service Role Key for seeding to bypass RLS
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in process.env');
    console.error('Ensure .env contains VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (preferred)');
    process.exit(1);
}

// Log safely
const keyType = supabaseKey.startsWith('eyJ') ? 'JWT' : 'Unknown';
console.log(`Using credentials: URL=${supabaseUrl}, KeyType=${keyType}`);

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const tools = [
    // المجموعة الأولى (30 أداة - الأساسية)
    { title: 'ChatGPT', description: 'المساعد الأشهر عالمياً للكتابة، البرمجة، والبحث. يقدم إجابات ذكية ومحادثات طبيعية.', url: 'https://chatgpt.com', category: 'نصوص', pricing_type: 'Freemium', features: ['chat', 'writing', 'coding', 'analysis'], supports_arabic: true, is_featured: true, is_published: true },
    { title: 'Google Gemini', description: 'منافس جوجل القوي، يتميز بالسرعة والارتباط بخدمات جوجل وتحديث المعلومات لحظياً.', url: 'https://gemini.google.com', category: 'نصوص', pricing_type: 'مجاني', features: ['google integration', 'real-time info', 'multimodal'], supports_arabic: true, is_featured: true, is_published: true },
    { title: 'Claude AI', description: 'يتميز بأسلوب كتابة طبيعي جداً وقدرات تحليلية فائقة وفهم عميق للسياق.', url: 'https://claude.ai', category: 'نصوص', pricing_type: 'Freemium', features: ['long context', 'natural writing', 'coding'], supports_arabic: true, is_featured: true, is_published: true },
    { title: 'DeepSeek', description: 'أداة صينية قوية جداً في البرمجة والتفكير المنطقي ومجانية تماماً.', url: 'https://deepseek.com', category: 'برمجة', pricing_type: 'مجاني', features: ['coding', 'logic', 'open source'], supports_arabic: true, is_featured: false, is_published: true },
    { title: 'Perplexity AI', description: 'محرك بحث ذكي يقدم إجابات موثقة بالمصادر والمراجع لضمان دقة المعلومات.', url: 'https://perplexity.ai', category: 'نصوص', pricing_type: 'Freemium', features: ['search', 'citations', 'research'], supports_arabic: true, is_featured: true, is_published: true },
    { title: 'QuillBot', description: 'أفضل أداة لإعادة صياغة النصوص وتحسين القواعد اللغوية وكتابة المحتوى بأساليب متعددة.', url: 'https://quillbot.com', category: 'نصوص', pricing_type: 'Freemium', features: ['paraphrasing', 'grammar check', 'summarizer'], supports_arabic: true, is_featured: false, is_published: true },
    { title: 'WriteSonic', description: 'متخصص في كتابة المقالات التسويقية والمحتوى المتوافق مع SEO للمواقع والمدونات.', url: 'https://writesonic.com', category: 'نصوص', pricing_type: 'Freemium', features: ['seo writing', 'marketing copy', 'blog posts'], supports_arabic: true, is_featured: false, is_published: true },
    { title: 'Leonardo.ai', description: 'منصة احترافية لتوليد الصور الفنية بجودة مذهلة يومياً مجاناً مع أدوات تحكم دقيقة.', url: 'https://leonardo.ai', category: 'صور', pricing_type: 'Freemium', features: ['image generation', 'art', 'canvas'], supports_arabic: false, is_featured: true, is_published: true },
    { title: 'Adobe Firefly', description: 'أداة أدوبي الرسمية لتوليد وتعديل الصور بالذكاء الاصطناعي، آمنة تجارياً وذات جودة عالية.', url: 'https://firefly.adobe.com', category: 'صور', pricing_type: 'Freemium', features: ['text to image', 'generative fill', 'commercial safe'], supports_arabic: false, is_featured: true, is_published: true },
    { title: 'Canva AI', description: 'أدوات ذكاء اصطناعي مدمجة في كانفا لتصميم الصور والعروض التقديمية بسهولة تامة.', url: 'https://canva.com', category: 'صور', pricing_type: 'Freemium', features: ['magic edit', 'presentations', 'social media'], supports_arabic: false, is_featured: true, is_published: true },
    { title: 'Ideogram', description: 'متميز جداً في كتابة النصوص داخل الصور بشكل دقيق وتصميم الشعارات.', url: 'https://ideogram.ai', category: 'صور', pricing_type: 'Freemium', features: ['typography', 'logos', 'image generation'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Lexica Art', description: 'محرك بحث ومولد صور يعتمد على نموذج Stable Diffusion بتصاميم فنية مميزة.', url: 'https://lexica.art', category: 'صور', pricing_type: 'مجاني', features: ['search', 'stable diffusion', 'art'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Microsoft Designer', description: 'أداة مجانية تماماً من مايكروسوفت لتصميم المنشورات والصور والعروض التقديمية.', url: 'https://designer.microsoft.com', category: 'صور', pricing_type: 'مجاني', features: ['graphic design', 'dalle-3', 'social posts'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Remove.bg', description: 'الأداة الأسرع والأشهر لإزالة خلفيات الصور بضغطة واحدة وبدقة عالية.', url: 'https://remove.bg', category: 'صور', pricing_type: 'Freemium', features: ['background removal', 'fast', 'api'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Luma Dream Machine', description: 'توليد فيديوهات واقعية جداً من النصوص أو الصور بجودة سينمائية.', url: 'https://lumalabs.ai', category: 'فيديو', pricing_type: 'Freemium', features: ['text to video', 'image to video', 'high quality'], supports_arabic: false, is_featured: true, is_published: true },
    { title: 'HeyGen', description: 'إنشاء فيديوهات لمتحدثين افتراضيين (Avatars) بجودة عالية ومزامنة دقيقة للشفاه.', url: 'https://heygen.com', category: 'فيديو', pricing_type: 'Freemium', features: ['avatars', 'talking head', 'translation'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'ElevenLabs', description: 'أفضل أداة لتحويل النص إلى كلام بأصوات بشرية واقعية جداً وبلهجات متعددة.', url: 'https://elevenlabs.io', category: 'صوت', pricing_type: 'Freemium', features: ['text to speech', 'voice cloning', 'multilingual'], supports_arabic: false, is_featured: true, is_published: true },
    { title: 'CapCut AI', description: 'أدوات ذكاء اصطناعي مدمجة لتحرير الفيديو وإضافة الترجمة والمؤثرات تلقائياً.', url: 'https://capcut.com', category: 'فيديو', pricing_type: 'مجاني', features: ['video editing', 'auto captions', 'effects'], supports_arabic: false, is_featured: true, is_published: true },
    { title: 'Adobe Podcast', description: 'تحسين جودة الصوت المسجل وإزالة الضجيج ليصبح كأنه تم تسجيله في استوديو احترافي.', url: 'https://podcast.adobe.com', category: 'صوت', pricing_type: 'مجاني', features: ['audio enhancement', 'noise removal', 'mic check'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Vocal Remover', description: 'فصل صوت المغني عن الموسيقى في أي ملف صوتي بدقة عالية وبشكل مجاني.', url: 'https://vocalremover.org', category: 'صوت', pricing_type: 'مجاني', features: ['stem separation', 'karaoke', 'key finder'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Gamma App', description: 'إنشاء عروض تقديمية (PowerPoint) ومستندات ومواقع ويب كاملة في ثوانٍ عبر الوصف.', url: 'https://gamma.app', category: 'إنتاجية', pricing_type: 'Freemium', features: ['presentations', 'documents', 'web design'], supports_arabic: false, is_featured: true, is_published: true },
    { title: 'Notion AI', description: 'مساعد ذكي داخل نوتشن لتنظيم المهام، تلخيص الملاحظات، وكتابة المحتوى.', url: 'https://notion.so', category: 'إنتاجية', pricing_type: 'Freemium', features: ['productivity', 'writing', 'summarization'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Humata AI', description: 'شات جي بي تي لملفات PDF. ارفع ملفك (مشروع، بحث، عقد) واسأله عن أي تفاصيل داخله.', url: 'https://humata.ai', category: 'دراسة وطلاب', pricing_type: 'Freemium', features: ['pdf chat', 'research', 'summarization'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Goblin.tools', description: 'مجموعة أدوات بسيطة تساعد الأشخاص (خاصة ذوي التشتت) في تنظيم وتكسير مهامهم المعقدة.', url: 'https://goblin.tools', category: 'إنتاجية', pricing_type: 'مجاني', features: ['task management', 'tone change', 'chef'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Consensus', description: 'محرك بحث علمي يبحث في ملايين الأوراق البحثية الموثقة ويجيب بناءً على العلم.', url: 'https://consensus.app', category: 'دراسة وطلاب', pricing_type: 'Freemium', features: ['research', 'science', 'academic'], supports_arabic: false, is_featured: true, is_published: true },
    { title: 'Otter.ai', description: 'تسجيل الاجتماعات والمحاضرات وتحويل الكلام إلى نص مكتوب وتلخيصه تلقائياً.', url: 'https://otter.ai', category: 'إنتاجية', pricing_type: 'Freemium', features: ['meeting notes', 'transcription', 'summary'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Cursor', description: 'محرر أكواد (Fork من VS Code) مدمج بالكامل مع الذكاء الاصطناعي لتجربة برمجة فائقة السرعة.', url: 'https://cursor.com', category: 'برمجة', pricing_type: 'Freemium', features: ['code editor', 'copilot', 'refactoring'], supports_arabic: false, is_featured: true, is_published: true },
    { title: 'Blackbox AI', description: 'مساعد برمجي سريع جداً لكتابة الكود وحل المشكلات البرمجية وفهم المشاريع المعقدة.', url: 'https://blackbox.ai', category: 'برمجة', pricing_type: 'Freemium', features: ['coding assistant', 'autocomplete', 'debugging'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Vercel V0', description: 'توليد واجهات المستخدم (UI) باستخدام React و Tailwind و Shadcn UI عبر الوصف النصي.', url: 'https://v0.dev', category: 'برمجة', pricing_type: 'Freemium', features: ['ui generation', 'react', 'tailwind'], supports_arabic: false, is_featured: true, is_published: true },
    { title: 'Phind', description: 'محرك بحث مخصص للمبرمجين يقدم حلولاً برمجية مباشرة مع أمثلة كود قابلة للنسخ.', url: 'https://phind.com', category: 'برمجة', pricing_type: 'مجاني', features: ['search', 'coding', 'solutions'], supports_arabic: false, is_featured: false, is_published: true },

    // المجموعة الثانية (30 أداة - إضافية)
    { title: 'Copy.ai', description: 'متخصص في كتابة نصوص الإعلانات، منشورات التواصل، ورسائل البريد.', url: 'https://www.copy.ai', category: 'نصوص', pricing_type: 'Freemium', features: ['copywriting', 'marketing', 'social media'], supports_arabic: true, is_featured: false, is_published: true },
    { title: 'Simplified', description: 'منصة متكاملة للتصميم، الكتابة، وجدولة المنشورات في مكان واحد.', url: 'https://simplified.com', category: 'إنتاجية', pricing_type: 'Freemium', features: ['all-in-one', 'social media', 'design'], supports_arabic: true, is_featured: false, is_published: true },
    { title: 'HoppyCopy', description: 'متخصص في كتابة حملات البريد الإلكتروني التسويقية بذكاء.', url: 'https://www.hoppycopy.co', category: 'نصوص', pricing_type: 'Freemium', features: ['email marketing', 'newsletters', 'spam check'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'AnswerThePublic', description: 'أداة لاكتشاف ما يبحث عنه الناس في جوجل لتحسين محتوى الـ SEO.', url: 'https://answerthepublic.com', category: 'نصوص', pricing_type: 'Freemium', features: ['seo research', 'keywords', 'content ideas'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Namelix', description: 'توليد أسماء تجارية وشعارات (Logos) مبتكرة باستخدام الذكاء الاصطناعي.', url: 'https://namelix.com', category: 'إنتاجية', pricing_type: 'مجاني', features: ['branding', 'business names', 'logos'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'NotebookLM', description: 'أداة جوجل الثورية لتحليل مستنداتك وتحويلها إلى بودكاست أو ملخصات.', url: 'https://notebooklm.google', category: 'دراسة وطلاب', pricing_type: 'مجاني', features: ['research', 'podcast', 'summarization'], supports_arabic: true, is_featured: true, is_published: true },
    { title: 'Elicit', description: 'مساعد بحث علمي يقوم باستخراج البيانات من الأوراق البحثية وتلخيصها.', url: 'https://elicit.com', category: 'دراسة وطلاب', pricing_type: 'Freemium', features: ['research assistant', 'data extraction', 'literature review'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Scholarcy', description: 'يقوم بقراءة الأوراق البحثية الطويلة وتلخيصها في بطاقات معلوماتية.', url: 'https://www.scholarcy.com', category: 'دراسة وطلاب', pricing_type: 'Freemium', features: ['summarization', 'flashcards', 'academic'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Scite.ai', description: 'يساعدك في التأكد من صحة الاستشهادات العلمية ومدى موثوقيتها.', url: 'https://scite.ai', category: 'دراسة وطلاب', pricing_type: 'Freemium', features: ['citations', 'fact checking', 'research'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'ChatPDF', description: 'ارفع أي ملف PDF وتحدث معه لاستخراج المعلومات أو التلخيص.', url: 'https://www.chatpdf.com', category: 'دراسة وطلاب', pricing_type: 'Freemium', features: ['pdf chat', 'summarization', 'documents'], supports_arabic: true, is_featured: false, is_published: true },
    { title: 'ResearchRabbit', description: 'أداة لاكتشاف الأبحاث المرتبطة بمجالك وتصور العلاقات بينها.', url: 'https://www.researchrabbit.ai', category: 'دراسة وطلاب', pricing_type: 'مجاني', features: ['research discovery', 'citations graph', 'academic'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Pebblely', description: 'تحويل صور المنتجات العادية إلى صور دعائية احترافية بخلفيات مذهلة.', url: 'https://pebblely.com', category: 'صور', pricing_type: 'Freemium', features: ['product photography', 'ecommerce', 'backgrounds'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Flair.ai', description: 'أداة تصميم مخصصة لصور المنتجات والعلامات التجارية (Branding).', url: 'https://flair.ai', category: 'صور', pricing_type: 'Freemium', features: ['branding', 'product design', 'mockups'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'ClipDrop', description: 'مجموعة أدوات من Stability AI لتعديل الصور، إزالة الإضاءة، وتكبير الحجم.', url: 'https://clipdrop.co', category: 'صور', pricing_type: 'Freemium', features: ['image editing', 'relight', 'upscale'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Vectorizer.ai', description: 'تحويل الصور العادية (Pixel) إلى صور متجهة (Vector) بدقة عالية جداً.', url: 'https://vectorizer.ai', category: 'صور', pricing_type: 'Freemium', features: ['vectorize', 'svg', 'design'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Luma Genie', description: 'توليد نماذج ثلاثية الأبعاد (3D Models) من خلال الوصف النصي فقط.', url: 'https://lumalabs.ai/genie', category: 'صور', pricing_type: 'مجاني', features: ['text to 3d', 'modeling', 'prototyping'], supports_arabic: false, is_featured: true, is_published: true },
    { title: 'InVideo AI', description: 'تحويل فكرة أو نص إلى فيديو كامل مع تعليق صوتي ومشاهد مناسبة.', url: 'https://invideo.io', category: 'فيديو', pricing_type: 'Freemium', features: ['text to video', 'editing', 'voiceover'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Zapier Central', description: 'بناء وكلاء ذكاء اصطناعي (AI Agents) لأتمتة مهامك عبر آلاف التطبيقات.', url: 'https://zapier.com/central', category: 'إنتاجية', pricing_type: 'Freemium', features: ['automation', 'agents', 'workflow'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Fireflies.ai', description: 'تسجيل وتلخيص الاجتماعات تلقائياً واستخراج بنود العمل (Action Items).', url: 'https://fireflies.ai', category: 'إنتاجية', pricing_type: 'Freemium', features: ['meeting notes', 'transcription', 'teams'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Taskade', description: 'منصة لإدارة المهام مدمجة مع وكلاء ذكاء اصطناعي لتنظيم العمل الجماعي.', url: 'https://www.taskade.com', category: 'إنتاجية', pricing_type: 'Freemium', features: ['project management', 'agents', 'collaboration'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Superwhisper', description: 'أداة إملاء صوتي دقيقة جداً تحول كلامك إلى نص منسق في أي تطبيق.', url: 'https://superwhisper.com', category: 'إنتاجية', pricing_type: 'Freemium', features: ['dictation', 'voice to text', 'mac'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Scribe', description: 'تحويل أي عملية تقوم بها على الشاشة إلى دليل إرشادي (Step-by-step) تلقائياً.', url: 'https://scribehow.com', category: 'إنتاجية', pricing_type: 'Freemium', features: ['documentation', 'guides', 'screenshots'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'ChefGPT', description: 'يقترح عليك وصفات طعام بناءً على المكونات المتوفرة لديك في الثلاجة.', url: 'https://www.chefgpt.xyz', category: 'إنتاجية', pricing_type: 'Freemium', features: ['cooking', 'recipes', 'lifestyle'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Poised', description: 'مدرب تواصل ذكي يساعدك في تحسين أسلوبك في التحدث أثناء الاجتماعات.', url: 'https://www.poised.com', category: 'إنتاجية', pricing_type: 'Freemium', features: ['communication', 'coaching', 'meetings'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Character.ai', description: 'التحدث مع شخصيات افتراضية أو تاريخية أو حتى شخصيات من صنعك.', url: 'https://character.ai', category: 'نصوص', pricing_type: 'مجاني', features: ['chat', 'entertainment', 'personas'], supports_arabic: true, is_featured: false, is_published: true },
    { title: 'Futurepedia', description: 'أكبر دليل متجدد يومياً لأدوات الذكاء الاصطناعي.', url: 'https://www.futurepedia.io', category: 'دراسة وطلاب', pricing_type: 'مجاني', features: ['directory', 'news', 'discovery'], supports_arabic: false, is_featured: false, is_published: true },

    // المجموعة الثالثة (30 أداة - متقدمة)
    { title: 'Julius AI', description: 'محلل بيانات ذكي، ارفع ملف Excel واطلب منه رسم بياني أو تحليل إحصائي عبر الدردشة.', url: 'https://julius.ai', category: 'إنتاجية', pricing_type: 'Freemium', features: ['data analysis', 'charts', 'excel'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Tableau Public', description: 'النسخة المجانية من أقوى أداة لتحليل وتصور البيانات (Data Visualization).', url: 'https://public.tableau.com', category: 'إنتاجية', pricing_type: 'مجاني', features: ['visualization', 'analytics', 'dashboards'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Akkio', description: 'منصة ذكاء اصطناعي "بدون كود" لبناء نماذج تنبؤية وتحليل بيانات الأعمال.', url: 'https://www.akkio.com', category: 'إنتاجية', pricing_type: 'Freemium', features: ['no-code', 'prediction', 'business'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Rows AI', description: 'جداول بيانات (Spreadsheets) مدمجة بالذكاء الاصطناعي لتحليل البيانات تلقائياً.', url: 'https://rows.com', category: 'إنتاجية', pricing_type: 'Freemium', features: ['spreadsheets', 'analysis', 'automation'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'ChatTerm', description: 'أداة لتحويل لغة SQL المعقدة إلى لغة بشرية بسيطة والعكس.', url: 'https://chatterm.com', category: 'برمجة', pricing_type: 'مجاني', features: ['sql', 'database', 'conversion'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'MonkeyLearn', description: 'تحليل مشاعر النصوص (Sentiment Analysis) واستخراج الكلمات المفتاحية بذكاء.', url: 'https://monkeylearn.com', category: 'نصوص', pricing_type: 'Freemium', features: ['sentiment analysis', 'keywords', 'nlp'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'WolframAlpha', description: 'المحرك الحسابي الأشهر لحل المعادلات الرياضية والهندسية المعقدة.', url: 'https://www.wolframalpha.com', category: 'دراسة وطلاب', pricing_type: 'Freemium', features: ['math', 'engineering', 'calculation'], supports_arabic: true, is_featured: false, is_published: true },
    { title: 'Autodesk FormIt', description: 'أداة تصميم معماري ثلاثي الأبعاد تعتمد على الذكاء الاصطناعي في المراحل الأولية.', url: 'https://formit.autodesk.com', category: 'صور', pricing_type: 'مجاني', features: ['architecture', '3d modeling', 'design'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Onshape', description: 'منصة CAD سحابية مدمجة بأدوات ذكاء اصطناعي لتحسين التصاميم الميكانيكية.', url: 'https://www.onshape.com', category: 'صور', pricing_type: 'Freemium', features: ['cad', 'mechanical', 'engineering'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'SimScale', description: 'محاكاة هندسية سحابية تعتمد على الذكاء الاصطناعي لتحليل الإجهادات.', url: 'https://www.simscale.com', category: 'برمجة', pricing_type: 'Freemium', features: ['simulation', 'engineering', 'cae'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'KiCad AI Plugins', description: 'إضافات ذكاء اصطناعي لمساعدة مهندسي الإلكترونيات في تصميم الدوائر المطبوعة.', url: 'https://www.kicad.org', category: 'صور', pricing_type: 'مجاني', features: ['electronics', 'pcb', 'design'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Coursera AI Courses', description: 'أداة تعليمية للوصول إلى مساقات الذكاء الاصطناعي من كبرى الجامعات مجاناً.', url: 'https://www.coursera.org', category: 'دراسة وطلاب', pricing_type: 'Freemium', features: ['courses', 'education', 'learning'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Krea.ai', description: 'توليد وتحسين الصور في الوقت الحقيقي أثناء الرسم أو التحريك.', url: 'https://www.krea.ai', category: 'صور', pricing_type: 'Freemium', features: ['real-time', 'drawing', 'enhancement'], supports_arabic: true, is_featured: false, is_published: true },
    { title: 'Magnific AI', description: 'أقوى أداة في العالم لزيادة دقة وتفاصيل الصور (Upscaling) بشكل لا يصدق.', url: 'https://magnific.ai', category: 'صور', pricing_type: 'Freemium', features: ['upscaling', 'enhancement', 'details'], supports_arabic: true, is_featured: false, is_published: true },
    { title: 'Pika Labs', description: 'منصة متطورة لتحويل النصوص والصور إلى فيديوهات سينمائية قصيرة.', url: 'https://pika.art', category: 'فيديو', pricing_type: 'Freemium', features: ['text to video', 'animation', 'cinematic'], supports_arabic: true, is_featured: false, is_published: true },
    { title: 'Suno AI', description: 'توليد أغاني كاملة (كلمات، لحن، وغناء) بجودة مذهلة عبر الوصف فقط.', url: 'https://suno.com', category: 'صوت', pricing_type: 'Freemium', features: ['music generation', 'songs', 'vocals'], supports_arabic: true, is_featured: true, is_published: true },
    { title: 'Udio', description: 'منافس قوي لـ Suno في توليد الموسيقى والأغاني بجودة استوديو احترافية.', url: 'https://www.udio.com', category: 'صوت', pricing_type: 'Freemium', features: ['music', 'high quality', 'composition'], supports_arabic: true, is_featured: true, is_published: true },
    { title: 'Spline AI', description: 'تصميم كائنات ومشاهد ثلاثية الأبعاد (3D) تفاعلية باستخدام الوصف النصي.', url: 'https://spline.design', category: 'صور', pricing_type: 'Freemium', features: ['3d', 'web design', 'interactive'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Codeium', description: 'بديل مجاني وقوي لـ GitHub Copilot يدعم أكثر من 70 لغة برمجة.', url: 'https://codeium.com', category: 'برمجة', pricing_type: 'مجاني', features: ['coding', 'copilot', 'autocomplete'], supports_arabic: true, is_featured: false, is_published: true },
    { title: 'Tabnine', description: 'مساعد برمجي يعتمد على الذكاء الاصطناعي لإكمال الكود وضمان الخصوصية.', url: 'https://www.tabnine.com', category: 'برمجة', pricing_type: 'Freemium', features: ['privacy', 'enterprise', 'coding'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Hugging Face', description: 'منصة GitHub للذكاء الاصطناعي، للوصول إلى آلاف النماذج والأدوات مفتوحة المصدر.', url: 'https://huggingface.co', category: 'برمجة', pricing_type: 'مجاني', features: ['models', 'datasets', 'open source'], supports_arabic: true, is_featured: false, is_published: true },
    { title: 'Replit Ghostwriter', description: 'بيئة برمجة سحابية مدمجة بمساعد ذكي لكتابة وتصحيح الأكواد.', url: 'https://replit.com', category: 'برمجة', pricing_type: 'Freemium', features: ['ide', 'cloud', 'coding'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Mintlify', description: 'توليد وثائق البرمجة (Documentation) تلقائياً من الكود المصدري.', url: 'https://mintlify.com', category: 'برمجة', pricing_type: 'Freemium', features: ['documentation', 'automation', 'dev tools'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Pieces for Developers', description: 'أداة لتنظيم وحفظ مقتطفات الكود باستخدام الذكاء الاصطناعي.', url: 'https://pieces.app', category: 'برمجة', pricing_type: 'مجاني', features: ['snippets', 'organization', 'workflow'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Ada Health', description: 'تطبيق ذكاء اصطناعي لتشخيص الأعراض الصحية وتقديم نصائح طبية أولية.', url: 'https://ada.com', category: 'إنتاجية', pricing_type: 'مجاني', features: ['health', 'diagnosis', 'symptoms'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Woebot Health', description: 'مساعد نفسي افتراضي يعتمد على العلاج المعرفي السلوكي (CBT).', url: 'https://woebothealth.com', category: 'إنتاجية', pricing_type: 'مجاني', features: ['mental health', 'therapy', 'chat'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'MealPractice', description: 'مخطط وجبات ذكي يساعدك في تنظيم أكلك بناءً على أهدافك الصحية.', url: 'https://mealpractice.com', category: 'إنتاجية', pricing_type: 'Freemium', features: ['nutrition', 'meal planning', 'diet'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Fitbod', description: 'يستخدم الذكاء الاصطناعي لتصميم تمارين رياضية مخصصة لك بناءً على تقدمك.', url: 'https://fitbod.me', category: 'إنتاجية', pricing_type: 'Freemium', features: ['fitness', 'workout', 'training'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Sleep Cycle', description: 'تحليل أنماط النوم باستخدام الذكاء الاصطناعي لتحسين جودة راحتك.', url: 'https://www.sleepcycle.com', category: 'إنتاجية', pricing_type: 'Freemium', features: ['sleep', 'tracking', 'alarm'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Yuka', description: 'مسح المنتجات الغذائية والتجميلية لتقييم تأثيرها الصحي بذكاء.', url: 'https://yuka.io', category: 'إنتاجية', pricing_type: 'مجاني', features: ['scanning', 'health', 'products'], supports_arabic: false, is_featured: false, is_published: true },

    // المجموعة الرابعة (10 أدوات - الختامية)
    { title: 'Napkin AI', description: 'تحويل النصوص والأفكار المعقدة إلى رسومات بيانية وتوضيحية (Visuals) فوراً.', url: 'https://www.napkin.ai', category: 'صور', pricing_type: 'Freemium', features: ['visualization', 'diagrams', 'storytelling'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'n8n', description: 'أداة أتمتة سير عمل (Workflow Automation) قوية جداً ومفتوحة المصدر كبديل لـ Zapier.', url: 'https://n8n.io', category: 'إنتاجية', pricing_type: 'Freemium', features: ['automation', 'workflow', 'open source'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'HeyGen Interactive Avatar', description: 'إنشاء متحدث افتراضي يتفاعل مع المستخدمين في الوقت الحقيقي (Real-time).', url: 'https://www.heygen.com/interactive-avatar', category: 'فيديو', pricing_type: 'Freemium', features: ['interactive', 'avatar', 'real-time'], supports_arabic: true, is_featured: false, is_published: true },
    { title: 'Civitai', description: 'أكبر مجتمع ونظام لمشاركة نماذج توليد الصور مفتوحة المصدر (Stable Diffusion).', url: 'https://civitai.com', category: 'صور', pricing_type: 'مجاني', features: ['models', 'stable diffusion', 'community'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Rose.ai', description: 'منصة بيانات سحابية تستخدم الذكاء الاصطناعي للعثور على البيانات الاقتصادية وتصورها.', url: 'https://rose.ai', category: 'إنتاجية', pricing_type: 'Freemium', features: ['data', 'finance', 'visualization'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Descript', description: 'تحرير الفيديو والصوت عبر تعديل النص المكتوب؛ احذف كلمة من النص لتُحذف من الفيديو!', url: 'https://www.descript.com', category: 'فيديو', pricing_type: 'Freemium', features: ['editing', 'transcription', 'audio'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Veed.io (Eye Contact)', description: 'أداة ذكاء اصطناعي تقوم بتعديل حركة عينيك في الفيديو لتبدو كأنك تنظر للكاميرا دائماً.', url: 'https://www.veed.io', category: 'فيديو', pricing_type: 'Freemium', features: ['eye contact', 'video editing', 'correction'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Gamma (AI Website)', description: 'لإنشاء مواقع ويب كاملة بصفحة واحدة وتصميم مذهل عبر الوصف الكتابي فقط.', url: 'https://gamma.app', category: 'إنتاجية', pricing_type: 'Freemium', features: ['website builder', 'no-code', 'design'], supports_arabic: false, is_featured: false, is_published: true },
    { title: 'Perplexity Pages', description: 'تحويل نتائج البحث العميقة إلى مقالات منسقة ومنظمة بشكل جميل للنشر الفوري.', url: 'https://www.perplexity.ai', category: 'نصوص', pricing_type: 'مجاني', features: ['publishing', 'articles', 'research'], supports_arabic: true, is_featured: false, is_published: true },
    { title: 'Manus AI', description: 'وكيل ذكاء اصطناعي عام قادر على تنفيذ مهام معقدة وشاملة نيابة عنك.', url: 'https://manus.im', category: 'إنتاجية', pricing_type: 'مجاني', features: ['agent', 'automation', 'tasks'], supports_arabic: true, is_featured: true, is_published: true },
];

async function seed() {
    console.log('🔄 Seeding tools...');

    // 1. Fetch existing URLs using available key
    const { data: existingTools, error: fetchError } = await supabase
        .from('tools')
        .select('id, url');

    if (fetchError) {
        console.error('❌ Error fetching existing tools:', fetchError);
        // If permission denied just to read, we might still fail to write, but let's see.
        if (fetchError.code === '42501') {
            console.error('⚠️ PERMISSION DENIED. You need to use the SERVICE_ROLE_KEY to bypass RLS.');
            console.error('Please set SUPABASE_SERVICE_ROLE_KEY in your .env or command line.');
            process.exit(1);
        }
    }

    const existingMap = new Map((existingTools || []).map(t => [t.url, t.id]));
    let inserted = 0;
    let updated = 0;
    let errors = 0;

    console.log(`Found ${existingMap.size} existing tools.`);

    for (const tool of tools) {
        try {
            const existingId = existingMap.get(tool.url);

            if (existingId) {
                // Update existing tool
                const { error } = await supabase
                    .from('tools')
                    .update(tool)
                    .eq('id', existingId);

                if (error) {
                    console.error(`❌ Error updating ${tool.title}:`, error.message);
                    errors++;
                } else {
                    updated++;
                }
            } else {
                // Insert new tool
                const { error } = await supabase
                    .from('tools')
                    .insert(tool);

                if (error) {
                    console.error(`❌ Error inserting ${tool.title}:`, error.message);
                    errors++;
                } else {
                    inserted++;
                }
            }
        } catch (err) {
            console.error(`🔥 Unexpected error for ${tool.title}:`, err);
        }
    }

    console.log('------------------------------------------------');
    console.log(`✅ Completed!`);
    console.log(`   - Inserted: ${inserted}`);
    console.log(`   - Updated: ${updated}`);
    console.log(`   - Errors: ${errors}`);
    console.log('------------------------------------------------');
}

seed();
