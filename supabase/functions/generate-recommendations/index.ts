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
    const extractedProfile = input.extractedProfile;
    
    console.log("Generating recommendations for:", { 
      firstName: wizardData?.firstName,
      skillsCount: (wizardData?.skills as string[])?.length,
      careerSignals
    });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const userContext = `
USER PROFILE:
- Name: ${wizardData.firstName || "User"}
- Location: ${wizardData.city || ""}, ${wizardData.state || ""}
- Current Situation: ${wizardData.situation || "exploring options"}

HARD SKILLS:
${((wizardData.skills as string[]) || []).map((s: string) => `- ${s}`).join("\n") || "- Not specified"}

SOFT SKILLS:
${((wizardData.softSkills as string[]) || []).map((s: string) => `- ${s}`).join("\n") || "- Not specified"}

INTERESTS:
${((wizardData.interests as string[]) || []).map((i: string) => `- ${i}`).join("\n") || "- Not specified"}

CREDENTIALS:
- Degrees: ${((wizardData.degrees as string[]) || []).join(", ") || "None"}
- Certifications: ${((wizardData.certifications as string[]) || (wizardData.credentials as string[]) || []).join(", ") || "None"}
- Licenses: ${((wizardData.licenses as string[]) || []).join(", ") || "None"}

WORK SUMMARY:
${wizardData.workSummary || "Not provided"}

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

CAREER FAMILIES TO CONSIDER:

1. TECHNICAL CAREERS (Data, Product, Engineering, Analytics, PM, IT):
   - Data Analyst, Data Scientist
   - Product Manager (Tech)
   - Software/Web Developer
   - IT Support/Systems Admin
   - Cybersecurity Analyst
   - Business Intelligence Analyst
   - QA Engineer
   - Technical Writer

2. WHITE-COLLAR NON-TECHNICAL CAREERS (Operations, HR, Sales, Management):
   - Operations Manager/Coordinator
   - Customer Success Manager
   - HR/People Ops Specialist
   - Sales Representative/Account Executive
   - Marketing Coordinator/Manager
   - Project Manager (Non-tech)
   - Business Analyst
   - Administrative Manager
   - Strategy/Business Development

3. BLUE-COLLAR / SKILLED TRADES:
   - Electrician
   - HVAC Technician
   - Plumber
   - Mechanic/Automotive Tech
   - Construction/Carpentry
   - Welding
   - Facilities Maintenance
   - Logistics/Warehouse Operations
   - Field Service Technician
   - Heavy Equipment Operator

4. HYBRID TECHNICAL-TRADE CAREERS:
   - Industrial Technician
   - Robotics Maintenance Tech
   - CNC Machinist/Programmer
   - IT Field Technician
   - Manufacturing Systems Tech
   - Automation Technician
   - Medical Equipment Tech
   - Elevator Technician
   - Wind Turbine Technician

OUTPUT REQUIREMENTS:
1. CAREER SCORECARD: Provide match percentages and explanations for each career family based on user inputs
2. TOP CAREER MATCHES (10-15): Specific roles from ALL relevant career families, sorted by match percentage
3. AI-CENTRIC OPPORTUNITIES (3-6): Roles leveraging AI tools
4. AI-PROOF OPPORTUNITIES (3-6): Automation-resistant roles
5. ALTERNATIVE PATHS (3-6): Ways to leverage resources for income
6. ALTERNATIVE OPTIONS (3-6): Unconventional career pivots
7. COMPLETE SUCCESS PLAN

For the CAREER SCORECARD, provide:
- match_percentage: 0-100 based on user's profile alignment
- explanation: 2-3 sentences explaining the match
- top_roles: 3-5 specific roles from this family that fit best
- strengths_for_track: What makes them suited for this track
- gaps_for_track: What they'd need to develop

For EACH career recommendation include:
- title: Clear, specific title
- career_family: "technical", "white-collar", "blue-collar", or "hybrid"
- match_percentage: 0-100 showing fit strength
- type: career, consulting, freelance, rental, side-hustle, business, creator, apprenticeship
- reason_fit: 3-5 bullet points referencing specific user inputs
- difficulty: L (low), M (medium), H (high)
- time_commitment: e.g., "5-10 hrs/week" or "full-time"
- ramp_time: Time to first income
- income_potential: L ($0-2k/mo), M ($2-5k/mo), H ($5k+/mo)
- required_training: Any certifications or training needed
- first_3_steps: Three specific, actionable steps

Be SPECIFIC. Reference the user's actual skills, preferences, and constraints. Use the pre-calculated career track scores to weight recommendations appropriately.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "generate_career_recommendations",
          description: "Generate comprehensive personalized career opportunities with career family scorecard",
          parameters: {
            type: "object",
            properties: {
              career_scorecard: {
                type: "object",
                description: "Match scores for each career family",
                properties: {
                  technical: {
                    type: "object",
                    properties: {
                      match_percentage: { type: "number", description: "0-100 match score" },
                      explanation: { type: "string" },
                      top_roles: { type: "array", items: { type: "string" } },
                      strengths_for_track: { type: "array", items: { type: "string" } },
                      gaps_for_track: { type: "array", items: { type: "string" } }
                    },
                    required: ["match_percentage", "explanation", "top_roles", "strengths_for_track", "gaps_for_track"]
                  },
                  white_collar: {
                    type: "object",
                    properties: {
                      match_percentage: { type: "number" },
                      explanation: { type: "string" },
                      top_roles: { type: "array", items: { type: "string" } },
                      strengths_for_track: { type: "array", items: { type: "string" } },
                      gaps_for_track: { type: "array", items: { type: "string" } }
                    },
                    required: ["match_percentage", "explanation", "top_roles", "strengths_for_track", "gaps_for_track"]
                  },
                  blue_collar: {
                    type: "object",
                    properties: {
                      match_percentage: { type: "number" },
                      explanation: { type: "string" },
                      top_roles: { type: "array", items: { type: "string" } },
                      strengths_for_track: { type: "array", items: { type: "string" } },
                      gaps_for_track: { type: "array", items: { type: "string" } }
                    },
                    required: ["match_percentage", "explanation", "top_roles", "strengths_for_track", "gaps_for_track"]
                  },
                  hybrid: {
                    type: "object",
                    properties: {
                      match_percentage: { type: "number" },
                      explanation: { type: "string" },
                      top_roles: { type: "array", items: { type: "string" } },
                      strengths_for_track: { type: "array", items: { type: "string" } },
                      gaps_for_track: { type: "array", items: { type: "string" } }
                    },
                    required: ["match_percentage", "explanation", "top_roles", "strengths_for_track", "gaps_for_track"]
                  }
                },
                required: ["technical", "white_collar", "blue_collar", "hybrid"]
              },
              recommendations: {
                type: "array",
                description: "10-15 personalized career/income opportunities from all relevant career families",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    career_family: { type: "string", enum: ["technical", "white-collar", "blue-collar", "hybrid"] },
                    match_percentage: { type: "number", description: "0-100 match score" },
                    type: { type: "string", enum: ["career", "consulting", "freelance", "rental", "side-hustle", "business", "creator", "apprenticeship"] },
                    reason_fit: { type: "array", items: { type: "string" }, description: "3-5 bullet points" },
                    difficulty: { type: "string", enum: ["L", "M", "H"] },
                    time_commitment: { type: "string" },
                    ramp_time: { type: "string" },
                    income_potential: { type: "string", enum: ["L", "M", "H"] },
                    required_training: { type: "string", description: "Certifications or training needed, or 'None required'" },
                    first_3_steps: { type: "array", items: { type: "string" } }
                  },
                  required: ["title", "career_family", "match_percentage", "type", "reason_fit", "difficulty", "time_commitment", "ramp_time", "income_potential", "required_training", "first_3_steps"]
                }
              },
              ai_centric_opportunities: {
                type: "array",
                description: "3-6 AI-focused roles and opportunities",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    career_family: { type: "string", enum: ["technical", "white-collar", "blue-collar", "hybrid"] },
                    match_percentage: { type: "number" },
                    type: { type: "string" },
                    reason_fit: { type: "array", items: { type: "string" } },
                    skill_bridge: { type: "string", description: "Skills to develop" },
                    entry_points: { type: "array", items: { type: "string" } },
                    competitive_edge: { type: "string" },
                    difficulty: { type: "string", enum: ["L", "M", "H"] },
                    time_commitment: { type: "string" },
                    ramp_time: { type: "string" },
                    income_potential: { type: "string", enum: ["L", "M", "H"] },
                    first_3_steps: { type: "array", items: { type: "string" } }
                  },
                  required: ["title", "career_family", "match_percentage", "type", "reason_fit", "skill_bridge", "entry_points", "competitive_edge", "difficulty", "time_commitment", "ramp_time", "income_potential", "first_3_steps"]
                }
              },
              ai_proof_opportunities: {
                type: "array",
                description: "3-6 automation-resistant opportunities",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    career_family: { type: "string", enum: ["technical", "white-collar", "blue-collar", "hybrid"] },
                    match_percentage: { type: "number" },
                    type: { type: "string" },
                    reason_fit: { type: "array", items: { type: "string" } },
                    human_advantage: { type: "string", description: "Why this cannot be automated" },
                    monetization_path: { type: "string" },
                    difficulty: { type: "string", enum: ["L", "M", "H"] },
                    time_commitment: { type: "string" },
                    ramp_time: { type: "string" },
                    income_potential: { type: "string", enum: ["L", "M", "H"] },
                    first_3_steps: { type: "array", items: { type: "string" } }
                  },
                  required: ["title", "career_family", "match_percentage", "type", "reason_fit", "human_advantage", "monetization_path", "difficulty", "time_commitment", "ramp_time", "income_potential", "first_3_steps"]
                }
              },
              alternative_paths: {
                type: "array",
                description: "3-6 alternative income paths leveraging user's resources",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    type: { type: "string", enum: ["rental", "passive-income", "side-hustle", "consulting", "creator", "freelance"] },
                    reason_fit: { type: "array", items: { type: "string" } },
                    resource_leveraged: { type: "string" },
                    effort_level: { type: "string", enum: ["Minimal", "Part-time", "Active"] },
                    passive_potential: { type: "string" },
                    difficulty: { type: "string", enum: ["L", "M", "H"] },
                    time_commitment: { type: "string" },
                    ramp_time: { type: "string" },
                    income_potential: { type: "string", enum: ["L", "M", "H"] },
                    first_3_steps: { type: "array", items: { type: "string" } }
                  },
                  required: ["title", "type", "reason_fit", "resource_leveraged", "effort_level", "passive_potential", "difficulty", "time_commitment", "ramp_time", "income_potential", "first_3_steps"]
                }
              },
              alternative_options: {
                type: "array",
                description: "3-6 unconventional career paths outside user's experience",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    career_family: { type: "string", enum: ["technical", "white-collar", "blue-collar", "hybrid"] },
                    match_percentage: { type: "number" },
                    type: { type: "string", enum: ["career", "consulting", "freelance", "business", "creator", "apprenticeship"] },
                    reason_fit: { type: "array", items: { type: "string" } },
                    why_unconventional: { type: "string" },
                    personality_match: { type: "string" },
                    transferable_strengths: { type: "array", items: { type: "string" } },
                    realistic_entry: { type: "string" },
                    difficulty: { type: "string", enum: ["L", "M", "H"] },
                    time_commitment: { type: "string" },
                    ramp_time: { type: "string" },
                    income_potential: { type: "string", enum: ["L", "M", "H"] },
                    first_3_steps: { type: "array", items: { type: "string" } }
                  },
                  required: ["title", "career_family", "match_percentage", "type", "reason_fit", "why_unconventional", "personality_match", "transferable_strengths", "realistic_entry", "difficulty", "time_commitment", "ramp_time", "income_potential", "first_3_steps"]
                }
              },
              success_plan: {
                type: "object",
                properties: {
                  strengths: { type: "array", items: { type: "string" }, description: "5-7 key strengths" },
                  skill_gaps: { type: "array", items: { type: "string" }, description: "3-5 skills to develop" },
                  fast_wins: { type: "array", items: { type: "string" }, description: "5-7 actions for this week" },
                  thirty_day_plan: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        week: { type: "number" },
                        focus: { type: "string" },
                        tasks: { type: "array", items: { type: "string" } }
                      },
                      required: ["week", "focus", "tasks"]
                    }
                  },
                  quickest_path_to_income: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        opportunity: { type: "string" },
                        timeline: { type: "string" },
                        steps: { type: "array", items: { type: "string" } }
                      },
                      required: ["opportunity", "timeline", "steps"]
                    }
                  },
                  best_long_term_bets: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        opportunity: { type: "string" },
                        why: { type: "string" },
                        potential: { type: "string" }
                      },
                      required: ["opportunity", "why", "potential"]
                    }
                  },
                  encouragement_summary: { type: "string" }
                },
                required: ["strengths", "skill_gaps", "fast_wins", "thirty_day_plan", "quickest_path_to_income", "best_long_term_bets", "encouragement_summary"]
              },
              low_hanging_fruit: { type: "array", items: { type: "string" }, description: "2-3 easiest opportunities" },
              profile_summary: {
                type: "object",
                properties: {
                  headline: { type: "string" },
                  top_skills: { type: "array", items: { type: "string" } },
                  experience_level: { type: "string" },
                  best_fit_types: { type: "array", items: { type: "string" } },
                  primary_career_track: { type: "string", enum: ["technical", "white-collar", "blue-collar", "hybrid"] }
                },
                required: ["headline", "top_skills", "experience_level", "best_fit_types", "primary_career_track"]
              }
            },
            required: ["career_scorecard", "recommendations", "ai_centric_opportunities", "ai_proof_opportunities", "alternative_paths", "alternative_options", "success_plan", "low_hanging_fruit", "profile_summary"]
          }
        }
      }
    ];

    console.log("Calling AI for recommendations with career scorecard...");

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
          { role: "user", content: userContext }
        ],
        tools,
        tool_choice: { type: "function", function: { name: "generate_career_recommendations" } }
      }),
    });

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
      messageKeys: aiResult.choices?.[0]?.message ? Object.keys(aiResult.choices[0].message) : [],
      hasToolCalls: !!aiResult.choices?.[0]?.message?.tool_calls,
      hasFunctionCall: !!aiResult.choices?.[0]?.message?.function_call,
    }));

    let recommendations;
    
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      console.log("Parsing from tool_calls");
      recommendations = JSON.parse(toolCall.function.arguments);
    }
    else if (aiResult.choices?.[0]?.message?.function_call?.arguments) {
      console.log("Parsing from function_call");
      recommendations = JSON.parse(aiResult.choices[0].message.function_call.arguments);
    }
    else if (aiResult.choices?.[0]?.message?.content) {
      console.log("Attempting to parse from content");
      const content = aiResult.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      }
    }
    
    if (!recommendations) {
      console.error("Full AI response:", JSON.stringify(aiResult).substring(0, 1000));
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
      alternativeOptions: recommendations.alternative_options?.length
    });

    return new Response(JSON.stringify({ 
      success: true, 
      data: recommendations 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-recommendations:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Failed to generate recommendations" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
