import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Loader2, Plus, Calendar, FileText, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import BlogCard from '@/components/BlogCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PostDialog from '@/components/PostDialog';
import { useAuth } from '@/hooks/useAuth';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useToast } from '@/hooks/use-toast';

interface Post {
  id: string;
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  image_url: string | null;
  created_at: string;
  is_published: boolean;
  author_id?: string;
  views_count?: number;
}

const Blog = () => {
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState<Post | null>(null);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const { user } = useAuth();
  const { isAdmin } = useAdminCheck();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      // Admins see all posts, others see only published
      let query = supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!isAdmin) {
        query.eq('is_published', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Post[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: '🗑️ تم الحذف بنجاح', className: "bg-red-500/10 text-red-500" });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setPostToDelete(null);
    },
    onError: () => {
      toast({ title: 'خطأ', description: 'فشل في حذف المقال', variant: 'destructive' });
    },
  });

  const getExcerpt = (post: Post, maxLength: number = 150) => {
    // Use excerpt if available, otherwise truncate content
    const text = post.excerpt || post.content;
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const handleEdit = (post: Post) => {
    setPostToEdit(post);
    setPostDialogOpen(true);
  };

  const handleAddNew = () => {
    setPostToEdit(null);
    setPostDialogOpen(true);
  };

  const handleCloseDialog = (open: boolean) => {
    setPostDialogOpen(open);
    if (!open) {
      setPostToEdit(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <Navbar onAddClick={handleAddNew} />

      <main className="flex-1 container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">المدونة</h1>
            <p className="text-muted-foreground">أحدث المقالات والأخبار عن الذكاء الاصطناعي</p>
          </div>

          {isAdmin && (
            <Button
              onClick={handleAddNew}
              className="bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 gap-2"
            >
              <Plus className="h-4 w-4" />
              مقال جديد
            </Button>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20 min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-neon-purple" />
              <span className="text-muted-foreground animate-pulse">جاري تحميل المقالات...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20 min-h-[400px] flex flex-col justify-center items-center">
            <div className="bg-destructive/10 p-4 rounded-full mb-4">
              <FileText className="h-8 w-8 text-destructive" />
            </div>
            <p className="text-xl font-bold text-destructive mb-2">حدث خطأ</p>
            <p className="text-muted-foreground">فشل في تحميل المقالات</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && (!posts || posts.length === 0) && (
          <div className="text-center py-20 min-h-[400px] flex flex-col justify-center items-center">
            <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mb-4 text-3xl opacity-50">
              📝
            </div>
            <p className="text-xl font-semibold text-foreground">لا توجد مقالات حالياً</p>
            <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
              كن أول من يشارك مقالاً!
            </p>
            {isAdmin && (
              <Button
                onClick={handleAddNew}
                className="mt-6 bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 gap-2"
              >
                <Plus className="h-4 w-4" />
                أضف أول مقال
              </Button>
            )}
          </div>
        )}

        {/* Posts Grid */}
        {!isLoading && !error && posts && posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div key={post.id} className="relative group">
                {/* Admin Actions */}
                {isAdmin && (
                  <div className="absolute top-3 left-3 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(post)}
                      className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-neon-purple/20 hover:text-neon-purple"
                      aria-label="تعديل المقال"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setPostToDelete(post)}
                      className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-destructive/20 hover:text-destructive"
                      aria-label="حذف المقال"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {/* Published Status Badge */}
                {isAdmin && !post.is_published && (
                  <Badge className="absolute top-3 right-3 z-20 bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                    <EyeOff className="w-3 h-3 mr-1" />
                    مسودة
                  </Badge>
                )}

                {/* BlogCard Component */}
                <BlogCard post={post} />
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Post Dialog (Add/Edit) */}
      <PostDialog
        open={postDialogOpen}
        onOpenChange={handleCloseDialog}
        postToEdit={postToEdit}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!postToDelete} onOpenChange={(open) => !open && setPostToDelete(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف المقال "{postToDelete?.title}" نهائياً. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => postToDelete && deleteMutation.mutate(postToDelete.id)}
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'حذف'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Blog;
