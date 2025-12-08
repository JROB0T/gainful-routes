-- Create table for storing assessment results
CREATE TABLE public.assessment_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wizard_data JSONB NOT NULL,
  recommendations JSONB,
  success_plan JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days'),
  run_count INTEGER NOT NULL DEFAULT 1
);

-- Enable Row Level Security
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;

-- Users can view their own results
CREATE POLICY "Users can view their own results"
ON public.assessment_results
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own results
CREATE POLICY "Users can create their own results"
ON public.assessment_results
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own results
CREATE POLICY "Users can update their own results"
ON public.assessment_results
FOR UPDATE
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_assessment_results_user_id ON public.assessment_results(user_id);
CREATE INDEX idx_assessment_results_status ON public.assessment_results(status);

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.assessment_results;