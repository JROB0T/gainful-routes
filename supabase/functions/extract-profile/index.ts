import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation constants
const MAX_RESUME_LENGTH = 50000;

// Rate limiting constants (now using distributed DB-backed rate limiting)
const RATE_LIMIT_WINDOW_SECONDS = 60; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5; // Max 5 requests per minute per user

// Distributed rate limiter using database
async function checkDistributedRateLimit(
  userId: string, 
  bucket: string, 
  limit: number, 
  windowSeconds: number
): Promise<{ allowed: boolean; retryAfter?: number; count?: number }> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('[RATE-LIMIT] Missing Supabase credentials, falling back to allow');
    return { allowed: true };
  }
  
  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabaseAdmin.rpc('check_rate_limit', {
      p_user_id: userId,
      p_bucket: bucket,
      p_limit: limit,
      p_window_seconds: windowSeconds
    });
    
    if (error) {
      console.error('[RATE-LIMIT] Database check failed:', error);
      return { allowed: true }; // Fail open on error
    }
    
    return {
      allowed: data.allowed,
      retryAfter: data.retry_after,
      count: data.count
    };
  } catch (err) {
    console.error('[RATE-LIMIT] Unexpected error:', err);
    return { allowed: true }; // Fail open on error
  }
}

function getUserIdFromJwt(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  
  try {
    const token = authHeader.split(' ')[1];
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || null;
  } catch {
    return null;
  }
}

// Audit logging helper
function auditLog(event: string, data: Record<string, unknown>) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    function: 'extract-profile',
    event,
    ...data,
  };
  console.log('[AUDIT]', JSON.stringify(logEntry));
}

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
    if (input.resumeText.trim().length < 50) {
      return { valid: false, error: "Please provide more detail about your professional experience (at least 50 characters)" };
    }
  } else {
    return { valid: false, error: "resumeText is required" };
  }
  
  return { 
    valid: true, 
    sanitized: {
      resumeText: input.resumeText.slice(0, MAX_RESUME_LENGTH),
    }
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Extract user ID from JWT for rate limiting and audit
  const authHeader = req.headers.get('authorization');
  const userId = getUserIdFromJwt(authHeader);
  
  if (!userId) {
    auditLog('auth_failed', { reason: 'missing_or_invalid_jwt' });
    return new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Check rate limit using distributed database
  const rateCheck = await checkDistributedRateLimit(
    userId, 
    'extract-profile', 
    RATE_LIMIT_MAX_REQUESTS, 
    RATE_LIMIT_WINDOW_SECONDS
  );
  if (!rateCheck.allowed) {
    auditLog('rate_limited', { userId, retryAfter: rateCheck.retryAfter, count: rateCheck.count });
    return new Response(JSON.stringify({ 
      error: `Rate limit exceeded. Please try again in ${rateCheck.retryAfter} seconds.` 
    }), {
      status: 429,
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json",
        "Retry-After": String(rateCheck.retryAfter)
      },
    });
  }

  auditLog('request_started', { userId });

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

    const { resumeText } = validation.sanitized as {
      resumeText: string;
    };
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("[EXTRACT-PROFILE] AI API key is not configured");
      throw new Error("Analysis service unavailable");
    }

    const inputContent = `
PROFESSIONAL EXPERIENCE/RESUME TEXT:
${resumeText}

Please analyze this professional background and extract structured career data.
`.trim();

    const systemPrompt = `You are a career analysis AI for CareerMovr, a U.S.-focused platform. Analyze the provided professional experience text and extract comprehensive structured career data.

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
                    description: "Equipment, property, vehicles, tools mentioned or likely owned"
                  },
                  network_strength: {
                    type: "string",
                    enum: ["weak", "moderate", "strong", "very-strong"]
                  },
                  industry_connections: {
                    type: "array",
                    items: { type: "string" },
                    description: "Industries where the person likely has contacts"
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
                    description: "Industries the person has experience in"
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
      
      // Audit log successful extraction
      auditLog('extraction_success', {
        userId,
        skillsCount: extractedData.skills?.length || 0,
        softSkillsCount: extractedData.soft_skills?.length || 0,
        degreesCount: extractedData.degrees?.length || 0,
        certificationsCount: extractedData.certifications?.length || 0,
        licensesCount: extractedData.licenses?.length || 0,
        hasWorkSummary: !!extractedData.work_summary,
        experienceLevel: extractedData.inferred_constraints?.experience_level,
        careerStage: extractedData.inferred_constraints?.career_stage,
      });
      
      console.log("Extracted profile data:", {
        skillsCount: extractedData.skills?.length,
        softSkillsCount: extractedData.soft_skills?.length,
        degreesCount: extractedData.degrees?.length
      });
    } catch (parseError) {
      auditLog('extraction_parse_error', { userId, error: 'Failed to parse tool call arguments' });
      console.error("Failed to parse tool call arguments:", toolCall.function.arguments);
      throw new Error("Failed to parse AI analysis results");
    }

    return new Response(JSON.stringify({ success: true, data: extractedData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in extract-profile:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    // Audit log the error
    auditLog('extraction_error', { 
      userId: userId || 'unknown',
      errorType: errorMessage,
    });
    
    // Return safe generic error message - never expose internal details
    const userMessage = "Something went wrong. Please try again.";
    
    return new Response(JSON.stringify({ error: userMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
