import { useState, useEffect, type ReactNode } from "react";
import { toast } from "sonner";
import { CompareContext } from "@/context/compare-context";

export const CompareProvider = ({ children }: { children: ReactNode }) => {
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
            toast.error("هذه الأداة موجودة بالفعل في قائمة المقارنة");
            return;
        }

        if (selectedTools.length >= 3) {
            toast.error("يمكنك مقارنة 3 أدوات كحد أقصى");
            return;
        }

        setSelectedTools((prev) => [...prev, id]);
        toast.success("تمت الإضافة إلى المقارنة");
    };

    const removeFromCompare = (id: string) => {
        setSelectedTools((prev) => prev.filter((itemId) => itemId !== id));
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
