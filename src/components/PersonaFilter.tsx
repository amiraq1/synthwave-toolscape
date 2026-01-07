import { Code, Palette, PenTool, GraduationCap, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

// تعريف الوظائف/الشخصيات
export const PERSONAS = [
    {
        id: "all",
        label: "الكل",
        icon: LayoutGrid,
        categories: [] as string[]
    },
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
        categories: ["نصوص", "تسويق", "كتابة", "SEO", "Marketing", "Copywriting", "Social Media"]
    },
    {
        id: "student",
        label: "طالب/باحث",
        icon: GraduationCap,
        categories: ["دراسة وطلاب", "تعليم", "بحث", "إنتاجية", "تلخيص", "Education", "Research", "Productivity"]
    },
] as const;

export type PersonaId = typeof PERSONAS[number]["id"];

interface PersonaFilterProps {
    currentPersona: PersonaId;
    onSelect: (id: PersonaId) => void;
}

const PersonaFilter = ({ currentPersona, onSelect }: PersonaFilterProps) => {
    return (
        <div className="flex flex-wrap justify-center gap-3 my-8">
            {PERSONAS.map((persona) => {
                const Icon = persona.icon;
                const isActive = currentPersona === persona.id;

                return (
                    <button
                        key={persona.id}
                        onClick={() => onSelect(persona.id)}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border",
                            isActive
                                ? "bg-neon-purple text-white border-neon-purple shadow-[0_0_15px_rgba(124,58,237,0.4)] scale-105"
                                : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
                        )}
                        aria-pressed={isActive}
                        aria-label={`فلترة حسب: ${persona.label}`}
                    >
                        <Icon className="w-4 h-4" />
                        <span>{persona.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

// Helper function to filter tools by persona
export const filterToolsByPersona = <T extends { category: string }>(
    tools: T[],
    personaId: PersonaId
): T[] => {
    if (personaId === "all") return tools;

    const persona = PERSONAS.find(p => p.id === personaId);
    if (!persona || persona.categories.length === 0) return tools;

    return tools.filter(tool =>
        persona.categories.some(cat =>
            tool.category.toLowerCase().includes(cat.toLowerCase()) ||
            cat.toLowerCase().includes(tool.category.toLowerCase())
        )
    );
};

export default PersonaFilter;
