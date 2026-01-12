import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import AvatarUpload from "@/components/AvatarUpload";
import { Loader2, Save } from "lucide-react";

const Settings = () => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const getProfile = async () => {
      if (!session) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, avatar_url") // Changed full_name to display_name to match DB schema
        .eq("id", session.user.id)
        .single();

      if (data) {
        const profileData = data as { display_name: string | null; avatar_url: string | null };
        setFullName(profileData.display_name || ""); // Mapped display_name to fullName state
        setAvatarUrl(profileData.avatar_url);
      }
      setLoading(false);
    };

    getProfile();
  }, [session]);

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    setUpdating(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: fullName, // Mapped to display_name
        avatar_url: avatarUrl,
        // updated_at is usually handled by triggers or default, ignoring for now or adding if needed
      })
      .eq("id", session.user.id);

    if (error) {
      toast.error("فشل التحديث: " + error.message);
    } else {
      toast.success("تم حفظ البيانات! ✅");
    }
    setUpdating(false);
  };

  if (!session) return <div className="p-10 text-center">يرجى تسجيل الدخول.</div>;
  if (loading) return <div className="flex justify-center mt-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl" dir="rtl">
      <h1 className="text-3xl font-bold mb-8 text-white">إعدادات الحساب</h1>

      <Card className="bg-white/5 border-white/10 text-right">
        <CardHeader>
          <CardTitle>الملف الشخصي</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={updateProfile} className="space-y-8">

            {/* 1. الصورة الشخصية */}
            <div className="flex justify-center mb-6">
              <AvatarUpload
                uid={session.user.id}
                url={avatarUrl}
                onUpload={(url) => setAvatarUrl(url)}
              />
            </div>

            {/* 2. الاسم والبريد */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input id="email" value={session.user.email} disabled className="bg-black/20 text-gray-400 text-right" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">الاسم الكامل</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="كيف تحب أن نناديك؟"
                  className="text-right"
                />
              </div>
            </div>

            {/* زر الحفظ */}
            <Button
              type="submit"
              className="w-full bg-neon-purple hover:bg-neon-purple/80"
              disabled={updating}
            >
              {updating ? <Loader2 className="animate-spin" /> : <><Save className="w-4 h-4 ml-2" /> حفظ التغييرات</>}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
