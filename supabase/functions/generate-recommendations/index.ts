import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation constants
const MAX_STRING_LENGTH = 500;
const MAX_ARRAY_LENGTH = 50;
const MAX_ARRAY_ITEM_LENGTH = 200;

// Validate string field
function validateString(value: unknown, maxLength: number = MAX_STRING_LENGTH): string {
  if (value === undefined || value === null) return '';
  if (typeof value !== 'string') return String(value).slice(0, maxLength);
  return value.slice(0, maxLength);
}

// Validate array of strings
function validateStringArray(value: unknown, maxItems: number = MAX_ARRAY_LENGTH): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, maxItems)
    .filter((item): item is string => typeof item === 'string')
    .map(item => item.slice(0, MAX_ARRAY_ITEM_LENGTH));
}

// Validate number in range
function validateNumber(value: unknown, min: number, max: number, defaultVal: number): number {
  if (typeof value !== 'number' || isNaN(value)) return defaultVal;
  return Math.min(Math.max(value, min), max);
}

// Validate boolean
function validateBoolean(value: unknown, defaultVal: boolean = false): boolean {
  if (typeof value === 'boolean') return value;
  return defaultVal;
}

// Validate and sanitize wizardData input
function validateWizardData(data: unknown): { valid: boolean; error?: string; sanitized?: Record<string, unknown> } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: "wizardData is required and must be an object" };
  }
  
  const input = data as Record<string, unknown>;
  
  // Sanitize all fields with appropriate limits
  const sanitized: Record<string, unknown> = {
    // Basic info
    firstName: validateString(input.firstName, 100),
    city: validateString(input.city, 100),
    state: validateString(input.state, 50),
    situation: validateString(input.situation, 200),
    
    // Skills & Interests
    skills: validateStringArray(input.skills),
    softSkills: validateStringArray(input.softSkills),
    interests: validateStringArray(input.interests),
    helpTopics: validateString(input.helpTopics, 500),
    enjoyWithoutPay: validateString(input.enjoyWithoutPay, 500),
    
    // Credentials
    degrees: validateStringArray(input.degrees),
    certifications: validateStringArray(input.certifications),
    licenses: validateStringArray(input.licenses),
    credentials: validateStringArray(input.credentials),
    workSummary: validateString(input.workSummary, 2000),
    
    // Work Preference (NEW)
    preferredWorkTypes: validateStringArray(input.preferredWorkTypes, 10),
    physicalComfort: validateNumber(input.physicalComfort, 1, 5, 3),
    toolsComfort: validateNumber(input.toolsComfort, 1, 5, 3),
    
    // Environment (NEW)
    environmentPreferences: validateStringArray(input.environmentPreferences, 10),
    safetyConditions: validateStringArray(input.safetyConditions, 10),
    certificationOpenness: validateString(input.certificationOpenness, 50),
    
    // Career Style (NEW)
    careerIdentity: validateString(input.careerIdentity, 50),
    dayToDayPreference: validateStringArray(input.dayToDayPreference, 10),
    
    // Personality sliders
    workTypes: validateStringArray(input.workTypes, 10),
    leadershipLevel: validateString(input.leadershipLevel, 50),
    structurePreference: validateNumber(input.structurePreference, 1, 5, 3),
    riskTolerance: validateNumber(input.riskTolerance, 1, 5, 3),
    autonomyPreference: validateNumber(input.autonomyPreference, 1, 5, 3),
    balanceVsIncome: validateNumber(input.balanceVsIncome, 1, 5, 3),
    
    // Trade-specific questions (conditional)
    enjoysTroubleshooting: validateNumber(input.enjoysTroubleshooting, 1, 5, 3),
    followsTechnicalInstructions: validateNumber(input.followsTechnicalInstructions, 1, 5, 3),
    considersFieldRole: validateBoolean(input.considersFieldRole),
    structuredHourlyComfort: validateNumber(input.structuredHourlyComfort, 1, 5, 3),
    considersApprenticeships: validateBoolean(input.considersApprenticeships),
    
    // White-collar questions (conditional)
    enjoysWriting: validateBoolean(input.enjoysWriting),
    prefersStructure: validateBoolean(input.prefersStructure),
    enjoysDataDriven: validateNumber(input.enjoysDataDriven, 1, 5, 3),
    prefersCollaborative: validateBoolean(input.prefersCollaborative),
    
    // Hybrid questions (conditional)
    hybridTechInterest: validateNumber(input.hybridTechInterest, 1, 5, 3),
    digitalToolsComfort: validateNumber(input.digitalToolsComfort, 1, 5, 3),
    
    // Constraints
    timeAvailable: validateString(input.timeAvailable, 100),
    workSetting: validateString(input.workSetting, 100),
    hasCaregiver: validateBoolean(input.hasCaregiver),
    caregiverDetails: validateString(input.caregiverDetails, 500),
    avoidIndustries: validateStringArray(input.avoidIndustries, 20),
    timeline: validateString(input.timeline, 100),
    experienceLevel: validateString(input.experienceLevel, 50),
    
    // Assets
    ownsHome: validateBoolean(input.ownsHome),
    hasExtraSpace: validateBoolean(input.hasExtraSpace),
    extraSpaceDetails: validateString(input.extraSpaceDetails, 200),
    capitalAvailable: validateString(input.capitalAvailable, 100),
    physicalAssets: validateStringArray(input.physicalAssets),
    digitalAssets: validateStringArray(input.digitalAssets),
    networkStrength: validateString(input.networkStrength, 50),
    industryConnections: validateStringArray(input.industryConnections),
    
    // Goals
    incomePaths: validateStringArray(input.incomePaths, 20),
    incomeType: validateString(input.incomeType, 50),
  };
  
  return { valid: true, sanitized };
}

