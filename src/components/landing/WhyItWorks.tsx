import { Brain, User, Sparkles, CheckCircle, Clock } from "lucide-react";
import { CollapsibleSection } from "./CollapsibleSection";

const reasons = [
  {
    icon: Brain,
    text: "AI-powered pattern matching",
  },
  {
    icon: User,
    text: "Personalized to your background",
  },
  {
    icon: Sparkles,
    text: "Not a generic personality quiz",
  },
  {
    icon: CheckCircle,
    text: "Actionable next steps",
  },
  {
    icon: Clock,
    text: "Clarity in minutes",
  },
];

export function WhyItWorks() {
  return (
    <CollapsibleSection
      className="py-12 md:py-24 bg-background"
      title={
        <>
          Why <span className="text-gradient-primary">CareerMovr</span> Works
        </>
      }
      subtitle="Built different from traditional career assessments"
    >
      <div className="flex flex-col gap-4 max-w-xl mx-auto">
        {reasons.map((reason, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <reason.icon className="w-5 h-5 text-primary" />
            </div>
            <span className="text-foreground font-medium">{reason.text}</span>
          </div>
        ))}
      </div>
    </CollapsibleSection>
  );
}
