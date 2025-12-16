import { useEffect, useCallback } from "react";
import type { WizardData } from "@/pages/GetStarted";

const STORAGE_KEY = "careermovr_wizard_data";
const STEP_KEY = "careermovr_wizard_step";

export function useWizardPersistence(
  data: WizardData,
  setData: (data: WizardData) => void,
  step: number,
  setStep: (step: number) => void
) {
  // Load persisted data on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      const savedStep = localStorage.getItem(STEP_KEY);
      
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
      console.error("Failed to restore wizard data:", err);
    }
  }, []);

  // Save data whenever it changes
  const persistData = useCallback((newData: WizardData, newStep: number) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      localStorage.setItem(STEP_KEY, String(newStep));
    } catch (err) {
      console.error("Failed to persist wizard data:", err);
    }
  }, []);

  // Clear persisted data (call after successful submission)
  const clearPersistedData = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STEP_KEY);
    } catch (err) {
      console.error("Failed to clear wizard data:", err);
    }
  }, []);

  return { persistData, clearPersistedData };
}
