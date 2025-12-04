import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation constants
const MAX_RESUME_LENGTH = 50000;
const MAX_URL_LENGTH = 500;
const MAX_STRING_LENGTH = 200;

// URL validation helper
function isValidUrl(url: string): boolean {
  if (!url) return true; // Optional fields are valid when empty
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// Validate and sanitize input
function validateInput(data: unknown): { valid: boolean; error?: string; sanitized?: Record<string, unknown> } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: "Invalid request body" };
  }
  
  const input = data as Record<string, unknown>;
  
  // Validate resumeText
  if (input.resumeText !== undefined && input.resumeText !== null) {
    if (typeof input.resumeText !== 'string') {
      return { valid: false, error: "resumeText must be a string" };
    }
    if (input.resumeText.length > MAX_RESUME_LENGTH) {
      return { valid: false, error: `resumeText exceeds maximum length of ${MAX_RESUME_LENGTH} characters` };
    }
  }
  
  // Validate URLs
  const urlFields = ['linkedinUrl', 'twitterUrl', 'portfolioUrl'];
  for (const field of urlFields) {
    const value = input[field];
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value !== 'string') {
        return { valid: false, error: `${field} must be a string` };
      }
      if (value.length > MAX_URL_LENGTH) {
        return { valid: false, error: `${field} exceeds maximum length of ${MAX_URL_LENGTH} characters` };
      }
      if (!isValidUrl(value)) {
        return { valid: false, error: `${field} must be a valid URL` };
      }
    }
  }
  
  // Validate basicInfo
  if (input.basicInfo !== undefined && input.basicInfo !== null) {
    if (typeof input.basicInfo !== 'object') {
      return { valid: false, error: "basicInfo must be an object" };
    }
    const basicInfo = input.basicInfo as Record<string, unknown>;
    const stringFields = ['firstName', 'city', 'state', 'situation'];
    for (const field of stringFields) {
      const value = basicInfo[field];
      if (value !== undefined && value !== null) {
        if (typeof value !== 'string') {
          return { valid: false, error: `basicInfo.${field} must be a string` };
        }
        if (value.length > MAX_STRING_LENGTH) {
          return { valid: false, error: `basicInfo.${field} exceeds maximum length of ${MAX_STRING_LENGTH} characters` };
        }
      }
    }
  }
  
  return { 
    valid: true, 
    sanitized: {
      resumeText: typeof input.resumeText === 'string' ? input.resumeText.slice(0, MAX_RESUME_LENGTH) : '',
      linkedinUrl: typeof input.linkedinUrl === 'string' ? input.linkedinUrl.slice(0, MAX_URL_LENGTH) : '',
      twitterUrl: typeof input.twitterUrl === 'string' ? input.twitterUrl.slice(0, MAX_URL_LENGTH) : '',
      portfolioUrl: typeof input.portfolioUrl === 'string' ? input.portfolioUrl.slice(0, MAX_URL_LENGTH) : '',
      basicInfo: input.basicInfo || {}
    }
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

    const validation = validateInput(rawInput);
    if (!validation.valid) {
      console.log("Input validation failed:", validation.error);
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { resumeText, linkedinUrl, twitterUrl, portfolioUrl, basicInfo } = validation.sanitized as {
      resumeText: string;
      linkedinUrl: string;
      twitterUrl: string;
      portfolioUrl: string;
      basicInfo: Record<string, unknown>;
    };
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const inputContent = `
RESUME/PROFILE TEXT:
${resumeText || "Not provided"}

LINKEDIN URL: ${linkedinUrl || "Not provided"}
TWITTER URL: ${twitterUrl || "Not provided"}
PORTFOLIO URL: ${portfolioUrl || "Not provided"}

BASIC INFO:
- Name: ${basicInfo?.firstName || "Not provided"}
- Location: ${basicInfo?.city || ""}, ${basicInfo?.state || ""}
- Current Situation: ${basicInfo?.situation || "exploring options"}
`.trim();

    const systemPrompt = `You are a career analysis AI for NextMove, a U.S.-focused platform. Analyze the provided resume/profile and extract comprehensive structured career data.

EXTRACTION GUIDELINES:
- Extract all hard skills (technical, tools, software, methodologies)
- Extract soft skills (communication, leadership, problem-solving, etc.)
- Identify professional interests from experience and context
- List all degrees, certifications, and licenses separately
- Summarize work history concisely
- Infer personality indicators from work patterns and achievements
- Identify all monetizable assets (physical, digital, network)
- Infer constraints from career trajectory

If information is sparse, make reasonable inferences based on available context. Be thorough but realistic.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "extract_career_profile",
          description: "Extract comprehensive structured career profile data",
          parameters: {
            type: "object",
            properties: {
              skills: {
                type: "array",
                items: { type: "string" },
                description: "8-20 hard/technical skills (tools, technologies, methodologies)"
              },
              soft_skills: {
                type: "array",
                items: { type: "string" },
                description: "5-10 soft skills (leadership, communication, etc.)"
              },
              interests: {
                type: "array",
                items: { type: "string" },
                description: "5-10 professional interests inferred from experience"
              },
              degrees: {
                type: "array",
                items: { type: "string" },
                description: "Educational degrees (e.g., 'BS Computer Science - Stanford')"
              },
              certifications: {
                type: "array",
                items: { type: "string" },
                description: "Professional certifications (e.g., 'AWS Solutions Architect')"
              },
              licenses: {
                type: "array",
                items: { type: "string" },
                description: "Professional licenses (e.g., 'CPA', 'Real Estate License')"
              },
              work_summary: {
                type: "string",
                description: "3-4 sentence summary of career trajectory and key achievements"
              },
              personality_indicators: {
                type: "object",
                properties: {
                  work_style: {
                    type: "array",
                    items: { type: "string" },
                    description: "2-4 work style traits (e.g., analytical, creative, collaborative)"
                  },
                  leadership_level: {
                    type: "string",
                    enum: ["individual-contributor", "team-lead", "manager", "director", "executive"]
                  },
                  structure_preference: {
                    type: "number",
                    description: "1-5 scale (1=highly flexible, 5=highly structured)"
                  },
                  risk_tolerance: {
                    type: "number",
                    description: "1-5 scale (1=risk-averse, 5=risk-seeking)"
                  },
                  autonomy_preference: {
                    type: "number",
                    description: "1-5 scale (1=prefers guidance, 5=highly autonomous)"
                  }
                },
                required: ["work_style", "leadership_level", "structure_preference", "risk_tolerance", "autonomy_preference"]
              },
              assets: {
                type: "object",
                properties: {
                  digital_assets: {
                    type: "array",
                    items: { type: "string" },
                    description: "Digital skills, platforms, social media presence, content"
                  },
                  physical_assets: {
                    type: "array",
                    items: { type: "string" },
                    description: "Equipment, property, vehicles, tools they might own"
                  },
                  network_strength: {
                    type: "string",
                    enum: ["weak", "moderate", "strong", "very-strong"]
                  },
                  industry_connections: {
                    type: "array",
                    items: { type: "string" },
                    description: "Industries where they likely have contacts"
                  }
                },
                required: ["digital_assets", "physical_assets", "network_strength", "industry_connections"]
              },
              inferred_constraints: {
                type: "object",
                properties: {
                  experience_level: {
                    type: "string",
                    enum: ["entry", "mid", "senior", "executive"]
                  },
                  career_stage: {
                    type: "string",
                    enum: ["early-career", "mid-career", "career-changer", "pre-retirement", "retired"]
                  },
                  industries: {
                    type: "array",
                    items: { type: "string" },
                    description: "Industries they have experience in"
                  },
                  geographic_flexibility: {
                    type: "string",
                    enum: ["local-only", "regional", "national", "remote-preferred", "fully-flexible"]
                  }
                },
                required: ["experience_level", "career_stage", "industries", "geographic_flexibility"]
              },
              teaser_summary: {
                type: "object",
                properties: {
                  skills_count: { type: "number" },
                  credentials_count: { type: "number" },
                  aligned_types: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-4 opportunity types that match (career, freelance, consulting, etc.)"
                  },
                  opportunity_paths: {
                    type: "number",
                    description: "Estimated 10-20 opportunity paths"
                  },
                  headline: {
                    type: "string",
                    description: "Engaging 1-2 sentence teaser about their potential (vague, not specific)"
                  }
                },
                required: ["skills_count", "credentials_count", "aligned_types", "opportunity_paths", "headline"]
              }
            },
            required: ["skills", "soft_skills", "interests", "degrees", "certifications", "licenses", "work_summary", "personality_indicators", "assets", "inferred_constraints", "teaser_summary"]
          }
        }
      }
    ];

    console.log("Calling AI for profile extraction...");

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
          { role: "user", content: inputContent },
        ],
        tools,
        tool_choice: { type: "function", function: { name: "extract_career_profile" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please contact support." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await response.json();
    console.log("AI Response received");
    
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "extract_career_profile") {
      console.error("No valid tool call in response:", aiResponse);
      throw new Error("AI did not return structured data");
    }

    let extractedData;
    try {
      extractedData = JSON.parse(toolCall.function.arguments);
      console.log("Extracted profile data:", {
        skillsCount: extractedData.skills?.length,
        softSkillsCount: extractedData.soft_skills?.length,
        degreesCount: extractedData.degrees?.length
      });
    } catch (parseError) {
      console.error("Failed to parse tool call arguments:", toolCall.function.arguments);
      throw new Error("Failed to parse AI analysis results");
    }

    return new Response(JSON.stringify({ success: true, data: extractedData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in extract-profile:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
