

# Self-Hosting CareerMovr — Complete Guide

This is not an implementation task — it's an export/documentation request. Here's everything you need to run CareerMovr independently.

---

## 1. Source Code

Connect to GitHub via **Project Settings → GitHub → Connect project**, then clone the repo. All frontend code, edge functions, and migrations are included.

## 2. Tech Stack

- **Frontend**: React 18, Vite 5, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Postgres DB, Auth, Edge Functions)
- **Hosting**: Deploy frontend to Vercel, Netlify, or Cloudflare Pages

## 3. Database Setup

Create a standalone Supabase project at [supabase.com](https://supabase.com) and run these 3 migration files in order:

1. `supabase/migrations/20251208140701_*.sql` — Creates `assessment_results` table with RLS
2. `supabase/migrations/20251208205425_*.sql` — Adds DELETE deny policy
3. `supabase/migrations/20251218192804_*.sql` — Creates `api_rate_limits` table, `check_rate_limit()` function

**Tables**: `assessment_results`, `api_rate_limits`
**Functions**: `check_rate_limit()`, `update_updated_at_column()`

## 4. Edge Functions (7 total)

Deploy these to your Supabase project using `supabase functions deploy`:

| Function | JWT | Purpose |
|---|---|---|
| `extract-profile` | No | AI resume analysis (freemium) |
| `generate-recommendations` | Yes | Full career recommendations |
| `create-payment` | Yes | Stripe checkout session |
| `check-payment` | Yes | Verify payment status |
| `send-welcome-email` | Yes | Welcome email via Resend |
| `send-results-email` | Yes | Results email via Resend |
| `verify-captcha` | No | Cloudflare Turnstile verification |

## 5. Environment Variables

### Frontend (.env)
```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_ref
```

### Edge Function Secrets (set via `supabase secrets set`)
```
STRIPE_SECRET_KEY=sk_live_...
RESEND_API_KEY=re_...
TURNSTILE_SECRET_KEY=your_turnstile_secret
```

### Hardcoded Values to Update
- **Turnstile site key** in `src/components/Turnstile.tsx` — currently `0x4AAAAAACHdntkT59vw_Tr3`
- **Stripe price ID** in `supabase/functions/create-payment/index.ts` — currently `price_1ScCWKGTwaFiwqpVaNp6PwR5`
- **App URL** in email functions — currently defaults to `https://careermovr.lovable.app`

## 6. AI Dependency — ACTION REQUIRED

Two edge functions use the Lovable AI proxy (`ai.gateway.lovable.dev`):
- `extract-profile` — uses `google/gemini-2.5-flash`
- `generate-recommendations` — uses `google/gemini-2.5-flash`

Both use `LOVABLE_API_KEY` which only works through Lovable. To self-host, you must:
1. Get a Google AI API key (or OpenAI key)
2. Replace the fetch URL from `https://ai.gateway.lovable.dev/v1/chat/completions` to your provider's endpoint (e.g., `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions` for Google)
3. Replace `LOVABLE_API_KEY` with your own API key secret

## 7. Third-Party Services

| Service | Purpose | Where to sign up |
|---|---|---|
| Supabase | DB, Auth, Edge Functions | supabase.com |
| Stripe | Payments ($10 assessment) | stripe.com |
| Resend | Transactional emails | resend.com |
| Cloudflare Turnstile | CAPTCHA on signup | cloudflare.com |
| Google AI / OpenAI | Career AI analysis | cloud.google.com / openai.com |

## 8. Auth Configuration

- Email + password signup with email verification
- Username stored in user metadata
- CAPTCHA (Turnstile) on signup form

## 9. DNS

Domain `careermovr.com` is on GoDaddy. Update A records to point to your new hosting provider instead of `185.158.133.1`.

## 10. Build & Deploy Commands

```bash
npm install
npm run build        # outputs to dist/
npm run preview      # local preview
```

Deploy the `dist/` folder to any static hosting. For edge functions, use the Supabase CLI:

```bash
supabase link --project-ref YOUR_REF
supabase functions deploy
supabase db push     # runs migrations
```

