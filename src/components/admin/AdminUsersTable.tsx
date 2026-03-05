import { useState, useEffect, useCallback } from 'react';
import { Shield, ShieldCheck, ShieldX, Loader2 } from 'lucide-react';
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
import { useTranslation } from 'react-i18next';

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
  const { t, i18n } = useTranslation();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleChangeUser, setRoleChangeUser] = useState<{ user: UserWithRole; newRole: 'admin' | 'moderator' | 'user' | null } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
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
      const errorMessage = error instanceof Error ? error.message : t('admin.users.fetch_error');
      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
        title: t('admin.users.update_success'),
        description: t('admin.users.update_success_desc', { name: user.display_name || user.email }),
      });

      fetchUsers();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('admin.users.update_error');
      toast({
        title: t('common.error'),
        description: errorMessage,
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
            {t('admin.users.role_admin')}
          </Badge>
        );
      case 'moderator':
        return (
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
            <Shield className="h-3 w-3 ml-1" />
            {t('admin.users.role_moderator')}
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-muted text-muted-foreground">
            {t('admin.users.role_user')}
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
        <h2 className="text-xl font-bold">{t('admin.users.manage_title', { count: users.length })}</h2>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-start">{t('admin.users.col_user')}</TableHead>
              <TableHead className="text-start">{t('admin.users.col_role')}</TableHead>
              <TableHead className="text-start">{t('admin.users.col_joined')}</TableHead>
              <TableHead className="text-start">{t('admin.tools.col_actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{user.display_name || t('admin.users.no_name')}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString(i18n.language === 'ar' ? 'ar-IQ' : 'en-US')}
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
                    <Badge variant="outline" className="text-xs">{t('admin.users.you')}</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Role Change Confirmation */}
      <AlertDialog open={!!roleChangeUser} onOpenChange={() => setRoleChangeUser(null)}>
        <AlertDialogContent dir={i18n.dir()}>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.users.dialog_change_role')}</AlertDialogTitle>
            <AlertDialogDescription>
              {roleChangeUser?.newRole === null
                ? t('admin.users.dialog_remove_desc', { name: roleChangeUser?.user.display_name || roleChangeUser?.user.email })
                : t('admin.users.dialog_grant_desc', {
                  name: roleChangeUser?.user.display_name || roleChangeUser?.user.email,
                  role: roleChangeUser?.newRole === 'admin' ? t('admin.users.role_admin') : t('admin.users.role_moderator')
                })
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRoleChange}
              disabled={isUpdating}
            >
              {isUpdating && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
              {t('admin.users.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsersTable;
