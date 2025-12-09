import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  assessmentId: string;
  userEmail: string;
  userName: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { assessmentId, userEmail, userName }: EmailRequest = await req.json();

    if (!assessmentId || !userEmail) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the app URL from environment or default
    const appUrl = Deno.env.get("APP_URL") || "https://careermovr.lovable.app";
    const dashboardUrl = `${appUrl}/dashboard?id=${assessmentId}`;

    // Mask email for privacy in logs
    const maskedEmail = userEmail.replace(/(.{2}).*(@.*)/, "$1***$2");
    console.log("Sending results email to:", maskedEmail);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "CareerMovr <onboarding@resend.dev>",
        to: [userEmail],
        subject: "Your CareerMovr Assessment Results Are Ready!",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <tr>
                <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">CareerMovr</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Your Personalized Career Assessment</p>
                </td>
              </tr>
              <tr>
                <td style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px;">
                  <h2 style="color: #18181b; margin: 0 0 16px; font-size: 22px;">
                    Hey ${userName || "there"}!
                  </h2>
                  <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                    Great news! Your personalized career assessment is ready. We've analyzed your profile and generated tailored recommendations just for you.
                  </p>
                  
                  <div style="background: #f4f4f5; border-radius: 12px; padding: 20px; margin: 0 0 24px;">
                    <p style="color: #18181b; font-weight: 600; margin: 0 0 12px;">Your report includes:</p>
                    <ul style="color: #52525b; margin: 0; padding-left: 20px; line-height: 1.8;">
                      <li>10-15 personalized career paths</li>
                      <li>AI-centric opportunities</li>
                      <li>AI-proof career options</li>
                      <li>Alternative income paths</li>
                      <li>Your complete 30-day Success Plan</li>
                    </ul>
                  </div>
                  
                  <a href="${dashboardUrl}" style="display: block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; text-align: center; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; margin: 0 0 24px;">
                    View My Results
                  </a>
                  
                  <p style="color: #a1a1aa; font-size: 14px; margin: 0; text-align: center;">
                    Your results are available for 30 days from your purchase date.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 24px 30px; text-align: center;">
                  <p style="color: #a1a1aa; font-size: 13px; margin: 0;">
                    CareerMovr. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      }),
    });

    const result = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend API error:", result);
      return new Response(
        JSON.stringify({ error: result.message || "Failed to send email" }),
        { status: emailResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Email sent successfully:", result);

    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in send-results-email:", error);
    // Log detailed error but return generic message to client
    return new Response(
      JSON.stringify({ error: "Failed to send email. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
