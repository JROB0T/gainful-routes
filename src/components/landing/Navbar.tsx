import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Compass, Menu, X, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function Navbar() {
  const navigate = useNavigate();
  const { username, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileMenuOpen]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-lg border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container px-4 md:px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              CareerMovr
            </span>
          </a>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("what-you-get")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              FAQ
            </button>
          </nav>

          {/* Desktop auth buttons / user info */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{username || user.email?.split('@')[0]}</span>
                </div>
                <Button variant="gradient" onClick={() => navigate("/dashboard")}>
                  Dashboard
                </Button>
              </div>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
                <Button variant="gradient" onClick={() => navigate("/get-started")}>
                  Take Free Assessment
                </Button>
              </>
            )}
          </div>

          {/* Mobile: User badge + CTA + Menu button */}
          <div className="flex md:hidden items-center gap-2" ref={menuRef}>
            {user && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-secondary/50 border border-border max-w-[100px]">
                <User className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <span className="text-xs font-medium text-foreground truncate">
                  {username || user.email?.split('@')[0]}
                </span>
              </div>
            )}
            <Button
              size="sm"
              variant="gradient"
              onClick={() => navigate(user ? "/dashboard" : "/get-started")}
              className="text-xs px-3 h-9 whitespace-nowrap"
            >
              {user ? "Dashboard" : "Free Assessment"}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu with backdrop */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop overlay */}
          <div 
            className="md:hidden fixed inset-0 top-16 bg-background/80 backdrop-blur-sm z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Menu content */}
          <div className="md:hidden border-t border-border bg-background/98 backdrop-blur-lg relative z-50">
            <nav className="container px-4 py-4 flex flex-col gap-1">
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-3 px-2 rounded-lg hover:bg-secondary"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection("what-you-get")}
                className="text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-3 px-2 rounded-lg hover:bg-secondary"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-3 px-2 rounded-lg hover:bg-secondary"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection("faq")}
                className="text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-3 px-2 rounded-lg hover:bg-secondary"
              >
                FAQ
              </button>
              <div className="border-t border-border pt-3 mt-2">
                {user ? (
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-11"
                    onClick={() => {
                      navigate("/dashboard");
                      setMobileMenuOpen(false);
                    }}
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-11"
                    onClick={() => {
                      navigate("/auth");
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
