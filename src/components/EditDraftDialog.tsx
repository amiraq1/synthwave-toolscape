import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import type { Tool } from "@/types";
import { useTranslation } from "react-i18next";
import { getValidToolUrl } from "@synthwave/utils";

interface EditDraftDialogProps {
    tool: Partial<Tool> | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

const EditDraftDialog = ({ tool, isOpen, onClose, onUpdate }: EditDraftDialogProps) => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        pricing_type: "",
        url: "",
    });
    const [loading, setLoading] = useState(false);

    // Update form data when tool changes
    useEffect(() => {
        if (tool) {
            setFormData({
                title: tool.title || "",
                description: tool.description || "",
                category: tool.category || "",
                pricing_type: tool.pricing_type || "",
                url: tool.url || "",
            });
        }
    }, [tool]);

    const { t, i18n } = useTranslation();
    const handleSave = async () => {
        if (!tool) return;

        const normalizedToolUrl = getValidToolUrl(formData.url);
        if (!normalizedToolUrl) {
            toast.error(t('admin.tools.invalid_url'));
            return;
        }

        setLoading(true);
        const { error } = await supabase
            .from("tools")
            .update({
                title: formData.title,
                description: formData.description,
                category: formData.category,
                pricing_type: formData.pricing_type,
                url: normalizedToolUrl,
                is_published: true // نشر الأداة عند الحفظ
            })
            .eq("id", Number(tool.id));

        if (error) {
            toast.error(t('admin.update_failed', { message: error.message }));
        } else {
            toast.success(t('admin.save_success'));
            onUpdate();
            onClose();
        }
        setLoading(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#1a1a2e] border-white/10 text-white max-w-2xl text-start" dir={i18n.dir()} aria-describedby={undefined}>
                <DialogHeader className="text-start">
                    <DialogTitle className="text-start">{t('admin.edit_draft')}: {formData.title}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">{t('add_tool.form_name')}</label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="bg-black/20"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">{t('add_tool.form_url')}</label>
                            <Input
                                value={formData.url}
                                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                className="bg-black/20 text-left"
                                dir="ltr"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">{t('add_tool.form_category')}</label>
                            <Input
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="bg-black/20"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">{t('add_tool.form_pricing')}</label>
                            <Input
                                value={formData.pricing_type}
                                onChange={(e) => setFormData({ ...formData, pricing_type: e.target.value })}
                                className="bg-black/20"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">{t('admin.form_desc_ar')}</label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="bg-black/20 min-h-[100px]"
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose} className="bg-transparent border-white/10 hover:bg-white/5">{t('add_tool.cancel')}</Button>
                    <Button onClick={handleSave} disabled={loading} className="bg-green-600 hover:bg-green-700">
                        {loading ? t('add_tool.enhancing') : t('admin.save_publish')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditDraftDialog;
