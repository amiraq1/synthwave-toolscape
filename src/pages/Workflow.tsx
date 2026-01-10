/**
 * 🏗️ مصنع الوكلاء - Workflow Builder
 * بناء سير عمل تلقائي بربط الأدوات ببعضها
 */

import { useCallback, useState, useRef } from 'react';
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
    Node,
    ReactFlowProvider,
    ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { Play, Save, Loader2, Trash2, RotateCcw } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import AINode from '@/components/workflow/AINode';
import AgentNode from '@/components/workflow/AgentNode';
import UserInputNode from '@/components/workflow/UserInputNode';
import OutputNode from '@/components/workflow/OutputNode';
import ToolsPanel from '@/components/workflow/ToolsPanel';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// تسجيل أنواع العقد
const nodeTypes = {
    aiNode: AINode,
    agentNode: AgentNode,
    userInput: UserInputNode,
    outputNode: OutputNode,
};

// العقد الافتراضية
const getInitialNodes = (): Node[] => [
    {
        id: '1',
        type: 'userInput',
        data: { value: '', label: 'أدخل النص هنا' },
        position: { x: 100, y: 50 },
    },
    {
        id: '2',
        type: 'agentNode',
        data: {
            label: 'وكيل ذكي',
            agentSlug: 'general',
            prompt: ''
        },
        position: { x: 100, y: 250 },
    },
    {
        id: '3',
        type: 'outputNode',
        data: { label: 'النتيجة النهائية', result: '' },
        position: { x: 100, y: 500 },
    },
];

// التوصيلات الافتراضية
const getInitialEdges = (): Edge[] => [
    {
        id: 'e1-2',
        source: '1',
        target: '2',
        animated: true,
        style: { stroke: '#7c3aed', strokeWidth: 2 }
    },
    {
        id: 'e2-3',
        source: '2',
        target: '3',
        animated: true,
        style: { stroke: '#10b981', strokeWidth: 2 }
    },
];

let nodeId = 4;
const getNodeId = () => `${nodeId++}`;

