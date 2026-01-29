import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Tool } from '@/types';

interface BookmarkRecord {
    id: string;
    user_id: string;
    tool_id: string;
    created_at: string;
}

interface BookmarkToolId {
    tool_id: string;
}

export const useBookmarks = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch user's bookmarked tool IDs
    const { data: bookmarks = [], isLoading } = useQuery({
        queryKey: ['bookmarks', user?.id],
        queryFn: async (): Promise<BookmarkToolId[]> => {
            if (!user) return [];

            const { data, error } = await supabase
                .from('bookmarks')
                .select('tool_id')
                .eq('user_id', user.id);

            if (error) throw error;
            return (data || []) as BookmarkToolId[];
        },
        enabled: !!user,
    });

    // Get list of bookmarked tool IDs
    const bookmarkedToolIds = bookmarks.map((b) => b.tool_id);

    // Check if a tool is bookmarked
    const isBookmarked = (toolId: number | string) => {
        const id = String(toolId);
        return bookmarkedToolIds.includes(id);
    };

    // Toggle bookmark mutation
    const toggleBookmarkMutation = useMutation({
        mutationFn: async (toolId: number | string) => {
            if (!user) throw new Error('User not authenticated');

            const id = String(toolId);
            const currentlyBookmarked = isBookmarked(id);

            if (currentlyBookmarked) {
                // Remove bookmark
                const { error } = await supabase
                    .from('bookmarks')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('tool_id', id);

                if (error) throw error;
                return { action: 'removed' as const, toolId: id };
            } else {
                // Add bookmark
                const { error } = await supabase
                    .from('bookmarks')
                    .insert({ user_id: user.id, tool_id: id });

                if (error) throw error;
                return { action: 'added' as const, toolId: id };
            }
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
            toast({
                title: result.action === 'added' ? '❤️ تمت الإضافة للمفضلة' : '💔 تمت الإزالة من المفضلة',
                className: result.action === 'added'
                    ? 'bg-rose-500/10 text-rose-500'
                    : 'bg-muted text-muted-foreground',
            });
        },
        onError: () => {
            toast({
                title: 'خطأ',
                description: 'فشل في تحديث المفضلة',
                variant: 'destructive',
            });
        },
    });

    return {
        bookmarkedToolIds,
        isBookmarked,
        toggleBookmark: toggleBookmarkMutation.mutate,
        isToggling: toggleBookmarkMutation.isPending,
        isLoading,
    };
};

// Hook to fetch full bookmarked tools data
export const useBookmarkedTools = () => {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['bookmarked-tools', user?.id],
        queryFn: async (): Promise<Tool[]> => {
            if (!user) return [];

            // First get bookmarked tool IDs
            const { data: bookmarks, error: bookmarksError } = await supabase
                .from('bookmarks')
                .select('tool_id')
                .eq('user_id', user.id);

            if (bookmarksError) throw bookmarksError;
            if (!bookmarks || bookmarks.length === 0) return [];

            const toolIds = (bookmarks as BookmarkToolId[]).map((b) => b.tool_id);

            // Then fetch full tool data
            const { data: tools, error: toolsError } = await supabase
                .from('tools')
                .select('*')
                .in('id', toolIds);

            if (toolsError) throw toolsError;

            // Transform to match Tool interface (id as string)
            return (tools || []).map(tool => ({
                ...tool,
                id: String(tool.id),
            })) as Tool[];
        },
        enabled: !!user,
    });
};
