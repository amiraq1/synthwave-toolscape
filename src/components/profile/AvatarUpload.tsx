import { useState, useRef } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
    currentAvatarUrl: string | null;
    onUploadComplete: (url: string) => void;
    userId: string;
}

const AvatarUpload = ({ currentAvatarUrl, onUploadComplete, userId }: AvatarUploadProps) => {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        const file = event.target.files[0];

        // التحقق من نوع الملف وحجمه
        if (!file.type.startsWith("image/")) {
            toast.error("يرجى اختيار ملف صورة صالح");
            return;
        }

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            toast.error("حجم الصورة يجب أن يكون أقل من 2 ميجابايت");
            return;
        }

        // إنشاء رابط معاينة
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
    };

    const handleUpload = async () => {
        if (!fileInputRef.current?.files?.[0]) return;

        setUploading(true);
        const file = fileInputRef.current.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        try {
            // رفع الصورة إلى Supabase Storage bucket 'avatars'
            // ملاحظة: تأكد من وجود bucket باسم 'avatars' في Supabase
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // الحصول على الرابط العام
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

            if (data) {
                onUploadComplete(data.publicUrl);
                setPreviewUrl(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
                toast.success("تم رفع الصورة بنجاح");
            }
        } catch (error: unknown) {
            console.error("Error uploading avatar:", error);
            toast.error("فشل رفع الصورة: " + (error instanceof Error ? error.message : "Unknown error"));
        } finally {
            setUploading(false);
        }
    };

    const cancelPreview = () => {
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative group">
                <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-black/8 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
                    {previewUrl ? (
                        <img src={previewUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : currentAvatarUrl ? (
                        <img src={currentAvatarUrl} alt="Current Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                            <Camera className="w-10 h-10" />
                        </div>
                    )}

                    {/* طبقة التحميل */}
                    {uploading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/50">
                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                        </div>
                    )}
                </div>

                {/* زر اختيار ملف مخفي */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                />

                {/* زر تغيير الصورة */}
                {!previewUrl && !uploading && (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 rounded-full bg-slate-950 p-2 text-white shadow-lg transition-colors hover:bg-slate-800"
                        title="تغيير الصورة"
                    >
                        <Camera className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* أزرار الإجراءات عند تحديد صورة */}
            {previewUrl && !uploading && (
                <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                    <Button
                        size="sm"
                        onClick={handleUpload}
                        className="rounded-full bg-slate-950 px-4 text-white hover:bg-slate-800"
                    >
                        حفظ الصورة
                    </Button>
                    <Button
                        size="sm"
                        onClick={cancelPreview}
                        variant="outline"
                        className="rounded-full border-black/10 bg-white/70 text-slate-950 hover:bg-white"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            )}

            <p className="max-w-[220px] text-center text-xs leading-6 text-slate-500">
                الصيغ المدعومة: JPG, PNG. الحد الأقصى: 2MB.
            </p>
        </div>
    );
};

export default AvatarUpload;
