import { Link } from "react-router-dom";
import { Search } from "lucide-react";

export default function NavigationBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-neutral-50/90 backdrop-blur-sm">
      <nav
        className="container mx-auto flex items-center justify-between px-6 py-4"
        aria-label="Primary navigation"
      >
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tighter text-neutral-950 sm:text-3xl">
            A<span className="text-blue-600">I</span>CREATIVE
          </span>
          <span className="hidden rounded-full bg-neutral-100 px-3 py-1 text-sm font-semibold uppercase tracking-widest text-neutral-600 sm:inline-flex">
            DIRECTORY
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link to="/explore" className="text-sm font-semibold text-neutral-700 hover:text-neutral-950">
            EXPLORE
          </Link>
          <Link to="/categories" className="text-sm font-semibold text-neutral-700 hover:text-neutral-950">
            CATEGORIES
          </Link>
          <Link to="/submit" className="text-sm font-semibold text-neutral-700 hover:text-neutral-950">
            SUBMIT TOOL
          </Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            className="text-neutral-600 transition-colors hover:text-neutral-950"
            aria-label="Open search"
          >
            <Search size={22} />
          </button>
          <Link to="/login" className="hidden text-sm font-semibold text-neutral-700 hover:text-neutral-950 sm:inline">
            LOG IN
          </Link>
          <Link
            to="/signup"
            className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-950 sm:px-5 sm:py-2.5"
          >
            SIGN UP
          </Link>
        </div>
      </nav>
    </header>
  );
}
