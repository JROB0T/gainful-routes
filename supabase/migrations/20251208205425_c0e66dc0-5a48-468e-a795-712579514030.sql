-- Add DELETE policy to prevent users from deleting assessment results
-- This preserves audit trails and business analytics data
CREATE POLICY "Users cannot delete assessment results"
ON public.assessment_results
FOR DELETE
USING (false);