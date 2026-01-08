import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming you have a utility for class merging (like tailwind-merge/clsx)

const ScrollToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Show button when page is scrolled down
    const toggleVisibility = () => {
        if (window.scrollY > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    // Scroll to top smooth
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    return (
        <Button
            onClick={scrollToTop}
            className={cn(
                "fixed bottom-20 left-4 z-40 rounded-full h-10 w-10 p-0 shadow-lg transition-all duration-300 transform",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none",
                "bg-neon-purple/80 hover:bg-neon-purple text-white border border-white/10 backdrop-blur-sm"
            )}
            aria-label="العودة لأعلى الصفحة"
            size="icon"
        >
            <ArrowUp className="h-5 w-5" />
        </Button>
    );
};

export default ScrollToTopButton;
