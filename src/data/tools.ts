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
    description: 'مساعد ذكي للمحادثات والكتابة والإجابة على الأسئلة بشكل احترافي.',
    category: 'نصوص',
    price: 'مجاني',
    icon: '🤖',
    url: 'https://chat.openai.com',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    id: '2',
    name: 'Midjourney',
    description: 'أداة رائدة لإنشاء صور فنية مذهلة باستخدام الذكاء الاصطناعي.',
    category: 'صور',
    price: 'مدفوع',
    icon: '🎨',
    url: 'https://midjourney.com',
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    id: '3',
    name: 'Jasper',
    description: 'منصة متكاملة لكتابة المحتوى التسويقي والإبداعي بسرعة فائقة.',
    category: 'نصوص',
    price: 'مدفوع',
    icon: '✍️',
    url: 'https://jasper.ai',
    gradient: 'from-orange-500 to-red-600',
  },
  {
    id: '4',
    name: 'RunwayML',
    description: 'أداة متقدمة لتحرير وإنشاء الفيديوهات باستخدام الذكاء الاصطناعي.',
    category: 'فيديو',
    price: 'مدفوع',
    icon: '🎬',
    url: 'https://runwayml.com',
    gradient: 'from-blue-500 to-cyan-600',
  },
  {
    id: '5',
    name: 'GitHub Copilot',
    description: 'مساعد برمجي ذكي يكتب الكود معك ويقترح حلولاً برمجية فورية.',
    category: 'برمجة',
    price: 'مدفوع',
    icon: '💻',
    url: 'https://github.com/features/copilot',
    gradient: 'from-gray-600 to-gray-800',
  },
  {
    id: '6',
    name: 'Notion AI',
    description: 'مساعد ذكي متكامل مع Notion لتنظيم المهام وكتابة المحتوى.',
    category: 'إنتاجية',
    price: 'مدفوع',
    icon: '📝',
    url: 'https://notion.so',
    gradient: 'from-amber-500 to-yellow-600',
  },
];
