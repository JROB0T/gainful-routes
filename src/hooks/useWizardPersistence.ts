import { useEffect, useCallback } from "react";
import type { WizardData } from "@/pages/GetStarted";

const STORAGE_KEY = "careermovr_wizard_data";
const STEP_KEY = "careermovr_wizard_step";

// Use sessionStorage instead of localStorage for sensitive data
// sessionStorage is cleared when the tab closes, reducing exposure window
// for XSS attacks and shared computer scenarios
export function useWizardPersistence(
  data: WizardData,
  setData: (data: WizardData) => void,
  step: number,
  setStep: (step: number) => void
) {
  // Load persisted data on mount
  useEffect(() => {
    try {
      const savedData = sessionStorage.getItem(STORAGE_KEY);
      const savedStep = sessionStorage.getItem(STEP_KEY);
      
      if (savedData) {
        const parsed = JSON.parse(savedData);
        // Only restore if there's meaningful data
        if (parsed.firstName || parsed.resumeText || parsed.skills?.length > 0) {
          setData(parsed);
        }
      }
      
      if (savedStep) {
        const parsedStep = parseInt(savedStep, 10);
        if (!isNaN(parsedStep) && parsedStep > 1) {
          setStep(parsedStep);
        }
      }
    } catch (err) {
      // Fail silently - don't log sensitive data errors
    }
  }, []);

  // Save data whenever it changes
  const persistData = useCallback((newData: WizardData, newStep: number) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      sessionStorage.setItem(STEP_KEY, String(newStep));
    } catch (err) {
      // Fail silently - storage quota exceeded or unavailable
    }
  }, []);

  // Clear persisted data (call after successful submission)
  const clearPersistedData = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STEP_KEY);
    } catch (err) {
      // Fail silently
    }
  }, []);

  return { persistData, clearPersistedData };
}
