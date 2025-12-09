import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, ArrowRight, Hammer, Wrench, Users, BarChart3, MessageSquare, Palette, Rocket, Heart, Cog, ShoppingBag, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step6CareerStyleProps {
  data: {
    careerIdentity: string;
    dayToDayPreference: string[];
    structurePreference: number;
    riskTolerance: number;
    balanceVsIncome: number;
  };
  updateData: (data: Partial<Step6CareerStyleProps["data"]>) => void;
  onNext: () => void;
  onBack: () => void;
}

const CAREER_IDENTITIES = [
  { id: "builder", label: "Builder / Maker", icon: Hammer, description: "Creating things with hands or tools" },
  { id: "technician", label: "Technician / Problem Solver", icon: Wrench, description: "Fixing, diagnosing, troubleshooting" },
  { id: "manager", label: "Manager / Coordinator", icon: Users, description: "Leading teams, organizing projects" },
  { id: "analyst", label: "Analyst / Thinker", icon: BarChart3, description: "Data, research, strategy" },
  { id: "communicator", label: "Communicator / People Person", icon: MessageSquare, description: "Sales, training, relationship-building" },
  { id: "creative", label: "Creative / Designer", icon: Palette, description: "Art, design, content creation" },
  { id: "entrepreneur", label: "Entrepreneur / Self-Starter", icon: Rocket, description: "Starting ventures, taking initiative" },
  { id: "helper", label: "Helper / Service Provider", icon: Heart, description: "Caring for others, service roles" },
];

const DAY_TO_DAY_OPTIONS = [
  { id: "hands-on", label: "Hands-on tasks", icon: Hammer },
  { id: "problem-solving", label: "Problem solving", icon: Wrench },
  { id: "people", label: "Working with people", icon: Users },
  { id: "organizing", label: "Organizing & coordinating", icon: BarChart3 },
  { id: "software", label: "Using software & tools", icon: Cog },
  { id: "creative-work", label: "Creative work", icon: Palette },
  { id: "mechanical", label: "Mechanical or repair tasks", icon: Wrench },
  { id: "sales", label: "Sales or relationship-building", icon: ShoppingBag },
  { id: "troubleshooting", label: "Technical troubleshooting", icon: Zap },
];

export function Step6CareerStyle({ data, updateData, onNext, onBack }: Step6CareerStyleProps) {
  const toggleDayToDay = (option: string) => {
    const current = data.dayToDayPreference || [];
    if (current.includes(option)) {
      updateData({ dayToDayPreference: current.filter((o) => o !== option) });
    } else if (current.length < 3) {
      updateData({ dayToDayPreference: [...current, option] });
    }
  };

  const canProceed = data.careerIdentity && (data.dayToDayPreference?.length || 0) >= 1;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Career Style & Identity
        </h2>
        <p className="text-muted-foreground">
          Help us understand what kind of career identity resonates with you.
        </p>
      </div>

      {/* Career identity */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold">Which type of career identity resonates with you most?</Label>
          <p className="text-sm text-muted-foreground mt-1">Select the one that feels most like you</p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CAREER_IDENTITIES.map(({ id, label, icon: Icon, description }) => (
            <button
              key={id}
              onClick={() => updateData({ careerIdentity: id })}
              className={cn(
                "p-4 rounded-xl border text-left transition-all",
                data.careerIdentity === id
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/30"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 mb-2",
                data.careerIdentity === id ? "text-primary" : "text-muted-foreground"
              )} />
              <div className="font-medium text-sm">{label}</div>
              <div className="text-xs text-muted-foreground mt-1">{description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Day-to-day preference */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold">Which describes your ideal day-to-day work style?</Label>
          <p className="text-sm text-muted-foreground mt-1">Select up to 3</p>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {DAY_TO_DAY_OPTIONS.map(({ id, label, icon: Icon }) => {
            const isSelected = data.dayToDayPreference?.includes(id);
            const isDisabled = !isSelected && (data.dayToDayPreference?.length || 0) >= 3;
            
            return (
              <button
                key={id}
                onClick={() => !isDisabled && toggleDayToDay(id)}
                disabled={isDisabled}
                className={cn(
                  "p-3 rounded-lg border text-center transition-all",
                  isSelected
                    ? "border-primary bg-primary/10"
                    : isDisabled
                    ? "border-border bg-muted/50 opacity-50 cursor-not-allowed"
                    : "border-border bg-card hover:border-primary/30"
                )}
              >
                <Icon className={cn(
                  "w-4 h-4 mx-auto mb-1",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )} />
                <div className="text-xs font-medium">{label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-6">
        <div className="space-y-4">
          <Label className="text-base font-semibold">Structure preference</Label>
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Flexible / Freelance</span>
            <span>Structured / Routine</span>
          </div>
          <Slider
            value={[data.structurePreference || 3]}
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
            value={[data.riskTolerance || 3]}
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
            value={[data.balanceVsIncome || 3]}
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
        <Button onClick={onNext} disabled={!canProceed}>
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
