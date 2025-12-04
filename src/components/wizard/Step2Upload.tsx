import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Sparkles, Linkedin, Globe, Twitter, Loader2 } from "lucide-react";
import { WizardData } from "@/pages/GetStarted";

interface Step2Props {
  data: WizardData;
  updateData: (data: Partial<WizardData>) => void;
  onBack: () => void;
  onAutoFill: () => void;
  isAnalyzing: boolean;
}

export function Step2Upload({ data, updateData, onBack, onAutoFill, isAnalyzing }: Step2Props) {
  const hasContent = data.resumeText || data.linkedinUrl;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Share your experience
        </h2>
        <p className="text-muted-foreground">
          Upload your resume or add social links. Our AI will extract and auto-fill your profile.
        </p>
      </div>

      <div className="space-y-5">
        {/* LinkedIn */}
        <div className="space-y-2">
          <Label htmlFor="linkedin" className="flex items-center gap-2">
            <Linkedin className="w-4 h-4 text-[#0A66C2]" />
            LinkedIn Profile URL
          </Label>
          <Input
            id="linkedin"
            type="url"
            placeholder="https://linkedin.com/in/yourprofile"
            value={data.linkedinUrl}
            onChange={(e) => updateData({ linkedinUrl: e.target.value })}
          />
        </div>

        {/* Twitter */}
        <div className="space-y-2">
          <Label htmlFor="twitter" className="flex items-center gap-2">
            <Twitter className="w-4 h-4 text-muted-foreground" />
            X/Twitter URL (optional)
          </Label>
          <Input
            id="twitter"
            type="url"
            placeholder="https://x.com/yourhandle"
            value={data.twitterUrl}
            onChange={(e) => updateData({ twitterUrl: e.target.value })}
          />
        </div>

        {/* Portfolio */}
        <div className="space-y-2">
          <Label htmlFor="portfolio" className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            Personal Website/Portfolio (optional)
          </Label>
          <Input
            id="portfolio"
            type="url"
            placeholder="https://yourwebsite.com"
            value={data.portfolioUrl}
            onChange={(e) => updateData({ portfolioUrl: e.target.value })}
          />
        </div>

        {/* Resume text */}
        <div className="space-y-2">
          <Label htmlFor="resume">Paste Your Resume (or key experience)</Label>
          <Textarea
            id="resume"
            placeholder="Paste your resume text here, or describe your work experience, skills, and accomplishments..."
            value={data.resumeText}
            onChange={(e) => updateData({ resumeText: e.target.value })}
            className="min-h-[200px] resize-y"
          />
          <p className="text-xs text-muted-foreground">
            Tip: The more detail you provide, the better your recommendations will be.
          </p>
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
          className="group"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Auto-fill My Profile
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
