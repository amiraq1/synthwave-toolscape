import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EditorialPageProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

interface EditorialHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  icon?: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
  className?: string;
}

interface EditorialPanelProps {
  children: ReactNode;
  className?: string;
}

export const EditorialPage = ({
  children,
  className,
  ...props
}: EditorialPageProps) => {
  return (
    <div className={cn("home-editorial-shell min-h-screen", className)} {...props}>
      <main className="mx-auto flex w-full max-w-[1380px] flex-col gap-8 px-4 pb-14 pt-24 sm:px-6 lg:gap-10 lg:px-8 lg:pt-28">
        {children}
      </main>
    </div>
  );
};

export const EditorialHero = ({
  eyebrow,
  title,
  description,
  icon,
  actions,
  aside,
  className,
}: EditorialHeroProps) => {
  return (
    <section className={cn("grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:gap-8", className)}>
      <div className="editorial-paper editorial-grid p-6 sm:p-8 lg:p-10">
        <div className="relative space-y-5">
          <span className="editorial-kicker">{eyebrow}</span>

          <div className="flex items-start gap-4">
            {icon && (
              <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-[1.35rem] bg-slate-950 text-white shadow-[0_12px_34px_rgba(15,23,42,0.24)] sm:flex">
                {icon}
              </div>
            )}

            <div className="space-y-4">
              <h1 className="font-editorial text-4xl font-semibold leading-[1.05] tracking-tight text-slate-950 sm:text-5xl lg:text-[3.7rem]">
                {title}
              </h1>
              <p className="max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                {description}
              </p>
            </div>
          </div>

          {actions && <div className="flex flex-wrap items-center gap-3 pt-2">{actions}</div>}
        </div>
      </div>

      {aside && <div className="editorial-ink-panel p-6 sm:p-7">{aside}</div>}
    </section>
  );
};

export const EditorialPanel = ({ children, className }: EditorialPanelProps) => {
  return <section className={cn("editorial-paper p-6 sm:p-7", className)}>{children}</section>;
};
