import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { User, Upload, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface AvatarUploadProps {
    uid: string;
    url: string | null;
    onUpload: (url: string) => void;
}

const AvatarUpload = ({ uid, url, onUpload }: AvatarUploadProps) => {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(url);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (url) setAvatarUrl(url);
    }, [url]);

    const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error("يجب اختيار صورة أولاً.");
            }

            const file = event.target.files[0];
            const fileExt = file.name.split(".").pop();
            const filePath = `${uid}/${Math.random()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            // الحصول على الرابط العام
            const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

            setAvatarUrl(data.publicUrl);
            onUpload(data.publicUrl);
            toast.success("تم تحديث الصورة بنجاح! 📸");

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'فشل الرفع';
            toast.error("فشل الرفع: " + errorMessage);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-black/8 bg-white/80 shadow-[0_18px_40px_rgba(15,23,42,0.08)] group">
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <User className="w-16 h-16 text-slate-400" />
                )}

                {uploading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/55">
                        <Loader2 className="animate-spin text-white" />
                    </div>
                )}
            </div>

            <div className="relative">
                <Button
                    variant="outline"
                    size="sm"
                    className="z-0 cursor-pointer gap-2 rounded-full border-black/10 bg-white/70 text-slate-950 hover:bg-white"
                >
                    <Upload className="w-4 h-4" />
                    {uploading ? "جاري الرفع..." : "تغيير الصورة"}
                </Button>
                <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    accept="image/*"
                    onChange={uploadAvatar}
                    disabled={uploading}
                />
            </div>
        </div>
    );
};

export default AvatarUpload;
