---
description: خطة تحسين جودة الأدوات المدرجة في موقع نبض
---

# خطة تحسينات جودة موقع نبض

## المرحلة 1: تنظيف البيانات (عاجل)
- [x] إزالة أدوات الاختبار (Test Tools) من قاعدة البيانات ✅ (تم إنشاء migration: 20260105113000_cleanup_duplicate_tools.sql)
- [x] إزالة الأدوات المكررة (ChatGPT المكرر) ✅

## المرحلة 2: تحسين البطاقات (ToolCard)
- [x] وسم "يدعم العربية" مع مقياس جودة الدعم (موجود)
- [x] عرض التقييمات (موجود)
- [x] وسم "جديد" للأدوات الحديثة (موجود)
- [x] وسم "رائج" للأدوات الشائعة (موجود)
- [x] وسم "عرض" للكوبونات (موجود)

## المرحلة 3: إثراء صفحة التفاصيل (ToolDetails)
- [x] تحسين قسم "الميزات الرئيسية" (Key Features) - تصميم بطاقات
- [x] إضافة قسم "حالات الاستخدام" (Use Cases/Tasks)
- [x] إضافة قسم "معلومات التسعير" مع 3 خطط

## المرحلة 4: تحسينات قاعدة البيانات
- [x] السماح بتصنيفات متعددة لكل أداة ✅ (migration: 20260104170000_quality_improvements.sql - secondary_categories)
- [x] إضافة حقل pricing_details (JSON) ✅ (migration: 20260104170000_quality_improvements.sql)
- [x] إضافة حقل use_cases (مصفوفة) ✅ (migration: 20260104170000_quality_improvements.sql - tasks field)

## المرحلة 5: نظام التتبع (مستقبلي)
- [x] تتبع النقرات على الروابط الخارجية ✅ (migration: 20260104170000_quality_improvements.sql - tool_clicks table)
- [x] إحصائيات المشاهدات لكل أداة ✅ (record_tool_click function + tools_with_analytics view)

// turbo-all
