import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { Loader2, Mail, Lock, CircuitBoard, Sparkles, ArrowRight } from "lucide-react";

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const { signIn, signUp, signInWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Redirect after login (default to home)
    const from = searchParams.get("from") || "/";

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        fullName: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await signIn(formData.email, formData.password);
                if (error) throw error;
                toast.success("تم تسجيل الدخول بنجاح!");
                navigate(from);
            } else {
                const { error } = await signUp(formData.email, formData.password, formData.fullName);
                if (error) throw error;
                toast.success("تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني.");
                if (!error) setIsLogin(true);
            }
        } catch (error: any) {
            toast.error("حدث خطأ ما", {
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const { error } = await signInWithGoogle();
            if (error) throw error;
            // Google redirect happens automatically
        } catch (error: any) {
            toast.error("حدث خطأ ما", {
                description: error.message,
            });
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0f0f1a]" dir="rtl">
            <Helmet>
                <title>{isLogin ? "تسجيل الدخول" : "إنشاء حساب"} | نبض AI</title>
            </Helmet>

            {/* Animated Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-neon-purple/20 blur-[120px] rounded-full animate-pulse-slow" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-neon-blue/20 blur-[120px] rounded-full animate-pulse-slow" style={{ animationDelay: "2s" }} />
            </div>

            <div className="w-full max-w-md relative z-10 animate-fade-in">
                <div className="glass-card p-8 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl">
                    {/* Logo & Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-neon-purple to-neon-blue rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-neon-purple/30 group hover:scale-110 transition-transform duration-300">
                            <CircuitBoard className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
                            {isLogin ? "مرحباً بعودتك" : "انضم إلى نبض AI"}
                        </h1>
                        <p className="text-gray-400 text-sm">
                            {isLogin
                                ? "سجل دخولك للوصول إلى أدواتك المفضلة"
                                : "اكتشف عالم الذكاء الاصطناعي معنا"}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div className="space-y-2">
                                <Label htmlFor="fullName" className="text-gray-300">الاسم الكامل</Label>
                                <div className="relative">
                                    <Input
                                        id="fullName"
                                        type="text"
                                        required
                                        placeholder="الاسم الكريم"
                                        className="bg-black/20 border-white/10 text-white pl-10 h-10 focus:border-neon-purple/50 focus:ring-neon-purple/20"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    />
                                    <Sparkles className="w-4 h-4 text-gray-500 absolute top-3 left-3" />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-300">البريد الإلكتروني</Label>
                            <div className="relative">
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    placeholder="name@example.com"
                                    className="bg-black/20 border-white/10 text-left placeholder:text-right text-white pl-10 h-10 focus:border-neon-purple/50 focus:ring-neon-purple/20"
                                    dir="ltr"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                                <Mail className="w-4 h-4 text-gray-500 absolute top-3 left-3" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password" className="text-gray-300">كلمة المرور</Label>
                                {isLogin && (
                                    <Button variant="link" className="p-0 h-auto text-xs text-neon-purple hover:text-neon-purple/80" type="button" onClick={() => navigate('/reset-password')}>
                                        نسيت كلمة المرور؟
                                    </Button>
                                )}
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="bg-black/20 border-white/10 text-left placeholder:text-right text-white pl-10 h-10 focus:border-neon-purple/50 focus:ring-neon-purple/20"
                                    dir="ltr"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <Lock className="w-4 h-4 text-gray-500 absolute top-3 left-3" />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-neon-purple hover:bg-neon-purple/80 text-white h-11 font-medium text-lg shadow-lg shadow-neon-purple/20 mt-4"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? "تسجيل الدخول" : "إنشاء حساب"}
                                    <ArrowRight className="w-5 h-5 mr-2" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#131320] px-2 text-gray-500 rounded-full border border-white/5">أو الاستمرار باستخدام</span>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white h-11"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                    >
                        <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        تسجيل الدخول باستخدام Google
                    </Button>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-gray-400">
                            {isLogin ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}
                        </span>{" "}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-neon-purple hover:underline font-medium hover:text-neon-purple/80 transition-colors"
                        >
                            {isLogin ? "أنشئ حساباً جديداً" : "سجل دخولك"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
