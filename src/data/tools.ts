export type Category = 'الكل' | 'نصوص' | 'صور' | 'فيديو' | 'برمجة' | 'إنتاجية';

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: Category;
  price: 'مجاني' | 'مدفوع';
  icon: string;
  url: string;
  gradient: string;
}

export const categories: Category[] = ['الكل', 'نصوص', 'صور', 'فيديو', 'برمجة', 'إنتاجية'];

export const tools: Tool[] = [
  {
    id: '1',
    name: 'ChatGPT',
    description: 'أنجز مهام الكتابة، الترجمة، والبحث عن المعلومة فوراً مع مساعدك الذكي.',
    category: 'نصوص',
    price: 'مجاني',
    icon: '🤖',
    url: 'https://chat.openai.com',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    id: '2',
    name: 'Midjourney',
    description: 'حول كلماتك إلى صور فنية مبهرة بتفاصيل دقيقة وإبداع لا حدود له.',
    category: 'صور',
    price: 'مدفوع',
    icon: '🎨',
    url: 'https://midjourney.com',
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    id: '3',
    name: 'Jasper',
    description: 'ضاعف إنتاجك من المحتوى التسويقي المميز وحسن نتائجك في محركات البحث.',
    category: 'نصوص',
    price: 'مدفوع',
    icon: '✍️',
    url: 'https://jasper.ai',
    gradient: 'from-orange-500 to-red-600',
  },
  {
    id: '4',
    name: 'RunwayML',
    description: 'اصنع فيديوهات احترافية وعدل عليها بمؤثرات بصرية مذهلة دون عناء.',
    category: 'فيديو',
    price: 'مدفوع',
    icon: '🎬',
    url: 'https://runwayml.com',
    gradient: 'from-blue-500 to-cyan-600',
  },
  {
    id: '5',
    name: 'GitHub Copilot',
    description: 'سرّع عملية البرمجة واكتشف الأخطاء مبكراً مع اقتراحات الكود الذكية.',
    category: 'برمجة',
    price: 'مدفوع',
    icon: '💻',
    url: 'https://github.com/features/copilot',
    gradient: 'from-gray-600 to-gray-800',
  },
  {
    id: '6',
    name: 'Notion AI',
    description: 'حول ملاحظاتك إلى خطط عمل واضحة واستفد من الذكاء الاصطناعي لتنظيم حياتك.',
    category: 'إنتاجية',
    price: 'مدفوع',
    icon: '📝',
    url: 'https://notion.so',
    gradient: 'from-amber-500 to-yellow-600',
  },
];
