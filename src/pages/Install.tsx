import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Check, Share, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function Install() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Smartphone className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Install CareerMovr</CardTitle>
          <CardDescription>
            Add CareerMovr to your home screen for quick access and an app-like experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isInstalled ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                <Check className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-muted-foreground">
                CareerMovr is already installed on your device!
              </p>
              <Button onClick={() => navigate("/")} className="w-full">
                Open App
              </Button>
            </div>
          ) : isIOS ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                To install on iOS, follow these steps:
              </p>
              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    1
                  </span>
                  <span className="flex items-center gap-2">
                    Tap the Share button <Share className="h-4 w-4 inline" />
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    2
                  </span>
                  <span className="flex items-center gap-2">
                    Scroll and tap "Add to Home Screen" <Plus className="h-4 w-4 inline" />
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    3
                  </span>
                  <span>Tap "Add" to confirm</span>
                </li>
              </ol>
              <Button variant="outline" onClick={() => navigate("/")} className="w-full">
                Continue in Browser
              </Button>
            </div>
          ) : deferredPrompt ? (
            <div className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Works offline
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Fast loading
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Home screen access
                </li>
              </ul>
              <Button onClick={handleInstall} className="w-full gap-2">
                <Download className="h-4 w-4" />
                Install App
              </Button>
              <Button variant="outline" onClick={() => navigate("/")} className="w-full">
                Continue in Browser
              </Button>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                Open this page in Chrome, Edge, or Safari to install the app.
              </p>
              <Button variant="outline" onClick={() => navigate("/")} className="w-full">
                Continue in Browser
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
