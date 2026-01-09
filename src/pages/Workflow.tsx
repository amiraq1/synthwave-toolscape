import { useCallback } from 'react';
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
import { Plus, Play, Save } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import AINode from '@/components/workflow/AINode';

const nodeTypes = {
    aiNode: AINode,
};

// 1. تعريف العقد الأولية (أمثلة)
const initialNodes = [
    {
        id: '1',
        type: 'input',
        data: { label: 'مدخلات المستخدم: "أريد تصميم شعار لشركة قهوة"' },
        position: { x: 250, y: 50 },
        style: { background: '#1a1a2e', color: '#fff', border: '1px solid #7c3aed', padding: '10px', borderRadius: '8px', width: 300 }
    },
    {
        id: '2',
        type: 'aiNode',
        data: { label: 'لخص لي أهم مميزات الذكاء الاصطناعي في 3 نقاط' },
        position: { x: 250, y: 150 },
    },
    {
        id: '3',
        type: 'aiNode',
        data: { label: 'توليد 3 أفكار تسويقية مبتكرة بناءً على وصف الشعار' },
        position: { x: 250, y: 400 },
    },
];

// 2. تعريف التوصيلات الأولية
const initialEdges = [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#7c3aed' } },
    { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#7c3aed' } },
];

const Workflow = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // دالة التوصيل بين العقد
    const onConnect = useCallback(
        (params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#fff' } }, eds)),
        [setEdges],
    );

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
                    <Button className="bg-neon-purple hover:bg-neon-purple/80 gap-2">
                        <Play className="w-4 h-4 fill-current" /> تشغيل التجربة
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
                        if (n.type === 'input') return '#7c3aed';
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
