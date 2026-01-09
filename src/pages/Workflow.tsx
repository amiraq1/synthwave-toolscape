import { useCallback, useState } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { Plus, Play, Save, Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import AINode from '@/components/workflow/AINode';
import UserInputNode from '@/components/workflow/UserInputNode';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const nodeTypes = {
    aiNode: AINode,
    userInput: UserInputNode,
};

// التوصيلات الأولية
const initialEdges = [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#7c3aed' } },
];

const Workflow = () => {
    // دالة مساعدة لتحديث قيمة النص في عقدة الإدخال
    const updateNodeValue = useCallback((nodeId: string, value: string) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === nodeId) {
                    return { ...node, data: { ...node.data, value } };
                }
                return node;
            })
        );
    }, []);

    const [nodes, setNodes, onNodesChange] = useNodesState([
        {
            id: '1',
            type: 'userInput',
            data: { value: '', onChange: (val: string) => updateNodeValue('1', val) },
            position: { x: 250, y: 50 },
        },
        {
            id: '2',
            type: 'aiNode',
            data: { label: 'انتظار المدخلات...' },
            position: { x: 250, y: 250 },
        },
    ] as any);

    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [isRunning, setIsRunning] = useState(false);

    // دالة التوصيل بين العقد
    const onConnect = useCallback(
        (params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#fff' } }, eds)),
        [setEdges],
    );

    // 🚀 المحرك الرئيسي: دالة تشغيل سير العمل
    const runWorkflow = async () => {
        setIsRunning(true);
        toast.info("جاري تشغيل سير العمل...");

        try {
            // 1. الحصول على النص من العقدة الأولى (Input Node)
            const inputNode = nodes.find(n => n.id === '1');
            const userPrompt = inputNode?.data?.value;

            if (!userPrompt) {
                toast.error("الرجاء كتابة نص في صندوق المدخلات أولاً!");
                setIsRunning(false);
                return;
            }

            // 2. تحديث العقدة الثانية لتظهر أنها "تفكر"
            setNodes((nds) => nds.map(n =>
                n.id === '2' ? { ...n, data: { ...n.data, label: `جاري معالجة: "${userPrompt.substring(0, 20)}..."` } } : n
            ));

            // 3. جلب الجلسة للمصادقة
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                toast.error("يجب تسجيل الدخول لتشغيل سير العمل");
                setIsRunning(false);
                return;
            }

            // 4. استدعاء الوكيل الذكي (Backend) مع token المصادقة
            const { data: response, error } = await supabase.functions.invoke('chat-agent', {
                body: { query: userPrompt },
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                }
            });

            if (error) throw error;

            // 4. تحديث العقدة الثانية بالنتيجة النهائية
            setNodes((nds) => nds.map(n =>
                n.id === '2' ? { ...n, data: { ...n.data, label: response.reply || response.answer || 'تم المعالجة' } } : n
            ));

            toast.success("تم اكتمال سير العمل! 🎉");

        } catch (error) {
            console.error(error);
            toast.error("حدث خطأ أثناء التشغيل");
            // إعادة تعيين العقدة الثانية
            setNodes((nds) => nds.map(n =>
                n.id === '2' ? { ...n, data: { ...n.data, label: 'حدث خطأ - حاول مرة أخرى' } } : n
            ));
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="h-[calc(100vh-64px)] w-full bg-[#0f0f1a] relative" dir="ltr">
            <Helmet>
                <title>المصنع (Beta) | نبض AI</title>
            </Helmet>

            {/* الشريط العلوي للأدوات */}
            <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10" dir="rtl">
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        🏗️ مصنع الوكلاء <span className="text-xs bg-neon-purple px-2 py-0.5 rounded-full">v4.0 Beta</span>
                    </h1>
                    <p className="text-xs text-gray-400">اربط الأدوات ببعضها لبناء سير عمل تلقائي.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 gap-2">
                        <Plus className="w-4 h-4" /> إضافة أداة
                    </Button>
                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 gap-2">
                        <Save className="w-4 h-4" /> حفظ المخطط
                    </Button>
                    <Button
                        onClick={runWorkflow}
                        disabled={isRunning}
                        className="bg-neon-purple hover:bg-neon-purple/80 gap-2"
                    >
                        {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                        {isRunning ? 'جاري التشغيل...' : 'تشغيل التجربة'}
                    </Button>
                </div>
            </div>

            {/* مساحة العمل (Canvas) */}
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                className="bg-[#0f0f1a]"
            >
                <Controls className="bg-black/50 border-white/10 fill-white text-black" />
                <MiniMap
                    nodeColor={(n) => {
                        if (n.type === 'userInput') return '#7c3aed';
                        if (n.type === 'aiNode') return '#7c3aed';
                        if (n.type === 'output') return '#10b981';
                        return '#334155';
                    }}
                    className="bg-black/50 border border-white/10 rounded-lg"
                    maskColor="rgba(0, 0, 0, 0.7)"
                />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#333" />
            </ReactFlow>
        </div>
    );
};

export default Workflow;
