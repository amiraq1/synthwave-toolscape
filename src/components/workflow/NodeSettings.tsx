import { X, Save, Mail, Bot, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Node } from "reactflow";
import type { WorkflowNodeData } from "@/types";
import { useTranslation } from "react-i18next";

interface NodeSettingsProps {
    node: Node | null;
    onClose: () => void;
    onSave: (nodeId: string, newData: WorkflowNodeData) => void;
}

export default function NodeSettings({ node, onClose, onSave }: NodeSettingsProps) {
    const { i18n } = useTranslation();
    const isAr = i18n.language === "ar";
    const [data, setData] = useState<WorkflowNodeData>({ label: '' });

    // تحديث النموذج عند تغيير العقدة المحددة
    useEffect(() => {
        if (node) setData({ ...node.data });
    }, [node]);

    if (!node) return null;

    const handleSave = () => {
        onSave(node.id, data);
        onClose();
    };

    const isTrigger = node.data.slug === 'trigger' || node.type === 'input' || String(node.data.label || "").toLowerCase().includes("email") || String(node.data.label || "").includes("إيميل");
    const isAgent = node.type === 'custom' && node.data.slug && node.data.slug !== 'trigger';
    const isAction = node.type === 'output' || node.data.slug === 'action';

    return (
        <div className="absolute top-16 left-0 bottom-0 w-80 bg-[#1a1a2e] border-r border-white/10 p-6 shadow-2xl z-20 flex flex-col animate-in slide-in-from-left-4 font-cairo" dir={isAr ? "rtl" : "ltr"}>

            {/* Header */}
            <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                    {isTrigger && <Mail className="w-4 h-4 text-blue-400" />}
                    {isAgent && <Bot className="w-4 h-4 text-neon-purple" />}
                    {isAction && <Database className="w-4 h-4 text-green-400" />}
                    {isAr ? "إعدادات العقدة" : "Node Settings"}
                </h3>
                <button onClick={onClose} className="text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto space-y-6">

                {/* الاسم (مشترك) */}
                <div className="space-y-2">
                    <Label className="text-gray-300">{isAr ? "اسم الخطوة" : "Step Name"}</Label>
                    <Input
                        value={data.label || ''}
                        onChange={e => setData({ ...data, label: e.target.value })}
                        className="bg-black/20 border-white/10 text-white"
                    />
                </div>

                {/* 1️⃣ إعدادات التريجر (إيميل) */}
                {isTrigger && (
                    <>
                        <div className="space-y-2">
                            <Label className="text-gray-300">{isAr ? "مزود الخدمة" : "Provider"}</Label>
                            <Select
                                value={data.provider || 'gmail'}
                                onValueChange={v => setData({ ...data, provider: v })}
                            >
                                <SelectTrigger className="bg-black/20 border-white/10 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a2e] text-white border-white/10">
                                    <SelectItem value="gmail">Gmail</SelectItem>
                                    <SelectItem value="outlook">Outlook</SelectItem>
                                    <SelectItem value="imap">IMAP Custom</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300">{isAr ? "التصفية (Filter)" : "Filter"}</Label>
                            <Input
                                placeholder={isAr ? "غير المقروء فقط: نعم" : "Only unread: Yes"}
                                disabled
                                className="bg-black/20 border-white/10 text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-[10px] text-gray-500">{isAr ? "* سيتم قراءة الإيميلات غير المقروءة فقط" : "* Only unread emails will be processed"}</p>
                        </div>
                    </>
                )}

                {/* 2️⃣ إعدادات الوكيل (Prompt) */}
                {isAgent && (
                    <div className="space-y-2">
                        <Label className="text-gray-300">{isAr ? "تعليمات النظام (Prompt)" : "System Prompt"}</Label>
                        <div className="text-xs text-gray-500 mb-2">
                            {isAr ? "يمكنك استخدام المتغيرات:" : "You can use variables:"} <span className="text-neon-purple">{"{{subject}}"}</span>, <span className="text-neon-purple">{"{{body}}"}</span>
                        </div>
                        <Textarea
                            value={data.customPrompt || ''}
                            onChange={e => setData({ ...data, customPrompt: e.target.value })}
                            placeholder={isAr ? "أنت مستشار تسليم. وصلك الإيميل التالي: {{body}}..." : "You are a delivery advisor. You received this email: {{body}}..."}
                            className="bg-black/20 border-white/10 text-white h-32 font-mono text-sm"
                        />
                    </div>
                )}

                {/* 3️⃣ إعدادات الإجراء (Send Email) */}
                {isAction && (
                    <>
                        <div className="space-y-2">
                            <Label className="text-gray-300">{isAr ? "المستلم (To)" : "Recipient (To)"}</Label>
                            <Input
                                value={data.to || '{{from}}'}
                                onChange={e => setData({ ...data, to: e.target.value })}
                                className="bg-black/20 border-white/10 text-white font-mono"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-300">{isAr ? "المحتوى (Body)" : "Body"}</Label>
                            <Textarea
                                value={data.body || '{{agent_output}}'}
                                onChange={e => setData({ ...data, body: e.target.value })}
                                placeholder={isAr ? "ناتج الوكيل الذكي..." : "AI agent output..."}
                                className="bg-black/20 border-white/10 text-white h-24 font-mono"
                            />
                        </div>
                    </>
                )}

            </div>

            {/* Footer */}
            <div className="pt-4 mt-4 border-t border-white/10">
                <Button onClick={handleSave} className="w-full bg-neon-purple hover:bg-neon-purple/80">
                    <Save className={`w-4 h-4 ${isAr ? "ml-2" : "mr-2"}`} /> {isAr ? "حفظ الإعدادات" : "Save Settings"}
                </Button>
            </div>
        </div>
    );
}
