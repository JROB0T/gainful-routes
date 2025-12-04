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

    const systemPrompt = `You are a career analysis AI for NextMove, a U.S.-focused career discovery platform. 
Analyze the provided resume/profile information and extract structured data.

Return a JSON object with these exact fields:
{
  "skills": ["array of 5-15 professional skills identified"],
  "interests": ["array of 3-8 professional interests inferred"],
  "credentials": ["array of degrees, certifications, licenses"],
  "workSummary": "brief 2-3 sentence summary of work experience",
  "personalityIndicators": {
    "workTypes": ["array of work style preferences like 'creative', 'analytical', 'leadership', 'collaborative'"],
    "structurePreference": 1-5 (1=very flexible, 5=very structured),
    "riskTolerance": 1-5 (1=risk-averse, 5=risk-seeking)
  },
  "assets": {
    "digitalAssets": ["any digital skills, platforms, audiences mentioned"],
    "credentials": ["professional licenses, certifications"],
    "networkStrength": "weak|moderate|strong|very-strong"
  },
  "inferredConstraints": {
    "experienceLevel": "entry|mid|senior|executive",
    "industries": ["industries they have experience in"]
  },
  "teaserSummary": {
    "skillsCount": number,
    "alignedTypes": ["2-3 career type matches"],
    "opportunityPaths": number (estimated 5-15),
    "assetsFound": boolean,
    "headline": "engaging 1-sentence teaser about their potential"
  }
}

Be thorough but concise. Extract real insights, don't fabricate data not present in the input.`;

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
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON from the response (handle markdown code blocks)
    let extractedData;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      extractedData = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
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
