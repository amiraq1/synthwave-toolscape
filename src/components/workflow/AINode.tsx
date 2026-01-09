import { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Button } from '@/components/ui/button';
import { Loader2, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AINode = ({ data }: any) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const runNode = async () => {
        setLoading(true);
        try {
            // 1. نرسل طلب للوكيل الذكي الذي بنيناه سابقاً
            const { data: response, error } = await supabase.functions.invoke('chat-agent', {
                body: { query: `قم بتنفيذ هذه المهمة باختصار: ${data.label}` } // نرسل اسم العقدة كمهمة
            });

            if (error) throw error;

            setResult(response.reply);
            toast.success("تم تنفيذ العقدة بنجاح! ✅");
        } catch (err) {
            toast.error("فشل التنفيذ");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#1e1e2e] border border-white/10 rounded-xl w-[300px] shadow-xl overflow-hidden font-cairo" dir="rtl">
            {/* الرأس */}
            <div className="bg-gradient-to-r from-neon-purple to-blue-600 p-3 flex justify-between items-center">
                <span className="font-bold text-white text-sm flex items-center gap-2">
                    🤖 معالج الذكاء الاصطناعي
                </span>
                <Handle type="target" position={Position.Top} className="w-3 h-3 bg-white border-2 border-neon-purple" />
            </div>

            {/* المحتوى */}
            <div className="p-4 space-y-3">
                <div className="text-gray-300 text-sm font-medium leading-relaxed">{data.label}</div>

                {/* النتيجة (تظهر بعد التشغيل) */}
                {result && (
                    <div className="bg-black/30 p-2 rounded text-xs text-green-300 max-h-[120px] overflow-y-auto border border-green-500/20 custom-scrollbar">
                        {result}
                    </div>
                )}

                <Button
                    size="sm"
                    className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/5 transition-all"
                    onClick={runNode}
                    disabled={loading}
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Play className="w-4 h-4 fill-current ml-2" />}
                    {loading ? "جاري المعالجة..." : "تشغيل هذه الخطوة"}
                </Button>
            </div>

            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-white border-2 border-neon-purple" />
        </div>
    );
};

export default AINode;
