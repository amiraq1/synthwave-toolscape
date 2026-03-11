import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Maximize2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface ToolGalleryProps {
    title: string;
    images?: string[]; // مصفوفة روابط الصور (اختياري)
}

/**
 * معرض صور محسّن مع:
 * ✅ Lazy loading للصور المصغرة
 * ✅ Blur-up loading effect
 * ✅ Aspect ratio ثابت (يمنع CLS)
 * ✅ النص البديل الفني (استخدام اسم الأداة كتعويض عند فشل التحميل)
 */
const ToolGallery = ({ title, images = [] }: ToolGalleryProps) => {
    const { t } = useTranslation();
    
    // إذا لم توجد أي صور، نضع قيمة دلالية للإشارة للفشل
    const displayImages = images.length > 0 ? images : ["fallback"];

    const [mainImage, setMainImage] = useState(displayImages[0]);
    const [isLoading, setIsLoading] = useState(mainImage !== "fallback");
    const [failedImages, setFailedImages] = useState<Set<string>>(new Set(images.length === 0 ? ["fallback"] : []));

    const handleImageLoad = useCallback(() => {
        setIsLoading(false);
    }, []);

    const handleImageError = useCallback((imgSrc: string) => {
        setFailedImages(prev => new Set(prev).add(imgSrc));
        setIsLoading(false);
    }, []);

    const handleImageChange = useCallback((img: string) => {
        setIsLoading(!failedImages.has(img));
        setMainImage(img);
    }, [failedImages]);

    // وظيفة لعرض الحرف الأول بطريقة فنية
    const getInitials = (name: string) => {
        return name ? name.substring(0, 2).toUpperCase() : "AI";
    };

    const isMainFailed = failedImages.has(mainImage);

    // المكون الخاص بالصورة المعطلة (Fallback Component)
    const FallbackView = ({ className = "" }: { className?: string }) => (
        <div className={cn(
            "w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-950 text-white p-6 text-center shadow-inner",
            className
        )}>
            <div className="w-20 h-20 mb-4 rounded-3xl bg-gradient-to-tr from-neon-purple to-neon-blue flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.3)]">
                <span className="text-3xl font-bold font-editorial">{getInitials(title)}</span>
            </div>
            <h3 className="text-xl font-bold font-editorial mb-2 line-clamp-1">{title}</h3>
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
                <Zap className="w-3.5 h-3.5 text-neon-purple" />
                <span>Nabd AI Tools Workspace</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-4">
            {/* 1. الصورة الرئيسية الكبيرة مع aspect-ratio ثابت */}
            <Dialog>
                <DialogTrigger asChild>
                    <div className={cn(
                        "relative group aspect-video rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 cursor-zoom-in flex items-center justify-center",
                        isMainFailed && "cursor-default border-zinc-800"
                    )}>
                        {/* Blur placeholder أثناء التحميل */}
                        {isLoading && !isMainFailed && (
                            <div
                                className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 to-neon-blue/5 animate-pulse z-10"
                                aria-hidden="true"
                            />
                        )}

                        {isMainFailed ? (
                            <FallbackView />
                        ) : (
                            <>
                                <img
                                    src={mainImage}
                                    alt={title}
                                    className={cn(
                                        "w-full h-full object-cover transition-all duration-700 group-hover:scale-105",
                                        isLoading ? "opacity-0 blur-sm scale-110" : "opacity-100 blur-0 scale-100"
                                    )}
                                    onLoad={handleImageLoad}
                                    onError={() => handleImageError(mainImage)}
                                    loading="eager"
                                    decoding="async"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 backdrop-blur-[2px]">
                                    <Maximize2 className="text-white w-10 h-10 drop-shadow-2xl opacity-80" />
                                </div>
                            </>
                        )}
                    </div>
                </DialogTrigger>

                {/* نافذة التكبير (Modal) - فقط إذا لم تفشل الصورة */}
                {!isMainFailed && (
                    <DialogContent className="max-w-5xl bg-black/95 border-white/10 p-1 shadow-2xl" aria-describedby={undefined}>
                        {/* عناصر مساعدة للوصول (Screen Readers) مخفية بصرياً لتجنب تغيير التصميم */}
                        <DialogTitle className="sr-only">{t('tool.gallery_title_sr', { title })}</DialogTitle>
                        <DialogDescription className="sr-only">{t('tool.gallery_desc_sr', { title })}</DialogDescription>

                        <img
                            src={mainImage}
                            alt={title}
                            className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
                            loading="eager"
                        />
                    </DialogContent>
                )}
            </Dialog>

            {/* 2. الصور المصغرة (Thumbnails) مع lazy loading - إخفاءها إذا كانت صورة واحدة وفاشلة */}
            {displayImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-3 pt-1 scrollbar-hide px-1">
                    {displayImages.map((img, idx) => {
                        const isThisFailed = failedImages.has(img);
                        const isSelected = mainImage === img;

                        return (
                            <button
                                key={idx}
                                onClick={() => handleImageChange(img)}
                                className={cn(
                                    "relative w-24 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 flex-shrink-0 flex items-center justify-center bg-zinc-900",
                                    isSelected
                                        ? "border-neon-purple shadow-[0_0_15px_rgba(124,58,237,0.4)] scale-105"
                                        : "border-white/5 opacity-60 hover:opacity-100 hover:border-white/20 hover:scale-100 scale-95"
                                )}
                            >
                                {isThisFailed ? (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900 border border-t-white/10">
                                        <span className="text-xs font-bold text-zinc-500">{getInitials(title)}</span>
                                    </div>
                                ) : (
                                    <img
                                        src={img}
                                        alt={`Thumbnail ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                        decoding="async"
                                        onError={() => handleImageError(img)}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ToolGallery;
