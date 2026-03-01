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
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl" role="main">
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
              <span className="font-extrabold gradient-text">نبض</span>
              <span className="font-medium text-foreground/80 ml-1">AI</span>
            </h1>
          </div>

          {isInstalled ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-emerald-400">
                <CheckCircle className="h-6 w-6" />
                <span className="text-xl font-semibold">طھظ… طھط«ط¨ظٹطھ ط§ظ„طھط·ط¨ظٹظ‚!</span>
              </div>
              <p className="text-muted-foreground">
                ظٹظ…ظƒظ†ظƒ ط§ظ„ط¢ظ† طھط´ط؛ظٹظ„ ظ†ط¨ط¶ AI ظ…ط¨ط§ط´ط±ط© ظ…ظ† ط§ظ„ط´ط§ط´ط© ط§ظ„ط±ط¦ظٹط³ظٹط©.
              </p>
              <Button
                onClick={() => navigate('/')}
                className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 py-6 text-lg"
              >
                ط§ظ„ط¹ظˆط¯ط© ظ„ظ„ط±ط¦ظٹط³ظٹط©
              </Button>
            </div>
          ) : isIOS ? (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-2 text-neon-purple">
                <Smartphone className="h-6 w-6" />
                <span className="text-xl font-semibold">طھط«ط¨ظٹطھ ط§ظ„طھط·ط¨ظٹظ‚</span>
              </div>

              <div className="space-y-4 text-right">
                <p className="text-muted-foreground">
                  ظ„طھط«ط¨ظٹطھ ط§ظ„طھط·ط¨ظٹظ‚ ط¹ظ„ظ‰ iPhone ط£ظˆ iPad:
                </p>
                <ol className="space-y-3 text-foreground">
                  <li className="flex items-start gap-3">
                    <span className="bg-neon-purple/20 text-neon-purple w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-sm">1</span>
                    <span>ط§ط¶ط؛ط· ط¹ظ„ظ‰ ط£ظٹظ‚ظˆظ†ط© ط§ظ„ظ…ط´ط§ط±ظƒط© <Share className="inline h-4 w-4 mx-1" /> ط£ط³ظپظ„ Safari</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-neon-purple/20 text-neon-purple w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-sm">2</span>
                    <span>ظ…ط±ظ‘ط± ظ„ظ„ط£ط³ظپظ„ ظˆط§ط®طھط± "ط¥ط¶ط§ظپط© ط¥ظ„ظ‰ ط§ظ„ط´ط§ط´ط© ط§ظ„ط±ط¦ظٹط³ظٹط©"</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-neon-purple/20 text-neon-purple w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-sm">3</span>
                    <span>ط§ط¶ط؛ط· "ط¥ط¶ط§ظپط©" ظپظٹ ط£ط¹ظ„ظ‰ ط§ظ„ط´ط§ط´ط©</span>
                  </li>
                </ol>
              </div>

              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full py-6 text-lg border-border/50"
              >
                ط§ظ„ط¹ظˆط¯ط© ظ„ظ„ط±ط¦ظٹط³ظٹط©
              </Button>
            </div>
          ) : deferredPrompt ? (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-2 text-neon-purple">
                <Download className="h-6 w-6" />
                <span className="text-xl font-semibold">طھط«ط¨ظٹطھ ط§ظ„طھط·ط¨ظٹظ‚</span>
              </div>

              <p className="text-muted-foreground">
                ط«ط¨ظ‘طھ ظ†ط¨ط¶ AI ظ„ظ„ظˆطµظˆظ„ ط§ظ„ط£ط³ط±ط¹ ظˆط¯ط¹ظ… ط§ظ„ط¹ظ…ظ„ ط¯ظˆظ† ط§طھطµط§ظ„.
              </p>

              <div className="space-y-3">
                <Button
                  onClick={handleInstall}
                  className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 py-6 text-lg gap-2"
                >
                  <Download className="h-5 w-5" />
                  طھط«ط¨ظٹطھ
                </Button>

                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="w-full py-6 text-lg border-border/50"
                >
                  ظ„ظٹط³ ط§ظ„ط¢ظ†
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Smartphone className="h-6 w-6" />
                <span className="text-xl font-semibold">ط§ظ„ظ…طھط§ط¨ط¹ط© ط¹ط¨ط± ط§ظ„ظ…طھطµظپط­</span>
              </div>

              <p className="text-muted-foreground">
                ظٹظ…ظƒظ†ظƒ ط§ظ„طھط«ط¨ظٹطھ ظ„ط§ط­ظ‚ط§ظ‹ ظ…ظ† ظ‚ط§ط¦ظ…ط© ط§ظ„ظ…طھطµظپط­ ط£ظˆ ط§ظ„ظ…طھط§ط¨ط¹ط© ط§ظ„ط¢ظ†.
              </p>

              <Button
                onClick={() => navigate('/')}
                className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 py-6 text-lg"
              >
                ط§ط³طھظƒط´ط§ظپ ط§ظ„ط£ط¯ظˆط§طھ
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Install;

