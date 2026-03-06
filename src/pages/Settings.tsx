import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import AvatarUpload from "@/components/AvatarUpload";
import { Loader2, Save, Settings as SettingsIcon, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  EditorialHero,
  EditorialPage,
  EditorialPanel,
} from "@/components/layout/EditorialPage";

const Settings = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const getProfile = async () => {
      if (!session) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", session.user.id)
        .single();

      if (data) {
        const profileData = data as {
          display_name: string | null;
          avatar_url: string | null;
        };
        setFullName(profileData.display_name || "");
        setAvatarUrl(profileData.avatar_url);
      }
      setLoading(false);
    };

    void getProfile();
  }, [session]);

  const updateProfile = async (event: React.FormEvent) => {
    event.preventDefault();
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
      toast.error(`${t("settings.update_error")}: ${error.message}`);
    } else {
      toast.success(t("settings.update_success"));
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <EditorialPage dir={i18n.dir()}>
        <EditorialPanel className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-slate-950" />
        </EditorialPanel>
      </EditorialPage>
    );
  }

  if (!session) {
    return (
      <EditorialPage dir={i18n.dir()}>
        <EditorialPanel className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center">
          <div className="space-y-4 text-center">
            <ShieldAlert className="mx-auto h-12 w-12 text-red-500" />
            <h1 className="font-editorial text-3xl font-semibold text-slate-950">
              {t("auth.login_required")}
            </h1>
            <Button
              onClick={() => navigate("/auth")}
              className="rounded-full bg-slate-950 px-6 text-white hover:bg-slate-800"
            >
              {t("auth.login")}
            </Button>
          </div>
        </EditorialPanel>
      </EditorialPage>
    );
  }

  return (
    <EditorialPage dir={i18n.dir()}>
      <EditorialHero
        eyebrow={t("settings.title")}
        title={t("settings.profile")}
        description={session.user.email || ""}
        icon={<SettingsIcon className="h-7 w-7" />}
        aside={
          <div className="space-y-5 text-white">
            <span className="editorial-kicker border-white/10 bg-white/10 text-white/65">
              Account
            </span>
            <h2 className="font-editorial text-3xl font-semibold leading-tight">
              {session.user.email}
            </h2>
            <p className="text-sm leading-7 text-white/72">
              عدّل الاسم والصورة الشخصية من نفس المساحة، مع الحفاظ على نفس طابع
              الواجهة التحريري الجديد.
            </p>
          </div>
        }
      />

      <EditorialPanel className="max-w-4xl">
        <form onSubmit={updateProfile} className="space-y-8">
          <div className="flex justify-center">
            <AvatarUpload
              uid={session.user.id}
              url={avatarUrl}
              onUpload={(url) => setAvatarUrl(url)}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">
                {t("settings.email_label")}
              </Label>
              <Input
                id="email"
                value={session.user.email}
                disabled
                className="editorial-form-field rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-slate-700">
                {t("settings.name_label")}
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder={t("settings.name_placeholder")}
                className="editorial-form-field rounded-2xl"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="rounded-full bg-slate-950 px-6 text-white hover:bg-slate-800"
            disabled={updating}
          >
            {updating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="ml-2 h-4 w-4" />
                {t("settings.save_btn")}
              </>
            )}
          </Button>
        </form>
      </EditorialPanel>
    </EditorialPage>
  );
};

export default Settings;
