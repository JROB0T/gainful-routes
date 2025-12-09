import { TrendingUp, Target, Calendar } from "lucide-react";

const previewCards = [
  {
    icon: Target,
    title: "Career Match Card",
    description: "See your top career matches with compatibility scores",
    color: "primary",
    preview: (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Product Manager</span>
          <span className="text-xs font-semibold text-success">92%</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-success rounded-full" style={{ width: "92%" }} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">UX Designer</span>
          <span className="text-xs font-semibold text-primary">87%</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: "87%" }} />
        </div>
      </div>
    ),
  },
  {
    icon: TrendingUp,
    title: "Strengths Breakdown",
    description: "Discover your top skills and hidden talents",
    color: "accent",
    preview: (
      <div className="flex flex-wrap gap-2">
        <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">Leadership</span>
        <span className="px-2 py-1 text-xs rounded-full bg-accent/10 text-accent">Communication</span>
        <span className="px-2 py-1 text-xs rounded-full bg-success/10 text-success">Problem Solving</span>
        <span className="px-2 py-1 text-xs rounded-full bg-warning/10 text-warning">Strategic Thinking</span>
      </div>
    ),
  },
  {
    icon: Calendar,
    title: "30-Day Roadmap",
    description: "Week-by-week action plan to reach your goals",
    color: "success",
    preview: (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
            <span className="text-[10px] font-bold text-success">W1</span>
          </div>
          <span className="text-xs text-muted-foreground">Research & prep</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-[10px] font-bold text-primary">W2</span>
          </div>
          <span className="text-xs text-muted-foreground">Skill building</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
            <span className="text-[10px] font-bold text-accent">W3</span>
          </div>
          <span className="text-xs text-muted-foreground">Network & apply</span>
        </div>
      </div>
    ),
  },
];

export function ReportPreview() {
  return (
    <section className="py-12 md:py-24 bg-background">
      <div className="container px-4 md:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
            Inside Your <span className="text-gradient-primary">Career Report</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Preview what you'll receive after completing your assessment
          </p>
        </div>

        {/* Mobile: Horizontal scroll carousel */}
        <div className="md:hidden overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 -mx-4 px-4">
          <div className="flex gap-4" style={{ width: "max-content" }}>
            {previewCards.map((card, index) => (
              <PreviewCard key={index} card={card} />
            ))}
          </div>
        </div>

        {/* Desktop: Grid */}
        <div className="hidden md:grid grid-cols-3 gap-6 max-w-5xl mx-auto">
          {previewCards.map((card, index) => (
            <PreviewCard key={index} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PreviewCard({ card }: { card: typeof previewCards[0] }) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary border-primary/20",
    accent: "bg-accent/10 text-accent border-accent/20",
    success: "bg-success/10 text-success border-success/20",
  };

  return (
    <div className="w-[85vw] md:w-auto snap-center flex-shrink-0 p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
      <div
        className={`w-12 h-12 rounded-xl ${colorClasses[card.color as keyof typeof colorClasses]} border flex items-center justify-center mb-4`}
      >
        <card.icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-display font-bold mb-2 text-foreground">
        {card.title}
      </h3>
      <p className="text-muted-foreground text-sm mb-4">{card.description}</p>
      <div className="p-3 rounded-lg bg-secondary/50 border border-border">
        {card.preview}
      </div>
    </div>
  );
}
