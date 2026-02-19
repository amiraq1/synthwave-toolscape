import { MessageSquare, Mail, Database, Zap, Sparkles, Bot, Brain } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Sidebar() {
    const { i18n } = useTranslation();
    const isAr = i18n.language === "ar";

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
        <aside className="w-64 bg-[#1a1a2e] border-r border-white/10 flex flex-col h-full font-cairo overflow-y-auto" dir={isAr ? "rtl" : "ltr"}>
            {/* Header */}
            <div className="p-4 border-b border-white/10">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-neon-purple" />
                    {isAr ? "الأدوات المتاحة" : "Available Nodes"}
                </h2>
                <p className="text-xs text-gray-500 mt-1">{isAr ? "اسحب العناصر إلى لوحة العمل" : "Drag items to the canvas"}</p>
            </div>

            <div className="p-4 flex flex-col gap-6">

                {/* 1. المحفزات (Triggers) */}
                <div>
                    <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider px-1">{isAr ? "المحفزات" : "Triggers"}</h3>

                    {/* إيميل جديد */}
                    <div
                        className="group bg-[#0f0f1a] p-3 rounded-xl border border-white/10 cursor-grab hover:border-blue-500/50 hover:bg-[#1a1a2e] transition-all flex items-center gap-3 mb-2 shadow-sm hover:shadow-lg"
                        onDragStart={(event) => onDragStart(event, 'custom', isAr ? '📧 إيميل جديد' : '📧 New Email', 'trigger')}
                        draggable
                    >
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                            <Mail className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <span className="block text-sm font-bold text-gray-200 group-hover:text-white">{isAr ? "إيميل جديد" : "New Email"}</span>
                            <span className="block text-[10px] text-gray-500">{isAr ? "عند استلام رسالة" : "When a message arrives"}</span>
                        </div>
                    </div>
                </div>

                {/* 2. الوكلاء (Agents) */}
                <div>
                    <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider px-1">{isAr ? "فريقي الذكي" : "AI Team"}</h3>

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
                            <span className="block text-[10px] text-gray-500">{isAr ? "منطق واستنتاج عميق" : "Deep reasoning and inference"}</span>
                        </div>
                        <span className="mr-auto text-[9px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded border border-red-500/30">PRO</span>
                    </div>

                    {/* مستشار الأدوات (الجديد) */}
                    <div
                        className="group bg-[#0f0f1a] p-3 rounded-xl border border-neon-purple/50 cursor-grab hover:border-neon-purple hover:bg-[#1a1a2e] transition-all flex items-center gap-3 mb-2 shadow-sm hover:shadow-lg hover:shadow-neon-purple/20"
                        onDragStart={(event) => onDragStart(event, 'custom', isAr ? '🎯 مستشار الأدوات' : '🎯 Tool Advisor', 'tool-advisor')}
                        draggable
                    >
                        <div className="w-8 h-8 rounded-lg bg-neon-purple/10 flex items-center justify-center group-hover:bg-neon-purple/20 transition-colors">
                            <Bot className="w-5 h-5 text-neon-purple" />
                        </div>
                        <div>
                            <span className="block text-sm font-bold text-gray-200 group-hover:text-white">{isAr ? "مستشار الأدوات" : "Tool Advisor"}</span>
                            <span className="block text-[10px] text-gray-500">{isAr ? "تحليل وترشيح ذكي" : "Smart analysis and recommendations"}</span>
                        </div>
                        <span className="mr-auto text-[9px] bg-neon-purple/20 text-neon-purple px-1.5 py-0.5 rounded border border-neon-purple/30">{isAr ? "جديد" : "New"}</span>
                    </div>

                    {/* خبير الكود */}
                    <div
                        className="group bg-[#0f0f1a] p-3 rounded-xl border border-white/10 cursor-grab hover:border-yellow-400/50 hover:bg-[#1a1a2e] transition-all flex items-center gap-3 mb-2 shadow-sm hover:shadow-lg"
                        onDragStart={(event) => onDragStart(event, 'custom', isAr ? '💻 خبير الكود' : '💻 Code Expert', 'coder')}
                        draggable
                    >
                        <div className="w-8 h-8 rounded-lg bg-yellow-400/10 flex items-center justify-center group-hover:bg-yellow-400/20 transition-colors">
                            <Zap className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                            <span className="block text-sm font-bold text-gray-200 group-hover:text-white">{isAr ? "خبير الكود" : "Code Expert"}</span>
                            <span className="block text-[10px] text-gray-500">{isAr ? "برمجة وتطوير" : "Software engineering"}</span>
                        </div>
                    </div>

                    {/* مستشار التصميم */}
                    <div
                        className="group bg-[#0f0f1a] p-3 rounded-xl border border-white/10 cursor-grab hover:border-pink-400/50 hover:bg-[#1a1a2e] transition-all flex items-center gap-3 mb-2 shadow-sm hover:shadow-lg"
                        onDragStart={(event) => onDragStart(event, 'custom', isAr ? '🎨 مستشار التصميم' : '🎨 Design Advisor', 'designer')}
                        draggable
                    >
                        <div className="w-8 h-8 rounded-lg bg-pink-400/10 flex items-center justify-center group-hover:bg-pink-400/20 transition-colors">
                            <Sparkles className="w-5 h-5 text-pink-400" />
                        </div>
                        <div>
                            <span className="block text-sm font-bold text-gray-200 group-hover:text-white">{isAr ? "مستشار التصميم" : "Design Advisor"}</span>
                            <span className="block text-[10px] text-gray-500">{isAr ? "UI/UX وألوان" : "UI/UX and visual direction"}</span>
                        </div>
                    </div>

                    {/* مساعد عام */}
                    <div
                        className="group bg-[#0f0f1a] p-3 rounded-xl border border-white/10 cursor-grab hover:border-gray-400/50 hover:bg-[#1a1a2e] transition-all flex items-center gap-3 mb-2 shadow-sm hover:shadow-lg"
                        onDragStart={(event) => onDragStart(event, 'custom', isAr ? '🤖 مساعد عام' : '🤖 General Assistant', 'general')}
                        draggable
                    >
                        <div className="w-8 h-8 rounded-lg bg-gray-400/10 flex items-center justify-center group-hover:bg-gray-400/20 transition-colors">
                            <MessageSquare className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                            <span className="block text-sm font-bold text-gray-200 group-hover:text-white">{isAr ? "مساعد عام" : "General Assistant"}</span>
                            <span className="block text-[10px] text-gray-500">{isAr ? "مهام متنوعة" : "General-purpose tasks"}</span>
                        </div>
                    </div>
                </div>

                {/* 3. الإجراءات (Actions) - Placeholder */}
                <div>
                    <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider px-1">{isAr ? "الإجراءات" : "Actions"}</h3>
                    <div className="opacity-50 text-xs text-center p-4 border border-dashed border-white/10 rounded-xl">
                        {isAr ? "قريباً..." : "Coming soon..."}
                    </div>
                </div>

            </div>
        </aside>
    );
}
