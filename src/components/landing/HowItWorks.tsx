import { ClipboardCheck, FileSearch, Map } from "lucide-react";

const steps = [
  {
    icon: ClipboardCheck,
    title: "Take a Guided Assessment",
    description:
      "Answer a few questions about your skills, experience, and goals. Paste your resume or describe your background to auto-fill your profile.",
    number: "01",
  },
  {
    icon: FileSearch,
    title: "Get Your Career Fit Report",
    description:
      "Our AI analyzes your background and generates personalized career matches based on your unique strengths.",
    number: "02",
  },
  {
    icon: Map,
    title: "Unlock Your Personalized Career Map",
    description:
      "Receive a complete 30-day action plan with specific steps, quick wins, and long-term strategies.",
    number: "03",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-12 md:py-24 bg-background">
      <div className="container px-4 md:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
            How <span className="text-gradient-primary">CareerMovr</span> Works
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            From assessment to action plan in just minutes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
            >
              {/* Step number */}
              <div className="absolute -top-3 -left-3 w-10 h-10 rounded-xl bg-gradient-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-md">
                {step.number}
              </div>

              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 mt-2">
                <step.icon className="w-7 h-7 text-primary" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-display font-bold mb-3 text-foreground">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
