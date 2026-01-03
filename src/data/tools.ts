export type Category = 'الكل' | 'نصوص' | 'صور' | 'فيديو' | 'برمجة' | 'إنتاجية' | 'دراسة وطلاب' | 'صوت';

export interface Tool {
  id: string;
  title: string;
  description: string;
  category: string;
  pricing_type: string;
  url: string;
  image_url?: string;
  gradient?: string; // Optional: kept for backward compatibility if needed
  is_featured?: boolean;
  average_rating?: number;
  reviews_count?: number;
  features?: string[];
  screenshots?: string[];
  video_url?: string;
  faqs?: { question: string; answer: string }[];
  alternatives?: string[];
  // TAAFT-Style Fields
  tasks?: string[]; // Array of tasks/use-cases (e.g. 'writing', 'summarizing')
  arabic_score?: number; // 0-10 scale for Arabic support quality
  release_date?: string; // ISO date string for recency calculations
  clicks_count?: number; // Popularity tracking
  trending_score?: number; // Calculated score from DB function
}

export const categories: Category[] = ['الكل', 'نصوص', 'صور', 'فيديو', 'برمجة', 'إنتاجية', 'دراسة وطلاب', 'صوت'];

export const tools: Tool[] = [
  // --- Core Tools (Updated) ---
  {
    id: '1',
    title: 'ChatGPT',
    description: 'أنجز مهام الكتابة، الترجمة، والبحث عن المعلومة فوراً مع مساعدك الذكي.',
    category: 'نصوص',
    pricing_type: 'مجاني',
    url: 'https://chat.openai.com',
    image_url: '',
    average_rating: 4.9,
    reviews_count: 5000,
    is_featured: true,
    video_url: 'https://www.youtube.com/embed/outcGtbnMuQ',
    faqs: [
      { question: 'هل ChatGPT مجاني؟', answer: 'نعم، يوجد إصدار مجاني يعتمد على GPT-3.5 و GPT-4o mini، بالإضافة لإصدار Plus المدفوع.' },
      { question: 'هل يدعم اللغة العربية؟', answer: 'نعم، يدعم ChatGPT اللغة العربية بشكل ممتاز في الكتابة والفهم.' }
    ],
    alternatives: ['102', '109'], // Claude & Qwen
  },
  {
    id: '2',
    title: 'Midjourney',
    description: 'حول كلماتك إلى صور فنية مبهرة بتفاصيل دقيقة وإبداع لا حدود له.',
    category: 'صور',
    pricing_type: 'مدفوع',
    url: 'https://midjourney.com',
    image_url: '',
    average_rating: 4.8,
    reviews_count: 3200,
  },
  {
    id: '5',
    title: 'GitHub Copilot',
    description: 'سرّع عملية البرمجة واكتشف الأخطاء مبكراً مع اقتراحات الكود الذكية.',
    category: 'برمجة',
    pricing_type: 'مدفوع',
    url: 'https://github.com/features/copilot',
    image_url: '',
    average_rating: 4.7,
    reviews_count: 1500,
  },

  // --- New Generation Tools (2025/2026) ---

  // Coding
  {
    id: '108',
    title: 'Cursor',
    description: 'محرر أكواد ثوري مبني للذكاء الاصطناعي. اكتب الكود، صحح الأخطاء، وابنِ مشاريع كاملة عبر الدردشة.',
    category: 'برمجة',
    pricing_type: 'مجاني',
    url: 'https://cursor.sh',
    image_url: '',
    is_featured: true,
    average_rating: 5.0,
    reviews_count: 850,
    features: ['شات ذكي مدمج في المحرر', 'تصحيح تلقائي للأخطاء', 'دعم إضافة مستودعات كاملة'],
  },
  {
    id: '109',
    title: 'Qwen 2.5',
    description: 'نموذج لغوي قوي من Alibaba يتفوق في مهام البرمجة والرياضيات المعقدة.',
    category: 'برمجة',
    pricing_type: 'مجاني',
    url: 'https://qwenlm.github.io',
    image_url: '',
    average_rating: 4.6,
    reviews_count: 120,
  },

  // Video & Design
  {
    id: '105',
    title: 'Google Veo',
    description: 'مولد فيديو سينمائي من Google DeepMind بدقة 1080p وفهم عميق لفيزياء الحركة.',
    category: 'فيديو',
    pricing_type: 'مدفوع',
    url: 'https://deepmind.google/technologies/veo',
    image_url: '',
    is_featured: true,
    average_rating: 4.9,
    reviews_count: 50,
  },
  {
    id: '106',
    title: 'Ideogram',
    description: 'توليد صور مع نصوص دقيقة ومقروءة بداخلها، مثالي لتصميم الشعارات والبوسترات.',
    category: 'صور',
    pricing_type: 'مجاني',
    url: 'https://ideogram.ai',
    image_url: '',
    average_rating: 4.7,
    reviews_count: 400,
  },

  // Productivity & Agents
  {
    id: '101',
    title: 'Zapier Agents',
    description: 'أنشئ وكلاء ذكاء اصطناعي يعملون 24/7 لتنفيذ مهام معقدة عبر 6000+ تطبيق.',
    category: 'إنتاجية',
    pricing_type: 'مدفوع',
    url: 'https://zapier.com/agents',
    image_url: '',
    is_featured: true,
    average_rating: 4.8,
    reviews_count: 210,
  },
  {
    id: '102',
    title: 'Claude 3.5 Artifacts',
    description: 'ليس مجرد شات! أنشئ واجهات تفاعلية، مستندات، ورسومات بيانية مباشرة في المحادثة.',
    category: 'نصوص',
    pricing_type: 'مجاني',
    url: 'https://claude.ai',
    image_url: '',
    average_rating: 4.9,
    reviews_count: 1200,
  },
  {
    id: '103',
    title: 'Perplexity',
    description: 'محرك إجابات فوري يغنيك عن البحث التقليدي، مع مصادر دقيقة وحديثة.',
    category: 'إنتاجية',
    pricing_type: 'مجاني',
    url: 'https://www.perplexity.ai',
    image_url: '',
    average_rating: 4.8,
    reviews_count: 900,
  },
  {
    id: '107',
    title: 'Hume AI',
    description: 'الذكاء العاطفي للصوت. واجهة صوتية تتفاعل مع نبرة صوتك ومشاعرك.',
    category: 'صوت',
    pricing_type: 'تجربة مجانية',
    url: 'https://hume.ai',
    image_url: '',
    average_rating: 4.5,
    reviews_count: 60,
  },
];
