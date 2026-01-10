/**
 * 🔗 ToolsPanel - لوحة الأدوات
 * لإضافة عقد جديدة إلى سير العمل
 */

import { memo } from 'react';
import { Bot, MessageSquare, FileOutput, GitBranch, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Tool {
    type: string;
    label: string;
    icon: React.ReactNode;
    color: string;
    description: string;
}

const TOOLS: Tool[] = [
    {
        type: 'userInput',
        label: 'إدخال المستخدم',
        icon: <MessageSquare className="w-5 h-5" />,
        color: 'bg-blue-500',
        description: 'نقطة بداية لإدخال النص'
    },
    {
        type: 'agentNode',
        label: 'وكيل ذكي',
        icon: <Bot className="w-5 h-5" />,
        color: 'bg-purple-500',
        description: 'معالجة بالذكاء الاصطناعي'
    },
    {
        type: 'aiNode',
        label: 'معالج AI',
        icon: <Sparkles className="w-5 h-5" />,
        color: 'bg-pink-500',
        description: 'معالجة نص بسيطة'
    },
    {
        type: 'outputNode',
        label: 'الإخراج',
        icon: <FileOutput className="w-5 h-5" />,
        color: 'bg-emerald-500',
        description: 'عرض النتيجة النهائية'
    },
];

interface ToolsPanelProps {
    onAddNode: (type: string) => void;
}

const ToolsPanel = memo(({ onAddNode }: ToolsPanelProps) => {
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div
            className="absolute right-4 top-24 w-56 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden z-10 font-cairo"
            dir="rtl"
        >
            <div className="p-3 border-b border-white/10">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-neon-purple" />
                    صندوق الأدوات
                </h3>
                <p className="text-gray-500 text-[10px] mt-1">اسحب الأداة إلى مساحة العمل</p>
            </div>.

            <div className="p-2 space-y-1">
                {TOOLS.map((tool) => (
                    <div
                        key={tool.type}
                        draggable
                        onDragStart={(e) => onDragStart(e, tool.type)}
                        onClick={() => onAddNode(tool.type)}
                        className={cn(
                            "flex items-center gap-3 p-2 rounded-lg cursor-grab active:cursor-grabbing",
                            "bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10",
                            "transition-all duration-200 group"
                        )}
                    >
                        <div className={cn("p-2 rounded-lg text-white", tool.color)}>
                            {tool.icon}
                        </div>
                        <div className="flex-1">
                            <p className="text-white text-sm font-medium">{tool.label}</p>
                            <p className="text-gray-500 text-[10px]">{tool.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-2 border-t border-white/10">
                <p className="text-gray-600 text-[9px] text-center">
                    💡 وصّل العقد ببعضها لبناء سير عمل
                </p>
            </div>
        </div>
    );
});

ToolsPanel.displayName = 'ToolsPanel';

export default ToolsPanel;
