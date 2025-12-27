-- إضافة سياسة للمدراء لقراءة بيانات private_profiles
create policy "Admins can view all private profiles"
on public.private_profiles
for select
using (has_role(auth.uid(), 'admin'::app_role));