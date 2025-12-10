import { Check } from "lucide-react";

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function WizardProgress({ currentStep, totalSteps }: WizardProgressProps) {
  const steps = [
    { label: "Basic Info", description: "Tell us about yourself" },
    { label: "Upload", description: "Share your experience" },
    { label: "Preview", description: "See your insights" },
  ];

  return (
    <div className="flex items-center justify-between max-w-md mx-auto">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;

        return (
          <div key={index} className="flex items-center">
            {/* Step indicator */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                  transition-all duration-300
                  ${isCompleted 
                    ? "bg-success text-success-foreground" 
                    : isCurrent 
                      ? "bg-gradient-primary text-primary-foreground shadow-glow" 
                      : "bg-muted text-muted-foreground"
                  }
                `}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
              </div>
              <span className={`
                text-xs mt-2 font-medium text-center whitespace-nowrap
                ${isCurrent ? "text-foreground" : "text-muted-foreground"}
              `}>
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {index < totalSteps - 1 && (
              <div
                className={`
                  w-16 md:w-24 h-0.5 mx-2
                  ${stepNumber < currentStep ? "bg-success" : "bg-muted"}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
