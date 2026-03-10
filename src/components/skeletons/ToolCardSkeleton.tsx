import { Skeleton } from "@/components/ui/skeleton";

export function ToolCardSkeleton() {
    return (
        <div className="flex flex-col h-full bg-white/70 border border-slate-200/60 rounded-[1.75rem] p-6 shadow-sm overflow-hidden relative backdrop-blur-sm">
            <div className="flex justify-between items-start mb-4 mt-2">
                <div className="flex items-center gap-3 w-full">
                    {/* Icon Skeleton */}
                    <Skeleton className="w-12 h-12 rounded-xl bg-slate-200/60 shrink-0" />

                    <div className="space-y-2 w-full">
                        {/* Title Skeleton */}
                        <Skeleton className="h-5 w-3/4 bg-slate-200/60" />
                        {/* Rating Skeleton */}
                        <Skeleton className="h-3 w-1/3 bg-slate-200/60" />
                    </div>
                </div>
            </div>

            {/* Description Skeleton */}
            <div className="space-y-2 mb-6 flex-grow">
                <Skeleton className="h-4 w-full bg-slate-200/60" />
                <Skeleton className="h-4 w-5/6 bg-slate-200/60" />
            </div>

            {/* Badges Skeleton */}
            <div className="flex gap-2 mb-4">
                <Skeleton className="h-5 w-16 rounded-full bg-slate-200/60" />
                <Skeleton className="h-5 w-12 rounded-full bg-slate-200/60" />
            </div>

            {/* Footer Skeleton */}
            <div className="mt-auto pt-4 border-t border-slate-200/40 flex items-center justify-between">
                <Skeleton className="h-4 w-20 bg-slate-200/60" />
                <Skeleton className="h-4 w-16 bg-slate-200/60" />
            </div>
        </div>
    );
}
