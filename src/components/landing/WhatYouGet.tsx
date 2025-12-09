import { 
  Target, 
  Zap, 
  TrendingUp, 
  Compass, 
  Map, 
  DollarSign, 
  Brain 
} from "lucide-react";

const benefits = [
  { icon: Target, label: "Best-fit roles" },
  { icon: Zap, label: "Skill strengths" },
  { icon: TrendingUp, label: "Skill gaps to develop" },
  { icon: Compass, label: "Recommended industries" },
  { icon: Map, label: "Step-by-step roadmap" },
  { icon: DollarSign, label: "Income potential insights" },
  { icon: Brain, label: "AI-powered analysis" },
];

export function WhatYouGet() {
  return (
    <section id="what-you-get" className="py-12 md:py-24 bg-secondary/30">
      <div className="container px-4 md:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
            What You'll <span className="text-gradient-accent">Learn</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Get comprehensive insights tailored to your unique background
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-3xl mx-auto">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <benefit.icon className="w-5 h-5 text-success" />
              </div>
              <span className="text-foreground font-medium">{benefit.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
