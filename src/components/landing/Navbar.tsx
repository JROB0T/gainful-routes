import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Compass, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Navbar() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (selector: string) => {
    document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container px-4 md:px-6">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-gradient-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <Compass className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg md:text-xl text-foreground">CareerMovr</span>
          </a>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-8">
            <a 
              href="#how-it-works" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </a>
            <a 
              href="#features" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('.py-24.bg-secondary\\/30');
              }}
            >
              Features
            </a>
            <a 
              href="#pricing" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('.max-w-lg.mx-auto');
              }}
            >
              Pricing
            </a>
          </nav>

          {/* Desktop auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
            <Button variant="gradient" onClick={() => navigate("/get-started")}>
              Get Started
            </Button>
          </div>

          {/* Mobile: CTA + Menu button */}
          <div className="flex md:hidden items-center gap-2">
            <Button 
              size="sm" 
              variant="gradient" 
              onClick={() => navigate("/get-started")}
              className="text-xs px-3 h-8"
            >
              Get Started
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-lg">
          <nav className="container px-4 py-4 flex flex-col gap-3">
            <a 
              href="#how-it-works" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('#how-it-works');
              }}
            >
              How It Works
            </a>
            <a 
              href="#features" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('.py-24.bg-secondary\\/30');
              }}
            >
              Features
            </a>
            <a 
              href="#pricing" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('.max-w-lg.mx-auto');
              }}
            >
              Pricing
            </a>
            <div className="border-t border-border/50 pt-3 mt-1">
              <Button 
                variant="ghost" 
                className="w-full justify-start" 
                onClick={() => {
                  navigate("/auth");
                  setMobileMenuOpen(false);
                }}
              >
                Sign In
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
