import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, ArrowRight, Users, Lightbulb, Wrench, FileText, Database } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step4PersonalityProps {
  data: {
    workTypes: string[];
    structurePreference: number;
    riskTolerance: number;
    balanceVsIncome: number;
  };
  updateData: (data: Partial<Step4PersonalityProps["data"]>) => void;
  onNext: () => void;
  onBack: () => void;
}

const WORK_TYPES = [
  { id: "people", label: "People", icon: Users, description: "Working with others" },
  { id: "ideas", label: "Ideas", icon: Lightbulb, description: "Creative thinking" },
  { id: "things", label: "Things", icon: Wrench, description: "Building/fixing" },
  { id: "content", label: "Content", icon: FileText, description: "Writing/media" },
  { id: "data", label: "Data", icon: Database, description: "Analysis/numbers" },
];

export function Step4Personality({ data, updateData, onNext, onBack }: Step4PersonalityProps) {
  const toggleWorkType = (type: string) => {
    if (data.workTypes.includes(type)) {
      updateData({ workTypes: data.workTypes.filter((t) => t !== type) });
    } else {
      updateData({ workTypes: [...data.workTypes, type] });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Personality & Work Style
        </h2>
        <p className="text-muted-foreground">
          Help us understand how you prefer to work.
        </p>
      </div>

      {/* Work types */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Preferred work types</Label>
        <p className="text-sm text-muted-foreground">Select all that appeal to you</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {WORK_TYPES.map(({ id, label, icon: Icon, description }) => (
            <button
              key={id}
              onClick={() => toggleWorkType(id)}
              className={cn(
                "p-4 rounded-xl border text-left transition-all",
                data.workTypes.includes(id)
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-card hover:border-primary/30"
              )}
            >
              <Icon className={cn(
                "w-6 h-6 mb-2",
                data.workTypes.includes(id) ? "text-primary" : "text-muted-foreground"
              )} />
              <div className="font-medium text-sm">{label}</div>
              <div className="text-xs text-muted-foreground">{description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-8">
        <div className="space-y-4">
          <Label className="text-base font-semibold">Structure preference</Label>
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Flexible / Freelance</span>
            <span>Structured / Routine</span>
          </div>
          <Slider
            value={[data.structurePreference]}
            onValueChange={([value]) => updateData({ structurePreference: value })}
            min={1}
            max={5}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className={data.structurePreference === n ? "text-primary font-medium" : ""}>
                {n}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-base font-semibold">Risk tolerance</Label>
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Play it safe</span>
            <span>High risk, high reward</span>
          </div>
          <Slider
            value={[data.riskTolerance]}
            onValueChange={([value]) => updateData({ riskTolerance: value })}
            min={1}
            max={5}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className={data.riskTolerance === n ? "text-primary font-medium" : ""}>
                {n}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-base font-semibold">Work-life balance vs income priority</Label>
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Balance first</span>
            <span>Income first</span>
          </div>
          <Slider
            value={[data.balanceVsIncome]}
            onValueChange={([value]) => updateData({ balanceVsIncome: value })}
            min={1}
            max={5}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className={data.balanceVsIncome === n ? "text-primary font-medium" : ""}>
                {n}
              </span>
            ))}
          </div>
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
