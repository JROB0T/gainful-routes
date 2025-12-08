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

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    // Find customer by email
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found", { email: user.email });
      return new Response(JSON.stringify({ hasPaid: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found customer", { customerId });

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
      logStep("Found successful payment", { paymentId: successfulPayment.id });
      
      // Check if payment is within 30-day access window
      const paymentDate = new Date(successfulPayment.created * 1000);
      const expiryDate = new Date(paymentDate);
      expiryDate.setDate(expiryDate.getDate() + 30);
      const now = new Date();
      
      const isValid = now < expiryDate;
      logStep("Payment validity check", { 
        paymentDate: paymentDate.toISOString(), 
        expiryDate: expiryDate.toISOString(),
        isValid 
      });

      return new Response(JSON.stringify({ 
        hasPaid: isValid,
        paymentDate: paymentDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
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
      const now = new Date();
      
      const isValid = now < expiryDate;

      return new Response(JSON.stringify({ 
        hasPaid: isValid,
        paymentDate: paymentDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
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
    return new Response(JSON.stringify({ error: errorMessage, hasPaid: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
