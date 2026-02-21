import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

interface CompareContextType {
    selectedTools: string[];
    addToCompare: (id: string) => void;
    removeFromCompare: (id: string) => void;
    clearCompare: () => void;
    setCompareList: (ids: string[]) => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider = ({ children }: { children: ReactNode }) => {

    // Safe localStorage read with try-catch for corrupted data
    const [selectedTools, setSelectedTools] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem("compare_tools");
            return saved ? JSON.parse(saved) : [];
        } catch {
            localStorage.removeItem("compare_tools");
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem("compare_tools", JSON.stringify(selectedTools));
    }, [selectedTools]);

    const addToCompare = (id: string) => {
        if (selectedTools.includes(id)) {
            toast.error("هذه الأداة موجودة في القائمة بالفعل");
            return;
        }
        if (selectedTools.length >= 3) {
            toast.error("يمكنك مقارنة 3 أدوات كحد أقصى");
            return;
        }
        setSelectedTools([...selectedTools, id]);
        toast.success("تمت الإضافة للمقارنة ⚖️");
    };

    const removeFromCompare = (id: string) => {
        setSelectedTools(selectedTools.filter((itemId) => itemId !== id));
    };

    const setCompareList = (ids: string[]) => {
        if (ids.length > 3) {
            setSelectedTools(ids.slice(0, 3));
        } else {
            setSelectedTools(ids);
        }
    };

    const clearCompare = () => setSelectedTools([]);

    return (
        <CompareContext.Provider value={{ selectedTools, addToCompare, removeFromCompare, clearCompare, setCompareList }}>
            {children}
        </CompareContext.Provider>
    );
};

export const useCompare = () => {
    const context = useContext(CompareContext);
    if (!context) throw new Error("useCompare must be used within a CompareProvider");
    return context;
};
