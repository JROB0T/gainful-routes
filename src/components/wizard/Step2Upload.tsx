import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Sparkles, Loader2, FileText } from "lucide-react";
import { WizardData } from "@/pages/GetStarted";

interface Step2Props {
  data: WizardData;
  updateData: (data: Partial<WizardData>) => void;
  onBack: () => void;
  onAutoFill: () => void;
  isAnalyzing: boolean;
}

export function Step2Upload({ data, updateData, onBack, onAutoFill, isAnalyzing }: Step2Props) {
  const hasContent = data.resumeText && data.resumeText.trim().length >= 50;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Share your experience
        </h2>
        <p className="text-muted-foreground">
          Tell us about your professional background. Our AI will analyze it to personalize your recommendations.
        </p>
      </div>

      <div className="space-y-5">
        {/* Guidance notice */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Tip:</span> Copy and paste your resume text, 
            or write a summary of your work experience, skills, and accomplishments. 
            The more detail you provide, the better your personalized recommendations will be.
          </p>
        </div>

        {/* Professional experience text area */}
        <div className="space-y-2">
          <Label htmlFor="resume" className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Professional Experience
          </Label>
          <Textarea
            id="resume"
            placeholder="Paste your resume text here, or describe your professional background...

Example:
• Your current and past job titles and responsibilities
• Key skills and technologies you've worked with
• Notable accomplishments and achievements
• Education, certifications, and licenses
• Industries you've worked in"
            value={data.resumeText}
            onChange={(e) => updateData({ resumeText: e.target.value })}
            className="min-h-[250px] resize-y"
          />
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              {data.resumeText.length > 0 
                ? `${data.resumeText.length} characters`
                : "Minimum 50 characters recommended for best results"
              }
            </p>
            {data.resumeText.length > 0 && data.resumeText.length < 50 && (
              <p className="text-xs text-amber-600">
                Add more detail for better recommendations
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Button
          variant="accent"
          size="lg"
          onClick={onAutoFill}
          disabled={!hasContent || isAnalyzing}
          className="group whitespace-nowrap"
        >
          {isAnalyzing ? (
            <span className="flex items-center gap-2 whitespace-nowrap">
              <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
              <span className="hidden sm:inline">Analyzing...</span>
              <span className="sm:hidden">Analyzing...</span>
            </span>
          ) : (
            <>
              <Sparkles className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">Analyze & Auto-fill</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
