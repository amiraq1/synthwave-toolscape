import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { isValidImageUrl } from "@/utils/imageUrl";
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
 * ✅ Progressive image loading
 */
const ToolGallery = ({ title, images = [] }: ToolGalleryProps) => {
    const { i18n } = useTranslation();
    const isAr = i18n.language === "ar";
    const validImages = images.filter(isValidImageUrl);

    // صور افتراضية للتجربة إذا لم تكن هناك صور حقيقية في قاعدة البيانات
    const displayImages = validImages.length > 0 ? validImages : [
        `https://placehold.co/1200x800/0f0f1a/6b7280?text=${encodeURIComponent(title)}`,
    ];

    const [mainImage, setMainImage] = useState(displayImages[0]);
    const [isLoading, setIsLoading] = useState(true);

    const handleImageLoad = useCallback(() => {
        setIsLoading(false);
    }, []);

    const handleImageChange = useCallback((img: string) => {
        setIsLoading(true);
        setMainImage(img);
    }, []);

    return (
        <div className="space-y-4">
            {/* 1. الصورة الرئيسية الكبيرة مع aspect-ratio ثابت */}
            <Dialog>
                <DialogTrigger asChild>
                    <div className="relative group aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black/20 cursor-zoom-in">
                        {/* Blur placeholder أثناء التحميل */}
                        {isLoading && (
                            <div
                                className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 to-neon-blue/5 animate-pulse"
                                aria-hidden="true"
                            />
                        )}

                        <img
                            src={mainImage}
                            alt={title}
                            className={cn(
                                "w-full h-full object-cover transition-all duration-500 group-hover:scale-105",
                                isLoading ? "opacity-0" : "opacity-100"
                            )}
                            onLoad={handleImageLoad}
                            loading="eager"
                            decoding="async"
                        />

                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Maximize2 className="text-white w-8 h-8 drop-shadow-lg" />
                        </div>
                    </div>
                </DialogTrigger>

                {/* نافذة التكبير (Modal) */}
                <DialogContent className="max-w-4xl bg-black/90 border-white/10 p-1">
                    <DialogTitle className="sr-only">
                        {isAr ? `معرض صور ${title}` : `${title} Image Gallery`}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        {isAr ? "عرض مكبر للصورة المختارة من معرض الأداة" : "Expanded view for the selected gallery image"}
                    </DialogDescription>
                    <img
                        src={mainImage}
                        alt={title}
                        className="w-full h-auto rounded-lg"
                        loading="eager"
                    />
                </DialogContent>
            </Dialog>

            {/* 2. الصور المصغرة (Thumbnails) مع lazy loading */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {displayImages.map((img, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleImageChange(img)}
                        className={cn(
                            "relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0",
                            mainImage === img
                                ? "border-neon-purple shadow-[0_0_10px_rgba(124,58,237,0.5)]"
                                : "border-white/10 opacity-70 hover:opacity-100"
                        )}
                    >
                        <img
                            src={img}
                            alt={`Screenshot ${idx + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                        />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ToolGallery;
