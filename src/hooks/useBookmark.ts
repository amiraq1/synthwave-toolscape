import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-hot-toast";

const BOOKMARK_QUERY_KEY = "bookmarkStatus";

export const useBookmark = (toolId: number) => {
    const { session } = useAuth();
    const queryClient = useQueryClient();

    // 1. Fetch Bookmark Status status
    const { data: isSaved, isLoading } = useQuery({
        queryKey: [BOOKMARK_QUERY_KEY, toolId, session?.user.id],
        queryFn: async () => {
            if (!session?.user.id) return false;
            const { data, error } = await supabase
                .from("bookmarks")
                .select("id")
                .eq("user_id", session.user.id)
                .eq("tool_id", toolId)
                .maybeSingle();

            if (error) throw error;
            return !!data;
        },
        enabled: !!session?.user.id && !isNaN(toolId),
        staleTime: 5 * 60 * 1000, // 5 minutes cache
    });

    // 2. Optimistic Mutation
    const mutation = useMutation({
        mutationFn: async (shouldSave: boolean) => {
            if (!session) throw new Error("User not logged in");

            if (shouldSave) {
                // Add bookmark
                const { error } = await supabase
                    .from("bookmarks")
                    .insert({ user_id: session.user.id, tool_id: toolId });
                if (error) throw error;
            } else {
                // Remove bookmark
                const { error } = await supabase
                    .from("bookmarks")
                    .delete()
                    .eq("user_id", session.user.id)
                    .eq("tool_id", toolId);
                if (error) throw error;
            }
        },
        // Before the request is sent
        onMutate: async (shouldSave) => {
            // Cancel distinct fetching queries
            await queryClient.cancelQueries({ queryKey: [BOOKMARK_QUERY_KEY, toolId, session?.user.id] });

            // Snapshot previous value
            const previousIsSaved = queryClient.getQueryData<boolean>([BOOKMARK_QUERY_KEY, toolId, session?.user.id]);

            // Optimistically update to the new value
            queryClient.setQueryData([BOOKMARK_QUERY_KEY, toolId, session?.user.id], shouldSave);

            // Return context with previous value
            return { previousIsSaved };
        },
        // If error occurs
        onError: (err, newTodo, context) => {
            // Rollback to previous value
            if (context?.previousIsSaved !== undefined) {
                queryClient.setQueryData([BOOKMARK_QUERY_KEY, toolId, session?.user.id], context.previousIsSaved);
            }
            toast.error("فشل تحديث المفضلة");
        },
        // Always refetch after error or success to ensure sync
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: [BOOKMARK_QUERY_KEY, toolId, session?.user.id] });
            // Also invalidate main profile bookmarks list if exists
            queryClient.invalidateQueries({ queryKey: ['profile_bookmarks'] });
        },
    });

    const toggleBookmark = () => {
        if (!session) {
            toast.error("سجل دخولك لحفظ الأدوات 🔐");
            return;
        }
        const newState = !isSaved;

        // Show Optimistic Toast
        if (newState) toast.success("تم الحفظ في مكتبتك 📚");
        else toast.success("تمت الإزالة من المفضلة");

        // Execute Mutation
        mutation.mutate(newState);
    };

    return {
        isSaved: !!isSaved,
        isLoading,
        toggleBookmark,
        isMutating: mutation.isPending
    };
};
