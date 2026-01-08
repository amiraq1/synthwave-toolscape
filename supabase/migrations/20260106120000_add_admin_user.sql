-- إضافة amaralmdarking27@gmail.com كمدير ومالك
-- Add amaralmdarking27@gmail.com as admin/owner

-- أولاً: البحث عن المستخدم بالإيميل وإضافته كأدمن
-- First: Find user by email and add as admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'amaralmdarking27@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- ملاحظة: إذا لم يكن المستخدم مسجلاً بعد، سيتم إضافته تلقائياً عند تسجيل الدخول
-- Note: If user hasn't signed up yet, you can run this after they register
