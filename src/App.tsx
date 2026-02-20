import { Suspense, lazy, useState, useEffect, type ComponentType } from "react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "@/context/AuthContext";
import { CompareProvider } from "@/context/CompareContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageLoader from "@/components/PageLoader";
import ScrollToTop from "@/components/ScrollToTop";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";
import { useAuth } from "@/context/AuthContext";
import { useIdleLoad } from "@/hooks/useIdleLoad";
import { useTranslation } from "react-i18next";
const PwaUpdateToast = lazy(() => import("@/components/pwa-update-toast").then(m => ({ default: m.PwaUpdateToast })));
import Index from "./pages/Index"; // Eager load Home for better LCP
const ScrollToTopButton = lazy(() => import("@/components/ScrollToTopButton"));

function lazyWithRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  retryKey: string,
) {
  return lazy(async () => {
    try {
      const module = await importFn();
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(retryKey);
      }
      return module;
    } catch (error) {
      if (typeof window !== "undefined") {
        const hasRetried = window.sessionStorage.getItem(retryKey) === "1";
        if (!hasRetried) {
          window.sessionStorage.setItem(retryKey, "1");
          window.location.reload();
        }
      }
      throw error;
    }
  });
}


// Lazy Load Pages
// const Index = lazy(() => import("./pages/Index")); // Moved to eager load
const ToolDetails = lazy(() => import("./pages/ToolDetails"));
const Auth = lazy(() => import("./pages/Auth"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Install = lazy(() => import("./pages/Install"));
const Settings = lazy(() => import("./pages/Settings"));
const Admin = lazyWithRetry(() => import("./pages/Admin"), "lazy-retry-admin-page");
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Bookmarks = lazy(() => import("./pages/Bookmarks"));
const ComparePage = lazy(() => import("./pages/Compare"));
const Profile = lazy(() => import("./pages/Profile"));
const WorkflowBuilder = lazy(() => import("./pages/WorkflowBuilder"));
const AgentsMarketplace = lazy(() => import("./pages/AgentsMarketplace"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy Load Components
const CompareFloatingBar = lazy(() => import("@/components/CompareFloatingBar"));
const AddToolModal = lazy(() => import("@/components/AddToolModal"));
const ChatBot = lazy(() => import("@/components/ChatBot")); // Replaced ChatWidget
// ScrollToTopButton moved to eager import

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent = () => {
  const { user } = useAuth();

  const location = useLocation(); // Get current location
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const showDeferredUi = useIdleLoad(12000);

  // Initialize analytics (deferred)
  useEffect(() => {
    let cancelled = false;
    import("@/lib/analytics").then(({ initGA, initHeap }) => {
      if (cancelled) return;
      initGA();
      initHeap();
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    import("@/lib/analytics").then(({ logPageView, logHeapPageView }) => {
      if (cancelled) return;
      logPageView(location.pathname + location.search);
      logHeapPageView();
    });
    return () => {
      cancelled = true;
    };
  }, [location]);



  const handleAddClick = () => {
    if (!user) {
      toast.error("Login required", {
        description: "Please sign in to submit a new tool",
      });
      return;
    }
    setIsAddModalOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0f0f1a] text-foreground font-cairo">
      <a
        href="#main-content"
        className={`sr-only focus:not-sr-only focus:fixed focus:top-3 focus:z-[9999] focus:rounded-xl focus:bg-glass focus:backdrop-blur-xl focus:text-neon-cyan focus:px-6 focus:py-3 focus:font-bold focus:shadow-2xl focus:ring-2 focus:ring-neon-purple outline-none ${isAr ? "focus:right-3" : "focus:left-3"}`}
      >
        {isAr ? "تخطّ إلى المحتوى الأساسي" : "Skip to main content"}
      </a>
      <Navbar onAddClick={handleAddClick} />
      <GlobalErrorBoundary isAr={isAr}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/tools" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/tool/:id" element={<ToolDetails />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/install" element={<Install />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogPost />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/library" element={<Bookmarks />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/workflow/new" element={<WorkflowBuilder />} />
            <Route path="/agents" element={<AgentsMarketplace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </GlobalErrorBoundary>

      <Footer />

      {/* Floating Components */}
      {showDeferredUi && (
        <Suspense fallback={null}>
          <CompareFloatingBar />
        </Suspense>
      )}
      {showDeferredUi && (
        <Suspense fallback={null}>
          <ScrollToTopButton />
        </Suspense>
      )}
      {isAddModalOpen && (
        <Suspense fallback={null}>
          <AddToolModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
        </Suspense>
      )}
      {showDeferredUi && (
        <Suspense fallback={null}>
          <ChatBot />
        </Suspense>
      )}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Suspense fallback={null}>
            <PwaUpdateToast />
          </Suspense>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <CompareProvider>
              <ScrollToTop />
              <AppContent />
            </CompareProvider>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
