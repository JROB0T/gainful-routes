import { useState, useEffect, useCallback, useRef } from "react";
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
import { useWizardPersistence } from "@/hooks/useWizardPersistence";

export type WizardData = {
  // Step 1
  firstName: string;
  state: string;
  city: string;
  situation: string;
  // Step 2 - Professional Experience
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

// Randomized test data generator for different user profiles
const generateTestData = (): Partial<WizardData> => {
  const profiles = [
    { // Technical/Software
      name: "Alex Chen",
      state: "California",
      city: "San Jose",
      situation: "looking-for-change",
      resumeText: "Senior Software Engineer with 6 years of experience building scalable web applications. Led a team of 4 developers at TechCorp Inc. Expert in Python, JavaScript, React, and cloud infrastructure. Built microservices handling 10M+ daily requests. Reduced deployment time by 60% through CI/CD improvements. BS in Computer Science from UC Berkeley.",
      skills: ["Python", "JavaScript", "React", "SQL", "AWS", "Docker", "Kubernetes"],
      interests: ["AI/ML", "Cloud Computing", "Open Source", "Startups"],
      helpTopics: "Building scalable systems and mentoring developers",
      enjoyWithoutPay: "Contributing to open source and learning new frameworks",
      preferredWorkTypes: ["analytical", "creative"],
      physicalComfort: 2,
      toolsComfort: 5,
      environmentPreferences: ["remote", "office"],
      careerIdentity: "analyst",
      dayToDayPreference: ["problem-solving", "software"],
      credentials: ["AWS Certified", "Google Cloud Professional"],
    },
    { // Blue-collar/Trades
      name: "Mike Johnson",
      state: "Texas",
      city: "Houston",
      situation: "career-transition",
      resumeText: "Licensed HVAC Technician with 8 years of field experience. Completed 500+ residential and commercial installations. EPA 608 Universal certified. OSHA 30 trained. Experienced in troubleshooting complex refrigeration systems. Previously worked as automotive mechanic for 3 years. Strong customer service skills with 4.9 star rating.",
      skills: ["Welding", "Blueprint Reading", "HVAC", "Electrical Systems", "Plumbing"],
      interests: ["Construction", "Renewable Energy", "Automotive", "Home Improvement"],
      helpTopics: "Working with my hands and fixing complex mechanical problems",
      enjoyWithoutPay: "Restoring cars and home renovation projects",
      preferredWorkTypes: ["hands-on", "physical", "mechanical"],
      physicalComfort: 5,
      toolsComfort: 5,
      environmentPreferences: ["outdoor", "workshop", "industrial"],
      careerIdentity: "builder",
      dayToDayPreference: ["hands-on", "mechanical"],
      credentials: ["OSHA 30", "EPA 608 Certification"],
    },
    { // White-collar/Management
      name: "Sarah Williams",
      state: "New York",
      city: "Manhattan",
      situation: "just-exploring",
      resumeText: "Operations Manager with 10 years of experience in financial services. MBA from Columbia Business School. Led cross-functional teams of 25+ people. Managed $5M annual budget. Implemented process improvements saving $2M annually. PMP and Six Sigma Green Belt certified. Strong background in stakeholder management and strategic planning.",
      skills: ["Project Management", "Excel", "Salesforce", "Public Speaking", "Budgeting"],
      interests: ["Leadership", "Strategy", "Team Building", "Business Development"],
      helpTopics: "Leading teams and driving organizational change",
      enjoyWithoutPay: "Volunteering as a mentor and organizing community events",
      preferredWorkTypes: ["office", "managing", "helping"],
      physicalComfort: 1,
      toolsComfort: 3,
      environmentPreferences: ["office", "remote"],
      careerIdentity: "manager",
      dayToDayPreference: ["people", "organizing"],
      credentials: ["PMP", "Six Sigma Green Belt", "MBA"],
    },
    { // Hybrid Tech-Trade
      name: "Jordan Rivera",
      state: "Michigan",
      city: "Detroit",
      situation: "upskilling",
      resumeText: "Manufacturing Systems Technician with 5 years in automotive industry. Certified in CNC programming and PLC troubleshooting. Experience with Fanuc robotics and Siemens automation systems. Associate degree in Industrial Technology. Led factory floor digitization project reducing downtime by 35%. Strong skills in CAD/CAM and 3D printing prototyping.",
      skills: ["CNC Programming", "CAD/CAM", "Robotics", "PLC Programming", "3D Printing"],
      interests: ["Manufacturing", "Automation", "Industrial IoT", "Electric Vehicles"],
      helpTopics: "Bridging traditional manufacturing with modern technology",
      enjoyWithoutPay: "Building custom electronics and 3D printed projects",
      preferredWorkTypes: ["analytical", "hands-on", "machines"],
      physicalComfort: 4,
      toolsComfort: 5,
      environmentPreferences: ["industrial", "workshop"],
      careerIdentity: "technician",
      dayToDayPreference: ["troubleshooting", "hands-on"],
      credentials: ["Certified Manufacturing Engineer", "AutoCAD Certified"],
    },
    { // Creative/Freelance
      name: "Emma Thompson",
      state: "Oregon",
      city: "Portland",
      situation: "side-income",
      resumeText: "Freelance Graphic Designer and Content Creator with 4 years of experience. Built personal brand with 15K Instagram followers. Clients include 3 Fortune 500 companies. Expert in Adobe Creative Suite, Figma, and video editing. BFA in Visual Communications. Managed social media accounts generating 500K+ monthly impressions. HubSpot Content Marketing certified.",
      skills: ["Graphic Design", "Copywriting", "Social Media", "Photography", "Video Editing"],
      interests: ["Branding", "Content Creation", "Freelancing", "E-commerce"],
      helpTopics: "Creating compelling visual content and building personal brands",
      enjoyWithoutPay: "Photography, blogging, and creating digital art",
      preferredWorkTypes: ["creative", "analytical"],
      physicalComfort: 2,
      toolsComfort: 4,
      environmentPreferences: ["remote", "office"],
      careerIdentity: "communicator",
      dayToDayPreference: ["creative-work", "problem-solving"],
      credentials: ["Adobe Certified Expert", "HubSpot Content Marketing"],
    },
  ];

  const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const pickMultiple = <T,>(arr: T[], min: number, max: number): T[] => {
    const count = min + Math.floor(Math.random() * (max - min + 1));
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };
  const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));

  const profile = pick(profiles);
  const situations = ["just-exploring", "looking-for-change", "career-transition", "upskilling", "side-income"];
  const timeOptions = ["<10", "10-20", "20-30", "30+"];
  const workSettings = ["remote", "on-site", "hybrid"];
  const certOpenness = ["very-open", "somewhat-open", "not-interested"];
  const capitalOptions = ["none", "small", "medium", "significant"];
  const networkOptions = ["weak", "moderate", "strong"];
  const incomeTypes = ["steady", "mix", "variable"];
  const timelines = ["asap", "1-3mo", "3-6mo", "6mo+"];
  const safetyOptions = ["heights", "outdoors", "noise", "chemicals", "none"];
  const physicalAssetOptions = ["Vehicle", "Tools", "Workshop", "Land"];
  const digitalAssetOptions = ["Website", "Social Following", "Email List", "Online Course"];
  const incomePathOptions = ["career-change", "freelancing", "part-time", "creator", "small-business", "rental"];

  return {
    firstName: profile.name,
    state: profile.state,
    city: profile.city,
    situation: pick(situations),
    // Include resume text from profile
    resumeText: profile.resumeText,
    // Fill the rest
    skills: profile.skills,
    interests: profile.interests,
    helpTopics: profile.helpTopics,
    enjoyWithoutPay: profile.enjoyWithoutPay,
    preferredWorkTypes: profile.preferredWorkTypes,
    physicalComfort: profile.physicalComfort,
    toolsComfort: profile.toolsComfort,
    environmentPreferences: profile.environmentPreferences,
    safetyConditions: pickMultiple(safetyOptions, 0, 2),
    certificationOpenness: pick(certOpenness),
    careerIdentity: profile.careerIdentity,
    dayToDayPreference: profile.dayToDayPreference,
    structurePreference: randInt(1, 5),
    riskTolerance: randInt(2, 5),
    balanceVsIncome: randInt(2, 5),
    enjoysTroubleshooting: randInt(2, 5),
    followsTechnicalInstructions: randInt(3, 5),
    considersFieldRole: Math.random() > 0.5,
    structuredHourlyComfort: randInt(2, 5),
    considersApprenticeships: Math.random() > 0.6,
    enjoysWriting: Math.random() > 0.4,
    prefersStructure: Math.random() > 0.5,
    enjoysDataDriven: randInt(2, 5),
    prefersCollaborative: Math.random() > 0.4,
    hybridTechInterest: randInt(2, 5),
    digitalToolsComfort: randInt(3, 5),
    timeAvailable: pick(timeOptions),
    workSetting: pick(workSettings),
    hasCaregiver: Math.random() > 0.8,
    caregiverDetails: "",
    avoidIndustries: [],
    ownsHome: Math.random() > 0.6,
    hasExtraSpace: Math.random() > 0.5,
    extraSpaceDetails: Math.random() > 0.5 ? "Garage" : "",
    capitalAvailable: pick(capitalOptions),
    physicalAssets: pickMultiple(physicalAssetOptions, 0, 2),
    digitalAssets: pickMultiple(digitalAssetOptions, 0, 2),
    credentials: profile.credentials,
    networkStrength: pick(networkOptions),
    incomePaths: pickMultiple(incomePathOptions, 1, 3),
    incomeType: pick(incomeTypes),
    timeline: pick(timelines),
    workTypes: [],
  };
};

