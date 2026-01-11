import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { MessageSquare, Mail, FileText, Database, Zap, MoreHorizontal } from "lucide-react";

// خريطة للأيقونات بناءً على نوع العقدة أو التسمية
const iconMap: Record<string, any> = {
    'input': Mail,
    'output': Database,
    'default': MessageSquare,
    'ai': FileText, // يمكننا إضافة المزيد
};

const CustomNode = ({ data, type, selected }: NodeProps) => {
    // تحديد الأيقونة المناسبة
    const Icon = iconMap[type] || Zap;

    // تحديد الألوان بناءً على النوع
    const getColors = () => {
        switch (type) {
            case 'input': return { border: 'border-neon-purple', icon: 'text-neon-purple', bg: 'bg-neon-purple/10' };
            case 'output': return { border: 'border-orange-500', icon: 'text-orange-500', bg: 'bg-orange-500/10' };
            case 'default': default: return { border: 'border-blue-500', icon: 'text-blue-500', bg: 'bg-blue-500/10' };
        }
    };

    const colors = getColors();

    return (
        <div className={`
      relative min-w-[200px] rounded-xl border bg-[#1a1a2e] shadow-xl transition-all duration-300
      ${selected ? 'ring-2 ring-neon-purple border-transparent' : 'border-white/10'}
    `}>
            {/* Header */}
            <div className={`flex items-center gap-3 p-3 border-b border-white/5 ${colors.bg} rounded-t-xl`}>
                <div className={`p-1.5 rounded-lg bg-[#0f0f1a] ${colors.border} border`}>
                    <Icon className={`w-4 h-4 ${colors.icon}`} />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-200">{data.label}</h3>
                    <p className="text-[10px] text-gray-400 capitalize">{type === 'input' ? 'Trigger' : type === 'output' ? 'Action' : 'Agent'}</p>
                </div>
                <button className="text-gray-500 hover:text-white">
                    <MoreHorizontal className="w-4 h-4" />
                </button>
            </div>

            {/* Body */}
            <div className="p-3">
                <p className="text-xs text-gray-500">
                    {data.description || "لم يتم التكوين بعد..."}
                </p>
            </div>

            {/* Handles (نقاط التوصيل) */}
            {type !== 'input' && (
                <Handle
                    type="target"
                    position={Position.Top}
                    className="!w-3 !h-3 !bg-[#1a1a2e] !border-2 !border-white/50 hover:!border-neon-purple hover:!bg-neon-purple transition-colors"
                />
            )}

            {type !== 'output' && (
                <Handle
                    type="source"
                    position={Position.Bottom}
                    className="!w-3 !h-3 !bg-[#1a1a2e] !border-2 !border-white/50 hover:!border-neon-purple hover:!bg-neon-purple transition-colors"
                />
            )}
        </div>
    );
};

export default memo(CustomNode);
