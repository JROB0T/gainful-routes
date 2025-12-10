import { RefreshCw, GraduationCap, Briefcase, Compass } from "lucide-react";
import { CollapsibleSection } from "./CollapsibleSection";

const personas = [
  {
    icon: RefreshCw,
    title: "Career Changers",
    description: "Feeling stuck or ready for a new direction",
  },
  {
    icon: GraduationCap,
    title: "Recent Graduates",
    description: "Unsure which path to take after school",
  },
  {
    icon: Briefcase,
    title: "Mid-Career Professionals",
    description: "Looking to level up or pivot",
  },
  {
    icon: Compass,
    title: "Anyone Exploring",
    description: "Curious about your options and potential",
  },
];

export function WhoIsThisFor() {
  return (
    <CollapsibleSection
      className="py-12 md:py-24 bg-secondary/30"
      title={
        <>
          Designed for Anyone Seeking{" "}
          <span className="text-gradient-accent">Career Clarity</span>
        </>
      }
      subtitle="Whether you're starting out or starting over"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
        {personas.map((persona, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-primary text-primary-foreground flex items-center justify-center mb-4">
              <persona.icon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-display font-bold mb-2 text-foreground">
              {persona.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {persona.description}
            </p>
          </div>
        ))}
      </div>
    </CollapsibleSection>
  );
}
