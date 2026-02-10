/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface CompareContextType {
    selectedTools: string[];
    addToCompare: (id: string) => void;
    removeFromCompare: (id: string) => void;
    clearCompare: () => void;
    setCompareList: (ids: string[]) => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider = ({ children }: { children: ReactNode }) => {
    const { i18n } = useTranslation();

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
        const currentIsAr = i18n.language === 'ar';

        if (selectedTools.includes(id)) {
            toast.error(currentIsAr ? "هذه الأداة موجودة في القائمة بالفعل" : "This tool is already in the list");
            return;
        }
        if (selectedTools.length >= 3) {
            toast.error(currentIsAr ? "يمكنك مقارنة 3 أدوات كحد أقصى" : "You can compare up to 3 tools max");
            return;
        }
        setSelectedTools([...selectedTools, id]);
        toast.success(currentIsAr ? "تمت الإضافة للمقارنة ⚖️" : "Added to compare ⚖️");
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
