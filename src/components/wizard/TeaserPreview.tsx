import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock, Sparkles, Target, TrendingUp, Briefcase, Check, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TeaserPreviewProps {
  analysis: {
    skillsCount: number;
    alignedTypes: string[];
    opportunityPaths: number;
    assetsFound: boolean;
    headline?: string;
  } | null;
  onBack: () => void;
  isLoggedIn: boolean;
}

export function TeaserPreview({ analysis, onBack, isLoggedIn }: TeaserPreviewProps) {
  const navigate = useNavigate();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handlePayment = async () => {
    if (!isLoggedIn) {
      navigate("/auth");
      return;
    }

    setIsProcessingPayment(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-payment");
      
      if (error) {
        console.error("Payment error:", error);
        toast.error("Failed to start checkout. Please try again.");
        return;
      }

      if (data?.url) {
        // On mobile, redirect in same window for better UX
        // On desktop, open in new tab
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
          window.location.href = data.url;
        } else {
          window.open(data.url, "_blank");
          toast.info("Complete payment in the new tab, then return here.");
        }
      } else {
        toast.error("No checkout URL received. Please try again.");
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (!analysis) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No analysis data available.</p>
        <Button variant="ghost" onClick={onBack} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Success message */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-success/20 text-success flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Profile Analysis Complete!
        </h2>
        <p className="text-muted-foreground">
          {analysis.headline || "We've discovered some exciting opportunities for you."}
        </p>
      </div>

      {/* Teaser insights */}
      <div className="grid gap-4 md:grid-cols-2">
        <TeaserCard
          icon={<Sparkles className="w-5 h-5" />}
          title="Skills Identified"
          description={`We identified multiple high-value skills in your background.`}
          highlight={`${analysis.skillsCount}+ skills detected`}
        />
        <TeaserCard
          icon={<Target className="w-5 h-5" />}
          title="Role Alignment"
          description={`You appear aligned with ${analysis.alignedTypes.join(" and ").toLowerCase()}.`}
          highlight="Strong match potential"
        />
        <TeaserCard
          icon={<TrendingUp className="w-5 h-5" />}
          title="Opportunity Paths"
          description="Several promising opportunity pathways match your experience."
          highlight={`${analysis.opportunityPaths}+ paths available`}
        />
        <TeaserCard
          icon={<Briefcase className="w-5 h-5" />}
          title="Income Potential"
          description={analysis.assetsFound 
            ? "You may have assets that could unlock rental, consulting, or freelance income."
            : "Multiple income streams could be available based on your profile."
          }
          highlight="Untapped potential"
        />
      </div>

      {/* Blurred preview hint */}
      <div className="relative rounded-xl bg-muted/50 p-6 overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-md bg-gradient-to-b from-transparent to-background/80 z-10" />
        <div className="relative z-20 text-center">
          <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-1">
            Your full assessment is ready
          </p>
          <p className="font-medium text-foreground">
            Unlock to see all insights, opportunities & your 30-day Success Plan
          </p>
        </div>
        {/* Fake blurred content */}
        <div className="absolute inset-0 opacity-30 blur-sm p-4">
          <div className="h-4 bg-muted rounded w-3/4 mb-3" />
          <div className="h-4 bg-muted rounded w-1/2 mb-3" />
          <div className="h-4 bg-muted rounded w-2/3" />
        </div>
      </div>

      {/* Paywall CTA */}
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-6 md:p-8 border border-primary/20">
        <div className="text-center">
          <h3 className="text-xl font-display font-bold text-foreground mb-2">
            Unlock Your Full Assessment
          </h3>
          <p className="text-muted-foreground mb-6">
            Get 10-15 personalized opportunities + your 30-day Success Plan
          </p>

          <div className="flex items-baseline justify-center gap-2 mb-6">
            <span className="text-4xl font-display font-bold text-foreground">$10</span>
            <span className="text-muted-foreground">one-time</span>
          </div>

          <ul className="text-sm text-left max-w-xs mx-auto space-y-2 mb-6">
            {[
              "Full personalized assessment",
              "30-day dashboard access",
              "Complete Success Plan",
              "Up to 3 re-runs",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                <span className="text-foreground">{item}</span>
              </li>
            ))}
          </ul>

          <Button
            variant="hero"
            size="xl"
            className="w-full sm:w-auto whitespace-nowrap"
            onClick={handlePayment}
            disabled={isProcessingPayment}
          >
            {isProcessingPayment ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : isLoggedIn ? (
              "Unlock Now — $10"
            ) : (
              "Sign Up to Unlock — $10"
            )}
          </Button>

          <p className="text-xs text-muted-foreground mt-4">
            Secure payment via Stripe • 30-day access • Plus applicable tax
          </p>
        </div>
      </div>

      <div className="flex justify-start">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>
    </div>
  );
}

function TeaserCard({
  icon,
  title,
  description,
  highlight,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight: string;
}) {
  return (
    <div className="p-5 rounded-xl bg-card border border-border">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-1">{title}</h4>
          <p className="text-sm text-muted-foreground mb-2">{description}</p>
          <span className="text-xs font-medium text-primary">{highlight}</span>
        </div>
      </div>
    </div>
  );
}
