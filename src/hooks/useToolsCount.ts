import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseNetworkError } from '@/integrations/supabase/client';
import { getToolsStatsFromCatalog } from '@/lib/toolsCatalogFallback';

interface ToolsStats {
    total_tools: number;
    total_categories: number;
    arabic_tools: number;
    free_tools: number;
}

interface ToolStatRow {
    arabic_score?: number | null;
    category?: string | null;
    description?: string | null;
    pricing_type?: string | null;
    supports_arabic?: boolean | null;
}

const FREE_PRICING_TOKENS = ['مجاني', 'free', 'freemium'];
const ARABIC_TEXT_REGEX = /[\u0600-\u06FF]/;

const normalizeText = (value?: string | null) => (value ?? '').trim().toLowerCase();

const isFreeTool = (pricingType?: string | null) => {
    const pricing = normalizeText(pricingType);
    return FREE_PRICING_TOKENS.some((token) => pricing.includes(token));
};

const isArabicTool = (tool: ToolStatRow) =>
    Boolean(tool.supports_arabic) ||
    (typeof tool.arabic_score === 'number' && tool.arabic_score > 0) ||
    ARABIC_TEXT_REGEX.test(tool.description ?? '');

/**
 * Fetch lightweight hero stats directly from the tools table.
 * This avoids hitting an RPC that may not exist in the current project.
 */
export const useToolsStats = () => {
    return useQuery<ToolsStats>({
        queryKey: ['tools-stats'],
        queryFn: async () => {
            try {
                const { data, error } = await supabase
                    .from('tools')
                    .select('category, pricing_type, supports_arabic, arabic_score, description')
                    .eq('is_published', true);

                if (error) {
                    throw error;
                }

                const tools = (data ?? []) as ToolStatRow[];

                return {
                    total_tools: tools.length,
                    total_categories: new Set(tools.map((tool) => tool.category).filter(Boolean)).size,
                    arabic_tools: tools.filter(isArabicTool).length,
                    free_tools: tools.filter((tool) => isFreeTool(tool.pricing_type)).length,
                };
            } catch (error) {
                if (!isSupabaseNetworkError(error)) {
                    console.error('Error fetching tools stats:', error);
                }

                return getToolsStatsFromCatalog();
            }
        },
        retry: false,
        staleTime: 1000 * 60 * 30,
        gcTime: 1000 * 60 * 60,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });
};

export default useToolsStats;
