/**
 * 🤖 AgentNode - عقدة الوكيل المتخصص
 * تستخدم Agent Brain مع اختيار الوكيل المناسب
 */

import { useState, memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Button } from '@/components/ui/button';
import { Loader2, Play, ChevronDown, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// أنواع الوكلاء المتاحة
const AGENTS = [
    { slug: 'general', name: 'المساعد العام', emoji: '🤖', color: 'from-purple-500 to-blue-500' },
    { slug: 'coder', name: 'خبير الكود', emoji: '💻', color: 'from-green-500 to-emerald-500' },
    { slug: 'designer', name: 'مستشار التصميم', emoji: '🎨', color: 'from-pink-500 to-rose-500' },
    { slug: 'writer', name: 'كاتب المحتوى', emoji: '✍️', color: 'from-yellow-500 to-orange-500' },
    { slug: 'video', name: 'خبير الفيديو', emoji: '🎬', color: 'from-cyan-500 to-blue-500' },
];

interface AgentNodeData {
    label: string;
    agentSlug?: string;
    prompt?: string;
    result?: string;
    onDataChange?: (data: Partial<AgentNodeData>) => void;
}

const AgentNode = memo(({ data, id }: NodeProps<AgentNodeData>) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(data.result || null);
    const [selectedAgent, setSelectedAgent] = useState(data.agentSlug || 'general');
    const [prompt, setPrompt] = useState(data.prompt || '');
    const [showAgentMenu, setShowAgentMenu] = useState(false);

    const currentAgent = AGENTS.find(a => a.slug === selectedAgent) || AGENTS[0];

    const runNode = async () => {
        if (!prompt.trim()) {
            toast.error("الرجاء كتابة المطلوب من الوكيل");
            return;
        }

        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                toast.error("يجب تسجيل الدخول");
                return;
            }

            const { data: response, error } = await supabase.functions.invoke('chat', {
                body: {
                    query: prompt
                },
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                }
            });

            if (error) throw error;

            const reply = response.reply || response.answer || 'تم المعالجة';
            setResult(reply);

            // تحديث البيانات للتدفق
            if (data.onDataChange) {
                data.onDataChange({ result: reply });
            }

            toast.success("تم تنفيذ العقدة بنجاح! ✅");
        } catch (err) {
            toast.error("فشل التنفيذ");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#1e1e2e] border border-white/10 rounded-xl w-[320px] shadow-xl overflow-hidden font-cairo" dir="rtl">
            {/* الرأس مع اختيار الوكيل */}
            <div className={cn("bg-gradient-to-r p-3", currentAgent.color)}>
                <div className="flex justify-between items-center">
                    <div className="relative">
                        <button
                            onClick={() => setShowAgentMenu(!showAgentMenu)}
                            className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full hover:bg-black/30 transition"
                        >
                            <span className="text-lg">{currentAgent.emoji}</span>
                            <span className="text-white text-sm font-bold">{currentAgent.name}</span>
                            <ChevronDown className={cn("w-3 h-3 text-white transition-transform", showAgentMenu && "rotate-180")} />
                        </button>

                        {/* قائمة الوكلاء */}
                        {showAgentMenu && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-[#1e1e2e] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                                {AGENTS.map(agent => (
                                    <button
                                        key={agent.slug}
                                        onClick={() => {
                                            setSelectedAgent(agent.slug);
                                            setShowAgentMenu(false);
                                        }}
                                        className={cn(
                                            "w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition",
                                            selectedAgent === agent.slug && "bg-white/10"
                                        )}
                                    >
                                        <span>{agent.emoji}</span>
                                        <span className="text-sm text-white">{agent.name}</span>
                                        {selectedAgent === agent.slug && <Check className="w-3 h-3 text-green-400 mr-auto" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <Handle type="target" position={Position.Top} className="w-3 h-3 bg-white border-2 border-white/50" />
                </div>
            </div>

            {/* المحتوى */}
            <div className="p-4 space-y-3">
                {/* حقل الإدخال */}
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="اكتب المطلوب من الوكيل..."
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-white placeholder:text-gray-500 resize-none h-20 focus:outline-none focus:ring-1 focus:ring-neon-purple"
                />

                {/* النتيجة */}
                {result && (
                    <div className="bg-black/30 p-2 rounded-lg text-xs text-green-300 max-h-[100px] overflow-y-auto border border-green-500/20 custom-scrollbar">
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
                    {loading ? "جاري المعالجة..." : "تشغيل"}
                </Button>
            </div>

            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-white border-2 border-white/50" />
        </div>
    );
});

AgentNode.displayName = 'AgentNode';

export default AgentNode;
