import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import satori from "https://esm.sh/satori@0.10.11";
import { Resvg } from "https://esm.sh/@resvg/resvg-wasm@2.4.1";
import { loadFont } from "./font.ts";

const fontData = await loadFont();

serve(async (req) => {
    const url = new URL(req.url);
    // قراءة المتغيرات من الرابط (مثال: ?title=ChatGPT&category=برمجة)
    const title = url.searchParams.get("title") || "نبض AI";
    const category = url.searchParams.get("category") || "دليل أدوات الذكاء الاصطناعي";
    // تصميم الصورة باستخدام JSX (شبيه بـ React)
    // هذا التصميم يستخدم ألوان الثيم الخاص بنا (الأسود والبنفسجي)
    const jsx = {
        type: "div",
        props: {
            style: {
                height: "100%",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundImage: "linear-gradient(to bottom right, #0f0f1a, #1a1a2e)",
                color: "white",
                fontFamily: '"Cairo"',
                padding: "40px",
                textAlign: "center",
                position: "relative",
            },
            children: [
                // خلفية شبكية خفيفة
                {
                    type: "div",
                    props: {
                        style: {
                            position: "absolute",
                            inset: 0,
                            backgroundImage: "radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.05) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.05) 2%, transparent 0%)",
                            backgroundSize: "100px 100px",
                            pointerEvents: "none",
                        }
                    }
                },
                // الشعار الصغير في الأعلى
                {
                    type: "div",
                    props: {
                        style: {
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            marginBottom: "40px",
                            fontSize: "24px",
                            fontWeight: "bold",
                        },
                        children: [
                            {
                                type: "span",
                                props: {
                                    style: { color: "#7c3aed" }, // neon-purple
                                    children: "نبض",
                                },
                            },
                            "AI",
                        ],
                    },
                },
                // العنوان الرئيسي (اسم الأداة أو المقال)
                {
                    type: "h1",
                    props: {
                        style: {
                            fontSize: "72px",
                            fontWeight: "bold",
                            margin: "0 0 20px 0",
                            lineHeight: 1.1,
                            textShadow: "0 0 30px rgba(124,58,237,0.5)",
                            backgroundImage: "linear-gradient(to right, #fff, #a78bfa)",
                            backgroundClip: "text",
                            color: "transparent",
                        },
                        children: title,
                    },
                },
                // التصنيف أو الوصف القصير
                {
                    type: "p",
                    props: {
                        style: {
                            fontSize: "32px",
                            color: "#9ca3af", // gray-400
                            backgroundColor: "rgba(124,58,237,0.1)",
                            padding: "10px 30px",
                            borderRadius: "50px",
                            border: "1px solid rgba(124,58,237,0.3)",
                        },
                        children: category,
                    },
                },
            ],
        },
    };

    // 1. تحويل JSX إلى SVG باستخدام Satori
    const svg = await satori(jsx, {
        width: 1200, // الحجم القياسي لصور الشبكات الاجتماعية
        height: 630,
        fonts: [
            {
                name: "Cairo",
                data: fontData,
                weight: 700,
                style: "normal",
            },
        ],
    });

    // 2. تحويل SVG إلى PNG باستخدام Resvg (لأن بعض المنصات لا تدعم SVG)
    const resvg = new Resvg(svg, {
        fitTo: {
            mode: 'width',
            value: 1200,
        }
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    // 3. إرجاع الصورة
    return new Response(pngBuffer, {
        headers: {
            "Content-Type": "image/png",
            "Cache-Control": "public, max-age=31536000, immutable", // تخزين مؤقت طويل جداً
        },
    });
});
