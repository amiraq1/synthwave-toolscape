import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Tool } from '@/types';

interface BookmarkRecord {
    id: string;
    user_id: string;
    tool_id: number;
    created_at: string;
}

interface BookmarkToolId {
    tool_id: number;
}

export const useBookmarks = () => {
    const { user } = useAuth();
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

    // Get list of bookmarked tool IDs (as numbers from DB)
    const bookmarkedToolIds = bookmarks.map((b) => b.tool_id);

    // Check if a tool is bookmarked
    const isBookmarked = (toolId: number | string) => {
        const id = typeof toolId === 'string' ? parseInt(toolId, 10) : toolId;
        return bookmarkedToolIds.includes(id);
    };

    // Toggle bookmark mutation
    const toggleBookmarkMutation = useMutation({
        mutationFn: async (toolId: number | string) => {
            if (!user) throw new Error('User not authenticated');

            const numericId = typeof toolId === 'string' ? parseInt(toolId, 10) : toolId;
            const currentlyBookmarked = isBookmarked(numericId);

            if (currentlyBookmarked) {
                // Remove bookmark
                const { error } = await supabase
                    .from('bookmarks')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('tool_id', numericId);

                if (error) throw error;
                return { action: 'removed' as const, toolId: numericId };
            } else {
                // Add bookmark
                const { error } = await supabase
                    .from('bookmarks')
                    .insert({ user_id: user.id, tool_id: numericId });

                if (error) throw error;
                return { action: 'added' as const, toolId: numericId };
            }
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
            if (result.action === 'added') {
                toast.success('❤️ تمت الإضافة للمفضلة');
            } else {
                toast('💔 تمت الإزالة من المفضلة');
            }
        },
        onError: () => {
            toast.error('خطأ', {
                description: 'فشل في تحديث المفضلة',
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

            const toolIds = bookmarks.map((b) => b.tool_id);

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
