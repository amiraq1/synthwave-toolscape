import { Suspense, lazy, useState } from "react";
import { Toaster as Sonner, toast } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "@/context/AuthContext";
import { CompareProvider } from "@/context/CompareContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageLoader from "@/components/PageLoader";
import ScrollToTop from "@/components/ScrollToTop";
import { useAuth } from "@/context/AuthContext";


// Lazy Load Pages
const Index = lazy(() => import("./pages/Index"));
const ToolDetails = lazy(() => import("./pages/ToolDetails"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Install = lazy(() => import("./pages/Install"));
const Settings = lazy(() => import("./pages/Settings"));
const Admin = lazy(() => import("./pages/Admin"));
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
const ScrollToTopButton = lazy(() => import("@/components/ScrollToTopButton"));

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

  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddClick = () => {
    if (!user) {
      toast.error("يجب تسجيل الدخول للمشاركة", {
        description: "سجل دخولك لإضافة أداة جديدة",
      });
      return;
    }
    setIsAddModalOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0f0f1a] text-foreground font-cairo">
      <Navbar onAddClick={handleAddClick} />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/tools" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
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

      <Footer />

      {/* Floating Components */}
      <Suspense fallback={null}>
        <CompareFloatingBar />
        <ScrollToTopButton />
        {isAddModalOpen && (
          <AddToolModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
        )}
      </Suspense>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <AuthProvider>
        <CompareProvider>
          <TooltipProvider>
            <Sonner position="top-center" richColors theme="system" closeButton />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <ScrollToTop />
              <AppContent />
            </BrowserRouter>
          </TooltipProvider>
        </CompareProvider>
      </AuthProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
