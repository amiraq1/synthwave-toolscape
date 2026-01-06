import { useAuth } from '@/hooks/useAuth';

const Admin = () => {
  useSEO({
    title: 'لوحة التحكم',
    description: 'لوحة تحكم المشرفين لإدارة أدوات الذكاء الاصطناعي والمستخدمين',
    noIndex: true,
  });
  const navigate = useNavigate();
  const { isAdmin, loading } = useAdminCheck();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-neon-purple mx-auto" />
          <p className="text-muted-foreground">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="text-center space-y-4">
          <ShieldAlert className="h-16 w-16 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">غير مصرح</h1>
          <p className="text-muted-foreground">ليس لديك صلاحية الوصول لهذه الصفحة</p>
          <Button onClick={() => navigate('/')}>
            العودة للرئيسية
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6 text-neon-purple" />
              <h1 className="text-xl font-bold">لوحة التحكم</h1>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowRight className="h-5 w-5" />
                const { user, session } = useAuth();
                const ADMIN_EMAIL = "amaralmdarking27@gmail.com"; // ايميل الأدمن

                if (!session || !user || user.email !== ADMIN_EMAIL) {
                  return (
                    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
                      <h1 className="text-3xl font-bold text-red-500 mb-2">⛔ دخول غير مصرح به</h1>
                      <p className="text-gray-400">هذه المنطقة مخصصة للمشرفين فقط.</p>
                      <Button className="mt-4" onClick={() => window.location.href = '/'}>
                        العودة للرئيسية
                      </Button>
                    </div>
                  );
                }
      {/* Main Content */}
