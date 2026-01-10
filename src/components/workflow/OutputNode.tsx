/**
 * 📤 OutputNode - عقدة الإخراج
 * تعرض النتيجة النهائية من سير العمل
 */

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FileOutput, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

interface OutputNodeData {
    label: string;
    result?: string;
}

const OutputNode = memo(({ data }: NodeProps<OutputNodeData>) => {
    const [copied, setCopied] = useState(false);

    const copyResult = () => {
        if (data.result) {
            navigator.clipboard.writeText(data.result);
            setCopied(true);
            toast.success("تم النسخ!");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="bg-[#1e1e2e] border border-white/10 rounded-xl w-[280px] shadow-xl overflow-hidden font-cairo" dir="rtl">
            {/* الرأس */}
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-3 flex justify-between items-center">
                <span className="font-bold text-white text-sm flex items-center gap-2">
                    <FileOutput className="w-4 h-4" />
                    الإخراج النهائي
                </span>
                <Handle type="target" position={Position.Top} className="w-3 h-3 bg-white border-2 border-emerald-300" />
            </div>

            {/* المحتوى */}
            <div className="p-4 space-y-3">
                <p className="text-gray-400 text-xs">{data.label}</p>

                {data.result ? (
                    <>
                        <div className="bg-black/30 p-3 rounded-lg text-sm text-white max-h-[150px] overflow-y-auto border border-emerald-500/20 custom-scrollbar">
                            {data.result}
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            className="w-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                            onClick={copyResult}
                        >
                            {copied ? <Check className="w-4 h-4 ml-2" /> : <Copy className="w-4 h-4 ml-2" />}
                            {copied ? "تم النسخ!" : "نسخ النتيجة"}
                        </Button>
                    </>
                ) : (
                    <div className="bg-black/20 p-4 rounded-lg text-center">
                        <p className="text-gray-500 text-sm">في انتظار الإخراج...</p>
                        <p className="text-gray-600 text-xs mt-1">شغّل سير العمل لرؤية النتيجة</p>
                    </div>
                )}
            </div>
        </div>
    );
});

OutputNode.displayName = 'OutputNode';

export default OutputNode;
