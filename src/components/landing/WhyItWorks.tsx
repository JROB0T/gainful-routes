import { Brain, User, Sparkles, CheckCircle, Clock } from "lucide-react";

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
    <section className="py-12 md:py-24 bg-background">
      <div className="container px-4 md:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
            Why <span className="text-gradient-primary">CareerMovr</span> Works
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Built different from traditional career assessments
          </p>
        </div>

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
      </div>
    </section>
  );
}
