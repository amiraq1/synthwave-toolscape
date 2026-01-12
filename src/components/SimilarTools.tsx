import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ToolCard from "@/components/ToolCard";
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Tool } from "@/types";

interface SimilarToolsProps {
    currentToolId: string;
    category: string;
}

const SimilarTools = ({ currentToolId, category }: SimilarToolsProps) => {
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);
    const { i18n } = useTranslation();
    const isAr = i18n.language === 'ar';

    useEffect(() => {
        const fetchSimilar = async () => {
            if (!category) return;

            const { data } = await supabase
                .from("tools")
                .select("*")
                .eq("category", category)
                .neq("id", currentToolId as unknown as number)
                .eq("is_published", true)
                .limit(3);

            if (data) setTools(data);
            setLoading(false);
        };

        fetchSimilar();
    }, [currentToolId, category]);

    if (loading || tools.length === 0) return null;

    return (
        <div className="mt-16 pt-10 border-t border-white/10" dir={isAr ? "rtl" : "ltr"}>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
                <Sparkles className="text-neon-purple" />
                {isAr ? "أدوات مشابهة قد تعجبك" : "Similar tools you may like"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                ))}
            </div>
        </div>
    );
};

export default SimilarTools;
