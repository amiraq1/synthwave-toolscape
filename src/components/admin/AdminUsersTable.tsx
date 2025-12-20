import { useState, useEffect } from 'react';
import { Shield, ShieldCheck, ShieldX, Loader2, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface UserWithRole {
  id: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
  role: 'admin' | 'moderator' | 'user' | null;
}

const AdminUsersTable = () => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleChangeUser, setRoleChangeUser] = useState<{user: UserWithRole; newRole: 'admin' | 'moderator' | 'user' | null} | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine data
      const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.id);
        return {
          id: profile.id,
          email: profile.email,
          display_name: profile.display_name,
          created_at: profile.created_at,
          role: userRole?.role || null,
        };
      });

      setUsers(usersWithRoles);
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: 'فشل في جلب المستخدمين',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async () => {
    if (!roleChangeUser) return;
    
    const { user, newRole } = roleChangeUser;
    setIsUpdating(true);

    try {
      if (newRole === null) {
        // Remove role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else if (user.role === null) {
        // Insert new role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: user.id, role: newRole });
        
        if (error) throw error;
      } else {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({ role: newRole })
          .eq('user_id', user.id);
        
        if (error) throw error;
      }

      toast({
        title: 'تم التحديث',
        description: `تم تحديث صلاحيات ${user.display_name || user.email}`,
      });
      
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في تحديث الصلاحيات',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
      setRoleChangeUser(null);
    }
  };

  const getRoleBadge = (role: string | null) => {
    switch (role) {
      case 'admin':
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <ShieldCheck className="h-3 w-3 ml-1" />
            مدير
          </Badge>
        );
      case 'moderator':
        return (
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
            <Shield className="h-3 w-3 ml-1" />
            مشرف
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-muted text-muted-foreground">
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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">إدارة المستخدمين ({users.length})</h2>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-right">المستخدم</TableHead>
              <TableHead className="text-right">الصلاحية</TableHead>
              <TableHead className="text-right">تاريخ التسجيل</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{user.display_name || 'بدون اسم'}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString('ar-IQ')}
                </TableCell>
                <TableCell>
                  {user.id !== currentUser?.id ? (
                    <div className="flex items-center gap-1">
                      {user.role !== 'admin' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-400 hover:bg-red-500/10"
                          onClick={() => setRoleChangeUser({ user, newRole: 'admin' })}
                        >
                          <ShieldCheck className="h-4 w-4" />
                        </Button>
                      )}
                      {user.role !== 'moderator' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-amber-400 hover:text-amber-400 hover:bg-amber-500/10"
                          onClick={() => setRoleChangeUser({ user, newRole: 'moderator' })}
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                      )}
                      {user.role && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => setRoleChangeUser({ user, newRole: null })}
                        >
                          <ShieldX className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-xs">أنت</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Role Change Confirmation */}
      <AlertDialog open={!!roleChangeUser} onOpenChange={() => setRoleChangeUser(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تغيير الصلاحيات</AlertDialogTitle>
            <AlertDialogDescription>
              {roleChangeUser?.newRole === null
                ? `هل تريد إزالة جميع الصلاحيات من "${roleChangeUser?.user.display_name || roleChangeUser?.user.email}"؟`
                : `هل تريد منح "${roleChangeUser?.user.display_name || roleChangeUser?.user.email}" صلاحية ${
                    roleChangeUser?.newRole === 'admin' ? 'المدير' : 'المشرف'
                  }؟`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRoleChange}
              disabled={isUpdating}
            >
              {isUpdating && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
              تأكيد
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsersTable;
