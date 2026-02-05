import { useState, useRef, useEffect } from "react";
import { Camera, Loader2, X, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
    currentAvatarUrl: string | null;
    onUploadComplete: (url: string) => void;
    userId: string;
    className?: string; // لإتاحة تخصيص الكلاسات الخارجية
}

const AvatarUpload = ({ currentAvatarUrl, onUploadComplete, userId, className }: AvatarUploadProps) => {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // تنظيف روابط المعاينة لتجنب تسرب الذاكرة
    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const processFile = (file: File) => {
        // التحقق من نوع الملف وحجمه
        if (!file.type.startsWith("image/")) {
            toast.error("يرجى اختيار ملف صورة صالح (JPG, PNG)");
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

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            processFile(event.target.files[0]);
        }
    };

    // معالجة السحب والإفلات
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            // تحديث الـ input يدوياً ليتوافق مع الرفع
            if (fileInputRef.current) {
                fileInputRef.current.files = e.dataTransfer.files;
            }
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!fileInputRef.current?.files?.[0]) return;

        setUploading(true);
        const file = fileInputRef.current.files[0];
        const fileExt = file.name.split('.').pop();
        // استخدام Timestamp لضمان عدم تكرار الاسم وتجاوز الكاش
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        try {
            // رفع الصورة
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false // نفضل إنشاء ملف جديد لتجنب مشاكل الكاش
                });

            if (uploadError) throw uploadError;

            // الحصول على الرابط العام
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

            if (data) {
                onUploadComplete(data.publicUrl);
                setPreviewUrl(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
                toast.success("تم تحديث الصورة الشخصية بنجاح");
            }
        } catch (error: any) {
            console.error("Error uploading avatar:", error);
            toast.error("فشل رفع الصورة", {
                description: error.message || "تأكد من إعدادات التخزين في Supabase",
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
        <div className={cn("flex flex-col items-center gap-6", className)}>
            <div
                className={cn(
                    "relative group cursor-pointer transition-all duration-300",
                    isDragging ? "scale-105" : ""
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {/* إطار الصورة */}
                <div className={cn(
                    "w-36 h-36 rounded-full overflow-hidden border-4 bg-black/40 shadow-xl transition-all",
                    isDragging ? "border-neon-purple shadow-neon-purple/20" : "border-white/10 hover:border-white/20"
                )}>
                    {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : currentAvatarUrl ? (
                        <img src={currentAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-muted/20">
                            <UploadCloud className="w-10 h-10 mb-2 opacity-50" />
                        </div>
                    )}

                    {/* طبقة التحميل */}
                    {uploading && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20 backdrop-blur-sm">
                            <Loader2 className="w-10 h-10 text-neon-purple animate-spin" />
                        </div>
                    )}

                    {/* طبقة السحب والإفلات */}
                    {isDragging && !uploading && (
                        <div className="absolute inset-0 bg-neon-purple/20 flex items-center justify-center z-10 border-4 border-dashed border-neon-purple rounded-full">
                            <span className="text-white font-bold text-sm drop-shadow-md">أفلت الصورة هنا</span>
                        </div>
                    )}
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={uploading}
                />

                {/* زر الكاميرا العائم */}
                {!previewUrl && !uploading && (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-1 right-1 p-2.5 bg-neon-purple rounded-full text-white shadow-lg hover:bg-neon-purple/90 hover:scale-110 transition-all border-4 border-background"
                        title="تغيير الصورة"
                    >
                        <Camera className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* أزرار الإجراءات */}
            {previewUrl && !uploading ? (
                <div className="flex gap-3 animate-in fade-in slide-in-from-top-2">
                    <Button
                        size="sm"
                        onClick={handleUpload}
                        className="bg-green-600 hover:bg-green-700 min-w-[100px]"
                    >
                        حفظ التغيير
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelPreview}
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    >
                        <X className="w-4 h-4 mr-1" /> إلغاء
                    </Button>
                </div>
            ) : (
                <div className="text-center space-y-1">
                    <p className="text-sm font-medium text-gray-300">الصورة الشخصية</p>
                    <p className="text-xs text-gray-500">
                        {isDragging ? "أفلت الصورة لرفعها" : "اضغط على الأيقونة لتغيير الصورة"}
                    </p>
                </div>
            )}
        </div>
    );
};

export default AvatarUpload;
