import { createContext } from "react";

export interface CompareContextType {
    selectedTools: string[];
    addToCompare: (id: string) => void;
    removeFromCompare: (id: string) => void;
    clearCompare: () => void;
    setCompareList: (ids: string[]) => void;
}

export const CompareContext = createContext<CompareContextType | undefined>(undefined);
