import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Compass, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Step1BasicInfo } from "@/components/wizard/Step1BasicInfo";
import { Step2Upload } from "@/components/wizard/Step2Upload";
import { Step3Skills } from "@/components/wizard/Step3Skills";
import { Step4Personality } from "@/components/wizard/Step4Personality";
import { Step5Constraints } from "@/components/wizard/Step5Constraints";
import { Step6Assets } from "@/components/wizard/Step6Assets";
import { Step7Goals } from "@/components/wizard/Step7Goals";
import { TeaserPreview } from "@/components/wizard/TeaserPreview";
import { WizardProgress } from "@/components/wizard/WizardProgress";

export type WizardData = {
  // Step 1
  firstName: string;
  state: string;
  city: string;
  situation: string;
  // Step 2
  linkedinUrl: string;
  twitterUrl: string;
  portfolioUrl: string;
  resumeText: string;
  // Step 3
  skills: string[];
  interests: string[];
  helpTopics: string;
  enjoyWithoutPay: string;
  // Step 4
  workTypes: string[];
  structurePreference: number;
  riskTolerance: number;
  balanceVsIncome: number;
  // Step 5
  timeAvailable: string;
  workSetting: string;
  hasCaregiver: boolean;
  caregiverDetails: string;
  avoidIndustries: string[];
  // Step 6
  ownsHome: boolean;
  hasExtraSpace: boolean;
  extraSpaceDetails: string;
  capitalAvailable: string;
  physicalAssets: string[];
  digitalAssets: string[];
  credentials: string[];
  networkStrength: string;
  // Step 7
  incomePaths: string[];
  incomeType: string;
  timeline: string;
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
  skills: [],
  interests: [],
  helpTopics: "",
  enjoyWithoutPay: "",
  workTypes: [],
  structurePreference: 3,
  riskTolerance: 3,
  balanceVsIncome: 3,
  timeAvailable: "",
  workSetting: "",
  hasCaregiver: false,
  caregiverDetails: "",
  avoidIndustries: [],
  ownsHome: false,
  hasExtraSpace: false,
  extraSpaceDetails: "",
  capitalAvailable: "",
  physicalAssets: [],
  digitalAssets: [],
  credentials: [],
  networkStrength: "",
  incomePaths: [],
  incomeType: "",
  timeline: "",
};

export default function GetStarted() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(initialData);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

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
    if (step < 8) {
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
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          resumeText: data.resumeText,
          linkedinUrl: data.linkedinUrl,
          twitterUrl: data.twitterUrl,
          portfolioUrl: data.portfolioUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Analysis failed");
      }

      const result = await response.json();
      const extracted = result.data;

      // Set teaser data for preview
      setAiAnalysis({
        skillsCount: extracted.teaserSummary?.skillsCount || extracted.skills?.length || 0,
        alignedTypes: extracted.teaserSummary?.alignedTypes || [],
        opportunityPaths: extracted.teaserSummary?.opportunityPaths || 0,
        assetsFound: extracted.teaserSummary?.assetsFound || false,
        headline: extracted.teaserSummary?.headline || "Your profile shows promising potential!",
      });

      // Auto-fill form fields from AI extraction
      updateData({
        skills: extracted.skills || [],
        interests: extracted.interests || [],
        credentials: extracted.assets?.credentials || extracted.credentials || [],
        workTypes: extracted.personalityIndicators?.workTypes || [],
        structurePreference: extracted.personalityIndicators?.structurePreference || 3,
        riskTolerance: extracted.personalityIndicators?.riskTolerance || 3,
        digitalAssets: extracted.assets?.digitalAssets || [],
        networkStrength: extracted.assets?.networkStrength || "",
      });

      toast.success("Profile analyzed successfully!");
      setStep(3); // Go to teaser for free users, or step 3 if paid
    } catch (error) {
      console.error("AI analysis error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to analyze profile. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBypassPayment = () => {
    setHasPaid(true);
    toast.success("Payment bypassed for testing - Full access granted!");
  };

  const handleGenerateOpportunities = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setIsGenerating(false);
      toast.success("Your personalized opportunities are ready!");
      navigate("/dashboard?test=true");
    }, 3000);
  };

  // Determine total steps based on payment status
  const totalSteps = hasPaid ? 7 : 3;
  const displayStep = hasPaid ? step : Math.min(step, 3);

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

        {/* Test bypass banner */}
        {!hasPaid && (
          <div className="mb-6 p-3 rounded-lg bg-warning/10 border border-warning/30 flex items-center justify-between">
            <span className="text-sm text-warning-foreground">
              Testing mode: Bypass payment to test full flow
            </span>
            <Button variant="outline" size="sm" onClick={handleBypassPayment}>
              Bypass Payment
            </Button>
          </div>
        )}

        {/* Progress */}
        <WizardProgress currentStep={displayStep} totalSteps={totalSteps} />

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
          
          {step === 3 && !hasPaid && (
            <TeaserPreview
              analysis={aiAnalysis}
              onBack={handleBack}
              isLoggedIn={isLoggedIn}
              onBypassPayment={handleBypassPayment}
            />
          )}

          {/* Paid user steps */}
          {hasPaid && step === 3 && (
            <Step3Skills
              data={{
                skills: data.skills,
                interests: data.interests,
                helpTopics: data.helpTopics,
                enjoyWithoutPay: data.enjoyWithoutPay,
              }}
              updateData={updateData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {hasPaid && step === 4 && (
            <Step4Personality
              data={{
                workTypes: data.workTypes,
                structurePreference: data.structurePreference,
                riskTolerance: data.riskTolerance,
                balanceVsIncome: data.balanceVsIncome,
              }}
              updateData={updateData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {hasPaid && step === 5 && (
            <Step5Constraints
              data={{
                timeAvailable: data.timeAvailable,
                workSetting: data.workSetting,
                hasCaregiver: data.hasCaregiver,
                caregiverDetails: data.caregiverDetails,
                avoidIndustries: data.avoidIndustries,
              }}
              updateData={updateData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {hasPaid && step === 6 && (
            <Step6Assets
              data={{
                ownsHome: data.ownsHome,
                hasExtraSpace: data.hasExtraSpace,
                extraSpaceDetails: data.extraSpaceDetails,
                capitalAvailable: data.capitalAvailable,
                physicalAssets: data.physicalAssets,
                digitalAssets: data.digitalAssets,
                credentials: data.credentials,
                networkStrength: data.networkStrength,
              }}
              updateData={updateData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {hasPaid && step === 7 && (
            <Step7Goals
              data={{
                incomePaths: data.incomePaths,
                incomeType: data.incomeType,
                timeline: data.timeline,
              }}
              updateData={updateData}
              onBack={handleBack}
              onSubmit={handleGenerateOpportunities}
              isSubmitting={isGenerating}
            />
          )}
        </div>
      </div>
    </div>
  );
}
