import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  Compass, 
  LogOut, 
  User, 
  Calendar, 
  RefreshCw, 
  Download,
  ChevronRight,
  Sparkles,
  Lock,
  Target,
  Zap,
  TrendingUp,
  Clock,
  DollarSign,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

type Opportunity = {
  title: string;
  type: string;
  whyItFits: string;
  difficulty: string;
  timeRequirement: string;
  rampTime: string;
  incomePotential: string;
  firstSteps: string[];
};

type SuccessPlan = {
  skillGaps: string[];
  fastWins: string[];
  weekByWeek: { week: number; focus: string; tasks: string[] }[];
  quickestPathToIncome: string[];
  bestLongTermUpside: string[];
  strengthsSummary: string;
};

type Results = {
  opportunities: Opportunity[];
  successPlan: SuccessPlan;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<Results | null>(null);
  const [activeTab, setActiveTab] = useState<"opportunities" | "plan">("opportunities");
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      
      // Load results from sessionStorage
      const stored = sessionStorage.getItem("nextmove_results");
      if (stored) {
        try {
          setResults(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse results:", e);
        }
      }
      
      setIsLoading(false);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem("nextmove_results");
    toast.success("Logged out successfully");
    navigate("/");
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      "career": "bg-blue-500/10 text-blue-600 border-blue-500/20",
      "side-hustle": "bg-green-500/10 text-green-600 border-green-500/20",
      "freelance": "bg-purple-500/10 text-purple-600 border-purple-500/20",
      "business": "bg-orange-500/10 text-orange-600 border-orange-500/20",
      "passive-income": "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      "hybrid": "bg-pink-500/10 text-pink-600 border-pink-500/20",
    };
    return colors[type] || "bg-secondary text-secondary-foreground";
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      "easy": "text-green-600",
      "moderate": "text-yellow-600",
      "challenging": "text-red-600",
    };
    return colors[difficulty] || "text-muted-foreground";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const hasResults = results && results.opportunities && results.opportunities.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Compass className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">NextMove</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{user?.email}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8">
        {!hasResults ? (
          // No results state
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-display font-bold text-foreground mb-2">
                Welcome to NextMove
              </h1>
              <p className="text-muted-foreground">
                Complete your assessment to unlock personalized opportunities.
              </p>
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-lg p-8">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mx-auto mb-6">
                <Lock className="w-8 h-8" />
              </div>

              <h2 className="text-xl font-display font-bold text-center text-foreground mb-4">
                Unlock Your Full Assessment
              </h2>

              <p className="text-center text-muted-foreground mb-6">
                Get 10-15 personalized career paths, income opportunities, and a 30-day action plan.
              </p>

              <div className="flex items-baseline justify-center gap-2 mb-6">
                <span className="text-4xl font-display font-bold text-foreground">$10</span>
                <span className="text-muted-foreground">one-time</span>
              </div>

              <Button
                variant="hero"
                size="xl"
                className="w-full"
                onClick={() => navigate("/get-started")}
              >
                <Sparkles className="w-5 h-5" />
                Start Assessment
              </Button>
            </div>
          </div>
        ) : (
          // Results view
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-display font-bold text-foreground">
                  Your Personalized Results
                </h1>
                <p className="text-muted-foreground">
                  {results.opportunities.length} opportunities matched to your profile
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">30 days access</span>
                </div>
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Re-run
                </Button>
              </div>
            </div>

            {/* Strengths Summary */}
            {results.successPlan?.strengthsSummary && (
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-primary/20 p-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-foreground mb-2">Your Strengths</h3>
                    <p className="text-muted-foreground">{results.successPlan.strengthsSummary}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <Button
                variant={activeTab === "opportunities" ? "default" : "outline"}
                onClick={() => setActiveTab("opportunities")}
              >
                <Target className="w-4 h-4 mr-2" />
                Opportunities ({results.opportunities.length})
              </Button>
              <Button
                variant={activeTab === "plan" ? "default" : "outline"}
                onClick={() => setActiveTab("plan")}
              >
                <Zap className="w-4 h-4 mr-2" />
                30-Day Plan
              </Button>
            </div>

            {/* Opportunities Tab */}
            {activeTab === "opportunities" && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {results.opportunities.map((opp, index) => (
                  <div
                    key={index}
                    className="bg-card rounded-xl border border-border p-5 hover:border-primary/30 transition-all cursor-pointer group"
                    onClick={() => setSelectedOpportunity(opp)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getTypeColor(opp.type)}`}>
                        {opp.type.replace("-", " ")}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    
                    <h3 className="font-display font-bold text-foreground mb-2 line-clamp-2">
                      {opp.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {opp.whyItFits}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{opp.timeRequirement}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>{opp.incomePotential}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span className={getDifficultyColor(opp.difficulty)}>{opp.difficulty}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Zap className="w-3.5 h-3.5" />
                        <span>{opp.rampTime}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Success Plan Tab */}
            {activeTab === "plan" && results.successPlan && (
              <div className="space-y-6">
                {/* Quick Wins */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    Fast Wins (This Week)
                  </h3>
                  <ul className="space-y-2">
                    {results.successPlan.fastWins?.map((win, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{win}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quickest Path */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-500" />
                      Quickest Path to Income
                    </h3>
                    <ul className="space-y-2">
                      {results.successPlan.quickestPathToIncome?.map((path, i) => (
                        <li key={i} className="text-muted-foreground">• {path}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                      Best Long-Term Upside
                    </h3>
                    <ul className="space-y-2">
                      {results.successPlan.bestLongTermUpside?.map((item, i) => (
                        <li key={i} className="text-muted-foreground">• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Week by Week */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-display font-bold text-foreground mb-4">
                    30-Day Week-by-Week Plan
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {results.successPlan.weekByWeek?.map((week) => (
                      <div key={week.week} className="p-4 rounded-lg bg-secondary/50">
                        <div className="text-sm font-medium text-primary mb-1">Week {week.week}</div>
                        <div className="font-semibold text-foreground mb-2">{week.focus}</div>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {week.tasks?.slice(0, 3).map((task, i) => (
                            <li key={i}>• {task}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skill Gaps */}
                {results.successPlan.skillGaps?.length > 0 && (
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="font-display font-bold text-foreground mb-4">
                      Skills to Develop
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {results.successPlan.skillGaps.map((skill, i) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Opportunity Detail Modal */}
            {selectedOpportunity && (
              <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedOpportunity(null)}>
                <div className="bg-card rounded-2xl border border-border shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getTypeColor(selectedOpportunity.type)}`}>
                        {selectedOpportunity.type.replace("-", " ")}
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedOpportunity(null)}>
                        ✕
                      </Button>
                    </div>

                    <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                      {selectedOpportunity.title}
                    </h2>

                    <p className="text-muted-foreground mb-6">
                      {selectedOpportunity.whyItFits}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-3 rounded-lg bg-secondary/50">
                        <div className="text-xs text-muted-foreground mb-1">Time Required</div>
                        <div className="font-semibold text-foreground">{selectedOpportunity.timeRequirement}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary/50">
                        <div className="text-xs text-muted-foreground mb-1">Income Potential</div>
                        <div className="font-semibold text-foreground">{selectedOpportunity.incomePotential}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary/50">
                        <div className="text-xs text-muted-foreground mb-1">Difficulty</div>
                        <div className={`font-semibold ${getDifficultyColor(selectedOpportunity.difficulty)}`}>
                          {selectedOpportunity.difficulty}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary/50">
                        <div className="text-xs text-muted-foreground mb-1">Time to First Income</div>
                        <div className="font-semibold text-foreground">{selectedOpportunity.rampTime}</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-display font-bold text-foreground mb-3">First Steps</h3>
                      <ol className="space-y-2">
                        {selectedOpportunity.firstSteps?.map((step, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium flex-shrink-0">
                              {i + 1}
                            </span>
                            <span className="text-muted-foreground">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
