import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email('يرجى إدخال بريد إلكتروني صالح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

const emailSchema = z.object({
  email: z.string().email('يرجى إدخال بريد إلكتروني صالح'),
});

type AuthMode = 'login' | 'signup' | 'forgot-password';

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signIn, signUp } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'forgot-password') {
        // Validate email only
        const validation = emailSchema.safeParse({ email });
        if (!validation.success) {
          toast({
            title: 'خطأ في البيانات',
            description: validation.error.errors[0].message,
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
          toast({
            title: 'خطأ',
            description: 'حدث خطأ أثناء إرسال رابط إعادة التعيين',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'تم الإرسال!',
            description: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني',
          });
          setMode('login');
          setEmail('');
        }
      } else {
        // Validate email and password
        const validation = authSchema.safeParse({ email, password });
        if (!validation.success) {
          toast({
            title: 'خطأ في البيانات',
            description: validation.error.errors[0].message,
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        if (mode === 'login') {
          const { error } = await signIn(email, password);
          if (error) {
            let message = 'حدث خطأ أثناء تسجيل الدخول';
            if (error.message.includes('Invalid login credentials')) {
              message = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
            }
            toast({
              title: 'خطأ',
              description: message,
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'مرحباً بك!',
              description: 'تم تسجيل الدخول بنجاح',
            });
          }
        } else {
          const { error } = await signUp(email, password, displayName || undefined);
          if (error) {
            let message = 'حدث خطأ أثناء إنشاء الحساب';
            if (error.message.includes('already registered')) {
              message = 'هذا البريد الإلكتروني مسجل بالفعل';
            }
            toast({
              title: 'خطأ',
              description: message,
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'تم إنشاء الحساب!',
              description: 'مرحباً بك في نبض',
            });
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'login':
        return 'تسجيل الدخول إلى حسابك';
      case 'signup':
        return 'إنشاء حساب جديد';
      case 'forgot-password':
        return 'استعادة كلمة المرور';
    }
  };

  const getButtonText = () => {
    if (isLoading) return 'جاري التحميل...';
    switch (mode) {
      case 'login':
        return 'تسجيل الدخول';
      case 'signup':
        return 'إنشاء الحساب';
      case 'forgot-password':
        return 'إرسال رابط الاستعادة';
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
      {/* Background gradient orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-neon-blue/20 rounded-full blur-[120px] -z-10" />

      <div className="w-full max-w-md">
        <div className="glass rounded-3xl p-8 space-y-8">
          {/* Logo */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Activity className="h-10 w-10 text-neon-purple animate-pulse" />
              <h1 className="text-3xl">
                <span className="font-extrabold gradient-text">نبض</span>
                <span className="font-medium text-foreground/80 mr-1">AI</span>
              </h1>
            </div>
            <p className="text-muted-foreground">{getTitle()}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="displayName">الاسم</Label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="اسمك"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="pr-10 bg-muted/50 border-border/50"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pr-10 bg-muted/50 border-border/50"
                  required
                />
              </div>
            </div>

            {mode !== 'forgot-password' && (
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10 bg-muted/50 border-border/50"
                    required
                  />
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="text-left">
                <button
                  type="button"
                  onClick={() => setMode('forgot-password')}
                  className="text-sm text-neon-purple hover:underline"
                >
                  نسيت كلمة المرور؟
                </button>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 transition-opacity py-6 text-lg"
            >
              {getButtonText()}
            </Button>
          </form>

          {/* Toggle */}
          <div className="text-center space-y-3">
            {mode === 'forgot-password' ? (
              <button
                type="button"
                onClick={() => setMode('login')}
                className="flex items-center justify-center gap-2 mx-auto text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowRight className="h-4 w-4" />
                العودة لتسجيل الدخول
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {mode === 'login' ? 'ليس لديك حساب؟ ' : 'لديك حساب بالفعل؟ '}
                <span className="text-neon-purple font-semibold">
                  {mode === 'login' ? 'سجل الآن' : 'سجل الدخول'}
                </span>
              </button>
            )}
          </div>

          {/* Back to Home */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              العودة للصفحة الرئيسية
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
