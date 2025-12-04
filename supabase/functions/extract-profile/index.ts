import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText, linkedinUrl, twitterUrl, portfolioUrl } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Prepare input for AI
    const inputContent = `
Resume/Profile Text:
${resumeText || "Not provided"}

LinkedIn URL: ${linkedinUrl || "Not provided"}
Twitter URL: ${twitterUrl || "Not provided"}
Portfolio URL: ${portfolioUrl || "Not provided"}
`.trim();

    const systemPrompt = `You are a career analysis AI for NextMove. Analyze the provided resume/profile text and extract structured career data. If the input is sparse, make reasonable inferences based on any available context.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "extract_career_profile",
          description: "Extract structured career profile data from resume text",
          parameters: {
            type: "object",
            properties: {
              skills: {
                type: "array",
                items: { type: "string" },
                description: "5-15 professional skills identified"
              },
              interests: {
                type: "array",
                items: { type: "string" },
                description: "3-8 professional interests inferred"
              },
              credentials: {
                type: "array",
                items: { type: "string" },
                description: "Degrees, certifications, licenses"
              },
              workSummary: {
                type: "string",
                description: "Brief 2-3 sentence summary of work experience"
              },
              personalityIndicators: {
                type: "object",
                properties: {
                  workTypes: {
                    type: "array",
                    items: { type: "string" },
                    description: "Work style preferences like creative, analytical, leadership"
                  },
                  structurePreference: {
                    type: "number",
                    description: "1-5 scale (1=flexible, 5=structured)"
                  },
                  riskTolerance: {
                    type: "number",
                    description: "1-5 scale (1=risk-averse, 5=risk-seeking)"
                  }
                },
                required: ["workTypes", "structurePreference", "riskTolerance"]
              },
              assets: {
                type: "object",
                properties: {
                  digitalAssets: {
                    type: "array",
                    items: { type: "string" },
                    description: "Digital skills, platforms, audiences"
                  },
                  credentials: {
                    type: "array",
                    items: { type: "string" },
                    description: "Professional licenses, certifications"
                  },
                  networkStrength: {
                    type: "string",
                    enum: ["weak", "moderate", "strong", "very-strong"]
                  }
                },
                required: ["digitalAssets", "credentials", "networkStrength"]
              },
              inferredConstraints: {
                type: "object",
                properties: {
                  experienceLevel: {
                    type: "string",
                    enum: ["entry", "mid", "senior", "executive"]
                  },
                  industries: {
                    type: "array",
                    items: { type: "string" }
                  }
                },
                required: ["experienceLevel", "industries"]
              },
              teaserSummary: {
                type: "object",
                properties: {
                  skillsCount: { type: "number" },
                  alignedTypes: {
                    type: "array",
                    items: { type: "string" },
                    description: "2-3 career type matches"
                  },
                  opportunityPaths: {
                    type: "number",
                    description: "Estimated 5-15 opportunity paths"
                  },
                  assetsFound: { type: "boolean" },
                  headline: {
                    type: "string",
                    description: "Engaging 1-sentence teaser about their potential"
                  }
                },
                required: ["skillsCount", "alignedTypes", "opportunityPaths", "assetsFound", "headline"]
              }
            },
            required: ["skills", "interests", "credentials", "workSummary", "personalityIndicators", "assets", "inferredConstraints", "teaserSummary"]
          }
        }
      }
    ];

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
    console.log("AI Response:", JSON.stringify(aiResponse));
    
    // Extract data from tool call response
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "extract_career_profile") {
      console.error("No valid tool call in response:", aiResponse);
      throw new Error("AI did not return structured data");
    }

    let extractedData;
    try {
      extractedData = JSON.parse(toolCall.function.arguments);
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
