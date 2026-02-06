import { MessageSquare, Mail, Database, Zap, Sparkles, Bot, Brain } from "lucide-react";

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
        <aside className="w-64 bg-[#1a1a2e] border-r border-white/10 flex flex-col h-full font-cairo overflow-y-auto">
            {/* Header */}
            <div className="p-4 border-b border-white/10">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-neon-purple" />
                    الأدوات المتاحة
                </h2>
                <p className="text-xs text-gray-500 mt-1">اسحب العناصر إلى لوحة العمل</p>
            </div>

            <div className="p-4 flex flex-col gap-6">

                {/* 1. المحفزات (Triggers) */}
                <div>
                    <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider px-1">المحفزات</h3>

                    {/* إيميل جديد */}
                    <div
                        className="group bg-[#0f0f1a] p-3 rounded-xl border border-white/10 cursor-grab hover:border-blue-500/50 hover:bg-[#1a1a2e] transition-all flex items-center gap-3 mb-2 shadow-sm hover:shadow-lg"
                        onDragStart={(event) => onDragStart(event, 'custom', '📧 إيميل جديد', 'trigger')}
                        draggable
                    >
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                            <Mail className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <span className="block text-sm font-bold text-gray-200 group-hover:text-white">إيميل جديد</span>
                            <span className="block text-[10px] text-gray-500">عند استلام رسالة</span>
                        </div>
                    </div>
                </div>

                {/* 2. الوكلاء (Agents) */}
                <div>
                    <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider px-1">فريقي الذكي</h3>

                    {/* UltraThink (الجديد) */}
                    <div
                        className="group bg-[#0f0f1a] p-3 rounded-xl border border-red-500/50 cursor-grab hover:border-red-500 hover:bg-[#1a1a2e] transition-all flex items-center gap-3 mb-2 shadow-sm hover:shadow-lg hover:shadow-red-500/20"
                        onDragStart={(event) => onDragStart(event, 'custom', '🧠 UltraThink', 'ultrathink')}
                        draggable
                    >
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                            <Brain className="w-5 h-5 text-red-500 animate-pulse" />
                        </div>
                        <div>
                            <span className="block text-sm font-bold text-gray-200 group-hover:text-white">UltraThink</span>
                            <span className="block text-[10px] text-gray-500">منطق واستنتاج عميق</span>
                        </div>
                        <span className="mr-auto text-[9px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded border border-red-500/30">PRO</span>
                    </div>

                    {/* مستشار الأدوات (الجديد) */}
                    <div
                        className="group bg-[#0f0f1a] p-3 rounded-xl border border-neon-purple/50 cursor-grab hover:border-neon-purple hover:bg-[#1a1a2e] transition-all flex items-center gap-3 mb-2 shadow-sm hover:shadow-lg hover:shadow-neon-purple/20"
                        onDragStart={(event) => onDragStart(event, 'custom', '🎯 مستشار الأدوات', 'tool-advisor')}
                        draggable
                    >
                        <div className="w-8 h-8 rounded-lg bg-neon-purple/10 flex items-center justify-center group-hover:bg-neon-purple/20 transition-colors">
                            <Bot className="w-5 h-5 text-neon-purple" />
                        </div>
                        <div>
                            <span className="block text-sm font-bold text-gray-200 group-hover:text-white">مستشار الأدوات</span>
                            <span className="block text-[10px] text-gray-500">تحليل وترشيح ذكي</span>
                        </div>
                        <span className="mr-auto text-[9px] bg-neon-purple/20 text-neon-purple px-1.5 py-0.5 rounded border border-neon-purple/30">جديد</span>
                    </div>

                    {/* خبير الكود */}
                    <div
                        className="group bg-[#0f0f1a] p-3 rounded-xl border border-white/10 cursor-grab hover:border-yellow-400/50 hover:bg-[#1a1a2e] transition-all flex items-center gap-3 mb-2 shadow-sm hover:shadow-lg"
                        onDragStart={(event) => onDragStart(event, 'custom', '💻 خبير الكود', 'coder')}
                        draggable
                    >
                        <div className="w-8 h-8 rounded-lg bg-yellow-400/10 flex items-center justify-center group-hover:bg-yellow-400/20 transition-colors">
                            <Zap className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                            <span className="block text-sm font-bold text-gray-200 group-hover:text-white">خبير الكود</span>
                            <span className="block text-[10px] text-gray-500">برمجة وتطوير</span>
                        </div>
                    </div>

                    {/* مستشار التصميم */}
                    <div
                        className="group bg-[#0f0f1a] p-3 rounded-xl border border-white/10 cursor-grab hover:border-pink-400/50 hover:bg-[#1a1a2e] transition-all flex items-center gap-3 mb-2 shadow-sm hover:shadow-lg"
                        onDragStart={(event) => onDragStart(event, 'custom', '🎨 مستشار التصميم', 'designer')}
                        draggable
                    >
                        <div className="w-8 h-8 rounded-lg bg-pink-400/10 flex items-center justify-center group-hover:bg-pink-400/20 transition-colors">
                            <Sparkles className="w-5 h-5 text-pink-400" />
                        </div>
                        <div>
                            <span className="block text-sm font-bold text-gray-200 group-hover:text-white">مستشار التصميم</span>
                            <span className="block text-[10px] text-gray-500">UI/UX وألوان</span>
                        </div>
                    </div>

                    {/* مساعد عام */}
                    <div
                        className="group bg-[#0f0f1a] p-3 rounded-xl border border-white/10 cursor-grab hover:border-gray-400/50 hover:bg-[#1a1a2e] transition-all flex items-center gap-3 mb-2 shadow-sm hover:shadow-lg"
                        onDragStart={(event) => onDragStart(event, 'custom', '🤖 مساعد عام', 'general')}
                        draggable
                    >
                        <div className="w-8 h-8 rounded-lg bg-gray-400/10 flex items-center justify-center group-hover:bg-gray-400/20 transition-colors">
                            <MessageSquare className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                            <span className="block text-sm font-bold text-gray-200 group-hover:text-white">مساعد عام</span>
                            <span className="block text-[10px] text-gray-500">مهام متنوعة</span>
                        </div>
                    </div>
                </div>

                {/* 3. الإجراءات (Actions) - Placeholder */}
                <div>
                    <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider px-1">الإجراءات</h3>
                    <div className="opacity-50 text-xs text-center p-4 border border-dashed border-white/10 rounded-xl">
                        قريباً...
                    </div>
                </div>

            </div>
        </aside>
    );
}
