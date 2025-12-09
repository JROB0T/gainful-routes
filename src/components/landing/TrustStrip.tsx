import { Building2, Briefcase, GraduationCap, Users } from "lucide-react";

const trustItems = [
  { icon: Users, label: "Career Changers" },
  { icon: GraduationCap, label: "Recent Graduates" },
  { icon: Briefcase, label: "Professionals" },
  { icon: Building2, label: "Entrepreneurs" },
];

export function TrustStrip() {
  return (
    <section className="py-8 md:py-12 bg-secondary/30 border-y border-border/50">
      <div className="container px-4 md:px-6 max-w-7xl mx-auto">
        <p className="text-center text-sm md:text-base text-muted-foreground mb-6">
          Trusted by career changers, graduates, and professionals across industries
        </p>
        
        <div className="flex justify-center">
          <div className="flex gap-6 md:gap-12 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 px-4">
            {trustItems.map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-2 snap-center flex-shrink-0"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-card border border-border flex items-center justify-center">
                  <item.icon className="w-6 h-6 md:w-7 md:h-7 text-muted-foreground" />
                </div>
                <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
