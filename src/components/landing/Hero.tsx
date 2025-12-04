import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Target, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float animation-delay-200" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 px-4 md:px-6">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">AI-Powered Career Discovery</span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold leading-tight mb-6 animate-fade-in animation-delay-200">
            Discover Your{" "}
            <span className="text-gradient-primary">Next Move</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 animate-fade-in animation-delay-400">
            Upload your resume, answer a few questions, and let AI reveal personalized career paths 
            and income opportunities tailored just for you.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16 animate-fade-in animation-delay-600">
            <Button 
              variant="hero" 
              size="xl" 
              onClick={() => navigate("/get-started")}
              className="group"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button 
              variant="outline" 
              size="xl"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            >
              See How It Works
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl animate-fade-in-up animation-delay-600">
            <FeatureHighlight 
              icon={<Zap className="w-5 h-5" />}
              title="5-Minute Setup"
              description="Upload and go"
            />
            <FeatureHighlight 
              icon={<Target className="w-5 h-5" />}
              title="15+ Opportunities"
              description="Personalized for you"
            />
            <FeatureHighlight 
              icon={<Sparkles className="w-5 h-5" />}
              title="30-Day Plan"
              description="Actionable roadmap"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureHighlight({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl glass">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-primary text-primary-foreground">
        {icon}
      </div>
      <div className="text-left">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
