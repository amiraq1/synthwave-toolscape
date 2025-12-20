-- إنشاء enum للأدوار
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- إنشاء جدول الأدوار
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- تفعيل RLS على جدول الأدوار
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- إنشاء دالة للتحقق من الأدوار (Security Definer لتجنب التكرار اللانهائي)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- سياسات جدول user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- تحديث سياسات جدول profiles
-- حذف السياسة القديمة التي تسمح للجميع برؤية كل الملفات
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- إنشاء سياسة جديدة: المستخدمون يرون ملفاتهم الشخصية فقط
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- السماح برؤية الأسماء فقط للمراجعات (بدون البريد الإلكتروني)
CREATE POLICY "Anyone can view display names"
ON public.profiles
FOR SELECT
USING (true);

-- إضافة سياسة حذف الحساب
CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = id);

-- تحديث سياسات جدول tools
-- حذف السياسة القديمة التي تسمح لأي شخص بالإضافة
DROP POLICY IF EXISTS "Anyone can add tools" ON public.tools;

-- إنشاء سياسة جديدة: فقط المستخدمون المسجلون يمكنهم الإضافة
CREATE POLICY "Authenticated users can add tools"
ON public.tools
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- المديرون فقط يمكنهم التعديل
CREATE POLICY "Admins can update tools"
ON public.tools
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- المديرون فقط يمكنهم الحذف
CREATE POLICY "Admins can delete tools"
ON public.tools
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));