import { useState, useRef } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
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
            toast({
                title: "يرجى اختيار ملف صورة صالح",
                variant: "destructive",
            });
            return;
        }

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            toast({
                title: "حجم الصورة يجب أن يكون أقل من 2 ميجابايت",
                variant: "destructive",
            });
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
                toast({ title: "تم رفع الصورة بنجاح" });
            }
        } catch (error: any) {
            console.error("Error uploading avatar:", error);
            toast({
                title: "فشل رفع الصورة",
                description: error.message,
                variant: "destructive",
            });
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
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 bg-black/40">
                    {previewUrl ? (
                        <img src={previewUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : currentAvatarUrl ? (
                        <img src={currentAvatarUrl} alt="Current Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Camera className="w-10 h-10" />
                        </div>
                    )}

                    {/* طبقة التحميل */}
                    {uploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                            <Loader2 className="w-8 h-8 text-neon-purple animate-spin" />
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
                        className="absolute bottom-0 right-0 p-2 bg-neon-purple rounded-full text-white shadow-lg hover:bg-neon-purple/80 transition-colors"
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
                        className="bg-green-600 hover:bg-green-700"
                    >
                        حفظ الصورة
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={cancelPreview}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            )}

            <p className="text-xs text-gray-500 text-center max-w-[200px]">
                الصيغ المدعومة: JPG, PNG. الحد الأقصى: 2MB.
            </p>
        </div>
    );
};

export default AvatarUpload;
