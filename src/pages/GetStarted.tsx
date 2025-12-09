import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Compass, ArrowLeft, AlertTriangle } from "lucide-react";
import { differenceInDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Step1BasicInfo } from "@/components/wizard/Step1BasicInfo";
import { Step2Upload } from "@/components/wizard/Step2Upload";
import { Step3Skills } from "@/components/wizard/Step3Skills";
import { Step4WorkPreference } from "@/components/wizard/Step4WorkPreference";
import { Step5Environment } from "@/components/wizard/Step5Environment";
import { Step6CareerStyle } from "@/components/wizard/Step6CareerStyle";
import { Step5Constraints } from "@/components/wizard/Step5Constraints";
import { Step6Assets } from "@/components/wizard/Step6Assets";
import { Step7Goals } from "@/components/wizard/Step7Goals";
import { StepTradeQuestions } from "@/components/wizard/StepTradeQuestions";
import { StepWhiteCollarQuestions } from "@/components/wizard/StepWhiteCollarQuestions";
import { StepHybridQuestions } from "@/components/wizard/StepHybridQuestions";
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
  // Step 3 - Skills
  skills: string[];
  interests: string[];
  helpTopics: string;
  enjoyWithoutPay: string;
  // Step 4 - Work Preference (NEW)
  preferredWorkTypes: string[];
  physicalComfort: number;
  toolsComfort: number;
  // Step 5 - Environment (NEW)
  environmentPreferences: string[];
  safetyConditions: string[];
  certificationOpenness: string;
  // Step 6 - Career Style (NEW consolidated)
  careerIdentity: string;
  dayToDayPreference: string[];
  structurePreference: number;
  riskTolerance: number;
  balanceVsIncome: number;
  // Conditional - Trade Questions
  enjoysTroubleshooting: number;
  followsTechnicalInstructions: number;
  considersFieldRole: boolean;
  structuredHourlyComfort: number;
  considersApprenticeships: boolean;
  // Conditional - White Collar Questions
  enjoysWriting: boolean;
  prefersStructure: boolean;
  enjoysDataDriven: number;
  prefersCollaborative: boolean;
  // Conditional - Hybrid Questions
  hybridTechInterest: number;
  digitalToolsComfort: number;
  // Step 7 - Constraints (was Step 5)
  timeAvailable: string;
  workSetting: string;
  hasCaregiver: boolean;
  caregiverDetails: string;
  avoidIndustries: string[];
  // Step 8 - Assets (was Step 6)
  ownsHome: boolean;
  hasExtraSpace: boolean;
  extraSpaceDetails: string;
  capitalAvailable: string;
  physicalAssets: string[];
  digitalAssets: string[];
  credentials: string[];
  networkStrength: string;
  // Step 9 - Goals (was Step 7)
  incomePaths: string[];
  incomeType: string;
  timeline: string;
  // Legacy fields kept for compatibility
  workTypes: string[];
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
  preferredWorkTypes: [],
  physicalComfort: 3,
  toolsComfort: 3,
  environmentPreferences: [],
  safetyConditions: [],
  certificationOpenness: "",
  careerIdentity: "",
  dayToDayPreference: [],
  structurePreference: 3,
  riskTolerance: 3,
  balanceVsIncome: 3,
  enjoysTroubleshooting: 3,
  followsTechnicalInstructions: 3,
  considersFieldRole: false,
  structuredHourlyComfort: 3,
  considersApprenticeships: false,
  enjoysWriting: false,
  prefersStructure: false,
  enjoysDataDriven: 3,
  prefersCollaborative: false,
  hybridTechInterest: 3,
  digitalToolsComfort: 3,
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
  workTypes: [],
};

