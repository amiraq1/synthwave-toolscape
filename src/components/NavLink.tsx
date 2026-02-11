import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { preloadRoute } from "@/hooks/usePreloadRoute";

type RouteKey = Parameters<typeof preloadRoute>[0];

interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
  preload?: RouteKey;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, preload, onMouseEnter, onFocus, ...props }, ref) => {
    const handlePreload = () => {
      if (preload) {
        preloadRoute(preload);
      }
    };

    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={({ isActive, isPending }) =>
          cn(className, isActive && activeClassName, isPending && pendingClassName)
        }
        onMouseEnter={(e) => {
          handlePreload();
          onMouseEnter?.(e);
        }}
        onFocus={(e) => {
          handlePreload();
          onFocus?.(e);
        }}
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
