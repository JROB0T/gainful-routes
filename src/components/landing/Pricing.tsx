import { Button } from "@/components/ui/button";
import { Check, X, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const freeFeatures = [
  { text: "Start your profile", included: true },
  { text: "Begin the assessment", included: true },
  { text: "Partial insights preview", included: true },
  { text: "Full career report", included: false },
  { text: "30-day Success Plan", included: false },
];

const premiumFeatures = [
  "Full career report with 10-15 paths",
  "Complete skill gaps analysis",
  "30-day personalized roadmap",
  "Role match compatibility scores",
  "Resume alignment tips",
  "AI-proof career suggestions",
  "AI-centric opportunities",
  "Up to 3 re-runs",
  "Export & print your plan",
];

export function Pricing() {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-12 md:py-24 bg-background">
      <div className="container px-4 md:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
            Start Free —{" "}
            <span className="text-gradient-primary">Upgrade Anytime</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Try before you commit. No credit card required to start.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="p-6 md:p-8 rounded-2xl bg-card border border-border">
            <h3 className="text-xl font-display font-bold mb-2 text-foreground">
              Free
            </h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-display font-bold text-foreground">
                $0
              </span>
              <span className="text-muted-foreground">to start</span>
            </div>

            <ul className="space-y-3 mb-8">
              {freeFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  {feature.included ? (
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-success" />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                      <X className="w-3 h-3 text-muted-foreground" />
                    </div>
                  )}
                  <span
                    className={
                      feature.included
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }
                  >
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>

            <Button
              variant="outline"
              size="lg"
              className="w-full min-h-[48px]"
              onClick={() => navigate("/get-started")}
            >
              Start Free
            </Button>
          </div>

          {/* Premium Plan */}
          <div className="relative p-6 md:p-8 rounded-2xl bg-card border-2 border-primary/30 shadow-lg">
            {/* Popular badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-accent text-accent-foreground text-sm font-semibold shadow-lg">
                <Sparkles className="w-4 h-4" />
                Best Value
              </div>
            </div>

            <h3 className="text-xl font-display font-bold mb-2 text-foreground mt-2">
              Premium
            </h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-display font-bold text-foreground">
                $10
              </span>
              <span className="text-muted-foreground">one-time</span>
            </div>

            <ul className="space-y-3 mb-8">
              {premiumFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-success" />
                  </div>
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              variant="hero"
              size="lg"
              className="w-full min-h-[48px]"
              onClick={() => navigate("/get-started")}
            >
              Get Full Access
            </Button>

            <p className="text-center text-xs text-muted-foreground mt-4">
              30-day access • Secure payment via Stripe
            </p>
          </div>
        </div>

        {/* Repeated CTA */}
        <div className="text-center mt-12">
          <Button
            variant="gradient"
            size="lg"
            className="min-h-[48px]"
            onClick={() => navigate("/get-started")}
          >
            Take the Free Career Assessment
          </Button>
        </div>
      </div>
    </section>
  );
}
