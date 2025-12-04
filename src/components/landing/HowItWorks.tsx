import { Upload, Brain, Map, Rocket } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Your Profile",
    description: "Share your resume and social links. We'll auto-fill your profile so you answer fewer questions.",
    color: "primary",
  },
  {
    icon: Brain,
    title: "AI Analysis",
    description: "Our AI extracts your skills, experience, and hidden strengths to understand your unique profile.",
    color: "accent",
  },
  {
    icon: Map,
    title: "Get Your Roadmap",
    description: "Receive 10-15 personalized career paths and income opportunities matched to your goals.",
    color: "success",
  },
  {
    icon: Rocket,
    title: "Take Action",
    description: "Follow your 30-day Success Plan with weekly goals and quick wins to start earning.",
    color: "warning",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
            How <span className="text-gradient-primary">CareerMovr</span> Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From upload to action plan in under 10 minutes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <StepCard key={index} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StepCard({ 
  step, 
  index 
}: { 
  step: typeof steps[0]; 
  index: number;
}) {
  const Icon = step.icon;
  
  const colorClasses = {
    primary: "bg-primary/10 text-primary border-primary/20",
    accent: "bg-accent/10 text-accent border-accent/20",
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
  };

  return (
    <div className="relative group">
      {/* Connection line */}
      {index < 3 && (
        <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-border to-transparent" />
      )}
      
      <div className="relative p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
        {/* Step number */}
        <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-md">
          {index + 1}
        </div>
        
        {/* Icon */}
        <div className={`w-14 h-14 rounded-xl ${colorClasses[step.color as keyof typeof colorClasses]} border flex items-center justify-center mb-4`}>
          <Icon className="w-7 h-7" />
        </div>
        
        {/* Content */}
        <h3 className="text-lg font-display font-bold mb-2 text-foreground">{step.title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
      </div>
    </div>
  );
}
