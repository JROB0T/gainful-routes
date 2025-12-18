import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TurnstileResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();

    if (!token) {
      console.error("verify-captcha: No token provided");
      return new Response(
        JSON.stringify({ success: false, error: "No CAPTCHA token provided" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const secretKey = Deno.env.get("TURNSTILE_SECRET_KEY");
    if (!secretKey) {
      console.error("verify-captcha: TURNSTILE_SECRET_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "CAPTCHA verification not configured" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Get client IP from headers
    const clientIp = req.headers.get("cf-connecting-ip") || 
                     req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     "unknown";

    console.log("verify-captcha: Verifying token for IP:", clientIp);

    // Verify with Cloudflare
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    formData.append("remoteip", clientIp);

    const verifyResponse = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const result: TurnstileResponse = await verifyResponse.json();

    console.log("verify-captcha: Verification result:", {
      success: result.success,
      errorCodes: result["error-codes"],
      hostname: result.hostname,
    });

    if (!result.success) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "CAPTCHA verification failed",
          codes: result["error-codes"]
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("verify-captcha: Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
