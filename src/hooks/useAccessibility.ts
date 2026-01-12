import { useEffect, useCallback } from 'react';

/**
 * 🎯 Accessibility Hook for نبض AI
 * Provides keyboard navigation, focus management, and screen reader support
 */

interface UseAccessibilityOptions {
  /** Enable focus trap within a container */
  trapFocus?: boolean;
  /** Container ref for focus trap */
  containerRef?: React.RefObject<HTMLElement>;
  /** Announce messages to screen readers */
  announceOnMount?: string;
  /** Enable keyboard shortcuts */
  enableShortcuts?: boolean;
}

// Screen reader announcement utility
const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcer = document.getElementById('a11y-announcer') || createAnnouncer();
  announcer.setAttribute('aria-live', priority);

  // Clear and set message (needed for same message re-announcement)
  announcer.textContent = '';
  setTimeout(() => {
    announcer.textContent = message;
  }, 100);
};

// Create invisible announcer element
const createAnnouncer = (): HTMLElement => {
  const announcer = document.createElement('div');
  announcer.id = 'a11y-announcer';
  announcer.setAttribute('aria-live', 'polite');
  announcer.setAttribute('aria-atomic', 'true');
  announcer.setAttribute('role', 'status');
  announcer.style.cssText = `
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  `;
  document.body.appendChild(announcer);
  return announcer;
};

export const useAccessibility = (options: UseAccessibilityOptions = {}) => {
  const { trapFocus, containerRef, announceOnMount, enableShortcuts = true } = options;

  // Announce message on mount
  useEffect(() => {
    if (announceOnMount) {
      announce(announceOnMount);
    }
  }, [announceOnMount]);

  // Focus trap implementation
  useEffect(() => {
    if (!trapFocus || !containerRef?.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [trapFocus, containerRef]);

  // Global keyboard shortcuts
  useEffect(() => {
    if (!enableShortcuts) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      // Keyboard shortcuts
      switch (e.key) {
        case '/': {
          // Focus search (common pattern)
          e.preventDefault();
          const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');
          if (searchInput) {
            searchInput.focus();
            announce('حقل البحث مفعّل');
          }
          break;
        }

        case 'Escape': {
          // Close any open modals/dialogs
          const closeButton = document.querySelector<HTMLButtonElement>('[data-close-modal]');
          if (closeButton) {
            closeButton.click();
          }
          break;
        }

        case 'h':
          // Go home (if not in input)
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            window.location.href = '/';
          }
          break;

        default:
          break;
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [enableShortcuts]);

  // Skip link functionality
  const handleSkipToContent = useCallback(() => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.tabIndex = -1;
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
      announce('تم الانتقال إلى المحتوى الرئيسي');
    }
  }, []);

  return {
    announce,
    handleSkipToContent,
  };
};

/**
 * Hook for managing focus when navigating between pages
 */
export const useFocusOnNavigate = () => {
  useEffect(() => {
    // Focus main content on navigation
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
    }

    // Announce page change
    const pageTitle = document.title;
    announce(`تم الانتقال إلى صفحة ${pageTitle}`, 'polite');
  }, []);
};

/**
 * Hook for reduced motion preference
 */
export const useReducedMotion = (): boolean => {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
};

/**
 * Hook for high contrast preference
 */
export const useHighContrast = (): boolean => {
  const mediaQuery = window.matchMedia('(prefers-contrast: more)');
  return mediaQuery.matches;
};

export default useAccessibility;
