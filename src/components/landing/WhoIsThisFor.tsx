import { RefreshCw, GraduationCap, Briefcase, Compass } from "lucide-react";

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
    <section className="py-12 md:py-24 bg-secondary/30">
      <div className="container px-4 md:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">
            Designed for Anyone Seeking{" "}
            <span className="text-gradient-accent">Career Clarity</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Whether you're starting out or starting over
          </p>
        </div>

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
      </div>
    </section>
  );
}
