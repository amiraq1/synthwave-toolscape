import { useEffect, useState } from "react";
import { Node } from "reactflow";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Bot, Mail, Save } from "lucide-react";
import type { WorkflowNodeData } from "@/types";

interface NodeConfigDialogProps {
    node: Node | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (nodeId: string, newData: WorkflowNodeData) => void;
}

export default function NodeConfigDialog({ node, isOpen, onClose, onSave }: NodeConfigDialogProps) {
    const [data, setData] = useState<WorkflowNodeData>({ label: '' });
    const [activeTab, setActiveTab] = useState("general");

    // تحديث البيانات عند فتح النافذة
    useEffect(() => {
        if (node) {
            setData({ ...node.data });
            // تحديد التبويب الافتراضي حسب النوع
            if (node.data.slug && node.data.slug !== 'trigger' && node.data.slug !== 'action') {
                setActiveTab("prompt");
            } else {
                setActiveTab("general");
            }
        }
    }, [node]);

    if (!node) return null;

    const handleSave = () => {
        onSave(node.id, data);
        onClose();
    };

    const isAgent = node.type === 'custom' && node.data.slug && node.data.slug !== 'trigger' && node.data.slug !== 'action';
    const isTrigger = node.data.slug === 'trigger';
    const tabsCount = 1 + (isAgent ? 1 : 0) + (isTrigger ? 1 : 0);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px] bg-[#1a1a2e] border-white/10 text-white font-cairo" dir="rtl">

                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        {isAgent && <Bot className="w-6 h-6 text-neon-purple" />}
                        {isTrigger && <Mail className="w-6 h-6 text-blue-400" />}
                        الإعدادات: {node.data.label}
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        قم بتخصيص سلوك هذه الخطوة بدقة.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
                    <TabsList className={`grid w-full bg-black/20 ${tabsCount === 1 ? "grid-cols-1" : tabsCount === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                        <TabsTrigger value="general">⚙️ عام</TabsTrigger>
                        {isAgent && <TabsTrigger value="prompt">🧠 الذكاء (Prompt)</TabsTrigger>}
                        {isTrigger && <TabsTrigger value="config">🔌 الاتصال</TabsTrigger>}
                    </TabsList>

                    {/* تبويب: عام */}
                    <TabsContent value="general" className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>اسم العقدة (للتوضيح فقط)</Label>
                            <Input
                                value={data.label || ''}
                                onChange={e => setData({ ...data, label: e.target.value })}
                                className="bg-black/20 border-white/10"
                            />
                        </div>
                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-300">
                            ℹ️ معرف العقدة: <span className="font-mono bg-black/20 px-1 rounded">{node.id}</span>
                        </div>
                    </TabsContent>

                    {/* تبويب: الذكاء (للوكلاء) */}
                    <TabsContent value="prompt" className="space-y-4 py-4">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label>تعليمات الوكيل (System Prompt)</Label>
                                <div className="flex gap-2">
                                    <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-neon-purple cursor-pointer hover:bg-white/20" title="سيتم استبداله بمحتوى الإيميل">{"{{body}}"}</span>
                                    <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-neon-purple cursor-pointer hover:bg-white/20">{"{{subject}}"}</span>
                                </div>
                            </div>
                            <Textarea
                                value={data.customPrompt || ''}
                                onChange={e => setData({ ...data, customPrompt: e.target.value })}
                                placeholder="أنت خبير في... الرجاء الرد على: {{body}}"
                                className="bg-black/20 border-white/10 min-h-[200px] font-mono text-sm leading-relaxed"
                            />
                            <p className="text-xs text-gray-500">
                                استخدم المت المتغيرات أعلاه لدمج البيانات القادمة من الخطوات السابقة ديناميكياً.
                            </p>
                        </div>
                    </TabsContent>

                    {/* تبويب: الاتصال (للمحفزات) */}
                    <TabsContent value="config" className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>مزود الخدمة</Label>
                            <Select
                                value={data.provider || 'gmail'}
                                onValueChange={v => setData({ ...data, provider: v })}
                            >
                                <SelectTrigger className="bg-black/20 border-white/10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a2e] text-white border-white/10">
                                    <SelectItem value="gmail">جيميل (Google)</SelectItem>
                                    <SelectItem value="outlook">أوتلوك (Microsoft)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-sm text-green-400">متصل بنجاح (حساب تجريبي)</span>
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter className="mt-6 flex justify-between sm:justify-between w-full border-t border-white/10 pt-4">
                    <Button variant="ghost" onClick={onClose} className="hover:bg-red-500/10 hover:text-red-400">
                        إلغاء
                    </Button>
                    <Button onClick={handleSave} className="bg-neon-purple hover:bg-neon-purple/80 min-w-[100px]">
                        <Save className="w-4 h-4 ml-2" /> حفظ التعديلات
                    </Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    );
}
