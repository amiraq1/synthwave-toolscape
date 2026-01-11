import { useCallback, useState } from 'react';
import ReactFlow, {
    addEdge,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    Connection,
    Edge,
    MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from "@/components/ui/button";
import { Play, Save, Plus } from "lucide-react";
import { Helmet } from "react-helmet-async";

// تعريف العقد الأولية (Initial Nodes)
const initialNodes = [
    {
        id: '1',
        type: 'input',
        data: { label: '📧 محفز: إيميل جديد' },
        position: { x: 250, y: 50 },
        style: { background: '#1a1a2e', color: '#fff', border: '1px solid #7c3aed', borderRadius: '10px' }
    },
    {
        id: '2',
        data: { label: '🤖 وكيل: تلخيص المحتوى' },
        position: { x: 250, y: 150 },
        style: { background: '#1a1a2e', color: '#fff', border: '1px solid #fff', borderRadius: '10px' }
    },
    {
        id: '3',
        type: 'output',
        data: { label: '💾 إجراء: حفظ في Notion' },
        position: { x: 250, y: 250 },
        style: { background: '#1a1a2e', color: '#fff', border: '1px solid #22c55e', borderRadius: '10px' }
    },
];

const initialEdges = [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#7c3aed' } },
    { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#fff' } },
];

export default function WorkflowBuilder() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [isRunning, setIsRunning] = useState(false);

    // دالة الربط بين العقد
    const onConnect = useCallback(
        (params: Edge | Connection) => setEdges((eds) => addEdge({
            ...params,
            animated: true,
            style: { stroke: '#fff' },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#fff' }
        }, eds)),
        [setEdges]
    );

    const handleRun = () => {
        setIsRunning(true);
        setTimeout(() => {
            setIsRunning(false);
            alert("تم تنفيذ سير العمل بنجاح! (محاكاة)");
        }, 2000);
    };

    return (
        <div className="h-screen w-full bg-[#0f0f1a] flex flex-col pt-16 font-cairo">
            <Helmet>
                <title>منشئ سير العمل | نبض AI</title>
            </Helmet>

            {/* شريط الأدوات العلوي */}
            <div className="h-16 border-b border-white/10 bg-[#1a1a2e]/50 backdrop-blur flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-neon-purple animate-pulse"></span>
                        تصميم سير العمل
                    </h1>
                    <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-400">Beta v0.1</span>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5">
                        <Plus className="w-4 h-4 ml-2" /> إضافة وكيل
                    </Button>
                    <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5">
                        <Save className="w-4 h-4 ml-2" /> حفظ
                    </Button>
                    <Button
                        onClick={handleRun}
                        className="bg-neon-purple hover:bg-neon-purple/80 text-white shadow-[0_0_15px_rgba(124,58,237,0.5)]"
                        disabled={isRunning}
                    >
                        {isRunning ? "جاري التنفيذ..." : <>تشغيل <Play className="w-4 h-4 mr-2 fill-current" /></>}
                    </Button>
                </div>
            </div>

            {/* مساحة العمل (Canvas) */}
            <div className="flex-1 relative">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                    className="bg-[#0f0f1a]"
                >
                    <Background color="#333" gap={20} size={1} />
                    <Controls className="bg-[#1a1a2e] border border-white/10 fill-white text-white" />
                    <MiniMap
                        style={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)' }}
                        nodeColor={(n) => {
                            if (n.type === 'input') return '#7c3aed';
                            if (n.type === 'output') return '#22c55e';
                            return '#fff';
                        }}
                    />
                </ReactFlow>

                {/* قائمة جانبية عائمة (اختياري) */}
                <div className="absolute left-4 top-4 bg-[#1a1a2e]/90 border border-white/10 p-4 rounded-xl backdrop-blur max-w-xs">
                    <h3 className="text-sm font-bold text-gray-400 mb-2">تعليمات سريعة:</h3>
                    <ul className="text-xs text-gray-500 space-y-1">
                        <li>• اسحب الدوائر لربط الوكلاء.</li>
                        <li>• استخدم زر "إضافة وكيل" للمزيد.</li>
                        <li>• اضغط Backspace لحذف أي عنصر.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
