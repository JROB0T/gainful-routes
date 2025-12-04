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
${(wizardData.skills || []).map((s: string) => `- ${s}`).join("\n") || "- Not specified"}

SOFT SKILLS:
${(wizardData.softSkills || []).map((s: string) => `- ${s}`).join("\n") || "- Not specified"}

INTERESTS:
${(wizardData.interests || []).map((i: string) => `- ${i}`).join("\n") || "- Not specified"}

CREDENTIALS:
- Degrees: ${(wizardData.degrees || []).join(", ") || "None"}
- Certifications: ${(wizardData.certifications || []).join(", ") || "None"}
- Licenses: ${(wizardData.licenses || []).join(", ") || "None"}

WORK SUMMARY:
${wizardData.workSummary || "Not provided"}

PERSONALITY & PREFERENCES:
- Work style: ${(wizardData.workTypes || []).join(", ") || "flexible"}
- Leadership level: ${wizardData.leadershipLevel || "individual-contributor"}
- Structure preference: ${wizardData.structurePreference || 3}/5
- Risk tolerance: ${wizardData.riskTolerance || 3}/5
- Autonomy preference: ${wizardData.autonomyPreference || 3}/5
- Work-life vs income priority: ${wizardData.balanceVsIncome || 3}/5

CONSTRAINTS:
- Time available: ${wizardData.timeAvailable || "not specified"}
- Work setting: ${wizardData.workSetting || "flexible"}
- Industries to avoid: ${(wizardData.avoidIndustries || []).join(", ") || "none"}
- Timeline goal: ${wizardData.timeline || "flexible"}
- Experience level: ${wizardData.experienceLevel || "mid"}

ASSETS:
- Capital available: ${wizardData.capitalAvailable || "not specified"}
- Physical assets: ${(wizardData.physicalAssets || []).join(", ") || "none listed"}
- Digital assets: ${(wizardData.digitalAssets || []).join(", ") || "none listed"}
- Network strength: ${wizardData.networkStrength || "moderate"}
- Industry connections: ${(wizardData.industryConnections || []).join(", ") || "none specified"}

GOALS:
- Income paths interested in: ${(wizardData.incomePaths || []).join(", ") || "open to options"}
- Preferred income type: ${wizardData.incomeType || "flexible"}
`.trim();

    const systemPrompt = `You are an expert career advisor AI for NextMove, a U.S.-focused platform. Generate comprehensive, personalized career recommendations.

OUTPUT REQUIREMENTS:
1. PERSONALIZED RECOMMENDATIONS (10-15): Traditional career paths, freelance, consulting, side hustles, businesses matched to user profile
2. AI-CENTRIC OPPORTUNITIES (3-6): Roles leveraging AI tools - prompt engineering, AI consulting, annotation work, AI-augmented roles
3. AI-PROOF OPPORTUNITIES (3-6): Automation-resistant roles based on user strengths - trades, relationship-heavy work, judgment-based roles
4. ALTERNATIVE PATHS (3-6): Ways to leverage their specific resources, assets, interests, and hobbies for income - EVEN IF they don't want to change careers. Focus on:
   - Monetizing existing assets (property, equipment, vehicles, digital presence)
   - Side income from hobbies and interests
   - Passive income opportunities matching their situation
   - Consulting/teaching others based on their expertise
   - Resource-based opportunities (rental, licensing, etc.)
5. COMPLETE SUCCESS PLAN with all 7 sections

For EACH recommendation include:
- title: Clear, specific title
- type: career, consulting, freelance, rental, side-hustle, business, creator, passive-income
- reason_fit: 3-5 bullet points referencing specific user inputs
- difficulty: L (low), M (medium), H (high)
- time_commitment: e.g., "5-10 hrs/week" or "full-time"
- ramp_time: Time to first income
- income_potential: L ($0-2k/mo), M ($2-5k/mo), H ($5k+/mo)
- first_3_steps: Three specific, actionable steps

For AI-CENTRIC opportunities also include:
- skill_bridge: What skills they need to develop
- entry_points: Realistic ways to start
- competitive_edge: How to stand out

For AI-PROOF opportunities also include:
- human_advantage: Why this can't be automated
- monetization_path: How to turn this into income

For ALTERNATIVE PATHS also include:
- resource_leveraged: What specific asset, interest, or resource this leverages
- effort_level: Minimal, Part-time, or Active
- passive_potential: Whether this can become passive income over time

