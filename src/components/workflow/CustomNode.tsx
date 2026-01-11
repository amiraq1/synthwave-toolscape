import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Bot, Mail, Database, Play, Loader2, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const CustomNode = ({ data, selected }: NodeProps) => {
    // تحديد الأيقونة واللون بناءً على نوع العقدة (محفوظ في data.type أو slug)
    const isAgent = data.slug && data.slug !== 'trigger' && data.slug !== 'action';
    const isTrigger = data.slug === 'trigger' || data.label.includes('إيميل');

    let headerColor = "bg-gray-700";
    let Icon = Database;

    if (isAgent) {
        headerColor = "bg-gradient-to-r from-neon-purple to-violet-600";
        Icon = Bot;
    } else if (isTrigger) {
        headerColor = "bg-gradient-to-r from-blue-500 to-cyan-500";
        Icon = Mail;
    }

    return (
        <div className={`
      relative min-w-[250px] rounded-xl bg-[#1a1a2e] border-2 transition-all duration-300 shadow-xl overflow-hidden
      ${selected ? 'border-neon-purple shadow-[0_0_20px_rgba(124,58,237,0.4)]' : 'border-white/10 hover:border-white/30'}
    `}>

            {/* 1. نقاط التوصيل (Handles) */}
            {/* نقطة الدخول (يسار) - لا تظهر للمحفزات */}
            {!isTrigger && (
                <Handle
                    type="target"
                    position={Position.Left}
                    className="w-3 h-3 !bg-white border-2 border-[#1a1a2e]"
                />
            )}

            {/* نقطة الخروج (يمين) */}
            <Handle
                type="source"
                position={Position.Right}
                className="w-3 h-3 !bg-neon-purple border-2 border-[#1a1a2e]"
            />

            {/* 2. رأس البطاقة */}
            <div className={`${headerColor} p-3 flex items-center justify-between text-white`}>
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Icon className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold opacity-90 uppercase tracking-wider">
                            {isAgent ? 'AI Agent' : isTrigger ? 'Trigger' : 'Action'}
                        </h3>
                        <p className="text-sm font-bold leading-none">{data.label}</p>
                    </div>
                </div>
                <MoreHorizontal className="w-4 h-4 opacity-50 cursor-pointer hover:opacity-100" />
            </div>

            {/* 3. جسم البطاقة */}
            <div className="p-4 bg-[#0f0f1a]/50">
                <div className="flex justify-between items-center">
                    {/* حالة التشغيل (تظهر فقط إذا كان يعمل) */}
                    {data.status === 'running' ? (
                        <div className="flex items-center gap-2 text-xs text-yellow-400">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>جاري المعالجة...</span>
                        </div>
                    ) : data.status === 'completed' ? (
                        <div className="flex items-center gap-2 text-xs text-green-400">
                            <div className="w-2 h-2 rounded-full bg-green-400" />
                            <span>مكتمل</span>
                        </div>
                    ) : (
                        <div className="text-xs text-gray-500">جاهز للعمل</div>
                    )}

                    {/* زر تشغيل مصغر للتجربة */}
                    {isAgent && (
                        <button className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                            <Play className="w-3 h-3 fill-current" />
                        </button>
                    )}
                </div>

                {/* عرض آخر نتيجة (Output Preview) */}
                {data.output && (
                    <div className="mt-3 p-2 bg-black/40 rounded border border-white/5 text-[10px] text-gray-300 font-mono truncate">
                        {data.output}
                    </div>
                )}
            </div>

            {/* تأثير التوهج الخلفي */}
            {selected && <div className="absolute inset-0 bg-neon-purple/5 pointer-events-none" />}
        </div>
    );
};

export default memo(CustomNode);
