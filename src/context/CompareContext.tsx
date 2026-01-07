import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

interface CompareContextType {
    selectedTools: string[];
    addToCompare: (id: string) => void;
    removeFromCompare: (id: string) => void;
    clearCompare: () => void;
    isInCompare: (id: string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider = ({ children }: { children: ReactNode }) => {
    // استرجاع البيانات المحفوظة من LocalStorage إن وجدت
    const [selectedTools, setSelectedTools] = useState<string[]>(() => {
        if (typeof window === "undefined") return [];
        const saved = localStorage.getItem("compare_tools");
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem("compare_tools", JSON.stringify(selectedTools));
    }, [selectedTools]);

    const addToCompare = (id: string) => {
        if (selectedTools.includes(id)) {
            toast.error("هذه الأداة مضافة للمقارنة بالفعل");
            return;
        }
        if (selectedTools.length >= 3) {
            toast.error("يمكنك مقارنة 3 أدوات كحد أقصى حالياً");
            return;
        }
        setSelectedTools([...selectedTools, id]);
        toast.success("تمت الإضافة للمقارنة 🆚");
    };

    const removeFromCompare = (id: string) => {
        setSelectedTools(selectedTools.filter((itemId) => itemId !== id));
        toast.info("تمت الإزالة من المقارنة");
    };

    const clearCompare = () => {
        setSelectedTools([]);
        toast.info("تم مسح قائمة المقارنة");
    };

    const isInCompare = (id: string) => selectedTools.includes(id);

    return (
        <CompareContext.Provider
            value={{
                selectedTools,
                addToCompare,
                removeFromCompare,
                clearCompare,
                isInCompare
            }}
        >
            {children}
        </CompareContext.Provider>
    );
};

export const useCompare = () => {
    const context = useContext(CompareContext);
    if (!context) {
        throw new Error("useCompare must be used within a CompareProvider");
    }
    return context;
};
