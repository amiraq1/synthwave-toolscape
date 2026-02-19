import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock, Eye } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import dayjs from "dayjs";
import 'dayjs/locale/en';
dayjs.locale('en');

interface BlogPost {
    id: string;
    title: string;
    excerpt?: string | null; // المقتطف القصير
    content?: string; // المحتوى الكامل (احتياطي)
    created_at: string;
    image_url?: string | null;
    reading_time?: number; // وقت القراءة (اختياري)
    views_count?: number;
}

interface BlogCardProps {
    post: BlogPost;
}

const BlogCard = ({ post }: BlogCardProps) => {
    // استخدام المقتطف إذا وجد، أو أخذ أول 100 حرف من المحتوى
    const summary = post.excerpt || post.content?.substring(0, 120) + "..." || "";

    return (
        <article className="group relative flex flex-col h-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-neon-purple/50 hover:shadow-[0_0_20px_rgba(124,58,237,0.1)] hover:-translate-y-1">

            {/* صورة المقال (اختياري) */}
            {post.image_url && (
                <div className="w-full overflow-hidden rounded-md bg-muted">
                    <AspectRatio ratio={16 / 9}>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                        <img
                            src={post.image_url}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                        />
                    </AspectRatio>
                </div>
            )}

            <div className="flex-1 p-6 flex flex-col">
                {/* معلومات التاريخ */}
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{dayjs(post.created_at).locale('en').format("D MMMM YYYY")}</span>
                    </div>
                    {post.reading_time && (
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{post.reading_time} min read</span>
                        </div>
                    )}
                    {typeof post.views_count === 'number' && (
                        <div className="flex items-center gap-1">
                            {/* Eye icon imported from lucide-react? Need to check imports */}
                            <Eye className="w-3 h-3" />
                            <span>{post.views_count}</span>
                        </div>
                    )}
                </div>

                {/* العنوان */}
                <h3 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-neon-purple transition-colors">
                    <Link to={`/blog/${post.id}`}>
                        {post.title}
                    </Link>
                </h3>

                {/* المقتطف */}
                <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-1">
                    {summary}
                </p>

                {/* زر قراءة المزيد المحسن */}
                <Link
                    to={`/blog/${post.id}`}
                    className="inline-flex items-center gap-2 text-neon-purple font-semibold text-sm transition-all group/link"
                >
                    <span>Read more</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-[5px]" />
                </Link>
            </div>
        </article>
    );
};

export default BlogCard;

