import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Briefcase, Wrench, Cpu, Settings, CheckCircle2, AlertCircle, TrendingUp, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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

function AnimatedScore({ score, delay }: { score: number; delay: number }) {
  const [displayScore, setDisplayScore] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 1000;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        setDisplayScore(Math.round(eased * score));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }, delay * 1000);
    
    return () => clearTimeout(timer);
  }, [score, delay]);
  
  return <>{displayScore}%</>;
}

function CareerFamilyCard({ familyKey, data, index }: { familyKey: string; data: CareerFamilyScore; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const config = familyConfig[familyKey];
  const Icon = config?.icon || Briefcase;
  const label = familyLabels[familyKey] || familyKey;
  const delay = index * 0.15;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      <Card 
        className={cn(
          "overflow-hidden cursor-pointer hover:shadow-md transition-shadow",
          config?.borderColor,
          isExpanded && "ring-2 ring-primary/20"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardHeader className={cn("pb-3", config?.bgColor)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                className={cn("p-2 rounded-lg bg-background/80", config?.color)}
                initial={{ rotate: -10, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: delay + 0.2, duration: 0.3, type: "spring" }}
              >
                <Icon className="w-5 h-5" />
              </motion.div>
              <div>
                <CardTitle className="text-base font-semibold">{label}</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{data.why_match}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className={cn("text-2xl font-bold tabular-nums", getScoreColor(data.score))}>
                  <AnimatedScore score={data.score} delay={delay + 0.3} />
                </div>
                <div className="text-xs text-muted-foreground">Match</div>
              </div>
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </motion.div>
            </div>
          </div>
          
          {/* Animated Progress bar */}
          <div className="mt-3 h-2 bg-background/50 rounded-full overflow-hidden">
            <motion.div 
              className={cn("h-full rounded-full", getScoreBg(data.score))}
              initial={{ width: 0 }}
              animate={{ width: `${data.score}%` }}
              transition={{ 
                duration: 1,
                delay: delay + 0.4,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            />
          </div>
        </CardHeader>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <CardContent className="pt-4 space-y-4" onClick={(e) => e.stopPropagation()}>
                {/* Top Roles */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-semibold">Top Roles For You</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.top_roles.map((role, idx) => (
                      <motion.span 
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.15 + idx * 0.05 }}
                        className={cn(
                          "text-xs px-3 py-1.5 rounded-full font-medium",
                          config?.bgColor,
                          config?.color
                        )}
                      >
                        {role}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>

                {/* Strengths */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <h4 className="text-sm font-semibold">Your Strengths</h4>
                  </div>
                  <ul className="space-y-1.5">
                    {data.strengths.map((strength, idx) => (
                      <motion.li 
                        key={idx} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 + idx * 0.05 }}
                        className="text-sm text-muted-foreground flex items-start gap-2"
                      >
                        <span className="text-green-500 mt-1">•</span>
                        {strength}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>

                {/* Gaps */}
                {data.gaps.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <h4 className="text-sm font-semibold">Areas to Develop</h4>
                    </div>
                    <ul className="space-y-1.5">
                      {data.gaps.map((gap, idx) => (
                        <motion.li 
                          key={idx} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.35 + idx * 0.05 }}
                          className="text-sm text-muted-foreground flex items-start gap-2"
                        >
                          <span className="text-amber-500 mt-1">•</span>
                          {gap}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* Explore Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="pt-2"
                >
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => navigate(`/career-family/${familyKey}`)}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Explore All Roles in {label}
                  </Button>
                </motion.div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
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
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h2 className="text-xl font-bold">Your Career Scorecard</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Career tracks ranked by your fit based on skills, interests, and preferences
          </p>
        </div>
      </motion.div>

      <div className="grid gap-4">
        {sortedFamilies.map(([familyKey, data], index) => (
          <div key={familyKey} className="relative">
            {index === 0 && (
              <motion.div 
                className="absolute -top-2 -left-2 z-10 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 500 }}
              >
                Best Match
              </motion.div>
            )}
            <CareerFamilyCard familyKey={familyKey} data={data} index={index} />
          </div>
        ))}
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.4 }}
      >
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">What this means:</strong> Your highest-scoring career family represents the best alignment 
              between your skills, work preferences, and personality. Explore the top roles within each family to find specific opportunities 
              that match your profile.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