// Helper to detect career track signals
function getCareerTrackSignals(data: WizardData) {
  const blueCollarSignals = 
    (data.preferredWorkTypes?.includes("hands-on") ? 1 : 0) +
    (data.preferredWorkTypes?.includes("physical") ? 1 : 0) +
    (data.preferredWorkTypes?.includes("machines") ? 1 : 0) +
    (data.preferredWorkTypes?.includes("mechanical") ? 1 : 0) +
    (data.physicalComfort >= 4 ? 1 : 0) +
    (data.toolsComfort >= 4 ? 1 : 0) +
    (data.environmentPreferences?.includes("outdoor") ? 1 : 0) +
    (data.environmentPreferences?.includes("workshop") ? 1 : 0) +
    (data.environmentPreferences?.includes("industrial") ? 1 : 0);

  const whiteCollarSignals =
    (data.preferredWorkTypes?.includes("office") ? 1 : 0) +
    (data.preferredWorkTypes?.includes("analytical") ? 1 : 0) +
    (data.physicalComfort <= 2 ? 1 : 0) +
    (data.environmentPreferences?.includes("office") ? 1 : 0) +
    (data.environmentPreferences?.includes("remote") ? 1 : 0);

  const technicalSignals =
    (data.preferredWorkTypes?.includes("analytical") ? 1 : 0) +
    (data.toolsComfort >= 4 ? 1 : 0) +
    (data.dayToDayPreference?.includes("troubleshooting") ? 1 : 0);

  return {
    showTradeQuestions: blueCollarSignals >= 3,
    showWhiteCollarQuestions: whiteCollarSignals >= 3 && blueCollarSignals < 2,
    showHybridQuestions: blueCollarSignals >= 2 && technicalSignals >= 2,
  };
}

