-- 1. جدول الأدوات (Tools)
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;

-- حذف السياسات القديمة إن وجدت لتجنب التكرار
DROP POLICY IF EXISTS "Public tools are viewable by everyone" ON tools;

-- سياسة القراءة: الجميع يمكنه رؤية الأدوات المنشورة
CREATE POLICY "Public tools are viewable by everyone" 
ON tools FOR SELECT 
USING (is_published = true);


-- 2. جدول المستخدمين (Profiles)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- القراءة: الجميع يمكنه رؤية الأسماء والصور (لعرض المراجعات)
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

-- التعديل: المستخدم يعدل ملفه الشخصي فقط
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);


-- 3. جدول المفضلة (Bookmarks)
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can insert own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON bookmarks;

-- القراءة: المستخدم يرى مفضلته فقط
CREATE POLICY "Users can view own bookmarks" 
ON bookmarks FOR SELECT 
USING (auth.uid() = user_id);

-- الإضافة/الحذف: المستخدم يتحكم بمفضلته فقط
CREATE POLICY "Users can insert own bookmarks" 
ON bookmarks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" 
ON bookmarks FOR DELETE 
USING (auth.uid() = user_id);


-- 4. جدول المراجعات (Reviews)
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
DROP POLICY IF EXISTS "Users can insert own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews; -- Added just in case, though not in snippet explicitly but header mentioned it

-- القراءة: الجميع يرى المراجعات
CREATE POLICY "Reviews are viewable by everyone" 
ON reviews FOR SELECT 
USING (true);

-- الكتابة: المستخدم يكتب مراجعة بحسابه فقط
CREATE POLICY "Users can insert own reviews" 
ON reviews FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- التعديل/الحذف: المستخدم يعدل مراجعته فقط
CREATE POLICY "Users can update own reviews" 
ON reviews FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" 
ON reviews FOR DELETE 
USING (auth.uid() = user_id);


-- 5. جدول المدونة (Posts)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON posts;

-- القراءة: الجميع يرى المقالات المنشورة
CREATE POLICY "Public posts are viewable by everyone" 
ON posts FOR SELECT 
USING (is_published = true);
