import { useState, useEffect, useCallback } from 'react';
import { Shield, ShieldCheck, ShieldX, Loader2, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

// تعريف الواجهات
interface UserWithRole {
  id: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
  role: 'admin' | 'moderator' | 'user' | null;
}

interface AdminUserRpcResponse {
  user_id: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
  role: 'admin' | 'moderator' | 'user' | null;
}

const AdminUsersTable = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // 🔍 إضافة حالة للبحث
  const [roleChangeUser, setRoleChangeUser] = useState<{ user: UserWithRole; newRole: 'admin' | 'moderator' | 'user' | null } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // جلب المستخدمين
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      // ⚠️ تأكد أن الدالة admin_get_users موجودة في قاعدة البيانات
      const { data: users, error } = await supabase.rpc('admin_get_users');

      if (error) throw error;

      const usersWithRoles: UserWithRole[] = ((users || []) as AdminUserRpcResponse[]).map((user) => ({
        id: user.user_id,
        email: user.email || null,
        display_name: user.display_name,
        created_at: user.created_at,
        role: user.role || null,
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'فشل في جلب المستخدمين';
      toast.error('خطأ', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // تصفية المستخدمين بناءً على البحث
  const filteredUsers = users.filter(user =>
    (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (user.display_name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  // تغيير الصلاحية
  const handleRoleChange = async () => {
    if (!roleChangeUser) return;

    const { user, newRole } = roleChangeUser;
    setIsUpdating(true);

    try {
      // Use SECURITY DEFINER RPC to avoid direct RLS conflicts on user_roles.
      const { error } = await supabase.rpc('admin_set_user_role', {
        p_user_id: user.id,
        p_role: newRole,
      });
      if (error) throw error;

      toast.success('تم التحديث', {
        description: `تم تحديث صلاحيات ${user.display_name || user.email}`,
      });

      fetchUsers(); // تحديث القائمة
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'فشل في تحديث الصلاحيات';
      toast.error('خطأ', {
        description: errorMessage,
      });
    } finally {
      setIsUpdating(false);
      setRoleChangeUser(null);
    }
  };

  // شارات الأدوار
  const getRoleBadge = (role: string | null) => {
    switch (role) {
      case 'admin':
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 gap-1 hover:bg-red-500/30">
            <ShieldCheck className="h-3 w-3" />
            مدير
          </Badge>
        );
      case 'moderator':
        return (
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 gap-1 hover:bg-amber-500/30">
            <Shield className="h-3 w-3" />
            مشرف
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-white/10 text-gray-400 gap-1">
            <User className="h-3 w-3" />
            مستخدم
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-neon-purple" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* رأس الجدول والبحث */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/20 p-4 rounded-xl border border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-neon-purple/10 rounded-lg">
            <Shield className="w-5 h-5 text-neon-purple" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-200">إدارة المستخدمين</h2>
            <p className="text-xs text-gray-500">إدارة الصلاحيات والأدوار ({users.length})</p>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="بحث بالاسم أو البريد..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-9 bg-black/40 border-white/10 focus-visible:ring-neon-purple/50"
          />
        </div>
      </div>

      {/* الجدول */}
      <div className="rounded-xl border border-white/10 overflow-hidden bg-black/20 backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="hover:bg-transparent border-white/5">
              <TableHead className="text-right">المستخدم</TableHead>
              <TableHead className="text-right">الصلاحية</TableHead>
              <TableHead className="text-right">تاريخ التسجيل</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="border-white/5 hover:bg-white/[0.02]">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-xs font-bold border border-white/10">
                        {user.display_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-200">{user.display_name || 'بدون اسم'}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell className="text-sm text-gray-500 dir-ltr text-right">
                    {new Date(user.created_at).toLocaleDateString('en-GB')}
                  </TableCell>
                  <TableCell>
                    {user.id !== currentUser?.id ? (
                      <div className="flex items-center gap-1">
                        {user.role !== 'admin' && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                            onClick={() => setRoleChangeUser({ user, newRole: 'admin' })}
                            title="ترقية لمدير"
                          >
                            <ShieldCheck className="h-4 w-4" />
                          </Button>
                        )}
                        {user.role !== 'moderator' && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10"
                            onClick={() => setRoleChangeUser({ user, newRole: 'moderator' })}
                            title="ترقية لمشرف"
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                        )}
                        {user.role && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10"
                            onClick={() => setRoleChangeUser({ user, newRole: null })}
                            title="إزالة الصلاحيات"
                          >
                            <ShieldX className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Badge variant="outline" className="border-white/10 text-gray-500 text-xs font-normal">
                        حسابك الحالي
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <User className="w-8 h-8 opacity-20" />
                    <p>لا يوجد مستخدمين مطابقين للبحث</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* نافذة تأكيد تغيير الصلاحية */}
      <AlertDialog open={!!roleChangeUser} onOpenChange={(open) => !open && setRoleChangeUser(null)}>
        <AlertDialogContent className="border-neon-purple/20 bg-black/90 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>تغيير صلاحيات المستخدم</AlertDialogTitle>
            <AlertDialogDescription>
              {roleChangeUser?.newRole ? (
                <>
                  هل أنت متأكد من ترقية <b>{roleChangeUser.user.display_name}</b> إلى رتبة
                  <span className={`mx-1 font-bold ${roleChangeUser.newRole === 'admin' ? 'text-red-400' : 'text-amber-400'}`}>
                    {roleChangeUser.newRole === 'admin' ? 'مدير' : 'مشرف'}
                  </span>
                  ؟ سيمنحه هذا صلاحيات واسعة في النظام.
                </>
              ) : (
                <>
                  هل أنت متأكد من إزالة جميع الصلاحيات الإدارية من <b>{roleChangeUser?.user.display_name}</b>؟
                  سيعود ليصبح مستخدماً عادياً.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 hover:bg-white/5 hover:text-white">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRoleChange}
              disabled={isUpdating}
              className="bg-neon-purple hover:bg-neon-purple/80 text-white"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'تأكيد التغيير'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsersTable;
