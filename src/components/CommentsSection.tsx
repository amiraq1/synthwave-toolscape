import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from 'sonner';
import dayjs from "dayjs";
import 'dayjs/locale/ar';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Send, Trash2, Loader2, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getValidImageUrl } from "@/utils/imageUrl";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Comment {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    user?: {
        id: string;
        display_name: string | null;
        avatar_url: string | null;
    };
}

interface CommentsSectionProps {
    postId: string;
}

const CommentsSection = ({ postId }: CommentsSectionProps) => {
    const { i18n } = useTranslation();
    const isAr = i18n.language === 'ar';
    const [newComment, setNewComment] = useState("");
    const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // جلب التعليقات
    const { data: comments, isLoading } = useQuery({
        queryKey: ["post-comments", postId],
        queryFn: async () => {
            interface CommentRow {
                id: string;
                content: string;
                created_at: string;
                user_id: string;
            }
            const { data, error } = await supabase
                .from("post_comments")
                .select(`
          id,
          content,
          created_at,
          user_id
        `)
                .eq("post_id", postId)
                .order("created_at", { ascending: false });

            if (error) throw error;

            return ((data || []) as CommentRow[]).map((comment) => ({
                ...comment,
                user: { id: comment.user_id, display_name: null, avatar_url: null }
            })) as Comment[];
        },
    });

    // إضافة تعليق
    const addMutation = useMutation({
        mutationFn: async (content: string) => {
            if (!user?.id) throw new Error("User not found");
            const { error } = await supabase
                .from("post_comments")
                .insert({
                    post_id: postId,
                    user_id: user.id,
                    content,
                });
            if (error) throw error;
        },
        onSuccess: () => {
            setNewComment("");
            queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
              toast.success(isAr ? "✅ تم إضافة التعليق" : "✅ Comment added");
        },
        onError: () => {
              toast.error(isAr ? "خطأ" : "Error", {
                  description: isAr ? "فشل في إضافة التعليق" : "Failed to add comment",
              });
        },
    });

    // حذف تعليق
    const deleteMutation = useMutation({
        mutationFn: async (commentId: string) => {
            const { error } = await supabase
                .from("post_comments")
                .delete()
                .eq("id", commentId);
            if (error) throw error;
        },
        onSuccess: () => {
            setCommentToDelete(null);
            queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
              toast.success(isAr ? "🗑️ تم حذف التعليق" : "🗑️ Comment deleted");
        },
        onError: () => {
            toast.error(isAr ? "خطأ" : "Error", {
                description: isAr ? "فشل في حذف التعليق" : "Failed to delete comment",
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim()) {
            addMutation.mutate(newComment.trim());
        }
    };

    return (
        <section className="mt-16 pt-8 border-t border-white/10">
            {/* العنوان */}
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-neon-purple/10 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-neon-purple" />
                </div>
                <h2 className="text-xl font-bold text-white">
                    {isAr ? "التعليقات" : "Comments"} ({comments?.length || 0})
                </h2>
            </div>

            {/* نموذج إضافة تعليق */}
            {user ? (
                <form onSubmit={handleSubmit} className="mb-8">
                    <div className="flex gap-3">
                        <Avatar className="w-10 h-10 shrink-0">
                            <AvatarImage src={getValidImageUrl(user.user_metadata?.avatar_url) || undefined} />
                            <AvatarFallback className="bg-neon-purple/20 text-neon-purple">
                                <User className="w-5 h-5" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-3">
<Textarea
                                  value={newComment}
                                  onChange={(e) => setNewComment(e.target.value)}
                                  placeholder={isAr ? "اكتب تعليقك هنا..." : "Write your comment here..."}
                                  className="min-h-[100px] bg-white/5 border-white/10 focus:border-neon-purple/50 resize-none"
                                  dir={isAr ? "rtl" : "ltr"}
                              />
                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={!newComment.trim() || addMutation.isPending}
                                    className="bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 gap-2"
                                >
                                    {addMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                    {isAr ? "إرسال التعليق" : "Post Comment"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="mb-8 p-6 bg-white/5 border border-white/10 rounded-xl text-center">
                    <p className="text-gray-400 mb-3">
                        {isAr ? "يجب تسجيل الدخول لإضافة تعليق" : "You need to sign in to add a comment"}
                    </p>
                    <Button asChild variant="outline" className="border-neon-purple/50 hover:bg-neon-purple/10">
                        <Link to="/auth">{isAr ? "تسجيل الدخول" : "Sign in"}</Link>
                    </Button>
                </div>
            )}

            {/* قائمة التعليقات */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-neon-purple" />
                    </div>
                ) : comments?.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>{isAr ? "لا توجد تعليقات بعد" : "No comments yet"}</p>
                        <p className="text-sm mt-1">{isAr ? "كن أول من يعلق!" : "Be the first to comment!"}</p>
                    </div>
                ) : (
                    comments?.map((comment) => (
                        <article
                            key={comment.id}
                            className="group p-4 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-colors"
                        >
                            <div className="flex gap-3">
                                <Avatar className="w-10 h-10 shrink-0">
                                    <AvatarImage src={getValidImageUrl(comment.user?.avatar_url) || undefined} />
                                    <AvatarFallback className="bg-neon-purple/20 text-neon-purple text-sm">
                                        {comment.user?.display_name?.charAt(0)?.toUpperCase() || "؟"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold text-white">
                                                {comment.user?.display_name || (isAr ? "مستخدم" : "User")}
                                            </span>
                          <span className="text-xs text-gray-500">
                                                  {dayjs(comment.created_at).locale(isAr ? 'ar' : 'en').format("D MMMM YYYY - HH:mm")}
                                              </span>
                                        </div>
                                        {user?.id === comment.user_id && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setCommentToDelete(comment.id)}
                                                className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition-all"
                                                aria-label={isAr ? "حذف التعليق" : "Delete comment"}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                                        {comment.content}
                                    </p>
                                </div>
                            </div>
                        </article>
                    ))
                )}
            </div>

            {/* مربع حوار تأكيد الحذف */}
            <AlertDialog open={!!commentToDelete} onOpenChange={(open) => !open && setCommentToDelete(null)}>
                <AlertDialogContent dir={isAr ? "rtl" : "ltr"}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{isAr ? "حذف التعليق؟" : "Delete comment?"}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {isAr
                                ? "هل أنت متأكد من حذف هذا التعليق؟ لا يمكن التراجع عن هذا الإجراء."
                                : "Are you sure you want to delete this comment? This action cannot be undone."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-row-reverse gap-2">
                        <AlertDialogCancel>{isAr ? "إلغاء" : "Cancel"}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => commentToDelete && deleteMutation.mutate(commentToDelete)}
                            className="bg-destructive hover:bg-destructive/90"
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                isAr ? "حذف" : "Delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </section>
    );
};

export default CommentsSection;
