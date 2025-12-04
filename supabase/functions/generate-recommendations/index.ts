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
    const { wizardData, extractedProfile } = await req.json();
    
    console.log("Generating recommendations for:", { 
      firstName: wizardData?.firstName,
      skillsCount: wizardData?.skills?.length,
      state: wizardData?.state 
    });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context from wizard data
    const userContext = `
USER PROFILE:
- Name: ${wizardData.firstName || "User"}
- Location: ${wizardData.city || ""}, ${wizardData.state || ""}
- Current Situation: ${wizardData.situation || "exploring options"}

SKILLS & EXPERIENCE:
${(wizardData.skills || []).map((s: string) => `- ${s}`).join("\n") || "- Not specified"}

INTERESTS:
${(wizardData.interests || []).map((i: string) => `- ${i}`).join("\n") || "- Not specified"}

CREDENTIALS:
${(wizardData.credentials || []).map((c: string) => `- ${c}`).join("\n") || "- None listed"}

WORK PREFERENCES:
- Preferred work types: ${(wizardData.workTypes || []).join(", ") || "flexible"}
- Structure preference: ${wizardData.structurePreference || 3}/5 (1=very flexible, 5=highly structured)
- Risk tolerance: ${wizardData.riskTolerance || 3}/5 (1=risk averse, 5=risk seeking)
- Work-life vs income priority: ${wizardData.balanceVsIncome || 3}/5 (1=balance, 5=income)

CONSTRAINTS:
- Time available: ${wizardData.timeAvailable || "not specified"}
- Work setting: ${wizardData.workSetting || "flexible"}
- Industries to avoid: ${(wizardData.avoidIndustries || []).join(", ") || "none"}

ASSETS:
- Owns home: ${wizardData.ownsHome ? "Yes" : "No"}
- Has extra space: ${wizardData.hasExtraSpace ? "Yes" : "No"}
- Capital available: ${wizardData.capitalAvailable || "not specified"}
- Physical assets: ${(wizardData.physicalAssets || []).join(", ") || "none listed"}
- Digital assets: ${(wizardData.digitalAssets || []).join(", ") || "none listed"}
- Network strength: ${wizardData.networkStrength || "moderate"}

GOALS:
- Income paths interested in: ${(wizardData.incomePaths || []).join(", ") || "open to options"}
- Preferred income type: ${wizardData.incomeType || "flexible"}
- Timeline: ${wizardData.timeline || "flexible"}
`.trim();

    const systemPrompt = `You are a career advisor AI for NextMove, a U.S.-focused platform helping people discover personalized career paths and income opportunities.

Analyze the user profile and generate actionable, personalized recommendations. Be specific and practical. Focus on opportunities that match their skills, constraints, and goals.

Generate exactly 10-15 opportunities and a complete Success Plan.`;

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
        tools: [
          {
            type: "function",
            function: {
              name: "generate_career_recommendations",
              description: "Generate personalized career opportunities and a 30-day success plan",
              parameters: {
                type: "object",
                properties: {
                  opportunities: {
                    type: "array",
                    description: "List of 10-15 personalized opportunities",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Clear, specific opportunity title" },
                        type: { type: "string", enum: ["career", "side-hustle", "freelance", "business", "passive-income", "hybrid"] },
                        whyItFits: { type: "string", description: "2-3 sentences explaining why this matches their profile" },
                        difficulty: { type: "string", enum: ["easy", "moderate", "challenging"] },
                        timeRequirement: { type: "string", description: "e.g., '5-10 hrs/week', 'full-time'" },
                        rampTime: { type: "string", description: "Time to first income, e.g., '2-4 weeks', '3-6 months'" },
                        incomePotential: { type: "string", description: "e.g., '$500-2000/month', '$60-80k/year'" },
                        firstSteps: {
                          type: "array",
                          items: { type: "string" },
                          description: "First 3 concrete action steps"
                        }
                      },
                      required: ["title", "type", "whyItFits", "difficulty", "timeRequirement", "rampTime", "incomePotential", "firstSteps"]
                    }
                  },
                  successPlan: {
                    type: "object",
                    description: "30-day action plan",
                    properties: {
                      skillGaps: {
                        type: "array",
                        items: { type: "string" },
                        description: "Skills to learn or improve"
                      },
                      fastWins: {
                        type: "array",
                        items: { type: "string" },
                        description: "5-7 quick wins to accomplish this week"
                      },
                      weekByWeek: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            week: { type: "number" },
                            focus: { type: "string" },
                            tasks: { type: "array", items: { type: "string" } }
                          },
                          required: ["week", "focus", "tasks"]
                        },
                        description: "4-week plan with weekly focus and tasks"
                      },
                      quickestPathToIncome: {
                        type: "array",
                        items: { type: "string" },
                        description: "1-2 fastest ways to generate income"
                      },
                      bestLongTermUpside: {
                        type: "array",
                        items: { type: "string" },
                        description: "1-2 opportunities with highest long-term potential"
                      },
                      strengthsSummary: {
                        type: "string",
                        description: "Encouraging summary of user's key strengths (2-3 sentences)"
                      }
                    },
                    required: ["skillGaps", "fastWins", "weekByWeek", "quickestPathToIncome", "bestLongTermUpside", "strengthsSummary"]
                  }
                },
                required: ["opportunities", "successPlan"]
              }
            }
          }
        ],
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
    console.log("AI Response received:", JSON.stringify(aiResult).substring(0, 500));

    // Extract tool call result
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("No recommendations generated");
    }

    const recommendations = JSON.parse(toolCall.function.arguments);
    console.log("Generated opportunities:", recommendations.opportunities?.length);

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
