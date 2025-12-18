-- Distributed, DB-backed rate limiting (fixes in-memory limiter bypass)

CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  bucket text NOT NULL,
  window_id bigint NOT NULL,
  count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, bucket, window_id)
);

ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

-- No RLS policies: default deny for anon/authenticated.

-- Tighten grants
REVOKE ALL ON TABLE public.api_rate_limits FROM PUBLIC;
REVOKE ALL ON TABLE public.api_rate_limits FROM anon;
REVOKE ALL ON TABLE public.api_rate_limits FROM authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.api_rate_limits TO service_role;

CREATE INDEX IF NOT EXISTS idx_api_rate_limits_lookup
  ON public.api_rate_limits (user_id, bucket, window_id);

-- Timestamp helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_api_rate_limits_updated_at ON public.api_rate_limits;
CREATE TRIGGER trg_api_rate_limits_updated_at
BEFORE UPDATE ON public.api_rate_limits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Atomic rate limit check + increment (distributed across instances)
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id uuid,
  p_bucket text,
  p_limit integer,
  p_window_seconds integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_epoch integer;
  v_window_id bigint;
  v_count integer;
  v_retry_after integer;
  v_allowed boolean;
  v_remaining integer;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'p_user_id is required';
  END IF;
  IF p_bucket IS NULL OR length(trim(p_bucket)) = 0 THEN
    RAISE EXCEPTION 'p_bucket is required';
  END IF;
  IF p_limit IS NULL OR p_limit <= 0 THEN
    RAISE EXCEPTION 'p_limit must be > 0';
  END IF;
  IF p_window_seconds IS NULL OR p_window_seconds <= 0 THEN
    RAISE EXCEPTION 'p_window_seconds must be > 0';
  END IF;

  v_epoch := floor(extract(epoch from now()))::int;
  v_window_id := floor(v_epoch::numeric / p_window_seconds)::bigint;

  INSERT INTO public.api_rate_limits (user_id, bucket, window_id, count)
  VALUES (p_user_id, p_bucket, v_window_id, 1)
  ON CONFLICT (user_id, bucket, window_id)
  DO UPDATE SET count = public.api_rate_limits.count + 1
  RETURNING count INTO v_count;

  v_allowed := v_count <= p_limit;
  v_retry_after := greatest(((v_window_id + 1) * p_window_seconds) - v_epoch, 0);
  v_remaining := greatest(p_limit - v_count, 0);

  RETURN jsonb_build_object(
    'allowed', v_allowed,
    'count', v_count,
    'limit', p_limit,
    'remaining', v_remaining,
    'retry_after', v_retry_after,
    'window_seconds', p_window_seconds,
    'bucket', p_bucket
  );
END;
$$;

REVOKE ALL ON FUNCTION public.check_rate_limit(uuid, text, integer, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.check_rate_limit(uuid, text, integer, integer) FROM anon;
REVOKE ALL ON FUNCTION public.check_rate_limit(uuid, text, integer, integer) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(uuid, text, integer, integer) TO service_role;
