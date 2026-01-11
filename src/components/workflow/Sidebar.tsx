import { MessageSquare, Mail, FileText, Database, Zap, Sparkles } from "lucide-react";

export default function Sidebar() {
    // دالة تُنفذ عند بدء سحب عنصر
    const onDragStart = (event: React.DragEvent, nodeType: string, label: string, agentSlug?: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.setData('application/label', label);
        if (agentSlug) {
            event.dataTransfer.setData('application/slug', agentSlug);
        }
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className="w-64 bg-[#1a1a2e] border-r border-white/10 flex flex-col h-full font-cairo">
            <div className="p-4 border-b border-white/10">
                <h2 className="font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-neon-purple" />
                    مكتبة الأدوات
                </h2>
                <p className="text-xs text-gray-500 mt-1">اسحب العناصر إلى اللوحة</p>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto flex-1">

                {/* قسم المحفزات */}
                <div>
                    <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">المحفزات (Triggers)</h3>
                    <div
                        className="bg-[#0f0f1a] p-3 rounded-lg border border-neon-purple/50 cursor-grab hover:bg-white/5 transition-colors flex items-center gap-3 mb-2"
                        onDragStart={(event) => onDragStart(event, 'input', '📧 إيميل جديد')}
                        draggable
                    >
                        <Mail className="w-4 h-4 text-neon-purple" />
                        <span className="text-sm text-gray-200">إيميل جديد</span>
                    </div>
                </div>

                {/* قسم الوكلاء */}
                <div>
                    <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">الوكلاء (AI Agents)</h3>

                    {/* وكيل المبرمج */}
                    <div
                        className="bg-[#0f0f1a] p-3 rounded-lg border border-white/10 cursor-grab hover:bg-white/5 transition-colors flex items-center gap-3 mb-2"
                        onDragStart={(event) => onDragStart(event, 'default', '💻 خبير الكود', 'coder')}
                        draggable
                    >
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-gray-200">خبير برمجة</span>
                    </div>

                    {/* وكيل المصمم */}
                    <div
                        className="bg-[#0f0f1a] p-3 rounded-lg border border-white/10 cursor-grab hover:bg-white/5 transition-colors flex items-center gap-3 mb-2"
                        onDragStart={(event) => onDragStart(event, 'default', '🎨 مستشار تصميم', 'designer')}
                        draggable
                    >
                        <Zap className="w-4 h-4 text-pink-400" />
                        <span className="text-sm text-gray-200">مستشار تصميم</span>
                    </div>

                    {/* وكيل مستشار الأدوات */}
                    <div
                        className="bg-[#0f0f1a] p-3 rounded-lg border border-neon-purple/50 cursor-grab hover:bg-white/5 transition-colors flex items-center gap-3 mb-2"
                        onDragStart={(event) => onDragStart(event, 'default', '🎯 مستشار الأدوات', 'tool-advisor')}
                        draggable
                    >
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-gray-200">مستشار الأدوات</span>
                        <span className="text-[10px] bg-neon-purple/20 text-neon-purple px-1.5 rounded border border-neon-purple/30">جديد</span>
                    </div>

                    {/* وكيل عام */}
                    <div
                        className="bg-[#0f0f1a] p-3 rounded-lg border border-white/10 cursor-grab hover:bg-white/5 transition-colors flex items-center gap-3 mb-2"
                        onDragStart={(event) => onDragStart(event, 'default', '🤖 مساعد عام', 'general')}
                        draggable
                    >
                        <MessageSquare className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-gray-200">مساعد عام</span>
                    </div>
                </div>

                {/* قسم الإجراءات */}
                <div>
                    <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">الإجراءات (Actions)</h3>
                    <div
                        className="bg-[#0f0f1a] p-3 rounded-lg border border-white/10 cursor-grab hover:bg-white/5 transition-colors flex items-center gap-3 mb-2"
                        onDragStart={(event) => onDragStart(event, 'output', '💾 حفظ في قاعدة البيانات')}
                        draggable
                    >
                        <Database className="w-4 h-4 text-orange-400" />
                        <span className="text-sm text-gray-200">حفظ البيانات</span>
                    </div>
                </div>

            </div>
        </aside>
    );
}