const initialData: WizardData = {
  firstName: "",
  state: "",
  city: "",
  situation: "",
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
  
  // Track if data has been restored to prevent overwriting
  const dataRestoredRef = useRef(false);
  
  // Persistence hook - restore data on mount
  const { persistData, clearPersistedData } = useWizardPersistence(
    data,
    (restoredData) => {
      if (!dataRestoredRef.current) {
        setData(restoredData);
        dataRestoredRef.current = true;
      }
    },
    step,
    (restoredStep) => {
      if (!dataRestoredRef.current) {
        setStep(restoredStep);
      }
    }
  );

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

  // Helper function to check payment with timeout and retry
  const checkPaymentStatus = async (userId: string, retryCount = 0) => {
    const controller = new AbortController();
    // Progressive timeout: 8s first try, 12s second try
    const timeout = retryCount === 0 ? 8000 : 12000;
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const { data: paymentData, error } = await supabase.functions.invoke("check-payment", {
        body: {},
      });
      clearTimeout(timeoutId);
      
      if (!error && paymentData?.hasPaid) {
        setHasPaid(true);
        if (paymentData.expiryDate) {
          setExpiryDate(paymentData.expiryDate);
        }
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      // Retry once on timeout
      if (retryCount < 1 && err?.name === 'AbortError') {
        console.log("Payment check timed out, retrying...");
        return checkPaymentStatus(userId, retryCount + 1);
      }
      console.error("Failed to check payment status:", err);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);
        
        if (session?.user) {
          const userName = session.user.user_metadata?.full_name || 
                           session.user.user_metadata?.name ||
                           session.user.email?.split('@')[0] || '';
          setData(prev => ({ ...prev, firstName: userName }));
          
          // Check payment in background - don't block UI
          checkPaymentStatus(session.user.id);
        }
      } catch (err) {
        console.error("Auth check error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();

    // CRITICAL: Don't make async calls directly in onAuthStateChange callback
    // This causes deadlocks on mobile. Use setTimeout(0) to defer.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Synchronous state updates only
      setIsLoggedIn(!!session);
      
      if (session?.user) {
        const userName = session.user.user_metadata?.full_name || 
                         session.user.user_metadata?.name ||
                         session.user.email?.split('@')[0] || '';
        setData(prev => ({ ...prev, firstName: userName }));
        
        // Defer Supabase calls to prevent deadlock
        setTimeout(() => {
          checkPaymentStatus(session.user.id);
        }, 0);
      } else {
        setHasPaid(false);
        setExpiryDate(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateData = (newData: Partial<WizardData>) => {
    setData(prev => {
      const updated = { ...prev, ...newData };
      // Persist data whenever it changes
      persistData(updated, step);
      return updated;
    });
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
      const newStep = step + 1;
      setStep(newStep);
      persistData(data, newStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      const newStep = step - 1;
      setStep(newStep);
      persistData(data, newStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAutoFill = async () => {
    if (!data.resumeText || data.resumeText.trim().length < 50) {
      toast.error("Please provide more detail about your professional experience (at least 50 characters)");
      return;
    }

    // Get session for authenticated API call
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      toast.error("Authentication required. Please log in to continue.");
      throw new Error("Authentication required");
    }
    
    setIsAnalyzing(true);
    
    // Use shorter initial timeout with retry for mobile reliability
    const fetchWithRetry = async (retryCount = 0): Promise<Response> => {
      const controller = new AbortController();
      // Progressive timeout: 45s first, 60s retry
      const timeout = retryCount === 0 ? 45000 : 60000;
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-profile`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionData.session.access_token}`,
          },
          body: JSON.stringify({
            resumeText: data.resumeText,
          }),
          signal: controller.signal,
          keepalive: true,
        });
        clearTimeout(timeoutId);
        return response;
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (err?.name === 'AbortError' && retryCount < 1) {
          toast.info("Still analyzing... Please wait.", { duration: 5000 });
          return fetchWithRetry(retryCount + 1);
        }
        throw err;
      }
    };
    
    try {
      toast.info("Analyzing your profile...", { duration: 8000 });
      
      const response = await fetchWithRetry();

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Analysis failed");
      }

      const result = await response.json();
      const extracted = result.data;

      // Store the full extracted profile for recommendations
      const fullExtracted = {
        skills: extracted.skills || [],
        soft_skills: extracted.soft_skills || [],
        interests: extracted.interests || [],
        degrees: extracted.degrees || [],
        certifications: extracted.certifications || [],
        licenses: extracted.licenses || [],
        work_summary: extracted.work_summary || '',
        personality_indicators: extracted.personality_indicators || {},
        assets: extracted.assets || {},
        inferred_constraints: extracted.inferred_constraints || {},
        teaser_summary: extracted.teaser_summary || extracted.teaserSummary || {},
      };
      
      setAiAnalysis({
        ...fullExtracted,
        skillsCount: extracted.teaser_summary?.skills_count || extracted.teaserSummary?.skillsCount || extracted.skills?.length || 0,
        alignedTypes: extracted.teaser_summary?.aligned_types || extracted.teaserSummary?.alignedTypes || [],
        opportunityPaths: extracted.teaser_summary?.opportunity_paths || extracted.teaserSummary?.opportunityPaths || 0,
        assetsFound: (extracted.assets?.digital_assets?.length > 0 || extracted.assets?.physical_assets?.length > 0) || extracted.teaserSummary?.assetsFound || false,
        headline: extracted.teaser_summary?.headline || extracted.teaserSummary?.headline || "Your profile shows promising potential!",
      });

      // Combine all credentials
      const allCredentials = [
        ...(extracted.degrees || []),
        ...(extracted.certifications || []),
        ...(extracted.licenses || []),
      ];

      updateData({
        skills: extracted.skills || [],
        interests: extracted.interests || [],
        credentials: allCredentials.length > 0 ? allCredentials : (extracted.assets?.credentials || extracted.credentials || []),
        workTypes: extracted.personality_indicators?.work_style || extracted.personalityIndicators?.workTypes || [],
        structurePreference: extracted.personality_indicators?.structure_preference || extracted.personalityIndicators?.structurePreference || 3,
        riskTolerance: extracted.personality_indicators?.risk_tolerance || extracted.personalityIndicators?.riskTolerance || 3,
        digitalAssets: extracted.assets?.digital_assets || extracted.assets?.digitalAssets || [],
        networkStrength: extracted.assets?.network_strength || extracted.assets?.networkStrength || "",
      });

      toast.success("Profile analyzed successfully!");
      setStep(3);
    } catch (error: any) {
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
      
      toast.info("Generating your opportunities... You'll receive an email when ready!", { duration: 15000 });
      
      // Fetch with retry for mobile reliability
      const fetchWithRetry = async (retryCount = 0): Promise<Response> => {
        const controller = new AbortController();
        // Progressive timeout: 60s first, 90s retry
        const timeout = retryCount === 0 ? 60000 : 90000;
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
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
            keepalive: true,
          });
          clearTimeout(timeoutId);
          return response;
        } catch (err: any) {
          clearTimeout(timeoutId);
          if (err?.name === 'AbortError' && retryCount < 1) {
            toast.info("Still generating... Please wait.", { duration: 8000 });
            return fetchWithRetry(retryCount + 1);
          }
          throw err;
        }
      };
      
      const response = await fetchWithRetry();
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate recommendations");
      }

      const result = await response.json();
      
      const { error: updateError } = await supabase
        .from('assessment_results')
        .update({
          recommendations: result,
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', assessmentId);
      
      if (updateError) {
        console.error("Failed to save results to database:", updateError);
      }
      
      // Email notification is non-blocking - don't fail if it errors
      try {
        const emailResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-results-email`, {
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
        if (!emailResponse.ok) {
          console.warn("Email notification failed (non-critical):", await emailResponse.text());
        }
      } catch (emailError) {
        console.warn("Email notification failed (non-critical):", emailError);
      }
      
      // Store results in sessionStorage for immediate access
      try {
        sessionStorage.setItem("careermovr_results", JSON.stringify(result));
      } catch (e) {
        console.warn("Failed to cache results:", e);
      }
      toast.success("Your personalized opportunities are ready!");
      navigate(`/dashboard?id=${assessmentId}`);
    } catch (error: any) {
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

          <div className="flex items-center gap-2">
            {import.meta.env.DEV && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  const testData = generateTestData();
                  setData(prev => ({ ...prev, ...testData }));
                  toast.success(`Test data filled: ${testData.firstName} (${testData.careerIdentity})`);
                }}
                className="text-xs"
              >
                Fill Test Data
              </Button>
            )}
            {!isLoggedIn && (
              <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
            )}
          </div>
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
