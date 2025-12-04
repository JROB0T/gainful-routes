import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  Compass, LogOut, User, Calendar, RefreshCw, Download, ChevronRight, ChevronDown,
  Sparkles, Lock, Target, Zap, TrendingUp, Clock, DollarSign, CheckCircle2,
  Brain, Shield, Rocket, Star, ArrowRight, Printer
} from "lucide-react";
import { toast } from "sonner";

type BaseOpportunity = {
  title: string;
  type: string;
  reason_fit: string[];
  difficulty: string;
  time_commitment: string;
  ramp_time: string;
  income_potential: string;
  first_3_steps: string[];
};

type Recommendation = BaseOpportunity;

type AICentricOpportunity = BaseOpportunity & {
  skill_bridge: string;
  entry_points: string[];
  competitive_edge: string;
};

type AIProofOpportunity = BaseOpportunity & {
  human_advantage: string;
  monetization_path: string;
};

type SuccessPlan = {
  strengths: string[];
  skill_gaps: string[];
  fast_wins: string[];
  thirty_day_plan: { week: number; focus: string; tasks: string[] }[];
  quickest_path_to_income: { opportunity: string; timeline: string; steps: string[] }[];
  best_long_term_bets: { opportunity: string; why: string; potential: string }[];
  encouragement_summary: string;
};

type ProfileSummary = {
  headline: string;
  top_skills: string[];
  experience_level: string;
  best_fit_types: string[];
};

