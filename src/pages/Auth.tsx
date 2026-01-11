import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Loader2 } from "lucide-react"; // Unused in this snippet but kept if needed later
import { Helmet } from "react-helmet-async";

const Auth = () => {
  const { session } = useAuth(); // حالة تسجيل الدخول من الكونتكست
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState("");

  // 1. التوجيه التلقائي إذا كان المستخدم مسجلاً بالفعل
  useEffect(() => {
    if (session) {
      // التحقق مما إذا كان هناك صفحة سابقة يجب العودة إليها
      // (نستخدم state بدلاً من searchParams لتجنب تلوث الرابط)
      const from = (location.state as any)?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [session, navigate, location]);

  // الاستماع لأخطاء المصادقة (اختياري)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, _session) => {
      if (event === "USER_UPDATED") {
        // تنظيف أي أخطاء عند التحديث
        setErrorMessage("");
      }
      if (event === "SIGNED_OUT") {
        setErrorMessage("");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // دالة مخصصة للتعامل مع الأخطاء التي قد تظهر في الرابط (مثل ?error=...)
  // ولكن بدون إعادة كتابة الرابط بشكل متكرر
  useEffect(() => {
    // تنظيف الروابط المشبوهة أولاً
    const search = window.location.search;
    if (search.includes('~and~') || search.length > 500) {
      navigate('/auth', { replace: true });
      return;
    }

    const params = new URLSearchParams(location.search);
    const errorDescription = params.get("error_description");
    if (errorDescription) {
      setErrorMessage(decodeURIComponent(errorDescription));
    }
  }, [location.search, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f1a] px-4 py-12 font-cairo" dir="rtl">
      <Helmet>
        <title>تسجيل الدخول | نبض AI</title>
      </Helmet>

      <div className="w-full max-w-md space-y-8 bg-[#1a1a2e]/50 p-8 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4">

        {/* الشعار والعنوان */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">مرحباً بك في نبض AI 👋</h2>
          <p className="text-gray-400">سجل الدخول لحفظ أدواتك المفضلة ومتابعة كل جديد.</p>
        </div>

        {/* عرض رسائل الخطأ إن وجدت */}
        {errorMessage && (
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* واجهة Supabase الجاهزة */}
        <div className="auth-container">
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#7c3aed', // neon-purple
                    brandAccent: '#6d28d9',
                    inputText: 'white',
                    inputBackground: 'rgba(0,0,0,0.2)',
                    inputBorder: 'rgba(255,255,255,0.1)',
                    inputLabelText: '#9ca3af',
                  },
                },
              },
              className: {
                button: 'font-cairo',
                input: 'font-cairo',
                label: 'font-cairo',
              }
            }}
            providers={[]} // تم تعطيل OAuth providers
            localization={{
              variables: {
                sign_in: {
                  email_label: "البريد الإلكتروني",
                  password_label: "كلمة المرور",
                  button_label: "تسجيل الدخول",
                  loading_button_label: "جاري الدخول...",
                  social_provider_text: "الدخول باستخدام {{provider}}",
                  link_text: "لديك حساب بالفعل؟ تسجيل الدخول"
                },
                sign_up: {
                  email_label: "البريد الإلكتروني",
                  password_label: "كلمة المرور",
                  button_label: "إنشاء حساب جديد",
                  loading_button_label: "جاري الإنشاء...",
                  social_provider_text: "التسجيل باستخدام {{provider}}",
                  link_text: "ليس لديك حساب؟ إنشاء حساب جديد"
                },
                forgotten_password: {
                  link_text: "نسيت كلمة المرور؟",
                  button_label: "إرسال تعليمات الاستعادة",
                  email_label: "البريد الإلكتروني"
                }
              }
            }}
            theme="dark"
          />
        </div>
      </div>
    </div>
  );
};

export default Auth;