Be SPECIFIC. Reference the user's actual skills, experience, and constraints. No generic advice.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "generate_career_recommendations",
          description: "Generate comprehensive personalized career opportunities and success plan",
          parameters: {
            type: "object",
            properties: {
              recommendations: {
                type: "array",
                description: "10-15 personalized career/income opportunities",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    type: { type: "string", enum: ["career", "consulting", "freelance", "rental", "side-hustle", "business", "creator"] },
                    reason_fit: { type: "array", items: { type: "string" }, description: "3-5 bullet points" },
                    difficulty: { type: "string", enum: ["L", "M", "H"] },
                    time_commitment: { type: "string" },
                    ramp_time: { type: "string" },
                    income_potential: { type: "string", enum: ["L", "M", "H"] },
                    first_3_steps: { type: "array", items: { type: "string" } }
                  },
                  required: ["title", "type", "reason_fit", "difficulty", "time_commitment", "ramp_time", "income_potential", "first_3_steps"]
                }
              },
              ai_centric_opportunities: {
                type: "array",
                description: "3-6 AI-focused roles and opportunities",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
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
                  required: ["title", "type", "reason_fit", "skill_bridge", "entry_points", "competitive_edge", "difficulty", "time_commitment", "ramp_time", "income_potential", "first_3_steps"]
                }
              },
              ai_proof_opportunities: {
                type: "array",
                description: "3-6 automation-resistant opportunities",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    type: { type: "string" },
                    reason_fit: { type: "array", items: { type: "string" } },
                    human_advantage: { type: "string", description: "Why this can't be automated" },
                    monetization_path: { type: "string" },
                    difficulty: { type: "string", enum: ["L", "M", "H"] },
                    time_commitment: { type: "string" },
                    ramp_time: { type: "string" },
                    income_potential: { type: "string", enum: ["L", "M", "H"] },
                    first_3_steps: { type: "array", items: { type: "string" } }
                  },
                  required: ["title", "type", "reason_fit", "human_advantage", "monetization_path", "difficulty", "time_commitment", "ramp_time", "income_potential", "first_3_steps"]
                }
              },
              alternative_paths: {
                type: "array",
                description: "3-6 alternative income paths leveraging user's resources, assets, and interests",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    type: { type: "string", enum: ["rental", "passive-income", "side-hustle", "consulting", "creator", "freelance"] },
                    reason_fit: { type: "array", items: { type: "string" } },
                    resource_leveraged: { type: "string", description: "What specific asset, interest, or resource this leverages" },
                    effort_level: { type: "string", enum: ["Minimal", "Part-time", "Active"] },
                    passive_potential: { type: "string", description: "Whether and how this can become passive income" },
                    difficulty: { type: "string", enum: ["L", "M", "H"] },
                    time_commitment: { type: "string" },
                    ramp_time: { type: "string" },
                    income_potential: { type: "string", enum: ["L", "M", "H"] },
                    first_3_steps: { type: "array", items: { type: "string" } }
                  },
                  required: ["title", "type", "reason_fit", "resource_leveraged", "effort_level", "passive_potential", "difficulty", "time_commitment", "ramp_time", "income_potential", "first_3_steps"]
                }
              },
              success_plan: {
                type: "object",
                properties: {
                  strengths: {
                    type: "array",
                    items: { type: "string" },
                    description: "5-7 key strengths identified"
                  },
                  skill_gaps: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-5 skills to develop"
                  },
                  fast_wins: {
                    type: "array",
                    items: { type: "string" },
                    description: "5-7 actions for this week"
                  },
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
                    },
                    description: "4-week plan with weekly focus and tasks"
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
                    },
                    description: "1-2 fastest income paths"
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
                    },
                    description: "1-2 highest upside opportunities"
                  },
                  encouragement_summary: {
                    type: "string",
                    description: "2-3 sentence personalized encouragement"
                  }
                },
                required: ["strengths", "skill_gaps", "fast_wins", "thirty_day_plan", "quickest_path_to_income", "best_long_term_bets", "encouragement_summary"]
              },
              low_hanging_fruit: {
                type: "array",
                items: { type: "string" },
                description: "2-3 easiest opportunities to start immediately"
              },
              profile_summary: {
                type: "object",
                properties: {
                  headline: { type: "string", description: "One-line profile summary" },
                  top_skills: { type: "array", items: { type: "string" } },
                  experience_level: { type: "string" },
                  best_fit_types: { type: "array", items: { type: "string" } }
                },
                required: ["headline", "top_skills", "experience_level", "best_fit_types"]
              }
            },
            required: ["recommendations", "ai_centric_opportunities", "ai_proof_opportunities", "alternative_paths", "success_plan", "low_hanging_fruit", "profile_summary"]
          }
        }
      }
    ];

    console.log("Calling AI for recommendations...");

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
      content: aiResult.choices?.[0]?.message?.content?.substring(0, 200)
    }));

    let recommendations;
    
    // Try tool_calls first (OpenAI format)
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      console.log("Parsing from tool_calls");
      recommendations = JSON.parse(toolCall.function.arguments);
    }
    // Try function_call (alternative format)
    else if (aiResult.choices?.[0]?.message?.function_call?.arguments) {
      console.log("Parsing from function_call");
      recommendations = JSON.parse(aiResult.choices[0].message.function_call.arguments);
    }
    // Try content as JSON (fallback)
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
    console.log("Generated:", {
      recommendations: recommendations.recommendations?.length,
      aiCentric: recommendations.ai_centric_opportunities?.length,
      aiProof: recommendations.ai_proof_opportunities?.length,
      alternativePaths: recommendations.alternative_paths?.length
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
