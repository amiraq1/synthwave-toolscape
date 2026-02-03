import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { User, Upload, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
            toast({ title: "تم تحديث الصورة بنجاح! 📸" });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'فشل الرفع';
            toast({
                title: "فشل الرفع",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 bg-black/20 flex items-center justify-center group">
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <User className="w-16 h-16 text-gray-500" />
                )}

                {uploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                        <Loader2 className="animate-spin text-white" />
                    </div>
                )}
            </div>

            <div className="relative">
                <Button variant="outline" size="sm" className="gap-2 cursor-pointer z-0">
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
