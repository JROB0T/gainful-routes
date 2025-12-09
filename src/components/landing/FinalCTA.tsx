import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function FinalCTA() {
  return (
    <section className="py-16 md:py-24 bg-gradient-hero">
      <div className="container px-4 md:px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
            Ready to Find Your{" "}
            <span className="text-gradient-primary">Ideal Career Path</span>?
          </h2>
          <p className="text-base md:text-lg text-muted-foreground mb-8">
            Get clarity and a personalized roadmap in minutes.
          </p>
          <CTAButton />
        </div>
      </div>
    </section>
  );
}

function CTAButton() {
  const navigate = useNavigate();
  
  return (
    <Button
      variant="hero"
      size="xl"
      onClick={() => navigate("/get-started")}
      className="group w-full sm:w-auto min-h-[52px]"
    >
      Take the Free Career Assessment
      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
    </Button>
  );
}
