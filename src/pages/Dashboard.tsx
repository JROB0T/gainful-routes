import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Lock
} from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPaid, setHasPaid] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      // TODO: Check payment status from database
      setHasPaid(false); // Default to false for now
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
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
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
        {!hasPaid ? (
          // Unpaid state
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
          // Paid state (placeholder)
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-display font-bold text-foreground">
                  Your Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Welcome back! Here's your personalized career roadmap.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">25 days remaining</span>
                </div>
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Re-run (2 left)
                </Button>
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Dashboard content placeholder */}
            <div className="grid gap-6 md:grid-cols-3">
              <DashboardCard title="Recommendations" count="12" description="Matched opportunities" />
              <DashboardCard title="Quick Wins" count="5" description="Start this week" />
              <DashboardCard title="Success Plan" count="30" description="Day action plan" />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function DashboardCard({ 
  title, 
  count, 
  description 
}: { 
  title: string; 
  count: string; 
  description: string;
}) {
  return (
    <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors cursor-pointer group">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <p className="text-3xl font-display font-bold text-foreground mb-1">{count}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