type Results = {
  recommendations: Recommendation[];
  ai_centric_opportunities: AICentricOpportunity[];
  ai_proof_opportunities: AIProofOpportunity[];
  success_plan: SuccessPlan;
  low_hanging_fruit: string[];
  profile_summary: ProfileSummary;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<Results | null>(null);
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [daysLeft] = useState(30);
  const [runsLeft] = useState(3);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      
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

  const handleExport = () => {
    if (!results) return;
    const content = JSON.stringify(results, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nextmove-assessment.json";
    a.click();
    toast.success("Assessment exported!");
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      "career": "bg-blue-500/10 text-blue-600 border-blue-500/20",
      "consulting": "bg-purple-500/10 text-purple-600 border-purple-500/20",
      "freelance": "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
      "rental": "bg-amber-500/10 text-amber-600 border-amber-500/20",
      "side-hustle": "bg-green-500/10 text-green-600 border-green-500/20",
      "business": "bg-orange-500/10 text-orange-600 border-orange-500/20",
      "creator": "bg-pink-500/10 text-pink-600 border-pink-500/20",
    };
    return colors[type] || "bg-secondary text-secondary-foreground";
  };

  const getDifficultyLabel = (d: string) => {
    const map: Record<string, { label: string; color: string }> = {
      "L": { label: "Low", color: "text-green-600" },
      "M": { label: "Medium", color: "text-yellow-600" },
      "H": { label: "High", color: "text-red-600" },
    };
    return map[d] || { label: d, color: "text-muted-foreground" };
  };

  const getIncomeLabel = (i: string) => {
    const map: Record<string, string> = {
      "L": "$0-2k/mo",
      "M": "$2-5k/mo",
      "H": "$5k+/mo",
    };
    return map[i] || i;
  };

  const NavItem = ({ id, label, icon: Icon, count }: { id: string; label: string; icon: any; count?: number }) => (
    <button
      onClick={() => setActiveSection(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        activeSection === id
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-secondary"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
      {count !== undefined && (
        <span className="ml-auto px-2 py-0.5 rounded-full text-xs bg-background/20">
          {count}
        </span>
      )}
    </button>
  );

  const OpportunityCard = ({ opp, type = "main" }: { opp: any; type?: string }) => {
    const isExpanded = expandedCard === opp.title;
    const diffInfo = getDifficultyLabel(opp.difficulty);
    
    return (
      <div className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/30 transition-all">
        <div
          className="p-5 cursor-pointer"
          onClick={() => setExpandedCard(isExpanded ? null : opp.title)}
        >
          <div className="flex items-start justify-between mb-3">
            <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getTypeColor(opp.type)}`}>
              {opp.type}
            </span>
            {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          </div>
          
          <h3 className="font-display font-bold text-foreground mb-3">{opp.title}</h3>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>{opp.time_commitment}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <DollarSign className="w-3.5 h-3.5" />
              <span>{getIncomeLabel(opp.income_potential)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className={diffInfo.color}>{diffInfo.label}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Zap className="w-3.5 h-3.5" />
              <span>{opp.ramp_time}</span>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="px-5 pb-5 border-t border-border pt-4 space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Why This Fits You</h4>
              <ul className="space-y-1">
                {opp.reason_fit?.map((r: string, i: number) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            {type === "ai-centric" && opp.skill_bridge && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Skill Bridge</h4>
                <p className="text-sm text-muted-foreground">{opp.skill_bridge}</p>
                {opp.entry_points && (
                  <div className="mt-2">
                    <span className="text-xs text-muted-foreground">Entry Points: </span>
                    <span className="text-xs text-foreground">{opp.entry_points.join(", ")}</span>
                  </div>
                )}
                {opp.competitive_edge && (
                  <div className="mt-1">
                    <span className="text-xs text-muted-foreground">Competitive Edge: </span>
                    <span className="text-xs text-foreground">{opp.competitive_edge}</span>
                  </div>
                )}
              </div>
            )}

            {type === "ai-proof" && opp.human_advantage && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Human Advantage</h4>
                <p className="text-sm text-muted-foreground">{opp.human_advantage}</p>
                {opp.monetization_path && (
                  <div className="mt-2">
                    <span className="text-xs text-muted-foreground">Path to Income: </span>
                    <span className="text-xs text-foreground">{opp.monetization_path}</span>
                  </div>
                )}
              </div>
            )}

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">First 3 Steps</h4>
              <ol className="space-y-1">
                {opp.first_3_steps?.map((step: string, i: number) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const hasResults = results && results.recommendations && results.recommendations.length > 0;

  if (!hasResults) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card sticky top-0 z-50">
          <div className="container px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Compass className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg text-foreground">NextMove</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{user?.email}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="container px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-4">
              Complete Your Assessment
            </h1>
            <p className="text-muted-foreground mb-8">
              Unlock personalized career paths, AI opportunities, and your 30-day success plan.
            </p>
            <Button variant="hero" size="xl" onClick={() => navigate("/get-started")}>
              <Sparkles className="w-5 h-5" />
              Start Assessment
            </Button>
          </div>
        </main>
      </div>
    );
  }

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

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground font-medium">{daysLeft} days left</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-sm">
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground font-medium">{runsLeft} runs left</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/get-started")}>
              <RefreshCw className="w-4 h-4 mr-2" />
              New Assessment
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <nav className="sticky top-24 space-y-1">
              <NavItem id="overview" label="Overview" icon={Compass} />
              <NavItem id="recommendations" label="Recommendations" icon={Target} count={results.recommendations?.length} />
              <NavItem id="ai-centric" label="AI Opportunities" icon={Brain} count={results.ai_centric_opportunities?.length} />
              <NavItem id="ai-proof" label="AI-Proof Roles" icon={Shield} count={results.ai_proof_opportunities?.length} />
              <NavItem id="quick-wins" label="Quick Wins" icon={Rocket} />
              <NavItem id="success-plan" label="Success Plan" icon={Star} />
              
              <div className="pt-4 border-t border-border mt-4">
                <Button variant="outline" size="sm" className="w-full" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Results
                </Button>
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Mobile Nav */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
              <NavItem id="overview" label="Overview" icon={Compass} />
              <NavItem id="recommendations" label="Recommendations" icon={Target} />
              <NavItem id="ai-centric" label="AI Opps" icon={Brain} />
              <NavItem id="ai-proof" label="AI-Proof" icon={Shield} />
              <NavItem id="success-plan" label="Plan" icon={Star} />
            </div>

            {/* Overview Section */}
            {activeSection === "overview" && (
              <div className="space-y-6">
                {/* Profile Summary */}
                {results.profile_summary && (
                  <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-primary/20 p-6">
                    <h2 className="font-display font-bold text-xl text-foreground mb-2">
                      {results.profile_summary.headline}
                    </h2>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {results.profile_summary.top_skills?.slice(0, 5).map((skill, i) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-background/50 text-sm text-foreground">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                      <span>Level: {results.profile_summary.experience_level}</span>
                      <span>•</span>
                      <span>Best for: {results.profile_summary.best_fit_types?.join(", ")}</span>
                    </div>
                  </div>
                )}

                {/* Encouragement */}
                {results.success_plan?.encouragement_summary && (
                  <div className="bg-card rounded-xl border border-border p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-yellow-500" />
                      </div>
                      <p className="text-muted-foreground">{results.success_plan.encouragement_summary}</p>
                    </div>
                  </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-card rounded-xl border border-border p-4 text-center">
                    <div className="text-3xl font-display font-bold text-foreground">{results.recommendations?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Opportunities</div>
                  </div>
                  <div className="bg-card rounded-xl border border-border p-4 text-center">
                    <div className="text-3xl font-display font-bold text-blue-500">{results.ai_centric_opportunities?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">AI Roles</div>
                  </div>
                  <div className="bg-card rounded-xl border border-border p-4 text-center">
                    <div className="text-3xl font-display font-bold text-green-500">{results.ai_proof_opportunities?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">AI-Proof</div>
                  </div>
                  <div className="bg-card rounded-xl border border-border p-4 text-center">
                    <div className="text-3xl font-display font-bold text-purple-500">{results.success_plan?.strengths?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Key Strengths</div>
                  </div>
                </div>

                {/* Low Hanging Fruit */}
                {results.low_hanging_fruit && results.low_hanging_fruit.length > 0 && (
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                      <Rocket className="w-5 h-5 text-green-500" />
                      Low-Hanging Fruit (Start Here)
                    </h3>
                    <ul className="space-y-2">
                      {results.low_hanging_fruit.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-muted-foreground">
                          <ArrowRight className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Long Term Bets */}
                {results.success_plan?.best_long_term_bets && results.success_plan.best_long_term_bets.length > 0 && (
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                      Long-Term Bets
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {results.success_plan.best_long_term_bets.map((bet, i) => (
                        <div key={i} className="p-4 rounded-lg bg-secondary/50">
                          <div className="font-semibold text-foreground mb-1">{bet.opportunity}</div>
                          <p className="text-sm text-muted-foreground mb-2">{bet.why}</p>
                          <div className="text-xs text-primary">{bet.potential}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Recommendations Section */}
            {activeSection === "recommendations" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                  Your Personalized Opportunities ({results.recommendations?.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {results.recommendations?.map((opp, i) => (
                    <OpportunityCard key={i} opp={opp} type="main" />
                  ))}
                </div>
              </div>
            )}

            {/* AI-Centric Section */}
            {activeSection === "ai-centric" && (
              <div className="space-y-4">
                <div className="mb-6">
                  <h2 className="text-2xl font-display font-bold text-foreground mb-2 flex items-center gap-2">
                    <Brain className="w-6 h-6 text-blue-500" />
                    AI-Centric Opportunities
                  </h2>
                  <p className="text-muted-foreground">Roles that leverage AI tools and your existing skills</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {results.ai_centric_opportunities?.map((opp, i) => (
                    <OpportunityCard key={i} opp={opp} type="ai-centric" />
                  ))}
                </div>
              </div>
            )}

            {/* AI-Proof Section */}
            {activeSection === "ai-proof" && (
              <div className="space-y-4">
                <div className="mb-6">
                  <h2 className="text-2xl font-display font-bold text-foreground mb-2 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-green-500" />
                    AI-Proof Opportunities
                  </h2>
                  <p className="text-muted-foreground">Automation-resistant roles based on your human strengths</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {results.ai_proof_opportunities?.map((opp, i) => (
                    <OpportunityCard key={i} opp={opp} type="ai-proof" />
                  ))}
                </div>
              </div>
            )}

            {/* Quick Wins Section */}
            {activeSection === "quick-wins" && results.success_plan && (
              <div className="space-y-6">
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">Quick Wins & Fast Paths</h2>
                
                {/* Fast Wins */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    7-Day Fast Wins
                  </h3>
                  <ul className="space-y-2">
                    {results.success_plan.fast_wins?.map((win, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{win}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quickest Path to Income */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    Quickest Path to Income
                  </h3>
                  <div className="space-y-4">
                    {results.success_plan.quickest_path_to_income?.map((path, i) => (
                      <div key={i} className="p-4 rounded-lg bg-secondary/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-foreground">{path.opportunity}</div>
                          <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-600">{path.timeline}</span>
                        </div>
                        <ol className="space-y-1">
                          {path.steps?.map((step, j) => (
                            <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="w-4 h-4 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                                {j + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Success Plan Section */}
            {activeSection === "success-plan" && results.success_plan && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-display font-bold text-foreground">Your 30-Day Success Plan</h2>
                  <Button variant="outline" size="sm" onClick={() => window.print()}>
                    <Printer className="w-4 h-4 mr-2" />
                    Print Plan
                  </Button>
                </div>

                {/* Strengths */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Your Key Strengths
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {results.success_plan.strengths?.map((strength, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-full bg-yellow-500/10 text-yellow-700 text-sm">
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Skill Gaps */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-display font-bold text-foreground mb-4">Skills to Develop</h3>
                  <div className="flex flex-wrap gap-2">
                    {results.success_plan.skill_gaps?.map((skill, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 30-Day Week by Week */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-display font-bold text-foreground mb-4">Week-by-Week Plan</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {results.success_plan.thirty_day_plan?.map((week) => (
                      <div key={week.week} className="p-4 rounded-lg bg-secondary/50">
                        <div className="text-sm font-medium text-primary mb-1">Week {week.week}</div>
                        <div className="font-semibold text-foreground mb-3">{week.focus}</div>
                        <ul className="text-sm text-muted-foreground space-y-1.5">
                          {week.tasks?.map((task, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-primary mt-1">•</span>
                              {task}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
