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
import { Play, Save, Database, X } from "lucide-react";
import { Helmet } from "react-helmet-async";
import Sidebar from "@/components/workflow/Sidebar";
import CustomNode from "@/components/workflow/CustomNode";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import NodeConfigDialog from "@/components/workflow/NodeConfigDialog";
import { Node } from "reactflow";

// تعريف أنواع العقد المخصصة
const nodeTypes = {
    custom: CustomNode, // نستخدم نوع واحد موحد لكل العقد الآن
    // يمكننا الاحتفاظ بالأنواع القديمة للتوافق إذا لزم الأمر، لكننا سنعتمد على 'custom'
};

// مكون داخلي للتعامل مع الـ ReactFlow Hook
const FlowArea = () => {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [editingNode, setEditingNode] = useState<Node | null>(null);
    const [logs, setLogs] = useState<string[]>([]); // سجلات التنفيذ

    const addLog = (message: string) => {
        setLogs(prev => [...prev, `> ${new Date().toLocaleTimeString().split(' ')[0]} ${message}`]);
    };

    const handleSave = () => {
        const workflowOpt = { nodes, edges };
        console.log("Saving:", workflowOpt);
        // هنا يمكن ربط Supabase لحفظ البيانات في جدول workflows
        toast.success("تم حفظ مخطط سير العمل (محلياً حالياً)");
    };

    const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
        setEditingNode(node);
    }, []);

    const onNodeUpdate = useCallback((nodeId: string, newData: any) => {
        setNodes((nds) => nds.map((node) => {
            if (node.id === nodeId) {
                return { ...node, data: { ...newData } };
            }
            return node;
        }));
        setEditingNode(null); // إغلاق اللوحة
        toast.success("تم تحديث إعدادات العقدة");
    }, [setNodes, setEditingNode]);

    // إعدادات الخطوط لتكون واضحة وسميكة
    const defaultEdgeOptions = {
        animated: true,
        type: 'smoothstep',
        style: {
            stroke: '#7c3aed',
            strokeWidth: 3,
            filter: 'drop-shadow(0 0 3px #7c3aed)',
        },
        markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#7c3aed',
        },
    };

    const onConnect = useCallback(
        (params: Edge | Connection) => setEdges((eds) => addEdge({
            ...params,
            ...defaultEdgeOptions
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
                type: 'custom', // 👈 توحيد النوع لاستخدام مكوننا المخصص
                position,
                data: {
                    label: label,
                    description: 'اسحب لتوصيل العقدة بغيرها',
                    slug: slug || null,
                    status: 'idle' // الحالة الافتراضية
                },
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
        setLogs([]); // تصفية السجلات القديمة
        addLog("🚀 تهيئة بيئة التشغيل...");
        toast.info("جاري بدء تشغيل السلسلة...");

        try {
            // محاكاة بيانات الإيميل الوارد
            let context: any = {
                subject: "استفسار بخصوص الطلب #992",
                from: "client@example.com",
                body: "مرحباً، لم يصلني الطلب حتى الآن. متى موعد التسليم المتوقع؟"
            };
            // أ) البحث عن عقدة البداية (Trigger)
            let currentData = "أريد كود React لعمل زر يتحول للون الأحمر عند الضغط عليه";
            addLog("📦 تحميل سياق التنفيذ (Context)...");

            let currentOutput = "";

            // ب) ترتيب العقد بناءً على الروابط (Edges)
            const sortedNodes = [];
            addLog("🔄 تحليل مسار سير العمل (Path Analysis)...");
            // نبحث عن عقدة البداية (trigger) أو أول عقدة input
            let currentNode = nodes.find(n => n.data.slug === 'trigger' || n.type === 'input');

            // إذا لم نجد trigger صريح، نأخذ أول عقدة ليس لها مدخلات (source فقط)
            if (!currentNode) {
                const targetHandleIds = new Set(edges.map(e => e.target));
                currentNode = nodes.find(n => !targetHandleIds.has(n.id));
            }

            while (currentNode) {
                sortedNodes.push(currentNode);
                const edge = edges.find(e => e.source === currentNode?.id);
                if (!edge) break;
                currentNode = nodes.find(n => n.id === edge.target);
            }

            if (sortedNodes.length === 0) {
                toast.warning("لم يتم العثور على مسار متصل.");
                setIsRunning(false);
                return;
            }

            for (const node of sortedNodes) {
                // تحديث حالة العقدة لـ running
                setNodes(nds => nds.map(n => n.id === node.id ? { ...n, selected: true, data: { ...n.data, status: 'running' } } : { ...n, selected: false }));
                await new Promise(r => setTimeout(r, 800)); // محاكاة وقت المعالجة وتأثير بصري

                // 1. إذا كان وكيل (Agent)
                if (node.data.slug && node.data.slug !== 'trigger' && node.data.slug !== 'action' && node.type !== 'output') {

                    addLog(`🤖 تشغيل الوكيل: ${node.data.label}`);

                    // استبدال المتغيرات في الـ Prompt
                    let prompt = node.data.customPrompt || "";
                    if (prompt) {
                        addLog(`📝 معالجة القوالب والمتغيرات للنص...`);
                        prompt = prompt.replace("{{body}}", context.body || "")
                            .replace("{{subject}}", context.subject || "")
                            .replace("{{from}}", context.from || "");
                    }

                    // إذا لم يكتب المستخدم برومبت، نستخدم ال output السابق أو body
                    const queryToSend = prompt || context.agent_output || context.body;

                    toast.loading(`الوكيل "${node.data.label}" يعالج الطلب...`);
                    addLog(`📡 الاتصال بخادم Gemini AI...`);

                    const { data, error } = await supabase.functions.invoke('chat-agent', {
                        body: { query: queryToSend, agentSlug: node.data.slug }
                    });

                    if (error) {
                        addLog(`❌ خطأ في الاتصال: ${error.message}`);
                        const errorMessage = await error.context?.json().then((e: any) => e.error).catch(() => error.message);
                        throw new Error(errorMessage || "فشل الاتصال بالوكيل");
                    }

                    currentOutput = data.reply;
                    addLog(`✅ تم استلام الرد من الوكيل.`);

                    // تحديث سياق النتائج والـ output للعرض في البطاقة
                    context = { ...context, agent_output: currentOutput };

                    // تحديث العقدة بالنتيجة (للعرض)
                    setNodes(nds => nds.map(n => n.id === node.id ? { ...n, data: { ...n.data, output: currentOutput } } : n));
                    toast.dismiss();
                    toast.success(`الوكيل ${node.data.label} أكمل المهمة`);
                }

                // 2. إذا كان إجراء (Send Email / Action) أو Output node
                else if (node.data.slug === 'action' || node.type === 'output') {
                    addLog(`⚡ تنفيذ الإجراء: ${node.data.label}`);
                    const to = node.data.to ? node.data.to.replace("{{from}}", context.from) : context.from;
                    const body = node.data.body ? node.data.body.replace("{{agent_output}}", context.agent_output) : currentOutput;

                    // محاكاة الإرسال
                    addLog(`📧 إرسال بريد إلكتروني إلى: ${to}`);
                    toast.success(`تم تنفيذ الإجراء: إرسال إلى ${to}`);
                    alert(`📧 محاكاة إرسال إيميل:\n\nإلى: ${to}\nالمحتوى:\n${body}`);
                }

                // 3. المحفز (Trigger)
                else if (node.data.slug === 'trigger' || node.type === 'input') {
                    addLog(`🔔 استلام حدث خارجي (Triggered)`);
                    toast.success("تم استلام محفز جديد: إيميل وارد");
                }

                // تحديث حالة العقدة لـ completed
                setNodes(nds => nds.map(n => n.id === node.id ? { ...n, data: { ...n.data, status: 'completed' } } : n));
            }

        } catch (error: any) {
            console.error(error);
            toast.error(`حدث خطأ: ${error.message}`);
        } finally {
            setIsRunning(false);
            // إبقاء الحالة completed ظاهرة للمستخدم ولا نعيد تعيينها فوراً
            setNodes(nds => nds.map(n => ({ ...n, selected: false })));
        }
    };

    return (
        <div className="flex-1 flex h-full">
            {/* القائمة الجانبية */}
            <Sidebar />

            {/* 👇 نافذة الإعدادات (Modal Dialog) */}
            <NodeConfigDialog
                node={editingNode}
                isOpen={!!editingNode}
                onClose={() => setEditingNode(null)}
                onSave={onNodeUpdate}
            />

            {/* مساحة العمل */}
            <div className="flex-1 flex flex-col h-full relative" ref={reactFlowWrapper}>

                {/* شريط التحكم */}
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <Button
                        variant="secondary"
                        onClick={handleSave}
                        className="bg-[#1a1a2e]/80 backdrop-blur border border-white/10 text-white hover:bg-white/10"
                    >
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
                    defaultEdgeOptions={defaultEdgeOptions} // 👈 تم إضافة الخيارات الافتراضية
                    onInit={setReactFlowInstance}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onNodeDoubleClick={onNodeDoubleClick} // 👈 تفعيل النقر المزدوج
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

                {/* سجل التحليل الذكي (UltraThink Terminal) */}
                {logs.length > 0 && (
                    <div className="absolute bottom-6 left-6 right-6 h-48 bg-black/90 border border-white/10 rounded-xl overflow-hidden font-mono text-sm shadow-2xl animate-in slide-in-from-bottom-10 backdrop-blur-md z-20">
                        <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center justify-between">
                            <span className="text-neon-purple font-bold flex items-center gap-2">
                                <Database className="w-4 h-4" /> سجل العمليات (Live Logs)
                            </span>
                            <button onClick={() => setLogs([])} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="p-4 h-full overflow-y-auto space-y-1 pb-10">
                            {logs.map((log, i) => (
                                <div key={i} className="text-gray-300 border-l-2 border-white/10 pl-2 animate-in fade-in slide-in-from-left-2">
                                    {log}
                                </div>
                            ))}
                            {isRunning && (
                                <div className="text-neon-purple animate-pulse">_</div>
                            )}
                        </div>
                    </div>
                )}
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
