import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Compass, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Step1BasicInfo } from "@/components/wizard/Step1BasicInfo";
import { Step2Upload } from "@/components/wizard/Step2Upload";
import { TeaserPreview } from "@/components/wizard/TeaserPreview";
import { WizardProgress } from "@/components/wizard/WizardProgress";

export type WizardData = {
  firstName: string;
  state: string;
  city: string;
  situation: string;
  linkedinUrl: string;
  twitterUrl: string;
  portfolioUrl: string;
  resumeText: string;
};

const initialData: WizardData = {
  firstName: "",
  state: "",
  city: "",
  situation: "",
  linkedinUrl: "",
  twitterUrl: "",
  portfolioUrl: "",
  resumeText: "",
};

export default function GetStarted() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(initialData);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      setIsLoading(false);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateData = (newData: Partial<WizardData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleAutoFill = async () => {
    if (!data.resumeText && !data.linkedinUrl) {
      toast.error("Please provide a resume or LinkedIn URL first");
      return;
    }

    setIsAnalyzing(true);
    // Simulate AI analysis for now (will be replaced with actual AI call)
    setTimeout(() => {
      setAiAnalysis({
        skillsCount: 12,
        alignedTypes: ["Creative roles", "Leadership positions"],
        opportunityPaths: 8,
        assetsFound: true,
      });
      setIsAnalyzing(false);
      setStep(3);
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container px-4 py-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Compass className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">NextMove</span>
          </div>

          {!isLoggedIn && (
            <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          )}
        </div>

        {/* Progress */}
        <WizardProgress currentStep={step} totalSteps={3} />

        {/* Step content */}
        <div className="bg-card rounded-2xl border border-border shadow-xl p-6 md:p-8 mt-8">
          {step === 1 && (
            <Step1BasicInfo
              data={data}
              updateData={updateData}
              onNext={handleNext}
            />
          )}
          {step === 2 && (
            <Step2Upload
              data={data}
              updateData={updateData}
              onBack={handleBack}
              onAutoFill={handleAutoFill}
              isAnalyzing={isAnalyzing}
            />
          )}
          {step === 3 && (
            <TeaserPreview
              analysis={aiAnalysis}
              onBack={handleBack}
              isLoggedIn={isLoggedIn}
            />
          )}
        </div>
      </div>
    </div>
  );
}
