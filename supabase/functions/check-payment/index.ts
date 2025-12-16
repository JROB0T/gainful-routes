import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Use service role key to access assessment_results table
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    
    // Create a separate client with anon key for auth
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    
    const { data } = await authClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // FIRST: Check if user has a valid (non-expired) assessment in the database
    // This means they already paid at some point
    const now = new Date().toISOString();
    const { data: assessments, error: assessmentError } = await supabaseClient
      .from('assessment_results')
      .select('id, expires_at, status, created_at')
      .eq('user_id', user.id)
      .gte('expires_at', now)
      .order('created_at', { ascending: false });

    if (!assessmentError && assessments && assessments.length > 0) {
      // Count only completed assessments for the run count (failed ones don't count)
      const completedRuns = assessments.filter((a: any) => a.status === 'completed').length;
      const latestAssessment = assessments[0];
      
      logStep("Found assessments in database", { 
        totalAssessments: assessments.length,
        completedRuns,
        latestId: latestAssessment.id,
        latestStatus: latestAssessment.status,
        expiresAt: latestAssessment.expires_at
      });

      // User has a valid non-expired assessment - they've already paid
      return new Response(JSON.stringify({ 
        hasPaid: true,
        expiryDate: latestAssessment.expires_at,
        runsUsed: completedRuns,
        runsRemaining: Math.max(0, 3 - completedRuns),
        source: 'database'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("No valid assessment found in database, checking Stripe");

    // SECOND: Fall back to checking Stripe for payment records
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error("[CHECK-PAYMENT] STRIPE_SECRET_KEY is not configured");
      throw new Error("Payment service unavailable");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    // Find customer by email
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found in Stripe", { email: user.email });
      return new Response(JSON.stringify({ hasPaid: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Check for successful payment intents for the CareerMovr Assessment product
    const paymentIntents = await stripe.paymentIntents.list({
      customer: customerId,
      limit: 100,
    });

    // Check if any payment was successful
    const successfulPayment = paymentIntents.data.find(
      (pi: { status: string; metadata?: { product?: string } }) => 
        pi.status === "succeeded" && pi.metadata?.product === "careermovr_assessment"
    );

    if (successfulPayment) {
      logStep("Found successful payment intent", { paymentId: successfulPayment.id });
      
      // Check if payment is within 30-day access window
      const paymentDate = new Date(successfulPayment.created * 1000);
      const expiryDate = new Date(paymentDate);
      expiryDate.setDate(expiryDate.getDate() + 30);
      const nowDate = new Date();
      
      const isValid = nowDate < expiryDate;
      logStep("Payment validity check", { 
        paymentDate: paymentDate.toISOString(), 
        expiryDate: expiryDate.toISOString(),
        isValid 
      });

      return new Response(JSON.stringify({ 
        hasPaid: isValid,
        paymentDate: paymentDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
        source: 'stripe_payment_intent'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Also check checkout sessions for completed payments
    const sessions = await stripe.checkout.sessions.list({
      customer: customerId,
      limit: 100,
    });

    const completedSession = sessions.data.find(
      (s: { payment_status: string; metadata?: { product?: string } }) => 
        s.payment_status === "paid" && s.metadata?.product === "careermovr_assessment"
    );

    if (completedSession) {
      logStep("Found completed checkout session", { sessionId: completedSession.id });
      
      const paymentDate = new Date(completedSession.created * 1000);
      const expiryDate = new Date(paymentDate);
      expiryDate.setDate(expiryDate.getDate() + 30);
      const nowDate = new Date();
      
      const isValid = nowDate < expiryDate;

      return new Response(JSON.stringify({ 
        hasPaid: isValid,
        paymentDate: paymentDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
        source: 'stripe_checkout'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Also check for any successful checkout session (without metadata check)
    // This handles cases where the payment was made but metadata wasn't set
    const anyPaidSession = sessions.data.find(
      (s: { payment_status: string }) => s.payment_status === "paid"
    );

    if (anyPaidSession) {
      logStep("Found paid checkout session (without product metadata)", { sessionId: anyPaidSession.id });
      
      const paymentDate = new Date(anyPaidSession.created * 1000);
      const expiryDate = new Date(paymentDate);
      expiryDate.setDate(expiryDate.getDate() + 30);
      const nowDate = new Date();
      
      const isValid = nowDate < expiryDate;

      return new Response(JSON.stringify({ 
        hasPaid: isValid,
        paymentDate: paymentDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
        source: 'stripe_checkout_any'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("No successful payment found");
    return new Response(JSON.stringify({ hasPaid: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    // Return safe error messages - only expose known safe errors
    const safeErrors = ["No authorization header provided", "User not authenticated or email not available"];
    const userMessage = safeErrors.includes(errorMessage) 
      ? errorMessage 
      : "Something went wrong. Please try again.";
    
    return new Response(JSON.stringify({ error: userMessage, hasPaid: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