// Calculate career track signals for scoring
function calculateCareerTrackSignals(data: Record<string, unknown>) {
  const preferredWorkTypes = data.preferredWorkTypes as string[] || [];
  const environmentPreferences = data.environmentPreferences as string[] || [];
  const safetyConditions = data.safetyConditions as string[] || [];
  const dayToDayPreference = data.dayToDayPreference as string[] || [];
  const careerIdentity = data.careerIdentity as string || '';
  
  const physicalComfort = data.physicalComfort as number || 3;
  const toolsComfort = data.toolsComfort as number || 3;
  const enjoysTroubleshooting = data.enjoysTroubleshooting as number || 3;
  const hybridTechInterest = data.hybridTechInterest as number || 3;
  const digitalToolsComfort = data.digitalToolsComfort as number || 3;
  const enjoysDataDriven = data.enjoysDataDriven as number || 3;
  
  // Blue-collar / Skilled Trades scoring (0-100)
  let blueCollarScore = 0;
  if (preferredWorkTypes.includes("hands-on")) blueCollarScore += 15;
  if (preferredWorkTypes.includes("physical")) blueCollarScore += 15;
  if (preferredWorkTypes.includes("machines")) blueCollarScore += 12;
  if (preferredWorkTypes.includes("mechanical")) blueCollarScore += 12;
  if (physicalComfort >= 4) blueCollarScore += 10;
  if (toolsComfort >= 4) blueCollarScore += 10;
  if (environmentPreferences.includes("outdoor")) blueCollarScore += 8;
  if (environmentPreferences.includes("workshop")) blueCollarScore += 8;
  if (environmentPreferences.includes("industrial")) blueCollarScore += 8;
  if (!safetyConditions.includes("none")) blueCollarScore += 5;
  if (careerIdentity === "builder" || careerIdentity === "technician") blueCollarScore += 10;
  if (dayToDayPreference.includes("hands-on")) blueCollarScore += 5;
  if (dayToDayPreference.includes("mechanical")) blueCollarScore += 5;
  
  // White-collar (Non-Technical) scoring (0-100)
  let whiteCollarScore = 0;
  if (preferredWorkTypes.includes("office")) whiteCollarScore += 15;
  if (preferredWorkTypes.includes("managing")) whiteCollarScore += 12;
  if (preferredWorkTypes.includes("helping")) whiteCollarScore += 10;
  if (environmentPreferences.includes("office")) whiteCollarScore += 10;
  if (environmentPreferences.includes("remote")) whiteCollarScore += 10;
  if (physicalComfort <= 2) whiteCollarScore += 8;
  if (careerIdentity === "manager" || careerIdentity === "communicator") whiteCollarScore += 15;
  if (careerIdentity === "helper") whiteCollarScore += 10;
  if (dayToDayPreference.includes("people")) whiteCollarScore += 8;
  if (dayToDayPreference.includes("organizing")) whiteCollarScore += 8;
  const enjoysWriting = data.enjoysWriting as boolean;
  const prefersCollaborative = data.prefersCollaborative as boolean;
  if (enjoysWriting) whiteCollarScore += 8;
  if (prefersCollaborative) whiteCollarScore += 5;
  
  // Technical careers scoring (0-100)
  let technicalScore = 0;
  if (preferredWorkTypes.includes("analytical")) technicalScore += 15;
  if (toolsComfort >= 4) technicalScore += 10;
  if (enjoysDataDriven >= 4) technicalScore += 12;
  if (careerIdentity === "analyst") technicalScore += 15;
  if (dayToDayPreference.includes("troubleshooting")) technicalScore += 12;
  if (dayToDayPreference.includes("software")) technicalScore += 12;
  if (dayToDayPreference.includes("problem-solving")) technicalScore += 10;
  if (environmentPreferences.includes("office") || environmentPreferences.includes("remote")) technicalScore += 8;
  if (digitalToolsComfort >= 4) technicalScore += 8;
  
  // Hybrid Technical-Trade scoring (0-100)
  let hybridScore = 0;
  if (hybridTechInterest >= 4) hybridScore += 20;
  if (digitalToolsComfort >= 4) hybridScore += 15;
  if (toolsComfort >= 4 && preferredWorkTypes.includes("analytical")) hybridScore += 15;
  if (preferredWorkTypes.includes("machines") && preferredWorkTypes.includes("analytical")) hybridScore += 12;
  if (enjoysTroubleshooting >= 4) hybridScore += 12;
  if (careerIdentity === "technician") hybridScore += 15;
  if (dayToDayPreference.includes("troubleshooting") && dayToDayPreference.includes("hands-on")) hybridScore += 10;
  if (environmentPreferences.includes("industrial") && digitalToolsComfort >= 3) hybridScore += 8;
  
  // Normalize scores (cap at 100)
  return {
    blueCollar: Math.min(blueCollarScore, 100),
    whiteCollar: Math.min(whiteCollarScore, 100),
    technical: Math.min(technicalScore, 100),
    hybrid: Math.min(hybridScore, 100),
    // Derived signals
    isBlueCollarOriented: blueCollarScore >= 40,
    isWhiteCollarOriented: whiteCollarScore >= 40,
    isTechnicalOriented: technicalScore >= 40,
    isHybridOriented: hybridScore >= 40,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let rawInput: unknown;
    try {
      rawInput = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!rawInput || typeof rawInput !== 'object') {
      return new Response(JSON.stringify({ error: "Request body must be an object" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const input = rawInput as Record<string, unknown>;
    
    const validation = validateWizardData(input.wizardData);
    if (!validation.valid) {
      console.log("Input validation failed:", validation.error);
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const wizardData = validation.sanitized!;
    const careerSignals = calculateCareerTrackSignals(wizardData);
    const extractedProfile = input.extractedProfile as Record<string, unknown> | undefined;
    
    console.log("Generating recommendations for:", { 
      firstName: wizardData?.firstName,
      skillsCount: (wizardData?.skills as string[])?.length,
      hasExtractedProfile: !!extractedProfile,
      extractedSkillsCount: (extractedProfile?.skills as string[])?.length,
      extractedDegrees: (extractedProfile?.degrees as string[])?.length,
      careerSignals
    });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Merge extracted profile data with wizard data for comprehensive context
    const mergedSkills = Array.from(new Set([
      ...((wizardData.skills as string[]) || []),
      ...((extractedProfile?.skills as string[]) || [])
    ]));
    
    const mergedSoftSkills = Array.from(new Set([
      ...((wizardData.softSkills as string[]) || []),
      ...((extractedProfile?.soft_skills as string[]) || [])
    ]));
    
    const mergedDegrees = Array.from(new Set([
      ...((wizardData.degrees as string[]) || []),
      ...((extractedProfile?.degrees as string[]) || [])
    ]));
    
    const mergedCertifications = Array.from(new Set([
      ...((wizardData.certifications as string[]) || []),
      ...((wizardData.credentials as string[]) || []),
      ...((extractedProfile?.certifications as string[]) || [])
    ]));
    
    const mergedLicenses = Array.from(new Set([
      ...((wizardData.licenses as string[]) || []),
      ...((extractedProfile?.licenses as string[]) || [])
    ]));

    const extractedWorkSummary = extractedProfile?.work_summary as string || '';
    const profileQualityWarning = (!mergedSkills.length && !mergedDegrees.length && !extractedWorkSummary) 
      ? "\n\nNOTE: Limited profile data was provided. Recommendations may be more general. For more personalized results, the user should provide a resume or LinkedIn profile."
      : "";

    const userContext = `
USER PROFILE:
- Name: ${wizardData.firstName || "User"}
- Location: ${wizardData.city || ""}, ${wizardData.state || ""}
- Current Situation: ${wizardData.situation || "exploring options"}

HARD SKILLS (from resume/profile and questionnaire):
${mergedSkills.map((s: string) => `- ${s}`).join("\n") || "- Not specified"}

SOFT SKILLS (from resume/profile and questionnaire):
${mergedSoftSkills.map((s: string) => `- ${s}`).join("\n") || "- Not specified"}

INTERESTS:
${((wizardData.interests as string[]) || (extractedProfile?.interests as string[]) || []).map((i: string) => `- ${i}`).join("\n") || "- Not specified"}

CREDENTIALS (from resume/profile and questionnaire):
- Degrees: ${mergedDegrees.join(", ") || "None specified"}
- Certifications: ${mergedCertifications.join(", ") || "None specified"}
- Licenses: ${mergedLicenses.join(", ") || "None specified"}

WORK SUMMARY (extracted from resume/profile):
${extractedWorkSummary || wizardData.workSummary || "Not provided"}
${profileQualityWarning}

WORK TYPE PREFERENCES:
- Preferred work types: ${((wizardData.preferredWorkTypes as string[]) || []).join(", ") || "not specified"}
- Physical comfort level: ${wizardData.physicalComfort}/5
- Tools/machinery comfort: ${wizardData.toolsComfort}/5

ENVIRONMENT PREFERENCES:
- Preferred environments: ${((wizardData.environmentPreferences as string[]) || []).join(", ") || "flexible"}
- Safety conditions comfortable with: ${((wizardData.safetyConditions as string[]) || []).join(", ") || "none specified"}
- Certification/training openness: ${wizardData.certificationOpenness || "not specified"}

CAREER IDENTITY & STYLE:
- Career identity: ${wizardData.careerIdentity || "not specified"}
- Day-to-day preferences: ${((wizardData.dayToDayPreference as string[]) || []).join(", ") || "not specified"}
- Structure preference: ${wizardData.structurePreference}/5
- Risk tolerance: ${wizardData.riskTolerance}/5
- Work-life vs income priority: ${wizardData.balanceVsIncome}/5

TRADE-SPECIFIC INDICATORS:
- Enjoys troubleshooting: ${wizardData.enjoysTroubleshooting}/5
- Follows technical instructions: ${wizardData.followsTechnicalInstructions}/5
- Open to field roles: ${wizardData.considersFieldRole ? "Yes" : "No"}
- Structured hourly comfort: ${wizardData.structuredHourlyComfort}/5
- Open to apprenticeships: ${wizardData.considersApprenticeships ? "Yes" : "No"}

WHITE-COLLAR INDICATORS:
- Enjoys writing/communicating: ${wizardData.enjoysWriting ? "Yes" : "No"}
- Prefers predictable structure: ${wizardData.prefersStructure ? "Yes" : "No"}
- Enjoys data-driven work: ${wizardData.enjoysDataDriven}/5
- Prefers collaborative work: ${wizardData.prefersCollaborative ? "Yes" : "No"}

HYBRID TECH-TRADE INDICATORS:
- Interest in hybrid tech-trade roles: ${wizardData.hybridTechInterest}/5
- Digital diagnostic tools comfort: ${wizardData.digitalToolsComfort}/5

CAREER TRACK SCORES (Pre-calculated):
- Blue-Collar/Skilled Trades affinity: ${careerSignals.blueCollar}%
- White-Collar (Non-Technical) affinity: ${careerSignals.whiteCollar}%
- Technical Careers affinity: ${careerSignals.technical}%
- Hybrid Technical-Trade affinity: ${careerSignals.hybrid}%

CONSTRAINTS:
- Time available: ${wizardData.timeAvailable || "not specified"}
- Work setting: ${wizardData.workSetting || "flexible"}
- Has caregiving responsibilities: ${wizardData.hasCaregiver ? "Yes" : "No"}
- Industries to avoid: ${((wizardData.avoidIndustries as string[]) || []).join(", ") || "none"}
- Timeline goal: ${wizardData.timeline || "flexible"}

ASSETS:
- Owns home: ${wizardData.ownsHome ? "Yes" : "No"}
- Has extra space: ${wizardData.hasExtraSpace ? "Yes" : "No"}
- Capital available: ${wizardData.capitalAvailable || "not specified"}
- Physical assets: ${((wizardData.physicalAssets as string[]) || []).join(", ") || "none listed"}
- Digital assets: ${((wizardData.digitalAssets as string[]) || []).join(", ") || "none listed"}
- Network strength: ${wizardData.networkStrength || "moderate"}

GOALS:
- Income paths interested in: ${((wizardData.incomePaths as string[]) || []).join(", ") || "open to options"}
- Preferred income type: ${wizardData.incomeType || "flexible"}
`.trim();

    const systemPrompt = `You are an expert career advisor AI for CareerMovr, a U.S.-focused platform. Generate comprehensive, personalized career recommendations across FOUR career tracks based on the user's profile and pre-calculated career track scores.

IMPORTANT: Use gender-neutral language throughout. Address the user as "you" and "your" - never use gendered pronouns (he/she/him/her/his/hers).

CAREER FAMILIES TO CONSIDER:

1. TECHNICAL CAREERS (Data, Product, Engineering, Analytics, PM, IT):
   - Data Analyst, Data Scientist, Product Manager (Tech), Software/Web Developer, IT Support/Systems Admin, Cybersecurity Analyst, Business Intelligence Analyst, QA Engineer, Technical Writer

2. WHITE-COLLAR NON-TECHNICAL CAREERS (Operations, HR, Sales, Management):
   - Operations Manager/Coordinator, Customer Success Manager, HR/People Ops Specialist, Sales Representative/Account Executive, Marketing Coordinator/Manager, Project Manager (Non-tech), Business Analyst, Administrative Manager, Strategy/Business Development

3. BLUE-COLLAR / SKILLED TRADES:
   - Electrician, HVAC Technician, Plumber, Mechanic/Automotive Tech, Construction/Carpentry, Welding, Facilities Maintenance, Logistics/Warehouse Operations, Field Service Technician, Heavy Equipment Operator

4. HYBRID TECHNICAL-TRADE CAREERS:
   - Industrial Technician, Robotics Maintenance Tech, CNC Machinist/Programmer, IT Field Technician, Manufacturing Systems Tech, Automation Technician, Medical Equipment Tech, Elevator Technician, Wind Turbine Technician

You MUST return valid JSON with exactly this structure. Be SPECIFIC and reference the user's actual skills, preferences, and constraints.`;

    const userPrompt = `${userContext}

Based on this profile, generate a JSON response with this EXACT structure:

{
  "career_scorecard": {
    "technical": { "match_percentage": 0-100, "explanation": "2-3 sentences", "top_roles": ["role1", "role2", "role3"], "strengths_for_track": ["strength1", "strength2"], "gaps_for_track": ["gap1", "gap2"] },
    "white_collar": { "match_percentage": 0-100, "explanation": "2-3 sentences", "top_roles": ["role1", "role2", "role3"], "strengths_for_track": ["strength1", "strength2"], "gaps_for_track": ["gap1", "gap2"] },
    "blue_collar": { "match_percentage": 0-100, "explanation": "2-3 sentences", "top_roles": ["role1", "role2", "role3"], "strengths_for_track": ["strength1", "strength2"], "gaps_for_track": ["gap1", "gap2"] },
    "hybrid": { "match_percentage": 0-100, "explanation": "2-3 sentences", "top_roles": ["role1", "role2", "role3"], "strengths_for_track": ["strength1", "strength2"], "gaps_for_track": ["gap1", "gap2"] }
  },
  "recommendations": [
    {
      "title": "Job Title",
      "career_family": "technical|white-collar|blue-collar|hybrid",
      "match_percentage": 0-100,
      "type": "career|consulting|freelance|rental|side-hustle|business|creator|apprenticeship",
      "reason_fit": ["bullet1", "bullet2", "bullet3"],
      "difficulty": "L|M|H",
      "time_commitment": "e.g. 40 hrs/week",
      "ramp_time": "e.g. 3 months",
      "income_potential": "L|M|H",
      "required_training": "description or None required",
      "first_3_steps": ["step1", "step2", "step3"]
    }
  ],
  "ai_centric_opportunities": [
    {
      "title": "AI Role Title",
      "career_family": "technical|white-collar|blue-collar|hybrid",
      "match_percentage": 0-100,
      "type": "career|consulting|freelance",
      "reason_fit": ["bullet1", "bullet2"],
      "skill_bridge": "Skills to develop",
      "entry_points": ["entry1", "entry2"],
      "competitive_edge": "Your unique advantage",
      "difficulty": "L|M|H",
      "time_commitment": "e.g. 20 hrs/week",
      "ramp_time": "e.g. 2 months",
      "income_potential": "L|M|H",
      "first_3_steps": ["step1", "step2", "step3"]
    }
  ],
  "ai_proof_opportunities": [
    {
      "title": "Automation-Resistant Role",
      "career_family": "technical|white-collar|blue-collar|hybrid",
      "match_percentage": 0-100,
      "type": "career|consulting|freelance",
      "reason_fit": ["bullet1", "bullet2"],
      "human_advantage": "Why this cannot be automated",
      "monetization_path": "How to earn income",
      "difficulty": "L|M|H",
      "time_commitment": "e.g. full-time",
      "ramp_time": "e.g. 6 months",
      "income_potential": "L|M|H",
      "first_3_steps": ["step1", "step2", "step3"]
    }
  ],
  "alternative_paths": [
    {
      "title": "Alternative Income Path",
      "type": "rental|passive-income|side-hustle|consulting|creator|freelance",
      "reason_fit": ["bullet1", "bullet2"],
      "resource_leveraged": "What existing resource this uses",
      "effort_level": "Minimal|Part-time|Active",
      "passive_potential": "Description of passive income potential",
      "difficulty": "L|M|H",
      "time_commitment": "e.g. 5 hrs/week",
      "ramp_time": "e.g. 1 month",
      "income_potential": "L|M|H",
      "first_3_steps": ["step1", "step2", "step3"]
    }
  ],
  "alternative_options": [
    {
      "title": "Unconventional Career Path",
      "career_family": "technical|white-collar|blue-collar|hybrid",
      "match_percentage": 0-100,
      "type": "career|consulting|freelance|business|creator|apprenticeship",
      "reason_fit": ["bullet1", "bullet2"],
      "why_unconventional": "Why this is outside their experience",
      "personality_match": "How personality aligns",
      "transferable_strengths": ["strength1", "strength2"],
      "realistic_entry": "How to realistically enter this field",
      "difficulty": "L|M|H",
      "time_commitment": "e.g. full-time",
      "ramp_time": "e.g. 12 months",
      "income_potential": "L|M|H",
      "first_3_steps": ["step1", "step2", "step3"]
    }
  ],
  "success_plan": {
    "strengths": ["strength1", "strength2", "strength3", "strength4", "strength5"],
    "skill_gaps": ["gap1", "gap2", "gap3"],
    "fast_wins": ["win1", "win2", "win3", "win4", "win5"],
    "thirty_day_plan": [
      { "week": 1, "focus": "Focus area", "tasks": ["task1", "task2", "task3"] },
      { "week": 2, "focus": "Focus area", "tasks": ["task1", "task2", "task3"] },
      { "week": 3, "focus": "Focus area", "tasks": ["task1", "task2", "task3"] },
      { "week": 4, "focus": "Focus area", "tasks": ["task1", "task2", "task3"] }
    ],
    "quickest_path_to_income": [
      { "opportunity": "Fastest opportunity", "timeline": "e.g. 2 weeks", "steps": ["step1", "step2", "step3"] }
    ],
    "best_long_term_bets": [
      { "opportunity": "Long-term opportunity", "why": "Why it's a good bet", "potential": "Growth potential" }
    ],
    "encouragement_summary": "A personalized, encouraging summary paragraph for the user. Use 'you' and 'your' - avoid gendered pronouns."
  },
  "low_hanging_fruit": ["easiest option 1", "easiest option 2"],
  "profile_summary": {
    "headline": "A compelling one-liner about the user's profile",
    "top_skills": ["skill1", "skill2", "skill3"],
    "experience_level": "entry|mid|senior",
    "best_fit_types": ["type1", "type2"],
    "primary_career_track": "technical|white-collar|blue-collar|hybrid"
  }
}

Generate 10-15 recommendations, 3-6 ai_centric_opportunities, 3-6 ai_proof_opportunities, 3-6 alternative_paths, and 3-6 alternative_options. Return ONLY the JSON, no markdown code blocks.`;

    console.log("Calling AI for recommendations (JSON mode)...");
    console.log("User context length:", userContext.length, "chars");
    console.log("System prompt length:", systemPrompt.length, "chars");
    console.log("User prompt length:", userPrompt.length, "chars");

    const startTime = Date.now();
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" }
      }),
    });
    
    console.log("AI response received in", Date.now() - startTime, "ms");

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResult = await response.json();
    console.log("AI Response received, structure:", JSON.stringify({
      hasChoices: !!aiResult.choices,
      choicesLength: aiResult.choices?.length,
      hasContent: !!aiResult.choices?.[0]?.message?.content,
    }));

    let recommendations;
    
    // Parse from content (JSON mode response)
    if (aiResult.choices?.[0]?.message?.content) {
      console.log("Parsing from content (JSON mode)");
      let content = aiResult.choices[0].message.content;
      
      // Clean up common JSON issues from AI responses
      const cleanJsonContent = (str: string): string => {
        // Remove markdown code blocks
        str = str.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
        // Fix trailing commas before closing braces/brackets
        str = str.replace(/,(\s*[}\]])/g, '$1');
        // Fix unescaped quotes in strings (common AI error)
        // This is a simplified fix - replace smart quotes with regular quotes
        str = str.replace(/[\u201C\u201D]/g, '"');
        str = str.replace(/[\u2018\u2019]/g, "'");
        return str.trim();
      };
      
      try {
        recommendations = JSON.parse(cleanJsonContent(content));
      } catch (parseError) {
        console.log("Initial parse failed, trying to extract JSON block");
        // Try to extract JSON from the content if it has markdown or extra text
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            recommendations = JSON.parse(cleanJsonContent(jsonMatch[0]));
          } catch (innerError) {
            console.error("JSON extraction also failed:", innerError);
            console.error("Problematic content (first 1000 chars):", content.substring(0, 1000));
            console.error("Problematic content (last 500 chars):", content.substring(content.length - 500));
            throw new Error("AI returned malformed JSON. Please try again.");
          }
        } else {
          console.error("No JSON object found in response");
          throw new Error("AI response did not contain valid JSON. Please try again.");
        }
      }
    }
    
    if (!recommendations) {
      console.error("Full AI response:", JSON.stringify(aiResult).substring(0, 2000));
      throw new Error("No recommendations generated - could not parse AI response");
    }
    
    // Add pre-calculated career signals to the response
    recommendations.career_signals = careerSignals;
    
    console.log("Generated:", {
      careerScorecard: !!recommendations.career_scorecard,
      recommendations: recommendations.recommendations?.length,
      aiCentric: recommendations.ai_centric_opportunities?.length,
      aiProof: recommendations.ai_proof_opportunities?.length,
      alternativePaths: recommendations.alternative_paths?.length,
      alternativeOptions: recommendations.alternative_options?.length,
      successPlan: !!recommendations.success_plan,
    });

    return new Response(JSON.stringify(recommendations), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-recommendations:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate recommendations";
    
    // Return safe error messages - only expose known safe user-facing errors
    const safeUserErrors = [
      "AI returned malformed JSON. Please try again.",
      "AI response did not contain valid JSON. Please try again."
    ];
    const userMessage = safeUserErrors.includes(errorMessage) 
      ? errorMessage 
      : "Failed to generate recommendations. Please try again.";
    
    return new Response(JSON.stringify({ error: userMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
