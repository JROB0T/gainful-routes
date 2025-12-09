import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, ArrowRight, PenLine, Calendar, BarChart3, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepWhiteCollarQuestionsProps {
  data: {
    enjoysWriting: boolean;
    prefersStructure: boolean;
    enjoysDataDriven: number;
    prefersCollaborative: boolean;
  };
  updateData: (data: Partial<StepWhiteCollarQuestionsProps["data"]>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepWhiteCollarQuestions({ data, updateData, onNext, onBack }: StepWhiteCollarQuestionsProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Professional Work Style
        </h2>
        <p className="text-muted-foreground">
          Tell us more about how you prefer to work in professional settings.
        </p>
      </div>

      {/* Writing enjoyment */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <PenLine className="w-5 h-5 text-primary" />
          <Label className="text-base font-semibold">Do you enjoy writing or communicating ideas?</Label>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => updateData({ enjoysWriting: true })}
            className={cn(
              "flex-1 px-6 py-4 rounded-xl border transition-all",
              data.enjoysWriting === true
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/30"
            )}
          >
            <span className="font-medium">Yes</span>
            <p className="text-xs text-muted-foreground mt-1">I enjoy crafting emails, reports, or content</p>
          </button>
          <button
            onClick={() => updateData({ enjoysWriting: false })}
            className={cn(
              "flex-1 px-6 py-4 rounded-xl border transition-all",
              data.enjoysWriting === false
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/30"
            )}
          >
            <span className="font-medium">No</span>
            <p className="text-xs text-muted-foreground mt-1">I prefer verbal or visual communication</p>
          </button>
        </div>
      </div>

      {/* Structure preference */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <Label className="text-base font-semibold">Do you prefer predictable daily structure?</Label>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => updateData({ prefersStructure: true })}
            className={cn(
              "flex-1 px-6 py-4 rounded-xl border transition-all",
              data.prefersStructure === true
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/30"
            )}
          >
            <span className="font-medium">Yes</span>
            <p className="text-xs text-muted-foreground mt-1">I thrive with routine and predictability</p>
          </button>
          <button
            onClick={() => updateData({ prefersStructure: false })}
            className={cn(
              "flex-1 px-6 py-4 rounded-xl border transition-all",
              data.prefersStructure === false
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/30"
            )}
          >
            <span className="font-medium">No</span>
            <p className="text-xs text-muted-foreground mt-1">I prefer variety and flexibility</p>
          </button>
        </div>
      </div>

      {/* Data-driven enjoyment */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <Label className="text-base font-semibold">How much do you enjoy data-driven decision-making?</Label>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Prefer intuition</span>
          <span>Love working with data</span>
        </div>
        <Slider
          value={[data.enjoysDataDriven || 3]}
          onValueChange={([value]) => updateData({ enjoysDataDriven: value })}
          min={1}
          max={5}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} className={data.enjoysDataDriven === n ? "text-primary font-medium" : ""}>
              {n}
            </span>
          ))}
        </div>
      </div>

      {/* Collaborative preference */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <Label className="text-base font-semibold">Do you prefer collaborative or solo work?</Label>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => updateData({ prefersCollaborative: true })}
            className={cn(
              "flex-1 px-6 py-4 rounded-xl border transition-all",
              data.prefersCollaborative === true
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/30"
            )}
          >
            <span className="font-medium">Collaborative</span>
            <p className="text-xs text-muted-foreground mt-1">I work best with a team</p>
          </button>
          <button
            onClick={() => updateData({ prefersCollaborative: false })}
            className={cn(
              "flex-1 px-6 py-4 rounded-xl border transition-all",
              data.prefersCollaborative === false
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/30"
            )}
          >
            <span className="font-medium">Solo</span>
            <p className="text-xs text-muted-foreground mt-1">I prefer independent work</p>
          </button>
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
