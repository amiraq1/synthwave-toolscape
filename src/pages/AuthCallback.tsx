import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Activity, Loader2 } from 'lucide-react';

const RETURN_TO_KEY = 'nabd_return_to';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // انتظار حتى يلتقط Supabase الجلسة من الـ URL hash
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/auth?error=callback_failed');
          return;
        }

        if (session) {
          // الجلسة موجودة - توجيه المستخدم للصفحة المحفوظة أو الرئيسية
          const returnTo = sessionStorage.getItem(RETURN_TO_KEY);
          sessionStorage.removeItem(RETURN_TO_KEY);
          
          if (returnTo) {
            // تحقق أن الرابط آمن (من نفس الدومين)
            try {
              const url = new URL(returnTo);
              if (url.origin === window.location.origin) {
                window.location.href = returnTo;
                return;
              }
            } catch {
              // ignore invalid URL
            }
          }
          
          navigate('/');
        } else {
          // لا توجد جلسة - ربما حدث خطأ أو تم إلغاء المصادقة
          navigate('/auth');
        }
      } catch (err) {
        console.error('Unexpected error in auth callback:', err);
        navigate('/auth?error=unexpected');
      }
    };

    // الاستماع لتغييرات الجلسة
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const returnTo = sessionStorage.getItem(RETURN_TO_KEY);
        sessionStorage.removeItem(RETURN_TO_KEY);
        
        if (returnTo) {
          try {
            const url = new URL(returnTo);
            if (url.origin === window.location.origin) {
              window.location.href = returnTo;
              return;
            }
          } catch {
            // ignore
          }
        }
        
        navigate('/');
      }
    });

    // محاولة الحصول على الجلسة بعد تأخير قصير للسماح لـ Supabase بمعالجة الـ hash
    const timer = setTimeout(handleCallback, 500);

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
      {/* Background gradient orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-neon-blue/20 rounded-full blur-[120px] -z-10" />
      
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-2">
          <Activity className="h-10 w-10 text-neon-purple animate-pulse" />
          <h1 className="text-3xl">
            <span className="font-extrabold gradient-text">نبض</span>
            <span className="font-medium text-foreground/80 mr-1">AI</span>
          </h1>
        </div>
        
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-neon-purple animate-spin" />
          <p className="text-muted-foreground text-lg">جاري إتمام تسجيل الدخول...</p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
