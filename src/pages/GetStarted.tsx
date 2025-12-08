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
      
      // Prefill firstName from user session
      if (session?.user) {
        const userName = session.user.user_metadata?.full_name || 
                         session.user.user_metadata?.name ||
                         session.user.email?.split('@')[0] || '';
        setData(prev => ({ ...prev, firstName: userName }));
      }
      
      setIsLoading(false);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
      
      // Update firstName when auth state changes
      if (session?.user) {
        const userName = session.user.user_metadata?.full_name || 
                         session.user.user_metadata?.name ||
                         session.user.email?.split('@')[0] || '';
        setData(prev => ({ ...prev, firstName: userName }));
      }
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
    
    // Create AbortController with 90 second timeout for mobile
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 90000);
    
    try {
      toast.info("Analyzing your profile... This may take up to a minute on mobile.", {
        duration: 10000,
      });
      
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
      clearTimeout(timeoutId);
      console.error("AI analysis error:", error);
      
      if (error instanceof Error && error.name === 'AbortError') {
        toast.error("Analysis timed out. Please try again with a stable connection.", {
          duration: 8000,
        });
      } else {
        toast.error(error instanceof Error ? error.message : "Failed to analyze profile. Please try again.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };


  const handleGenerateOpportunities = async () => {
    setIsGenerating(true);
    
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Please sign in to generate your assessment");
      navigate("/auth");
      return;
    }
    
    // Create AbortController with 120 second timeout for recommendations (longer AI call)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 120000);
    
    let assessmentId: string | null = null;
    
    try {
      // First, create the assessment record in the database
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
      console.log("Created assessment record:", assessmentId);
      
      toast.info("Generating your personalized opportunities... This may take 1-2 minutes. You'll receive an email when ready!", {
        duration: 20000,
      });
      
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
      
      // Update the assessment record with results
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
      
      // Send email notification (fire and forget)
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
        console.log("Email notification sent");
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
        // Don't fail the whole operation if email fails
      }
      
      // Store results in sessionStorage for immediate access
      sessionStorage.setItem("careermovr_results", JSON.stringify(result.data));
      
      toast.success("Your personalized opportunities are ready!");
      navigate(`/dashboard?id=${assessmentId}`);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Generation error:", error);
      
      // Update assessment status to failed if we have an ID
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
        toast.error("Generation timed out. Check your email - we'll notify you when your results are ready!", {
          duration: 10000,
        });
        // Navigate to dashboard anyway - they can check back later
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
            <span className="font-display font-bold text-lg text-foreground">CareerMovr</span>
          </div>

          {!isLoggedIn && (
            <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          )}
        </div>


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
              onBypass={() => setHasPaid(true)}
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
