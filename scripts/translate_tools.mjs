import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://pzpplippcdmkmwnzmdbr.supabase.co";
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_LrMo9PCEEA3mhoJiHfySQA_H3fAylDZ";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ترجمة مجانية عبر Google Translate (بدون API key)
async function translateText(text) {
    if (!text || text.trim() === '') return text;
    if (/[\u0600-\u06FF]/.test(text.substring(0, 20))) return text; // already Arabic

    const encoded = encodeURIComponent(text.substring(0, 500)); // حد 500 حرف
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=${encoded}`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data && data[0]) {
            return data[0].map(s => s[0]).join('');
        }
        return text;
    } catch (err) {
        console.error(`   ⚠️ خطأ ترجمة: ${err.message}`);
        return text;
    }
}

async function main() {
    console.log('🚀 بدء ترجمة أوصاف الأدوات (Google Translate مجاني)...\n');

    const { count } = await supabase
        .from('tools')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);

    console.log(`📊 إجمالي الأدوات: ${count}`);

    const BATCH_SIZE = 50;
    let offset = 0;
    let totalTranslated = 0;
    let totalSkipped = 0;

    while (offset < count) {
        const { data: tools, error } = await supabase
            .from('tools')
            .select('id, title, description')
            .eq('is_published', true)
            .range(offset, offset + BATCH_SIZE - 1);

        if (error || !tools || tools.length === 0) break;

        const englishTools = tools.filter(t =>
            t.description && !/[\u0600-\u06FF]/.test(t.description.substring(0, 20))
        );
        totalSkipped += (tools.length - englishTools.length);

        if (englishTools.length > 0) {
            const batchNum = Math.floor(offset / BATCH_SIZE) + 1;
            process.stdout.write(`📦 دفعة ${batchNum} (${offset}+${tools.length}): ترجمة ${englishTools.length} أداة...`);

            let batchTranslated = 0;
            for (const tool of englishTools) {
                const translated = await translateText(tool.description);
                if (translated !== tool.description) {
                    const { error: upErr } = await supabase
                        .from('tools')
                        .update({ description: translated })
                        .eq('id', tool.id);

                    if (!upErr) {
                        batchTranslated++;
                        totalTranslated++;
                    }
                }
                // تأخير بسيط لتجنب الحظر
                await new Promise(r => setTimeout(r, 200));
            }
            console.log(` ✅ ${batchTranslated}`);
        }

        offset += BATCH_SIZE;
    }

    console.log(`\n🎉 انتهت العملية!`);
    console.log(`   ✅ تم ترجمة: ${totalTranslated}`);
    console.log(`   ⏭️ تم تخطي (عربي بالفعل): ${totalSkipped}`);
}

main().catch(console.error);
