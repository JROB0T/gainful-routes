import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Building2, Home, TreePine, Warehouse, MapPin, Factory, Store, HeartPulse, HardHat, Mountain, Dumbbell, Shield, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step5EnvironmentProps {
  data: {
    environmentPreferences: string[];
    safetyConditions: string[];
    certificationOpenness: string;
  };
  updateData: (data: Partial<Step5EnvironmentProps["data"]>) => void;
  onNext: () => void;
  onBack: () => void;
}

const ENVIRONMENT_OPTIONS = [
  { id: "office", label: "Office setting", icon: Building2 },
  { id: "remote", label: "Remote / Work-from-home", icon: Home },
  { id: "outdoor", label: "Outdoor work", icon: TreePine },
  { id: "workshop", label: "Workshop / Shop floor / Warehouse", icon: Warehouse },
  { id: "on-site", label: "On-site / Client visits", icon: MapPin },
  { id: "industrial", label: "Industrial or mechanical environments", icon: Factory },
  { id: "retail", label: "Retail or customer-facing", icon: Store },
  { id: "healthcare", label: "Hospital / Care environment", icon: HeartPulse },
];

const SAFETY_CONDITIONS = [
  { id: "outdoors", label: "Working outdoors", icon: TreePine },
  { id: "heights", label: "Working at heights (ladders, lifts)", icon: Mountain },
  { id: "heavy-lifting", label: "Occasional heavy lifting", icon: Dumbbell },
  { id: "protective-equipment", label: "Using protective equipment", icon: Shield },
  { id: "noise", label: "Noise or industrial environments", icon: Volume2 },
  { id: "none", label: "None of the above", icon: HardHat },
];

const CERTIFICATION_OPTIONS = [
  { id: "very-open", label: "Very open", description: "Ready to invest 3-12 months in training" },
  { id: "somewhat-open", label: "Somewhat open", description: "Open to shorter programs" },
  { id: "not-interested", label: "Not interested", description: "Prefer to use existing skills" },
];

export function Step5Environment({ data, updateData, onNext, onBack }: Step5EnvironmentProps) {
  const toggleEnvironment = (env: string) => {
    const current = data.environmentPreferences || [];
    if (current.includes(env)) {
      updateData({ environmentPreferences: current.filter((e) => e !== env) });
    } else {
      updateData({ environmentPreferences: [...current, env] });
    }
  };

  const toggleSafety = (condition: string) => {
    const current = data.safetyConditions || [];
    if (condition === "none") {
      // "None" clears all others
      updateData({ safetyConditions: current.includes("none") ? [] : ["none"] });
    } else {
      // Remove "none" if selecting other options
      const filtered = current.filter(c => c !== "none");
      if (filtered.includes(condition)) {
        updateData({ safetyConditions: filtered.filter((c) => c !== condition) });
      } else {
        updateData({ safetyConditions: [...filtered, condition] });
      }
    }
  };

  const canProceed = (data.environmentPreferences?.length || 0) >= 1 && data.certificationOpenness;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Work Environment
        </h2>
        <p className="text-muted-foreground">
          Tell us about your ideal work environment and conditions.
        </p>
      </div>

      {/* Environment preferences */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold">Which work environments do you feel comfortable in?</Label>
          <p className="text-sm text-muted-foreground mt-1">Select all that apply</p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ENVIRONMENT_OPTIONS.map(({ id, label, icon: Icon }) => {
            const isSelected = data.environmentPreferences?.includes(id);
            return (
              <button
                key={id}
                onClick={() => toggleEnvironment(id)}
                className={cn(
                  "p-3 rounded-xl border text-center transition-all",
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/30"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 mx-auto mb-2",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )} />
                <div className="text-xs font-medium">{label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Safety conditions */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold">Are you comfortable with work that may involve any of the following?</Label>
          <p className="text-sm text-muted-foreground mt-1">Select all that apply</p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {SAFETY_CONDITIONS.map(({ id, label, icon: Icon }) => {
            const isSelected = data.safetyConditions?.includes(id);
            return (
              <button
                key={id}
                onClick={() => toggleSafety(id)}
                className={cn(
                  "p-3 rounded-xl border text-left transition-all flex items-center gap-3",
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/30"
                )}
              >
                <Icon className={cn(
                  "w-4 h-4 flex-shrink-0",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )} />
                <span className="text-sm font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Certification openness */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold">How open are you to short-term certification or trade programs (3-12 months)?</Label>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CERTIFICATION_OPTIONS.map(({ id, label, description }) => (
            <button
              key={id}
              onClick={() => updateData({ certificationOpenness: id })}
              className={cn(
                "p-4 rounded-xl border text-left transition-all",
                data.certificationOpenness === id
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/30"
              )}
            >
              <div className="font-medium text-sm">{label}</div>
              <div className="text-xs text-muted-foreground mt-1">{description}</div>
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
        <Button onClick={onNext} disabled={!canProceed}>
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
