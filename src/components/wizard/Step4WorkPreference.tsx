import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, ArrowRight, Hammer, Activity, Cog, Wrench, Building2, BarChart3, Palette, Users, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step4WorkPreferenceProps {
  data: {
    preferredWorkTypes: string[];
    physicalComfort: number;
    toolsComfort: number;
  };
  updateData: (data: Partial<Step4WorkPreferenceProps["data"]>) => void;
  onNext: () => void;
  onBack: () => void;
}

const WORK_TYPE_OPTIONS = [
  { id: "hands-on", label: "Working with my hands", icon: Hammer, description: "Building, fixing, creating" },
  { id: "physical", label: "Physical or active work", icon: Activity, description: "Moving, lifting, field work" },
  { id: "machines", label: "Working with machines/equipment", icon: Cog, description: "Operating, maintaining" },
  { id: "mechanical", label: "Solving mechanical problems", icon: Wrench, description: "Troubleshooting, repairing" },
  { id: "office", label: "Office-based work", icon: Building2, description: "Desk work, meetings" },
  { id: "analytical", label: "Analytical/computer work", icon: BarChart3, description: "Data, research, coding" },
  { id: "creative", label: "Creative or artistic work", icon: Palette, description: "Design, content, media" },
  { id: "managing", label: "Managing processes & people", icon: Users, description: "Leadership, coordination" },
  { id: "helping", label: "Helping or interacting with people", icon: Heart, description: "Service, support, care" },
];

export function Step4WorkPreference({ data, updateData, onNext, onBack }: Step4WorkPreferenceProps) {
  const toggleWorkType = (type: string) => {
    const current = data.preferredWorkTypes || [];
    if (current.includes(type)) {
      updateData({ preferredWorkTypes: current.filter((t) => t !== type) });
    } else if (current.length < 3) {
      updateData({ preferredWorkTypes: [...current, type] });
    }
  };

  const canProceed = (data.preferredWorkTypes?.length || 0) >= 1;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Work Type Preferences
        </h2>
        <p className="text-muted-foreground">
          What type of work do you naturally prefer? This helps us match you with the right career tracks.
        </p>
      </div>

      {/* Work type preference - multi-select up to 3 */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold">What type of work do you naturally prefer?</Label>
          <p className="text-sm text-muted-foreground mt-1">Select up to 3 that appeal to you most</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {WORK_TYPE_OPTIONS.map(({ id, label, icon: Icon, description }) => {
            const isSelected = data.preferredWorkTypes?.includes(id);
            const isDisabled = !isSelected && (data.preferredWorkTypes?.length || 0) >= 3;
            
            return (
              <button
                key={id}
                onClick={() => !isDisabled && toggleWorkType(id)}
                disabled={isDisabled}
                className={cn(
                  "p-4 rounded-xl border text-left transition-all",
                  isSelected
                    ? "border-primary bg-primary/10 text-foreground"
                    : isDisabled
                    ? "border-border bg-muted/50 opacity-50 cursor-not-allowed"
                    : "border-border bg-card hover:border-primary/30"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 mb-2",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )} />
                <div className="font-medium text-sm">{label}</div>
                <div className="text-xs text-muted-foreground mt-1">{description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Physical comfort slider */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold">How comfortable are you with physically active or hands-on work?</Label>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Not at all comfortable</span>
          <span>Very comfortable</span>
        </div>
        <Slider
          value={[data.physicalComfort || 3]}
          onValueChange={([value]) => updateData({ physicalComfort: value })}
          min={1}
          max={5}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} className={data.physicalComfort === n ? "text-primary font-medium" : ""}>
              {n}
            </span>
          ))}
        </div>
      </div>

      {/* Tools comfort slider */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold">How comfortable are you using tools, machinery, or mechanical equipment?</Label>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Not at all comfortable</span>
          <span>Very comfortable</span>
        </div>
        <Slider
          value={[data.toolsComfort || 3]}
          onValueChange={([value]) => updateData({ toolsComfort: value })}
          min={1}
          max={5}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} className={data.toolsComfort === n ? "text-primary font-medium" : ""}>
              {n}
            </span>
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
