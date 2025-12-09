import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronRight, Briefcase, Wrench, Cpu, Settings, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

type CareerFamilyScore = {
  family: string;
  score: number;
  top_roles: string[];
  strengths: string[];
  gaps: string[];
  why_match: string;
};

type CareerScorecardData = {
  technical: CareerFamilyScore;
  white_collar: CareerFamilyScore;
  blue_collar: CareerFamilyScore;
  hybrid: CareerFamilyScore;
};

interface CareerScorecardProps {
  scorecard: CareerScorecardData | null;
}

const familyConfig: Record<string, { icon: typeof Briefcase; color: string; bgColor: string; borderColor: string }> = {
  technical: {
    icon: Cpu,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  white_collar: {
    icon: Briefcase,
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
  },
  blue_collar: {
    icon: Wrench,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
  },
  hybrid: {
    icon: Settings,
    color: "text-teal-600",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/30",
  },
};

const familyLabels: Record<string, string> = {
  technical: "Technical Careers",
  white_collar: "White-Collar (Non-Technical)",
  blue_collar: "Blue-Collar / Skilled Trades",
  hybrid: "Hybrid Technical-Trade",
};

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-blue-600";
  if (score >= 40) return "text-amber-600";
  return "text-muted-foreground";
}

function getScoreBg(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-blue-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-muted";
}

function CareerFamilyCard({ familyKey, data }: { familyKey: string; data: CareerFamilyScore }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = familyConfig[familyKey];
  const Icon = config?.icon || Briefcase;
  const label = familyLabels[familyKey] || familyKey;

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all cursor-pointer hover:shadow-md",
        config?.borderColor,
        isExpanded && "ring-2 ring-primary/20"
      )}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <CardHeader className={cn("pb-3", config?.bgColor)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg bg-background/80", config?.color)}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">{label}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{data.why_match}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className={cn("text-2xl font-bold", getScoreColor(data.score))}>
                {data.score}%
              </div>
              <div className="text-xs text-muted-foreground">Match</div>
            </div>
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 h-2 bg-background/50 rounded-full overflow-hidden">
          <div 
            className={cn("h-full rounded-full transition-all duration-500", getScoreBg(data.score))}
            style={{ width: `${data.score}%` }}
          />
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-4 space-y-4" onClick={(e) => e.stopPropagation()}>
          {/* Top Roles */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold">Top Roles For You</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.top_roles.map((role, idx) => (
                <span 
                  key={idx}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-full font-medium",
                    config?.bgColor,
                    config?.color
                  )}
                >
                  {role}
                </span>
              ))}
            </div>
          </div>

          {/* Strengths */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <h4 className="text-sm font-semibold">Your Strengths</h4>
            </div>
            <ul className="space-y-1.5">
              {data.strengths.map((strength, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>

          {/* Gaps */}
          {data.gaps.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <h4 className="text-sm font-semibold">Areas to Develop</h4>
              </div>
              <ul className="space-y-1.5">
                {data.gaps.map((gap, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    {gap}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export function CareerScorecard({ scorecard }: CareerScorecardProps) {
  if (!scorecard) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground text-center">Career scorecard data not available</p>
      </Card>
    );
  }

  // Sort families by score descending
  const sortedFamilies = Object.entries(scorecard)
    .filter(([_, data]) => data && typeof data.score === 'number')
    .sort(([, a], [, b]) => b.score - a.score);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Your Career Scorecard</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Career tracks ranked by your fit based on skills, interests, and preferences
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {sortedFamilies.map(([familyKey, data], index) => (
          <div key={familyKey} className="relative">
            {index === 0 && (
              <div className="absolute -top-2 -left-2 z-10 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                Best Match
              </div>
            )}
            <CareerFamilyCard familyKey={familyKey} data={data} />
          </div>
        ))}
      </div>

      {/* Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">What this means:</strong> Your highest-scoring career family represents the best alignment 
            between your skills, work preferences, and personality. Explore the top roles within each family to find specific opportunities 
            that match your profile.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
