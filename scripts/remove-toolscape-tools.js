import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.resolve(__dirname, "../public/data/tools.json");

const main = () => {
    if (!fs.existsSync(filePath)) {
        console.error(`❌ tools.json not found at: ${filePath}`);
        process.exit(1);
    }

    console.log("📖 Reading tools.json...");
    const raw = fs.readFileSync(filePath, "utf8");
    let data;

    try {
        data = JSON.parse(raw);
    } catch (e) {
        console.error("❌ Error parsing JSON:", e.message);
        process.exit(1);
    }

    if (!Array.isArray(data)) {
        console.error("❌ Invalid format. Expected an array.");
        process.exit(1);
    }

    const initialCount = data.length;
    console.log(`📊 Total tools before cleanup: ${initialCount}`);

    // فلتر لإزالة أدوات Toolscape
    const cleanedData = data.filter(tool => {
        const title = tool.title || "";
        // تحقق مما إذا كانت الأداة هي واحدة من الأدوات الوهمية
        // النمط المستخدم في التوليد هو: "Toolscape AI <number>"
        const isToolscape = /^Toolscape AI \d+$/i.test(title);

        // تحقق إضافي بالرابط إذا لزم الأمر
        const isToolscapeUrl = (tool.url || "").includes("toolscape.ai/tool/");

        return !isToolscape && !isToolscapeUrl;
    });

    const removedCount = initialCount - cleanedData.length;

    if (removedCount === 0) {
        console.log("✨ No Toolscape tools found to remove.");
        return;
    }

    console.log(`🗑️ Removing ${removedCount} fake tools...`);

    fs.writeFileSync(filePath, JSON.stringify(cleanedData, null, 2), "utf8");
    console.log(`✅ Successfully cleaned tools.json!`);
    console.log(`📊 Total tools after cleanup: ${cleanedData.length}`);
};

main();
