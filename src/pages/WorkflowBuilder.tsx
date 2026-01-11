import { useCallback, useState, useRef } from 'react';
import ReactFlow, {
    addEdge,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    Connection,
    Edge,
    MarkerType,
    ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from "@/components/ui/button";
import { Play, Save } from "lucide-react";
import { Helmet } from "react-helmet-async";
import Sidebar from "@/components/workflow/Sidebar";
import CustomNode from "@/components/workflow/CustomNode";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// تعريف أنواع العقد المخصصة
const nodeTypes = {
    input: CustomNode,
    default: CustomNode,
    output: CustomNode,
    // يمكن إضافة أنواع أخرى هنا
};

// مكون داخلي للتعامل مع الـ ReactFlow Hook
const FlowArea = () => {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
    const [isRunning, setIsRunning] = useState(false);

    const onConnect = useCallback(
        (params: Edge | Connection) => setEdges((eds) => addEdge({
            ...params,
            animated: true,
            style: { stroke: '#7c3aed', strokeWidth: 2 }, // تحسين شكل الخط
            markerEnd: { type: MarkerType.ArrowClosed, color: '#7c3aed' }
        }, eds)),
        [setEdges]
    );

    // السحر هنا: دالة الإفلات (OnDrop) 🪄
    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            const label = event.dataTransfer.getData('application/label');
            const slug = event.dataTransfer.getData('application/slug'); // استلام معرف الوكيل

            // التحقق من صحة البيانات
            if (typeof type === 'undefined' || !type) {
                return;
            }

            // حساب مكان الإسقاط بالنسبة للشاشة
            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            // إنشاء العقدة الجديدة باستخدام التصميم المخصص
            const newNode = {
                id: `${type}-${Date.now()}`, // ID فريد
                type,
                position,
                data: { label: label, description: 'اسحب لتوصيل العقدة بغيرها', slug: slug || null }, // حفظ الـ slug
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes]
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    // 2. محرك التنفيذ الحقيقي (The Execution Engine) ⚙️
    const handleRun = async () => {
        if (nodes.length === 0) {
            toast.warning("الرجاء إضافة عناصر أولاً!");
            return;
        }
        setIsRunning(true);
        toast.info("جاري بدء تشغيل السلسلة...");

        try {
            // أ) البحث عن عقدة البداية (Trigger)
            let currentData = "أريد كود React لعمل زر يتحول للون الأحمر عند الضغط عليه";

            // ب) ترتيب العقد بناءً على الروابط (Edges)
            const sortedNodes = [];
            let currentNode = nodes.find(n => n.type === 'input'); // البداية

            while (currentNode) {
                sortedNodes.push(currentNode);
                const edge = edges.find(e => e.source === currentNode?.id);
                if (!edge) break;
                currentNode = nodes.find(n => n.id === edge.target);
            }

            if (sortedNodes.length === 0) {
                toast.warning("لم يتم العثور على مسار متصل يبدأ من المحفز (Trigger).");
                setIsRunning(false);
                return;
            }

            // ج) تنفيذ الحلقة
            for (const node of sortedNodes) {
                // تمييز العقدة الحالية بصرياً
                setNodes(nds => nds.map(n => n.id === node.id ? { ...n, selected: true } : { ...n, selected: false }));

                await new Promise(r => setTimeout(r, 600)); // تأثير بصري

                if (node.type === 'input') {
                    console.log("Start Input:", currentData);
                    toast.success("تم تفعيل المحفز: إيميل جديد");
                }

                else if (node.data.slug) {
                    // 🤖 هذه عقدة وكيل ذكي! لنتصل بالسيرفر
                    toast.loading(`الوكيل "${node.data.label}" يفكر...`);

                    const { data, error } = await supabase.functions.invoke('chat', {
                        body: {
                            message: currentData, // نمرر مخرجات الخطوة السابقة كمدخلات
                            agentSlug: node.data.slug,
                            history: []
                        }
                    });

                    if (error) {
                        const errorMessage = await error.context?.json().then((e: any) => e.error).catch(() => error.message);
                        throw new Error(errorMessage || "فشل الاتصال بالوكيل");
                    }

                    currentData = data.reply || data.generatedText || JSON.stringify(data);
                    toast.dismiss();
                    toast.success(`تمت المعالجة بواسطة ${node.data.label}`);
                }

                else if (node.type === 'output') {
                    // النهاية: عرض النتيجة
                    toast.success("تم الحفظ بنجاح!");
                    alert(`🎉 النتيجة النهائية:\n\n${currentData}`);
                }
            }

        } catch (error: any) {
            console.error(error);
            toast.error(`حدث خطأ: ${error.message}`);
        } finally {
            setIsRunning(false);
            setNodes(nds => nds.map(n => ({ ...n, selected: false }))); // إزالة التحديد
        }
    };

    return (
        <div className="flex-1 flex h-full">
            {/* القائمة الجانبية */}
            <Sidebar />

            {/* مساحة العمل */}
            <div className="flex-1 flex flex-col h-full relative" ref={reactFlowWrapper}>

                {/* شريط التحكم */}
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <Button variant="secondary" className="bg-[#1a1a2e]/80 backdrop-blur border border-white/10 text-white hover:bg-white/10">
                        <Save className="w-4 h-4 ml-2" /> حفظ
                    </Button>
                    <Button
                        onClick={handleRun}
                        className="bg-neon-purple hover:bg-neon-purple/80 text-white shadow-[0_0_15px_rgba(124,58,237,0.5)]"
                        disabled={isRunning}
                    >
                        {isRunning ? "جاري المعالجة..." : <>تشغيل <Play className="w-4 h-4 mr-2 fill-current" /></>}
                    </Button>
                </div>

                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onInit={setReactFlowInstance}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    nodeTypes={nodeTypes} // تسجيل العقد المخصصة
                    fitView
                    className="bg-[#0f0f1a]"
                >
                    <Background color="#333" gap={20} size={1} />
                    <Controls className="bg-[#1a1a2e] border border-white/10 fill-white text-white" />
                    <MiniMap
                        style={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)' }}
                        nodeColor={(n) => {
                            if (n.type === 'input') return '#7c3aed';
                            if (n.type === 'output') return '#f97316';
                            return '#3b82f6';
                        }}
                    />
                </ReactFlow>
            </div>
        </div>
    );
};

// المكون الرئيسي المغلف
export default function WorkflowBuilder() {
    return (
        <div className="h-screen w-full bg-[#0f0f1a] flex flex-col pt-16 font-cairo overflow-hidden">
            <Helmet>
                <title>منشئ سير العمل | نبض AI</title>
            </Helmet>

            {/* يجب تغليف FlowArea بـ ReactFlowProvider لاستخدام useReactFlow Hook */}
            <ReactFlowProvider>
                <FlowArea />
            </ReactFlowProvider>
        </div>
    );
}
