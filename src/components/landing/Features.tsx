import { 
  FileText, 
  Lightbulb, 
  TrendingUp, 
  Shield, 
  Clock, 
  RefreshCw,
  Bot,
  ShieldCheck
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Smart Resume Parsing",
    description: "Upload once, auto-fill everything. Our AI extracts skills, experience, and credentials instantly.",
  },
  {
    icon: Lightbulb,
    title: "Personalized Insights",
    description: "Discover hidden strengths and opportunities you might have overlooked based on your unique profile.",
  },
  {
    icon: Bot,
    title: "AI-Centric Opportunities",
    description: "Discover roles that leverage AI tools — prompt engineering, AI consulting, and emerging tech careers matched to your skills.",
  },
  {
    icon: ShieldCheck,
    title: "AI-Resistant Paths",
    description: "Find future-proof careers that rely on human judgment, creativity, and interpersonal skills — roles AI can't replace.",
  },
  {
    icon: TrendingUp,
    title: "Income Opportunities",
    description: "Beyond careers — find consulting, freelance, rental income, and side hustle paths matched to your assets.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your data is encrypted and never shared. We use it only to generate your personalized recommendations.",
  },
  {
    icon: Clock,
    title: "30-Day Success Plan",
    description: "Get a week-by-week action plan with quick wins and long-term strategies to start earning.",
  },
  {
    icon: RefreshCw,
    title: "Re-run Anytime",
    description: "Update your profile and regenerate recommendations up to 3 times within your 30-day access.",
  },
];

export function Features() {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
            Everything You Need to{" "}
            <span className="text-gradient-accent">Move Forward</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A complete toolkit for discovering and pursuing your best opportunities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature }: { feature: typeof features[0] }) {
  const Icon = feature.icon;
  
  return (
    <div className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="w-12 h-12 rounded-xl bg-gradient-primary text-primary-foreground flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-display font-bold mb-2 text-foreground">{feature.title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
    </div>
  );
}
