import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, User, Mail, Save, Trash2, LogOut, Bell, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useSEO } from "@/hooks/useSEO";

const LS_KEYS = {
  showRatings: "nabd_show_ratings",
  animations: "nabd_animations",
} as const;

function readBoolLS(key: string, defaultValue = true) {
  try {
    const v = localStorage.getItem(key);
    if (v === null) return defaultValue;
    return v !== "false";
  } catch {
    return defaultValue;
  }
}

const Settings = () => {
  useSEO({
    title: "الإعدادات",
    description: "إدارة إعدادات حسابك وتفضيلاتك الشخصية في نبض",
    noIndex: true,
  });

  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // تفضيلات: نقرأها بعد mount لتجنب مشاكل SSR/hydration
  const [showRatings, setShowRatings] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  const initialDisplayNameRef = useRef<string>("");

  useEffect(() => {
    // init local prefs after mount
    setShowRatings(readBoolLS(LS_KEYS.showRatings, true));
    setAnimationsEnabled(readBoolLS(LS_KEYS.animations, true));
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      // لو عندك display_name في metadata خذه أولاً (أسرع للموبايل)
      const fromMeta = (user.user_metadata as any)?.display_name ?? (user.user_metadata as any)?.full_name ?? "";

      if (fromMeta && !displayName) {
        setDisplayName(String(fromMeta));
        initialDisplayNameRef.current = String(fromMeta);
      }

      setProfileLoading(true);
      try {
        const { data, error } = await supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle();

        if (error) throw error;

        const name = (data?.display_name || fromMeta || "").toString();
        setDisplayName(name);
        initialDisplayNameRef.current = name;
      } catch (error) {
        // لا نزعج المستخدم بتوست هنا—صفحة إعدادات، خليها silent
        console.error("Error fetching profile:", error);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const canSave = useMemo(() => {
    if (!user) return false;
    const trimmed = displayName.trim();
    // اسم عرض غير فاضي + تغيّر عن القيمة الأصلية
    return trimmed.length > 0 && trimmed !== initialDisplayNameRef.current.trim();
  }, [displayName, user]);

  const handleSaveProfile = async () => {
    if (!user) return;

    const trimmed = displayName.trim();
    if (trimmed.length === 0) {
      toast({
        title: "اسم غير صالح",
        description: "يرجى إدخال اسم عرض صحيح",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from("profiles").update({ display_name: trimmed }).eq("id", user.id);

      if (error) throw error;

      initialDisplayNameRef.current = trimmed;

      toast({
        title: "تم الحفظ",
        description: "تم تحديث معلومات الملف الشخصي",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ البيانات",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleRatings = (checked: boolean) => {
    setShowRatings(checked);
    try {
      localStorage.setItem(LS_KEYS.showRatings, String(checked));
    } catch {}
    toast({
      title: checked ? "تم تفعيل التقييمات" : "تم إخفاء التقييمات",
      description: checked ? "ستظهر التقييمات في البطاقات" : "تم إخفاء التقييمات من البطاقات",
    });
  };

  const handleToggleAnimations = (checked: boolean) => {
    setAnimationsEnabled(checked);
    try {
      localStorage.setItem(LS_KEYS.animations, String(checked));
    } catch {}
    toast({
      title: checked ? "تم تفعيل الحركات" : "تم إيقاف الحركات",
      description: checked ? "ستظهر الحركات في الواجهة" : "تم إيقاف حركات الواجهة",
    });
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "تم تسجيل الخروج",
      description: "نراك قريباً!",
    });
    navigate("/", { replace: true });
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <Loader2 className="h-12 w-12 animate-spin text-neon-purple" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden" dir="rtl">
      <div className="fixed top-0 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-neon-purple/20 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-0 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-neon-blue/20 rounded-full blur-[120px] -z-10" />

      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="mx-auto w-full max-w-3xl px-4 py-4">
          <Button
            onClick={() => navigate("/", { replace: true })}
            variant="ghost"
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowRight className="h-5 w-5" />
            العودة للرئيسية
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12 space-y-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">الإعدادات</h1>

        {/* Profile */}
        <section className="glass rounded-2xl p-5 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <User className="h-6 w-6 text-neon-purple" />
            <h2 className="text-xl font-semibold text-foreground">الملف الشخصي</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-muted-foreground">
                البريد الإلكتروني
              </Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="pr-10 bg-muted/30 border-border/50 text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">اسم العرض</Label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="displayName"
                  type="text"
                  inputMode="text"
                  placeholder="اسمك الذي يظهر للآخرين"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="pr-10 bg-muted/50 border-border/50"
                />
              </div>
            </div>

            <Button
              onClick={handleSaveProfile}
              disabled={isSaving || !canSave}
              className="w-full sm:w-auto bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 gap-2"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              حفظ التغييرات
            </Button>
          </div>
        </section>

        {/* Preferences */}
        <section className="glass rounded-2xl p-5 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <Eye className="h-6 w-6 text-neon-purple" />
            <h2 className="text-xl font-semibold text-foreground">تفضيلات العرض</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 py-3">
              <div className="space-y-1 min-w-0">
                <p className="font-medium text-foreground">عرض التقييمات</p>
                <p className="text-sm text-muted-foreground">إظهار تقييمات الأدوات في البطاقات</p>
              </div>
              <Switch checked={showRatings} onCheckedChange={handleToggleRatings} />
            </div>

            <Separator className="bg-border/50" />

            <div className="flex items-center justify-between gap-3 py-3">
              <div className="space-y-1 min-w-0">
                <p className="font-medium text-foreground">الحركات والتأثيرات</p>
                <p className="text-sm text-muted-foreground">تفعيل حركات الواجهة والانتقالات</p>
              </div>
              <Switch checked={animationsEnabled} onCheckedChange={handleToggleAnimations} />
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="glass rounded-2xl p-5 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-neon-purple" />
            <h2 className="text-xl font-semibold text-foreground">الإشعارات</h2>
          </div>

          <p className="text-muted-foreground">إشعارات التطبيق غير متوفرة حالياً. سيتم إضافتها في تحديث قادم.</p>
        </section>

        {/* Account */}
        <section className="glass rounded-2xl p-5 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <LogOut className="h-6 w-6 text-destructive" />
            <h2 className="text-xl font-semibold text-foreground">الحساب</h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleSignOut} variant="outline" className="w-full sm:w-auto gap-2 border-border/50">
              <LogOut className="h-4 w-4" />
              تسجيل الخروج
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto gap-2 border-destructive/50 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                  حذف الحساب
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent dir="rtl" className="glass">
                <AlertDialogHeader>
                  <AlertDialogTitle>هل أنت متأكد من حذف الحساب؟</AlertDialogTitle>
                  <AlertDialogDescription>
                    سيتم حذف حسابك نهائياً مع جميع المراجعات والبيانات المرتبطة به. هذا الإجراء لا يمكن التراجع عنه.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-row-reverse gap-2">
                  <AlertDialogCancel className="mt-0">إلغاء</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive hover:bg-destructive/90"
                    onClick={() => {
                      toast({
                        title: "غير متوفر حالياً",
                        description: "يرجى التواصل مع الدعم لحذف حسابك",
                        variant: "destructive",
                      });
                    }}
                  >
                    حذف الحساب
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Settings;