const WorkflowContent = () => {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(getInitialNodes());
    const [edges, setEdges, onEdgesChange] = useEdgesState(getInitialEdges());
    const [isRunning, setIsRunning] = useState(false);

    // تحديث قيمة العقدة
    const updateNodeData = useCallback((nodeId: string, newData: any) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === nodeId) {
                    return { ...node, data: { ...node.data, ...newData } };
                }
                return node;
            })
        );
    }, [setNodes]);

    // التوصيل بين العقد
    const onConnect = useCallback(
        (params: Connection | Edge) => setEdges((eds) => addEdge({
            ...params,
            animated: true,
            style: { stroke: '#7c3aed', strokeWidth: 2 }
        }, eds)),
        [setEdges]
    );

    // إضافة عقدة جديدة
    const addNode = useCallback((type: string) => {
        const position = {
            x: Math.random() * 300 + 100,
            y: Math.random() * 200 + 100,
        };

        const newNode: Node = {
            id: getNodeId(),
            type,
            position,
            data: getNodeDefaultData(type),
        };

        setNodes((nds) => [...nds, newNode]);
        toast.success(`تمت إضافة عقدة ${getNodeLabel(type)}`);
    }, [setNodes]);

    // السحب والإفلات
    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            if (!type || !reactFlowInstance) return;

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode: Node = {
                id: getNodeId(),
                type,
                position,
                data: getNodeDefaultData(type),
            };

            setNodes((nds) => [...nds, newNode]);
        },
        [reactFlowInstance, setNodes]
    );

    // 🚀 تشغيل سير العمل
    const runWorkflow = async () => {
        setIsRunning(true);
        toast.info("🚀 جاري تشغيل سير العمل...");

        try {
            // 1. الحصول على الجلسة
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast.error("يجب تسجيل الدخول");
                setIsRunning(false);
                return;
            }

            // 2. جلب عقدة الإدخال
            const inputNode = nodes.find(n => n.type === 'userInput');
            const userInput = inputNode?.data?.value;

            if (!userInput) {
                toast.error("الرجاء كتابة نص في صندوق الإدخال");
                setIsRunning(false);
                return;
            }

            // 3. تتبع التدفق (بسيط: Input -> Agent -> Output)
            const agentNodes = nodes.filter(n => n.type === 'agentNode' || n.type === 'aiNode');
            const outputNode = nodes.find(n => n.type === 'outputNode');

            let currentResult = userInput;

            // 4. تنفيذ كل عقدة وكيل بالترتيب
            for (const agentNode of agentNodes) {
                const prompt = agentNode.data.prompt || agentNode.data.label || currentResult;
                const agentSlug = agentNode.data.agentSlug || 'general';

                // تحديث حالة العقدة
                updateNodeData(agentNode.id, { label: 'جاري المعالجة...' });

                const { data: response, error } = await supabase.functions.invoke('chat', {
                    body: {
                        query: `${prompt}\n\nالسياق: ${currentResult}`
                    },
                    headers: {
                        Authorization: `Bearer ${session.access_token}`
                    }
                });

                if (error) throw error;

                currentResult = response.reply || response.answer || 'تم المعالجة';

                // تحديث العقدة بالنتيجة
                updateNodeData(agentNode.id, {
                    result: currentResult,
                    label: agentNode.data.prompt || 'تم المعالجة ✅'
                });
            }

            // 5. تحديث عقدة الإخراج
            if (outputNode) {
                updateNodeData(outputNode.id, { result: currentResult });
            }

            toast.success("✅ تم اكتمال سير العمل!");

        } catch (error) {
            console.error(error);
            toast.error("حدث خطأ أثناء التشغيل");
        } finally {
            setIsRunning(false);
        }
    };

    // إعادة تعيين سير العمل
    const resetWorkflow = () => {
        setNodes(getInitialNodes());
        setEdges(getInitialEdges());
        nodeId = 4;
        toast.info("تم إعادة تعيين سير العمل");
    };

    // حذف جميع العقد
    const clearWorkflow = () => {
        setNodes([]);
        setEdges([]);
        toast.info("تم مسح سير العمل");
    };

    return (
        <div className="h-[calc(100vh-64px)] w-full bg-[#0f0f1a] relative" dir="ltr">
            <Helmet>
                <title>المصنع | نبض AI</title>
            </Helmet>

            {/* الشريط العلوي */}
            <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center bg-black/60 backdrop-blur-xl p-4 rounded-xl border border-white/10" dir="rtl">
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        🏗️ مصنع الوكلاء
                        <span className="text-xs bg-neon-purple px-2 py-0.5 rounded-full">v5.0</span>
                    </h1>
                    <p className="text-xs text-gray-400">اربط الأدوات ببعضها لبناء سير عمل تلقائي</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-white/10 text-white hover:bg-white/5 gap-2"
                        onClick={resetWorkflow}
                    >
                        <RotateCcw className="w-4 h-4" /> إعادة تعيين
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10 gap-2"
                        onClick={clearWorkflow}
                    >
                        <Trash2 className="w-4 h-4" /> مسح
                    </Button>
                    <Button
                        onClick={runWorkflow}
                        disabled={isRunning}
                        className="bg-neon-purple hover:bg-neon-purple/80 gap-2"
                    >
                        {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                        {isRunning ? 'جاري التشغيل...' : 'تشغيل'}
                    </Button>
                </div>
            </div>

            {/* لوحة الأدوات */}
            <ToolsPanel onAddNode={addNode} />

            {/* مساحة العمل */}
            <div ref={reactFlowWrapper} className="h-full w-full">
                <ReactFlow
                    nodes={nodes.map(node => ({
                        ...node,
                        data: {
                            ...node.data,
                            onChange: (val: string) => updateNodeData(node.id, { value: val }),
                            onDataChange: (data: any) => updateNodeData(node.id, data),
                        }
                    }))}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onInit={setReactFlowInstance}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    nodeTypes={nodeTypes}
                    fitView
                    className="bg-[#0f0f1a]"
                >
                    <Controls className="bg-black/50 border-white/10 fill-white" />
                    <MiniMap
                        nodeColor={(n) => {
                            if (n.type === 'userInput') return '#3b82f6';
                            if (n.type === 'agentNode') return '#7c3aed';
                            if (n.type === 'aiNode') return '#ec4899';
                            if (n.type === 'outputNode') return '#10b981';
                            return '#334155';
                        }}
                        className="bg-black/50 border border-white/10 rounded-lg"
                        maskColor="rgba(0, 0, 0, 0.7)"
                    />
                    <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#333" />
                </ReactFlow>
            </div>
        </div>
    );
};

// Helper functions
function getNodeDefaultData(type: string): any {
    switch (type) {
        case 'userInput':
            return { value: '', label: 'إدخال المستخدم' };
        case 'agentNode':
            return { label: 'وكيل ذكي', agentSlug: 'general', prompt: '' };
        case 'aiNode':
            return { label: 'معالج AI' };
        case 'outputNode':
            return { label: 'الإخراج', result: '' };
        default:
            return { label: 'عقدة جديدة' };
    }
}

function getNodeLabel(type: string): string {
    switch (type) {
        case 'userInput': return 'إدخال المستخدم';
        case 'agentNode': return 'وكيل ذكي';
        case 'aiNode': return 'معالج AI';
        case 'outputNode': return 'الإخراج';
        default: return 'عقدة';
    }
}

// Wrap with ReactFlowProvider
const Workflow = () => (
    <ReactFlowProvider>
        <WorkflowContent />
    </ReactFlowProvider>
);

export default Workflow;
