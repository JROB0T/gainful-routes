import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, ArrowRight, Wrench, FileText, MapPin, Clock, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepTradeQuestionsProps {
  data: {
    enjoysTroubleshooting: number;
    followsTechnicalInstructions: number;
    considersFieldRole: boolean;
    structuredHourlyComfort: number;
    considersApprenticeships: boolean;
  };
  updateData: (data: Partial<StepTradeQuestionsProps["data"]>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepTradeQuestions({ data, updateData, onNext, onBack }: StepTradeQuestionsProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Trade & Hands-On Work Details
        </h2>
        <p className="text-muted-foreground">
          Based on your preferences, let us know more about your interest in hands-on work.
        </p>
      </div>

      {/* Troubleshooting enjoyment */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-primary" />
          <Label className="text-base font-semibold">Do you enjoy troubleshooting mechanical or technical problems?</Label>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Not at all</span>
          <span>Love it</span>
        </div>
        <Slider
          value={[data.enjoysTroubleshooting || 3]}
          onValueChange={([value]) => updateData({ enjoysTroubleshooting: value })}
          min={1}
          max={5}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} className={data.enjoysTroubleshooting === n ? "text-primary font-medium" : ""}>
              {n}
            </span>
          ))}
        </div>
      </div>

      {/* Following technical instructions */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <Label className="text-base font-semibold">How comfortable are you following technical instructions or diagrams?</Label>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Not comfortable</span>
          <span>Very comfortable</span>
        </div>
        <Slider
          value={[data.followsTechnicalInstructions || 3]}
          onValueChange={([value]) => updateData({ followsTechnicalInstructions: value })}
          min={1}
          max={5}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} className={data.followsTechnicalInstructions === n ? "text-primary font-medium" : ""}>
              {n}
            </span>
          ))}
        </div>
      </div>

      {/* Field role consideration */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <Label className="text-base font-semibold">Would you consider a field role with varied locations?</Label>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => updateData({ considersFieldRole: true })}
            className={cn(
              "flex-1 px-6 py-4 rounded-xl border transition-all",
              data.considersFieldRole === true
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/30"
            )}
          >
            <span className="font-medium">Yes</span>
            <p className="text-xs text-muted-foreground mt-1">Open to traveling or varied job sites</p>
          </button>
          <button
            onClick={() => updateData({ considersFieldRole: false })}
            className={cn(
              "flex-1 px-6 py-4 rounded-xl border transition-all",
              data.considersFieldRole === false
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/30"
            )}
          >
            <span className="font-medium">No</span>
            <p className="text-xs text-muted-foreground mt-1">Prefer a fixed location</p>
          </button>
        </div>
      </div>

      {/* Structured hourly comfort */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <Label className="text-base font-semibold">How comfortable are you with structured hourly work?</Label>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Prefer flexibility</span>
          <span>Prefer structured hours</span>
        </div>
        <Slider
          value={[data.structuredHourlyComfort || 3]}
          onValueChange={([value]) => updateData({ structuredHourlyComfort: value })}
          min={1}
          max={5}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} className={data.structuredHourlyComfort === n ? "text-primary font-medium" : ""}>
              {n}
            </span>
          ))}
        </div>
      </div>

      {/* Apprenticeship consideration */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary" />
          <Label className="text-base font-semibold">Would you consider apprenticeships or on-the-job training programs?</Label>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => updateData({ considersApprenticeships: true })}
            className={cn(
              "flex-1 px-6 py-4 rounded-xl border transition-all",
              data.considersApprenticeships === true
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/30"
            )}
          >
            <span className="font-medium">Yes</span>
            <p className="text-xs text-muted-foreground mt-1">Open to learning on the job</p>
          </button>
          <button
            onClick={() => updateData({ considersApprenticeships: false })}
            className={cn(
              "flex-1 px-6 py-4 rounded-xl border transition-all",
              data.considersApprenticeships === false
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/30"
            )}
          >
            <span className="font-medium">No</span>
            <p className="text-xs text-muted-foreground mt-1">Prefer to use existing skills</p>
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
