-- إضافة عمود is_published لجدول tools
-- Add is_published column to tools table for draft functionality

ALTER TABLE public.tools 
ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT true;

-- تعليق: الأدوات الموجودة تبقى منشورة، الأدوات الجديدة من auto-draft تكون مسودة
COMMENT ON COLUMN public.tools.is_published IS 'Draft tools are false, published tools are true';

-- تحديث سياسة القراءة للأدوات: المستخدمون العاديون يرون فقط المنشورة
-- Update RLS: Regular users only see published tools
DROP POLICY IF EXISTS "Anyone can view tools" ON public.tools;

CREATE POLICY "Anyone can view published tools"
ON public.tools
FOR SELECT
USING (is_published = true OR public.has_role(auth.uid(), 'admin'));

-- المدراء يمكنهم رؤية كل الأدوات (منشورة ومسودات)
-- Admins can see all tools (published and drafts)
