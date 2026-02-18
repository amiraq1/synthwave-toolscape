import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import AvatarUpload from "@/components/AvatarUpload";
import { Loader2, Save } from "lucide-react";
import { useTranslation } from "react-i18next";

const Settings = () => {
  const { session } = useAuth();
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const getProfile = async () => {
      if (!session) return;

      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", session.user.id)
        .single();

      if (data) {
        const profileData = data as { display_name: string | null; avatar_url: string | null };
        setFullName(profileData.display_name || "");
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
        display_name: fullName,
        avatar_url: avatarUrl,
      })
      .eq("id", session.user.id);

    if (error) {
      toast.error(isAr ? "فشل التحديث" : "Update failed", {
        description: error.message,
      });
    } else {
      toast.success(isAr ? "تم حفظ البيانات" : "Changes saved");
    }
    setUpdating(false);
  };

  if (!session) return <div className="p-10 text-center" role="main">{isAr ? "يرجى تسجيل الدخول." : "Please sign in."}</div>;
  if (loading) return <div className="flex justify-center mt-20" role="main"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl" dir={isAr ? "rtl" : "ltr"} role="main">
      <h1 className="text-3xl font-bold mb-8 text-white">{isAr ? "إعدادات الحساب" : "Account Settings"}</h1>

      <Card className={`bg-white/5 border-white/10 ${isAr ? 'text-right' : 'text-left'}`}>
        <CardHeader>
          <CardTitle>{isAr ? "الملف الشخصي" : "Profile"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={updateProfile} className="space-y-8">
            <div className="flex justify-center mb-6">
              <AvatarUpload uid={session.user.id} url={avatarUrl} onUpload={(url) => setAvatarUrl(url)} />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{isAr ? "البريد الإلكتروني" : "Email"}</Label>
                <Input id="email" value={session.user.email} disabled className={`bg-black/20 text-gray-400 ${isAr ? 'text-right' : 'text-left'}`} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">{isAr ? "الاسم الكامل" : "Full name"}</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={isAr ? "كيف تحب أن نناديك؟" : "How should we call you?"}
                  className={isAr ? "text-right" : "text-left"}
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-neon-purple hover:bg-neon-purple/80" disabled={updating}>
              {updating ? <Loader2 className="animate-spin" /> : <><Save className={`w-4 h-4 ${isAr ? 'ml-2' : 'mr-2'}`} /> {isAr ? "حفظ التغييرات" : "Save changes"}</>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
