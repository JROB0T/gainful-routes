import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const includedFeatures = [
  "Full AI-powered assessment",
  "10-15 tailored career & income paths",
  "Complete 30-day Success Plan",
  "Skills & strengths analysis",
  "Income potential estimates",
  "Week-by-week action items",
  "Up to 3 profile re-runs",
  "30-day dashboard access",
  "Export & print your plan",
];

export function Pricing() {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-background">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
            Simple, <span className="text-gradient-primary">Transparent</span> Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            One payment. Full access. No subscriptions.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <div className="relative p-8 md:p-10 rounded-3xl bg-card border-2 border-primary/20 shadow-xl hover:shadow-glow transition-shadow duration-300">
            {/* Popular badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-accent text-accent-foreground text-sm font-semibold shadow-lg">
                <Sparkles className="w-4 h-4" />
                Best Value
              </div>
            </div>

            {/* Price */}
            <div className="text-center mb-8 pt-4">
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-5xl md:text-6xl font-display font-bold text-foreground">$10</span>
                <span className="text-muted-foreground font-medium">one-time</span>
              </div>
              <p className="text-muted-foreground">30-day full access</p>
            </div>

            {/* Features list */}
            <ul className="space-y-4 mb-8">
              {includedFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-success/20 text-success flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Button 
              variant="hero" 
              size="xl" 
              className="w-full"
              onClick={() => navigate("/get-started")}
            >
              Get Started Now
            </Button>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Secure one-time payment via Stripe. No subscription.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
