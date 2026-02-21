/* eslint-disable react-refresh/only-export-components */
import { Code, Palette, PenTool, GraduationCap, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tool } from "@/hooks/useTools";

// تعريف الوظائف وتصنيفاتها
export const PERSONAS = [
    { id: "all", label: "الكل", icon: LayoutGrid, categories: [] as string[] },
    {
        id: "developer",
        label: "مبرمج",
        icon: Code,
        categories: ["برمجة", "أدوات تطوير", "كود", "Code", "Development"]
    },
    {
        id: "designer",
        label: "مصمم",
        icon: Palette,
        categories: ["صور", "فيديو", "تصميم", "Image", "Video", "Design", "Art"]
    },
    {
        id: "marketer",
        label: "مسوق/كاتب",
        icon: PenTool,
        categories: ["تسويق", "كتابة", "SEO", "Marketing", "Copywriting", "Social Media", "نصوص"]
    },
    {
        id: "student",
        label: "طالب/باحث",
        icon: GraduationCap,
        categories: ["تعليم", "بحث", "إنتاجية", "تلخيص", "Education", "Research", "Productivity", "دراسة وطلاب"]
    },
] as const;

// Type for Persona IDs
export type PersonaId = typeof PERSONAS[number]["id"];

/**
 * Filter tools by persona categories
 */
export const filterToolsByPersona = (tools: Tool[], personaId: PersonaId): Tool[] => {
    if (personaId === "all") return tools;

    const persona = PERSONAS.find((p) => p.id === personaId);
    if (!persona || persona.categories.length === 0) return tools;

    return tools.filter((tool) => {
        const toolCategory = tool.category?.toLowerCase() || "";
        return persona.categories.some((cat) =>
            toolCategory.includes(cat.toLowerCase()) || cat.toLowerCase().includes(toolCategory)
        );
    });
};

interface PersonaFilterProps {
    currentPersona: string;
    onSelect: (id: string) => void;
    counts?: Record<string, number>;
}

const PersonaFilter = ({ currentPersona, onSelect, counts }: PersonaFilterProps) => {
    return (
        <div className="flex flex-wrap justify-center gap-3 my-8" dir="rtl">
            {PERSONAS.map((persona) => {
                const Icon = persona.icon;
                const isActive = currentPersona === persona.id;
                const count = counts ? counts[persona.id] : 0;
                const label = persona.label;

                return (
                    <button
                        key={persona.id}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => onSelect(persona.id)}
                        className={cn(
                            "group flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border relative overflow-hidden",
                            isActive
                                ? "bg-neon-purple text-white border-neon-purple shadow-[0_0_15px_rgba(124,58,237,0.4)]"
                                : "bg-white/10 text-slate-200 border-white/15 hover:bg-white/15 hover:text-white"
                        )}
                    >
                        <Icon className="w-4 h-4" />
                        <span>{label}</span>

                        {count > 0 && (
                            <span className={cn(
                                "mr-1 text-[10px] px-1.5 py-0.5 rounded-full transition-colors",
                                isActive
                                    ? "bg-white/30 text-white border border-white/30"
                                    : "bg-white/15 text-slate-200 border border-white/20 group-hover:text-white"
                            )}>
                                {count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export default PersonaFilter;