export default function GetStarted() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(initialData);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expiryDate, setExpiryDate] = useState<string | null>(null);

  // Handle payment success callback
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    if (paymentStatus === "success") {
      setHasPaid(true);
      toast.success("Payment successful! You now have full access.");
      setSearchParams({});
    } else if (paymentStatus === "cancelled") {
      toast.info("Payment was cancelled.");
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      
      if (session?.user) {
        const userName = session.user.user_metadata?.full_name || 
                         session.user.user_metadata?.name ||
                         session.user.email?.split('@')[0] || '';
        setData(prev => ({ ...prev, firstName: userName }));
        
        try {
          const { data: paymentData, error } = await supabase.functions.invoke("check-payment");
          if (!error && paymentData?.hasPaid) {
            setHasPaid(true);
            if (paymentData.expiryDate) {
              setExpiryDate(paymentData.expiryDate);
            }
          }
        } catch (err) {
          console.error("Failed to check payment status:", err);
        }
      }
      
      setIsLoading(false);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsLoggedIn(!!session);
      
      if (session?.user) {
        const userName = session.user.user_metadata?.full_name || 
                         session.user.user_metadata?.name ||
                         session.user.email?.split('@')[0] || '';
        setData(prev => ({ ...prev, firstName: userName }));
        
        try {
          const { data: paymentData, error } = await supabase.functions.invoke("check-payment");
          if (!error && paymentData?.hasPaid) {
            setHasPaid(true);
            if (paymentData.expiryDate) {
              setExpiryDate(paymentData.expiryDate);
            }
          }
        } catch (err) {
          console.error("Failed to check payment status:", err);
        }
      } else {
        setHasPaid(false);
        setExpiryDate(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateData = (newData: Partial<WizardData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  // Build step sequence based on branching logic
  const getStepSequence = () => {
    const baseSteps = [
      "basic-info",      // 1
      "upload",          // 2
      "skills",          // 3
      "work-preference", // 4
      "environment",     // 5
      "career-style",    // 6
    ];
    
    const signals = getCareerTrackSignals(data);
    const conditionalSteps: string[] = [];
    
    if (signals.showTradeQuestions) conditionalSteps.push("trade-questions");
    if (signals.showWhiteCollarQuestions) conditionalSteps.push("white-collar-questions");
    if (signals.showHybridQuestions) conditionalSteps.push("hybrid-questions");
    
    const endSteps = [
      "constraints",  // 7+
      "assets",       // 8+
      "goals",        // 9+
    ];
    
    return [...baseSteps, ...conditionalSteps, ...endSteps];
  };

  const stepSequence = getStepSequence();
  const currentStepName = stepSequence[step - 1] || "basic-info";

  const handleNext = () => {
    if (step < stepSequence.length) {
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);
    
    try {
      toast.info("Analyzing your profile... This may take up to a minute on mobile.", { duration: 10000 });
      
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
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Analysis failed");
      }

      const result = await response.json();
      const extracted = result.data;

      setAiAnalysis({
        skillsCount: extracted.teaserSummary?.skillsCount || extracted.skills?.length || 0,
        alignedTypes: extracted.teaserSummary?.alignedTypes || [],
        opportunityPaths: extracted.teaserSummary?.opportunityPaths || 0,
        assetsFound: extracted.teaserSummary?.assetsFound || false,
        headline: extracted.teaserSummary?.headline || "Your profile shows promising potential!",
      });

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
      setStep(3);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("AI analysis error:", error);
      
      if (error instanceof Error && error.name === 'AbortError') {
        toast.error("Analysis timed out. Please try again with a stable connection.", { duration: 8000 });
      } else {
        toast.error(error instanceof Error ? error.message : "Failed to analyze profile. Please try again.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateOpportunities = async () => {
    setIsGenerating(true);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Please sign in to generate your assessment");
      navigate("/auth");
      return;
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);
    
    let assessmentId: string | null = null;
    
    try {
      const { data: assessment, error: insertError } = await supabase
        .from('assessment_results')
        .insert([{
          user_id: session.user.id,
          wizard_data: JSON.parse(JSON.stringify(data)),
          status: 'processing',
        }])
        .select('id')
        .single();
      
      if (insertError) {
        console.error("Failed to create assessment record:", insertError);
        throw new Error("Failed to start assessment. Please try again.");
      }
      
      assessmentId = assessment.id;
      
      toast.info("Generating your personalized opportunities... This may take 1-2 minutes. You'll receive an email when ready!", { duration: 20000 });
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-recommendations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          wizardData: data,
          extractedProfile: aiAnalysis,
          assessmentId: assessmentId,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate recommendations");
      }

      const result = await response.json();
      
      const { error: updateError } = await supabase
        .from('assessment_results')
        .update({
          recommendations: JSON.parse(JSON.stringify(result.data)),
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', assessmentId);
      
      if (updateError) {
        console.error("Failed to save results to database:", updateError);
      }
      
      try {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-results-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            assessmentId: assessmentId,
            userEmail: session.user.email,
            userName: data.firstName || session.user.email?.split('@')[0],
          }),
        });
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
      }
      
      sessionStorage.setItem("careermovr_results", JSON.stringify(result.data));
      toast.success("Your personalized opportunities are ready!");
      navigate(`/dashboard?id=${assessmentId}`);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Generation error:", error);
      
      if (assessmentId) {
        await supabase
          .from('assessment_results')
          .update({
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error',
          })
          .eq('id', assessmentId);
      }
      
      if (error instanceof Error && error.name === 'AbortError') {
        toast.error("Generation timed out. Check your email - we'll notify you when your results are ready!", { duration: 10000 });
        if (assessmentId) {
          navigate(`/dashboard?id=${assessmentId}&pending=true`);
        }
      } else {
        toast.error(error instanceof Error ? error.message : "Failed to generate recommendations");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const totalSteps = hasPaid ? stepSequence.length : 3;
  const displayStep = hasPaid ? step : Math.min(step, 3);

  const daysRemaining = expiryDate 
    ? differenceInDays(new Date(expiryDate), new Date())
    : null;
  const showExpiryWarning = hasPaid && daysRemaining !== null && daysRemaining <= 7 && daysRemaining >= 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero overflow-x-hidden max-w-[100vw]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container px-4 py-8 max-w-3xl mx-auto">
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
            <span className="font-display font-bold text-lg text-foreground">CareerMovr</span>
          </div>

          {!isLoggedIn && (
            <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          )}
        </div>

        {showExpiryWarning && (
          <div className="mb-4 p-4 rounded-lg bg-warning/10 border border-warning/30 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-warning">
                {daysRemaining === 0 
                  ? "Your access expires today!" 
                  : daysRemaining === 1 
                    ? "Your access expires tomorrow!" 
                    : `Your access expires in ${daysRemaining} days`}
              </p>
              <p className="text-xs text-muted-foreground">
                Complete your assessment before your 30-day access ends.
              </p>
            </div>
          </div>
        )}

        <WizardProgress currentStep={displayStep} totalSteps={totalSteps} />

        <div className="bg-card rounded-2xl border border-border shadow-xl p-6 md:p-8 mt-8">
          {currentStepName === "basic-info" && (
            <Step1BasicInfo data={data} updateData={updateData} onNext={handleNext} />
          )}
          
          {currentStepName === "upload" && (
            <Step2Upload data={data} updateData={updateData} onBack={handleBack} onAutoFill={handleAutoFill} isAnalyzing={isAnalyzing} />
          )}
          
          {step === 3 && !hasPaid && (
            <TeaserPreview analysis={aiAnalysis} onBack={handleBack} isLoggedIn={isLoggedIn} />
          )}

          {hasPaid && currentStepName === "skills" && (
            <Step3Skills
              data={{ skills: data.skills, interests: data.interests, helpTopics: data.helpTopics, enjoyWithoutPay: data.enjoyWithoutPay }}
              updateData={updateData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {hasPaid && currentStepName === "work-preference" && (
            <Step4WorkPreference
              data={{ preferredWorkTypes: data.preferredWorkTypes, physicalComfort: data.physicalComfort, toolsComfort: data.toolsComfort }}
              updateData={updateData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {hasPaid && currentStepName === "environment" && (
            <Step5Environment
              data={{ environmentPreferences: data.environmentPreferences, safetyConditions: data.safetyConditions, certificationOpenness: data.certificationOpenness }}
              updateData={updateData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {hasPaid && currentStepName === "career-style" && (
            <Step6CareerStyle
              data={{ careerIdentity: data.careerIdentity, dayToDayPreference: data.dayToDayPreference, structurePreference: data.structurePreference, riskTolerance: data.riskTolerance, balanceVsIncome: data.balanceVsIncome }}
              updateData={updateData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {hasPaid && currentStepName === "trade-questions" && (
            <StepTradeQuestions
              data={{ enjoysTroubleshooting: data.enjoysTroubleshooting, followsTechnicalInstructions: data.followsTechnicalInstructions, considersFieldRole: data.considersFieldRole, structuredHourlyComfort: data.structuredHourlyComfort, considersApprenticeships: data.considersApprenticeships }}
              updateData={updateData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {hasPaid && currentStepName === "white-collar-questions" && (
            <StepWhiteCollarQuestions
              data={{ enjoysWriting: data.enjoysWriting, prefersStructure: data.prefersStructure, enjoysDataDriven: data.enjoysDataDriven, prefersCollaborative: data.prefersCollaborative }}
              updateData={updateData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {hasPaid && currentStepName === "hybrid-questions" && (
            <StepHybridQuestions
              data={{ hybridTechInterest: data.hybridTechInterest, digitalToolsComfort: data.digitalToolsComfort }}
              updateData={updateData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {hasPaid && currentStepName === "constraints" && (
            <Step5Constraints
              data={{ timeAvailable: data.timeAvailable, workSetting: data.workSetting, hasCaregiver: data.hasCaregiver, caregiverDetails: data.caregiverDetails, avoidIndustries: data.avoidIndustries }}
              updateData={updateData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {hasPaid && currentStepName === "assets" && (
            <Step6Assets
              data={{ ownsHome: data.ownsHome, hasExtraSpace: data.hasExtraSpace, extraSpaceDetails: data.extraSpaceDetails, capitalAvailable: data.capitalAvailable, physicalAssets: data.physicalAssets, digitalAssets: data.digitalAssets, credentials: data.credentials, networkStrength: data.networkStrength }}
              updateData={updateData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {hasPaid && currentStepName === "goals" && (
            <Step7Goals
              data={{ incomePaths: data.incomePaths, incomeType: data.incomeType, timeline: data.timeline }}
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
