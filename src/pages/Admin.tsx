import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Settings, Wrench, Users, Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import AdminToolsTable from '@/components/admin/AdminToolsTable';
import AdminUsersTable from '@/components/admin/AdminUsersTable';
import { useSEO } from '@/hooks/useSEO';

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
              العودة
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <Tabs defaultValue="tools" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto">
            <TabsTrigger value="tools" className="gap-2">
              <Wrench className="h-4 w-4" />
              الأدوات
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              المستخدمين
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tools" className="glass rounded-xl p-6">
            <AdminToolsTable />
          </TabsContent>

          <TabsContent value="users" className="glass rounded-xl p-6">
            <AdminUsersTable />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
