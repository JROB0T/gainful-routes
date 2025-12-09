import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-hero pt-16">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/8 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-accent/8 rounded-full blur-3xl animate-float animation-delay-200" />
      </div>

      <div className="container relative z-10 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Text content */}
          <div className="flex-1 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
            <h1 className="text-[28px] sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6 animate-fade-in">
              Find Your Ideal Career Path —{" "}
              <span className="text-gradient-primary">
                Based on Your Strengths
              </span>
              , Not Guesswork
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in animation-delay-200 max-w-xl mx-auto lg:mx-0">
              A personalized career assessment that recommends roles, industries,
              and next steps — in minutes.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-in animation-delay-400">
              <Button
                variant="hero"
                size="xl"
                onClick={() => navigate("/get-started")}
                className="group w-full sm:w-auto min-h-[48px]"
              >
                Take the Free Career Assessment
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto min-h-[48px] gap-2"
                onClick={() =>
                  document
                    .getElementById("how-it-works")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                <Play className="w-4 h-4" />
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Hero Image / Dashboard Preview */}
          <div className="flex-1 w-full max-w-[90%] sm:max-w-lg lg:max-w-xl animate-fade-in-up animation-delay-600">
            <div className="relative p-4">
              <div className="rounded-2xl overflow-hidden shadow-xl border border-border bg-card">
                {/* Mock Dashboard Header */}
                <div className="bg-gradient-primary px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary-foreground/30" />
                    <div className="w-3 h-3 rounded-full bg-primary-foreground/30" />
                    <div className="w-3 h-3 rounded-full bg-primary-foreground/30" />
                    <span className="ml-2 text-xs text-primary-foreground/80">
                      Your Career Report
                    </span>
                  </div>
                </div>
                {/* Mock Content */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
                    <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                      <span className="text-success font-bold">92%</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Career Match Score
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Product Manager
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <span className="text-primary font-bold text-sm">15</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Career Paths Found
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Matched to your skills
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/10 border border-accent/20">
                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                      <span className="text-accent font-bold text-sm">30</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Day Success Plan
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Week-by-week roadmap
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative shadow */}
              <div className="absolute -inset-4 bg-gradient-primary/10 rounded-3xl blur-2xl -z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
