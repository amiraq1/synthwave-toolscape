import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { useSEO } from '@/hooks/useSEO';

const authSchema = z.object({
  email: z.string().email('يرجى إدخال بريد إلكتروني صالح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

const emailSchema = z.object({
  email: z.string().email('يرجى إدخال بريد إلكتروني صالح'),
});

type AuthMode = 'login' | 'signup' | 'forgot-password';

// دالة مركزية لترجمة أخطاء Supabase إلى رسائل عربية ودية
const getErrorMessage = (error: Error, mode: AuthMode): { message: string; autoSwitchToLogin?: boolean; showSignup: boolean; showLogin: boolean; showForgotPassword: boolean } => {
  const errorMessage = error.message.toLowerCase();

  // أخطاء الاتصال
  if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
    return {
      message: 'تعذر الاتصال بالخادم. تحقق من اتصالك بالإنترنت وحاول مرة أخرى.',
      showSignup: false,
      showLogin: false,
      showForgotPassword: false,
    };
  }

  // بيانات تسجيل دخول خاطئة
  if (errorMessage.includes('invalid login credentials') || errorMessage.includes('invalid credentials')) {
    return {
      message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
      showSignup: true,
      showLogin: false,
      showForgotPassword: true,
    };
  }

  // البريد الإلكتروني مسجل بالفعل
  if (errorMessage.includes('user already registered') || errorMessage.includes('already exists')) {
    return {
      message: 'هذا البريد مسجل بالفعل، جاري تحويلك لتسجيل الدخول...',
      autoSwitchToLogin: true,
      showSignup: false,
      showLogin: true,
      showForgotPassword: true,
    };
  }

  // تجاوز حد المحاولات
  if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
    return {
      message: 'محاولات كثيرة جداً، يرجى الانتظار قليلاً.',
      showSignup: false,
      showLogin: false,
      showForgotPassword: false,
    };
  }

  // البريد غير مُفعّل
  if (errorMessage.includes('email not confirmed')) {
    return {
      message: 'يرجى تفعيل حسابك عبر الرابط المرسل إلى بريدك الإلكتروني.',
      showSignup: false,
      showLogin: false,
      showForgotPassword: false,
    };
  }

  // كلمة مرور ضعيفة
  if (errorMessage.includes('weak password')) {
    return {
      message: 'كلمة المرور ضعيفة جداً. استخدم 6 أحرف على الأقل.',
      showSignup: false,
      showLogin: false,
      showForgotPassword: false,
    };
  }

  // خطأ افتراضي
  return {
    message: `حدث خطأ غير متوقع: ${error.message || 'يرجى المحاولة لاحقاً'}`,
    showSignup: false,
    showLogin: false,
    showForgotPassword: false,
  };
};

const Auth = () => {
  useSEO({
    title: 'تسجيل الدخول',
    description: 'سجل دخولك أو أنشئ حساباً جديداً في نبض - دليل أدوات الذكاء الاصطناعي',
    noIndex: true,
  });
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, signIn, signUp, signInWithGoogle } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showSignupSuggestion, setShowSignupSuggestion] = useState(false);
  const [showLoginSuggestion, setShowLoginSuggestion] = useState(false);
  const [showForgotPasswordSuggestion, setShowForgotPasswordSuggestion] = useState(false);

  // دالة التحقق من صحة البريد الإلكتروني
  const validateEmail = (value: string): string => {
    if (!value.trim()) {
      return 'البريد الإلكتروني مطلوب';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'يرجى إدخال بريد إلكتروني صالح';
    }
    return '';
  };

  // دالة التحقق من صحة كلمة المرور
  const validatePassword = (value: string): string => {
    if (!value) {
      return 'كلمة المرور مطلوبة';
    }
    if (value.length < 6) {
      return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }
    return '';
  };

  // التحقق من صحة النموذج بالكامل
  const isFormValid = (): boolean => {
    const emailValid = validateEmail(email) === '';
    const passwordValid = mode === 'forgot-password' || validatePassword(password) === '';
    return emailValid && passwordValid;
  };

  // معالجة تغيير البريد الإلكتروني
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) {
      setEmailError(validateEmail(value));
    }
  };

  // معالجة فقدان التركيز على حقل البريد
  const handleEmailBlur = () => {
    setEmailError(validateEmail(email));
  };

  // معالجة تغيير كلمة المرور
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (passwordError) {
      setPasswordError(validatePassword(value));
    }
  };

  // معالجة فقدان التركيز على حقل كلمة المرور
  const handlePasswordBlur = () => {
    setPasswordError(validatePassword(password));
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error('حدث خطأ أثناء تسجيل الدخول بـ Google');
      setIsGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setShowSignupSuggestion(false);
    setShowLoginSuggestion(false);
    setShowForgotPasswordSuggestion(false);

    try {
      if (mode === 'forgot-password') {
        const validation = emailSchema.safeParse({ email });
        if (!validation.success) {
          const msg = validation.error.errors[0].message;
          setError(msg);
          toast.error(msg);
          setIsLoading(false);
          return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) throw error;

        toast.success('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
        setMode('login');
        setEmail('');
      } else {
        // Validate email and password
        const validation = authSchema.safeParse({ email, password });
        if (!validation.success) {
          const msg = validation.error.errors[0].message;
          setError(msg);
          toast.error(msg);
          setIsLoading(false);
          return;
        }

        if (mode === 'login') {
          const { error } = await signIn(email, password);
          if (error) throw error;

          toast.success('تم تسجيل الدخول بنجاح! 🚀');
        } else {
          const { error } = await signUp(email, password, displayName || undefined);
          if (error) throw error;

          toast.success('تم إنشاء الحساب! مرحباً بك في نبض');
        }
      }
    } catch (err: unknown) {
      console.error('Authentication Error:', err);
      // Error Handling Logic
      const errorObj = err instanceof Error ? err : new Error('Unknown error');
      const errorResult = getErrorMessage(errorObj, mode);

      // Auto-switch logic (Smart Suggestions)
      if (errorResult.autoSwitchToLogin && mode === 'signup') {
        toast(errorResult.message, { icon: '🔄' });
        setTimeout(() => setMode('login'), 1500);
      } else {
        setError(errorResult.message);
        toast.error(errorResult.message);
      }

      setShowSignupSuggestion(errorResult.showSignup);
      setShowLoginSuggestion(errorResult.showLogin);
      setShowForgotPasswordSuggestion(errorResult.showForgotPassword);
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
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onBlur={handleEmailBlur}
                  className={`pr-10 bg-muted/50 border-border/50 ${emailError ? 'border-red-500 focus:border-red-500' : ''}`}
                  required
                />
              </div>
              {emailError && (
                <p className="text-red-500 text-xs mt-1">{emailError}</p>
              )}
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
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    onBlur={handlePasswordBlur}
                    className={`pr-10 bg-muted/50 border-border/50 ${passwordError ? 'border-red-500 focus:border-red-500' : ''}`}
                    required
                  />
                </div>
                {passwordError && (
                  <p className="text-red-500 text-xs mt-1">{passwordError}</p>
                )}
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
              disabled={isLoading || !isFormValid()}
              className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 transition-opacity py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {getButtonText()}
            </Button>

            {/* Error Message */}
            {error && (
              <div className="text-center mt-3 space-y-2">
                <p className="text-red-500 text-sm font-medium">
                  {error}
                </p>

                {/* اقتراحات الحلول */}
                <div className="flex flex-wrap justify-center gap-2 text-sm">
                  {showSignupSuggestion && (
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className="text-neon-purple hover:underline font-semibold"
                    >
                      أنشئ حساباً جديداً
                    </button>
                  )}

                  {showLoginSuggestion && (
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-neon-purple hover:underline font-semibold"
                    >
                      تسجيل الدخول
                    </button>
                  )}

                  {showForgotPasswordSuggestion && (
                    <>
                      {(showSignupSuggestion || showLoginSuggestion) && (
                        <span className="text-muted-foreground">أو</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setMode('forgot-password')}
                        className="text-neon-blue hover:underline font-semibold"
                      >
                        استعادة كلمة المرور
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </form>

          {/* Google Sign In */}
          {mode !== 'forgot-password' && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background/50 px-2 text-muted-foreground">أو</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full py-6 text-lg border-border/50 hover:bg-muted/50 gap-3"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {isGoogleLoading ? 'جاري التحميل...' : 'المتابعة مع Google'}
              </Button>
            </>
          )}

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
