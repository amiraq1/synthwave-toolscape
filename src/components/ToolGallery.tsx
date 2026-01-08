import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Maximize2, Image as ImageIcon } from "lucide-react";

interface ToolGalleryProps {
    title: string;
    images?: string[]; // مصفوفة روابط الصور (اختياري)
}

const ToolGallery = ({ title, images = [] }: ToolGalleryProps) => {
    // صور افتراضية للتجربة إذا لم تكن هناك صور حقيقية في قاعدة البيانات
    const displayImages = images.length > 0 ? images : [
        "https://images.unsplash.com/photo-1620712943543-bcc4688e7485", // Placeholder 1
        "https://images.unsplash.com/photo-1611162617474-5b21e879e113", // Placeholder 2
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c"  // Placeholder 3
    ];

    const [mainImage, setMainImage] = useState(displayImages[0]);

    return (
        <div className="space-y-4">
            {/* 1. الصورة الرئيسية الكبيرة */}
            <Dialog>
                <DialogTrigger asChild>
                    <div className="relative group aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black/20 cursor-zoom-in">
                        <img
                            src={mainImage}
                            alt={title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Maximize2 className="text-white w-8 h-8 drop-shadow-lg" />
                        </div>
                    </div>
                </DialogTrigger>

                {/* نافذة التكبير (Modal) */}
                <DialogContent className="max-w-4xl bg-black/90 border-white/10 p-1">
                    <img src={mainImage} alt={title} className="w-full h-auto rounded-lg" />
                </DialogContent>
            </Dialog>

            {/* 2. الصور المصغرة (Thumbnails) */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {displayImages.map((img, idx) => (
                    <button
                        key={idx}
                        onClick={() => setMainImage(img)}
                        className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${mainImage === img ? "border-neon-purple shadow-[0_0_10px_rgba(124,58,237,0.5)]" : "border-white/10 opacity-70 hover:opacity-100"
                            }`}
                    >
                        <img src={img} alt={`Screenshot ${idx}`} className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ToolGallery;
