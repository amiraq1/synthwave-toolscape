import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "@/hooks/use-toast";
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

    // استرجاع البيانات من LocalStorage لتبقى الاختيارات حتى بعد التحديث
    const [selectedTools, setSelectedTools] = useState<string[]>(() => {
        const saved = localStorage.getItem("compare_tools");
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem("compare_tools", JSON.stringify(selectedTools));
    }, [selectedTools]);

    const addToCompare = (id: string) => {
        const currentIsAr = i18n.language === 'ar';

        if (selectedTools.includes(id)) {
            toast({
                title: currentIsAr ? "هذه الأداة موجودة في القائمة بالفعل" : "This tool is already in the list",
                variant: "destructive",
            });
            return;
        }
        if (selectedTools.length >= 3) {
            toast({
                title: currentIsAr ? "يمكنك مقارنة 3 أدوات كحد أقصى" : "You can compare up to 3 tools max",
                variant: "destructive",
            });
            return;
        }
        setSelectedTools([...selectedTools, id]);
        toast({
            title: currentIsAr ? "تمت الإضافة للمقارنة ⚖️" : "Added to compare ⚖️",
        });
    };

    const removeFromCompare = (id: string) => {
        setSelectedTools(selectedTools.filter((itemId) => itemId !== id));
    };

    const setCompareList = (ids: string[]) => {
        // التحقق من الحد الأقصى
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
