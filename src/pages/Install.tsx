import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Download, Smartphone, CheckCircle, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';


// Interface is globally defined in vite-env.d.ts


const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="ltr" role="main">
      {/* Background gradient orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-neon-blue/20 rounded-full blur-[120px] -z-10" />

      <div className="w-full max-w-md">
        <div className="glass rounded-3xl p-8 space-y-8 text-center">
          {/* Logo */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center">
              <Activity className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-3xl">
              <span className="font-extrabold gradient-text">Nabd</span>
              <span className="font-medium text-foreground/80 ml-1">AI</span>
            </h1>
          </div>

          {isInstalled ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-emerald-400">
                <CheckCircle className="h-6 w-6" />
                <span className="text-xl font-semibold">App Installed!</span>
              </div>
              <p className="text-muted-foreground">
                You can now launch Nabd AI directly from your home screen.
              </p>
              <Button
                onClick={() => navigate('/')}
                className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 py-6 text-lg"
              >
                Back to Home
              </Button>
            </div>
          ) : isIOS ? (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-2 text-neon-purple">
                <Smartphone className="h-6 w-6" />
                <span className="text-xl font-semibold">Install the App</span>
              </div>

              <div className="space-y-4 text-left">
                <p className="text-muted-foreground">
                  To install on iPhone or iPad:
                </p>
                <ol className="space-y-3 text-foreground">
                  <li className="flex items-start gap-3">
                    <span className="bg-neon-purple/20 text-neon-purple w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-sm">1</span>
                    <span>Tap the Share icon <Share className="inline h-4 w-4 mx-1" /> at the bottom of Safari</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-neon-purple/20 text-neon-purple w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-sm">2</span>
                    <span>Scroll down and choose "Add to Home Screen"</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-neon-purple/20 text-neon-purple w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-sm">3</span>
                    <span>Tap "Add" in the top corner</span>
                  </li>
                </ol>
              </div>

              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full py-6 text-lg border-border/50"
              >
                Back to Home
              </Button>
            </div>
          ) : deferredPrompt ? (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-2 text-neon-purple">
                <Download className="h-6 w-6" />
                <span className="text-xl font-semibold">Install App</span>
              </div>

              <p className="text-muted-foreground">
                Install Nabd AI for faster access and offline support.
              </p>

              <div className="space-y-3">
                <Button
                  onClick={handleInstall}
                  className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 py-6 text-lg gap-2"
                >
                  <Download className="h-5 w-5" />
                  Install
                </Button>

                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="w-full py-6 text-lg border-border/50"
                >
                  Not Now
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Smartphone className="h-6 w-6" />
                <span className="text-xl font-semibold">Continue in Browser</span>
              </div>

              <p className="text-muted-foreground">
                You can install later from the browser menu or continue now.
              </p>

              <Button
                onClick={() => navigate('/')}
                className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 py-6 text-lg"
              >
                Explore Tools
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Install;
