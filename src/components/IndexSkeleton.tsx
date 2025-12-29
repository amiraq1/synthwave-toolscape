import { Skeleton } from "@/components/ui/skeleton";

const IndexSkeleton = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      {/* Navbar Skeleton */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <Skeleton className="h-8 w-32" />
          <div className="flex gap-4">
            <Skeleton className="h-8 w-20 hidden md:block" />
            <Skeleton className="h-8 w-20 hidden md:block" />
            <Skeleton className="h-10 w-24 rounded-full" />
          </div>
        </div>
      </header>

      <main className="flex-1 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Hero Section Skeleton */}
        <section className="mb-8 text-center space-y-4 py-12">
          <Skeleton className="h-12 w-3/4 mx-auto md:w-1/2" />
          <Skeleton className="h-6 w-2/3 mx-auto md:w-1/3" />
          <div className="max-w-2xl mx-auto mt-8">
            <Skeleton className="h-12 w-full rounded-2xl" />
          </div>
        </section>

        {/* Filters Skeleton */}
        <section className="mb-8 rounded-2xl border bg-card/50 p-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-10 w-24 flex-shrink-0 rounded-full" />
            ))}
          </div>
        </section>

        {/* Grid Skeleton */}
        <section className="rounded-2xl border bg-card/30 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer Skeleton */}
      <footer className="border-t py-8 mt-auto">
        <div className="container px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <Skeleton className="h-6 w-40" />
          <div className="flex gap-4">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default IndexSkeleton;
