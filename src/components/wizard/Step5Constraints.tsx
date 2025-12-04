import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Clock, MapPin, Heart, Ban, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step5ConstraintsProps {
  data: {
    timeAvailable: string;
    workSetting: string;
    hasCaregiver: boolean;
    caregiverDetails: string;
    avoidIndustries: string[];
  };
  updateData: (data: Partial<Step5ConstraintsProps["data"]>) => void;
  onNext: () => void;
  onBack: () => void;
}

const TIME_OPTIONS = [
  { id: "5-10", label: "5-10 hours", description: "A few hours per week" },
  { id: "10-20", label: "10-20 hours", description: "Part-time commitment" },
  { id: "20-30", label: "20-30 hours", description: "Significant time" },
  { id: "30+", label: "30+ hours", description: "Full-time availability" },
];

const WORK_SETTINGS = [
  { id: "remote", label: "Remote only", icon: "🏠" },
  { id: "mostly-remote", label: "Mostly remote", icon: "💻" },
  { id: "hybrid", label: "Hybrid", icon: "🔄" },
  { id: "in-person", label: "In-person", icon: "🏢" },
];

const INDUSTRIES_TO_AVOID = [
  "Healthcare", "Finance", "Technology", "Retail", "Manufacturing",
  "Education", "Government", "Legal", "Real Estate", "Entertainment"
];

export function Step5Constraints({ data, updateData, onNext, onBack }: Step5ConstraintsProps) {
  const toggleIndustry = (industry: string) => {
    if (data.avoidIndustries.includes(industry)) {
      updateData({ avoidIndustries: data.avoidIndustries.filter((i) => i !== industry) });
    } else {
      updateData({ avoidIndustries: [...data.avoidIndustries, industry] });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Constraints
        </h2>
        <p className="text-muted-foreground">
          Let us know about any limitations we should consider.
        </p>
      </div>

      {/* Time available */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <Label className="text-base font-semibold">Time available per week</Label>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {TIME_OPTIONS.map(({ id, label, description }) => (
            <button
              key={id}
              onClick={() => updateData({ timeAvailable: id })}
              className={cn(
                "p-4 rounded-xl border text-left transition-all",
                data.timeAvailable === id
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/30"
              )}
            >
              <div className="font-medium">{label}</div>
              <div className="text-sm text-muted-foreground">{description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Work setting */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <Label className="text-base font-semibold">Work setting preference</Label>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {WORK_SETTINGS.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => updateData({ workSetting: id })}
              className={cn(
                "p-4 rounded-xl border text-center transition-all",
                data.workSetting === id
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/30"
              )}
            >
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-sm font-medium">{label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Caregiving */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" />
          <Label className="text-base font-semibold">Caregiving responsibilities</Label>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => updateData({ hasCaregiver: false })}
            className={cn(
              "px-6 py-3 rounded-xl border transition-all",
              !data.hasCaregiver
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/30"
            )}
          >
            No
          </button>
          <button
            onClick={() => updateData({ hasCaregiver: true })}
            className={cn(
              "px-6 py-3 rounded-xl border transition-all",
              data.hasCaregiver
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/30"
            )}
          >
            Yes
          </button>
        </div>

        {data.hasCaregiver && (
          <Textarea
            value={data.caregiverDetails}
            onChange={(e) => updateData({ caregiverDetails: e.target.value })}
            placeholder="Tell us more (optional)..."
            rows={2}
          />
        )}
      </div>

      {/* Industries to avoid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Ban className="w-5 h-5 text-primary" />
          <Label className="text-base font-semibold">Industries to avoid (optional)</Label>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {data.avoidIndustries.map((industry) => (
            <Badge key={industry} variant="secondary" className="px-3 py-1.5">
              {industry}
              <button onClick={() => toggleIndustry(industry)} className="ml-2 hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {INDUSTRIES_TO_AVOID.filter((i) => !data.avoidIndustries.includes(i)).map((industry) => (
            <Badge
              key={industry}
              variant="outline"
              className="cursor-pointer hover:bg-destructive/10 hover:border-destructive/30 transition-colors"
              onClick={() => toggleIndustry(industry)}
            >
              {industry}
            </Badge>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext}>
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
