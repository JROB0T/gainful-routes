import { useState } from "react";
import { Compass, Copy, Check } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function Footer() {
  const [contactOpen, setContactOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const supportEmail = "support@careermovr.com";

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCopyEmail = async () => {
    await navigator.clipboard.writeText(supportEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="py-12 bg-secondary/50 border-t border-border">
      <div className="container px-4 md:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Compass className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl text-foreground">
                CareerMovr
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              AI-powered career discovery that helps you find personalized career
              paths and opportunities based on your unique strengths.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-left text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection("what-you-get")}
                className="text-left text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="text-left text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection("faq")}
                className="text-left text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                FAQ
              </button>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <nav className="flex flex-col gap-2">
              <Link
                to="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
              <button
                onClick={() => setContactOpen(true)}
                className="text-left text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </button>
            </nav>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-border pt-6 mb-6">
          <p className="text-xs text-muted-foreground text-center max-w-3xl mx-auto">
            <strong>Disclaimer:</strong> CareerMovr provides informational career and income recommendations generated using AI. CareerMovr LLC does not guarantee job placement, income outcomes, or accuracy of AI-generated content. Nothing on this site constitutes professional, legal, financial, or employment advice.
          </p>
        </div>

        <div className="border-t border-border pt-6">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} CareerMovr LLC. All rights reserved.
          </p>
        </div>
      </div>
      {/* Contact Dialog */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Us</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <p className="text-muted-foreground text-center">
              Send us an email at:
            </p>
            <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg w-full justify-center">
              <span className="font-mono text-foreground">{supportEmail}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyEmail}
                className="h-8 w-8"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            {copied && (
              <p className="text-sm text-green-500">Copied to clipboard!</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  );
}
