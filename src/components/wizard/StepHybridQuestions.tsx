import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, ArrowRight, Cpu, Laptop } from "lucide-react";

interface StepHybridQuestionsProps {
  data: {
    hybridTechInterest: number;
    digitalToolsComfort: number;
  };
  updateData: (data: Partial<StepHybridQuestionsProps["data"]>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepHybridQuestions({ data, updateData, onNext, onBack }: StepHybridQuestionsProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Technical-Trade Hybrid Interests
        </h2>
        <p className="text-muted-foreground">
          You show interest in both hands-on and technical work. Let us understand your hybrid preferences.
        </p>
      </div>

      {/* Hybrid tech interest */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-primary" />
          <Label className="text-base font-semibold">
            How interested are you in roles that combine hands-on work with technology?
          </Label>
        </div>
        <p className="text-sm text-muted-foreground">
          Examples: Robotics tech, IT field tech, manufacturing automation tech, CNC machinist
        </p>
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Not interested</span>
          <span>Very interested</span>
        </div>
        <Slider
          value={[data.hybridTechInterest || 3]}
          onValueChange={([value]) => updateData({ hybridTechInterest: value })}
          min={1}
          max={5}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} className={data.hybridTechInterest === n ? "text-primary font-medium" : ""}>
              {n}
            </span>
          ))}
        </div>
      </div>

      {/* Digital diagnostic tools comfort */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Laptop className="w-5 h-5 text-primary" />
          <Label className="text-base font-semibold">
            How comfortable are you working with digital diagnostic tools?
          </Label>
        </div>
        <p className="text-sm text-muted-foreground">
          Examples: Diagnostic software, computer-based testing equipment, digital meters, PLCs
        </p>
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Not comfortable</span>
          <span>Very comfortable</span>
        </div>
        <Slider
          value={[data.digitalToolsComfort || 3]}
          onValueChange={([value]) => updateData({ digitalToolsComfort: value })}
          min={1}
          max={5}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} className={data.digitalToolsComfort === n ? "text-primary font-medium" : ""}>
              {n}
            </span>
          ))}
        </div>
      </div>

      <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
        <h4 className="font-semibold text-sm mb-2">Hybrid Technical-Trade Careers</h4>
        <p className="text-sm text-muted-foreground">
          These roles combine the best of both worlds - hands-on work with modern technology.
          They often offer excellent pay and job security as they require a unique skill set.
        </p>
        <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
          <li>• Industrial Technician</li>
          <li>• Robotics Maintenance</li>
          <li>• CNC Machinist</li>
          <li>• IT Field Technician</li>
          <li>• Manufacturing Systems Tech</li>
        </ul>
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
