import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Sparkles, Briefcase, Clock, Wallet, PenTool, Building, Video, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step7GoalsProps {
  data: {
    incomePaths: string[];
    incomeType: string;
    timeline: string;
  };
  updateData: (data: Partial<Step7GoalsProps["data"]>) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const INCOME_PATHS = [
  { id: "career-change", label: "Full-time career change", icon: Briefcase },
  { id: "part-time", label: "Part-time side income", icon: Clock },
  { id: "freelancing", label: "Freelancing/consulting", icon: PenTool },
  { id: "small-business", label: "Small business", icon: Building },
  { id: "creator", label: "Creator income", icon: Video },
  { id: "rental", label: "Rental income", icon: Home },
];

const INCOME_TYPES = [
  { id: "active", label: "Active", description: "Trading time for money" },
  { id: "semi-passive", label: "Semi-passive", description: "Some ongoing work" },
  { id: "mix", label: "Mix of both", description: "Diversified approach" },
];

const TIMELINES = [
  { id: "1-3mo", label: "1-3 months", description: "Quick start" },
  { id: "3-6mo", label: "3-6 months", description: "Building up" },
  { id: "6-12mo", label: "6-12 months", description: "Longer runway" },
  { id: "long-term", label: "Long-term", description: "No rush" },
];

export function Step7Goals({ data, updateData, onBack, onSubmit, isSubmitting }: Step7GoalsProps) {
  const toggleIncomePath = (path: string) => {
    if (data.incomePaths.includes(path)) {
      updateData({ incomePaths: data.incomePaths.filter((p) => p !== path) });
    } else {
      updateData({ incomePaths: [...data.incomePaths, path] });
    }
  };

  const canSubmit = data.incomePaths.length > 0 && data.incomeType && data.timeline;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Goals & Income Preferences
        </h2>
        <p className="text-muted-foreground">
          What kind of income opportunities are you open to?
        </p>
      </div>

      {/* Income paths */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Income paths you're open to</Label>
        <p className="text-sm text-muted-foreground">Select all that interest you</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {INCOME_PATHS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => toggleIncomePath(id)}
              className={cn(
                "p-4 rounded-xl border text-left transition-all",
                data.incomePaths.includes(id)
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/30"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 mb-2",
                data.incomePaths.includes(id) ? "text-primary" : "text-muted-foreground"
              )} />
              <div className="text-sm font-medium">{label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Income type */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Preferred income type</Label>
        
        <div className="grid grid-cols-3 gap-3">
          {INCOME_TYPES.map(({ id, label, description }) => (
            <button
              key={id}
              onClick={() => updateData({ incomeType: id })}
              className={cn(
                "p-4 rounded-xl border text-center transition-all",
                data.incomeType === id
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/30"
              )}
            >
              <div className="font-medium text-sm">{label}</div>
              <div className="text-xs text-muted-foreground">{description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">When do you want to start earning?</Label>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TIMELINES.map(({ id, label, description }) => (
            <button
              key={id}
              onClick={() => updateData({ timeline: id })}
              className={cn(
                "p-4 rounded-xl border text-center transition-all",
                data.timeline === id
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/30"
              )}
            >
              <div className="font-medium text-sm">{label}</div>
              <div className="text-xs text-muted-foreground">{description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button 
          variant="hero" 
          size="lg"
          onClick={onSubmit} 
          disabled={!canSubmit || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate My Opportunities
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
