import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ChevronDown, ChevronRight, Briefcase, Wrench, Cpu, Settings, 
  CheckCircle2, AlertCircle, TrendingUp, ExternalLink, GitCompare, X,
  ArrowRight, Minus, Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

const familyConfig: Record<string, { icon: typeof Briefcase; color: string; bgColor: string; borderColor: string; solidBg: string }> = {
  technical: {
    icon: Cpu,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    solidBg: "bg-blue-500",
  },
  white_collar: {
    icon: Briefcase,
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    solidBg: "bg-purple-500",
  },
  blue_collar: {
    icon: Wrench,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    solidBg: "bg-amber-500",
  },
  hybrid: {
    icon: Settings,
    color: "text-teal-600",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/30",
    solidBg: "bg-teal-500",
  },
};

const familyLabels: Record<string, string> = {
  technical: "Technical Careers",
  white_collar: "White-Collar (Non-Technical)",
  blue_collar: "Blue-Collar / Skilled Trades",
  hybrid: "Hybrid Technical-Trade",
};

const familyShortLabels: Record<string, string> = {
  technical: "Technical",
  white_collar: "White-Collar",
  blue_collar: "Blue-Collar",
  hybrid: "Hybrid",
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
        const eased = 1 - Math.pow(1 - progress, 3);
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

// Comparison View Component
function ComparisonView({ 
  families, 
  onClose 
}: { 
  families: [string, CareerFamilyScore][];
  onClose: () => void;
}) {
  const [family1Key, family1Data] = families[0];
  const [family2Key, family2Data] = families[1];
  
  const config1 = familyConfig[family1Key];
  const config2 = familyConfig[family2Key];
  const Icon1 = config1?.icon || Briefcase;
  const Icon2 = config2?.icon || Briefcase;
  
  const scoreDiff = family1Data.score - family2Data.score;

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <GitCompare className="w-5 h-5" />
          Career Family Comparison
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-6 pt-4">
        {/* Header Comparison */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div 
            className={cn("rounded-xl p-4", config1?.bgColor, config1?.borderColor, "border")}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("p-2 rounded-lg bg-background", config1?.color)}>
                <Icon1 className="w-5 h-5" />
              </div>
              <div className="font-semibold">{familyShortLabels[family1Key]}</div>
            </div>
            <div className={cn("text-4xl font-bold", getScoreColor(family1Data.score))}>
              {family1Data.score}%
            </div>
            <div className="text-sm text-muted-foreground">Match Score</div>
          </motion.div>

          <motion.div 
            className={cn("rounded-xl p-4", config2?.bgColor, config2?.borderColor, "border")}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("p-2 rounded-lg bg-background", config2?.color)}>
                <Icon2 className="w-5 h-5" />
              </div>
              <div className="font-semibold">{familyShortLabels[family2Key]}</div>
            </div>
            <div className={cn("text-4xl font-bold", getScoreColor(family2Data.score))}>
              {family2Data.score}%
            </div>
            <div className="text-sm text-muted-foreground">Match Score</div>
          </motion.div>
        </div>

        {/* Score Difference */}
        <motion.div 
          className="text-center py-3 bg-secondary/50 rounded-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-sm text-muted-foreground">Score Difference: </span>
          <span className={cn(
            "font-bold",
            scoreDiff > 0 ? config1?.color : scoreDiff < 0 ? config2?.color : "text-muted-foreground"
          )}>
            {scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff} points
          </span>
          <span className="text-sm text-muted-foreground"> in favor of </span>
          <span className="font-semibold">
            {scoreDiff >= 0 ? familyShortLabels[family1Key] : familyShortLabels[family2Key]}
          </span>
        </motion.div>

        {/* Why It Matches */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Why {familyShortLabels[family1Key]} Fits
            </h4>
            <p className="text-sm text-muted-foreground bg-secondary/30 rounded-lg p-3">
              {family1Data.why_match}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Why {familyShortLabels[family2Key]} Fits
            </h4>
            <p className="text-sm text-muted-foreground bg-secondary/30 rounded-lg p-3">
              {family2Data.why_match}
            </p>
          </div>
        </div>

        {/* Top Roles Comparison */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">Top Roles</h4>
            <div className="flex flex-wrap gap-1.5">
              {family1Data.top_roles.map((role, idx) => (
                <span 
                  key={idx}
                  className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    config1?.bgColor, config1?.color
                  )}
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">Top Roles</h4>
            <div className="flex flex-wrap gap-1.5">
              {family2Data.top_roles.map((role, idx) => (
                <span 
                  key={idx}
                  className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    config2?.bgColor, config2?.color
                  )}
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Strengths Comparison */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Your Strengths
            </h4>
            <ul className="space-y-1">
              {family1Data.strengths.map((strength, idx) => (
                <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <Plus className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                  {strength}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Your Strengths
            </h4>
            <ul className="space-y-1">
              {family2Data.strengths.map((strength, idx) => (
                <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <Plus className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Gaps Comparison */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Areas to Develop ({family1Data.gaps.length})
            </h4>
            {family1Data.gaps.length > 0 ? (
              <ul className="space-y-1">
                {family1Data.gaps.map((gap, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <Minus className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                    {gap}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-green-600">No significant gaps identified</p>
            )}
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Areas to Develop ({family2Data.gaps.length})
            </h4>
            {family2Data.gaps.length > 0 ? (
              <ul className="space-y-1">
                {family2Data.gaps.map((gap, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <Minus className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                    {gap}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-green-600">No significant gaps identified</p>
            )}
          </div>
        </div>

        {/* Summary */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Comparison Summary:</strong>{" "}
              {scoreDiff >= 10 ? (
                <>
                  <span className={config1?.color}>{familyShortLabels[family1Key]}</span> shows a significantly stronger match 
                  for your profile. However, {familyShortLabels[family2Key]} may offer complementary opportunities worth exploring.
                </>
              ) : scoreDiff <= -10 ? (
                <>
                  <span className={config2?.color}>{familyShortLabels[family2Key]}</span> shows a significantly stronger match 
                  for your profile. However, {familyShortLabels[family1Key]} may offer complementary opportunities worth exploring.
                </>
              ) : (
                <>
                  Both career families show similar fit levels. Consider exploring roles in both 
                  <span className={config1?.color}> {familyShortLabels[family1Key]}</span> and 
                  <span className={config2?.color}> {familyShortLabels[family2Key]}</span> to find the best match for your goals.
                </>
              )}
            </p>
          </CardContent>
        </Card>
      </div>
    </DialogContent>
  );
}

function CareerFamilyCard({ 
  familyKey, 
  data, 
  index,
  isCompareMode,
  isSelected,
  onToggleSelect
}: { 
  familyKey: string; 
  data: CareerFamilyScore; 
  index: number;
  isCompareMode: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const config = familyConfig[familyKey];
  const Icon = config?.icon || Briefcase;
  const label = familyLabels[familyKey] || familyKey;
  const delay = index * 0.15;

  const handleClick = () => {
    if (isCompareMode) {
      onToggleSelect();
    } else {
      setIsExpanded(!isExpanded);
    }
  };

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
          "overflow-hidden cursor-pointer hover:shadow-md transition-all",
          config?.borderColor,
          isExpanded && !isCompareMode && "ring-2 ring-primary/20",
          isCompareMode && isSelected && "ring-2 ring-primary shadow-lg",
          isCompareMode && !isSelected && "opacity-70 hover:opacity-100"
        )}
        onClick={handleClick}
      >
        <CardHeader className={cn("pb-3", config?.bgColor)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isCompareMode && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                    isSelected ? "bg-primary border-primary" : "border-muted-foreground/50"
                  )}
                >
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-primary-foreground" />}
                </motion.div>
              )}
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
              {!isCompareMode && (
                <motion.div
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </motion.div>
              )}
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
          {isExpanded && !isCompareMode && (
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
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

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

  const toggleFamily = (familyKey: string) => {
    setSelectedFamilies(prev => {
      if (prev.includes(familyKey)) {
        return prev.filter(k => k !== familyKey);
      }
      if (prev.length >= 2) {
        return [prev[1], familyKey];
      }
      return [...prev, familyKey];
    });
  };

  const handleCompare = () => {
    if (selectedFamilies.length === 2) {
      setShowComparison(true);
    }
  };

  const exitCompareMode = () => {
    setIsCompareMode(false);
    setSelectedFamilies([]);
  };

  const comparisonFamilies = selectedFamilies
    .map(key => sortedFamilies.find(([k]) => k === key))
    .filter(Boolean) as [string, CareerFamilyScore][];

  return (
    <div className="space-y-6">
      <motion.div 
        className="flex items-center justify-between flex-wrap gap-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h2 className="text-xl font-bold">Your Career Scorecard</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isCompareMode 
              ? `Select 2 career families to compare (${selectedFamilies.length}/2 selected)`
              : "Career tracks ranked by your fit based on skills, interests, and preferences"
            }
          </p>
        </div>
        <div className="flex gap-2">
          {isCompareMode ? (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={exitCompareMode}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button 
                size="sm"
                disabled={selectedFamilies.length !== 2}
                onClick={handleCompare}
              >
                <GitCompare className="w-4 h-4 mr-2" />
                Compare
              </Button>
            </>
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsCompareMode(true)}
            >
              <GitCompare className="w-4 h-4 mr-2" />
              Compare Families
            </Button>
          )}
        </div>
      </motion.div>

      <div className="grid gap-4">
        {sortedFamilies.map(([familyKey, data], index) => (
          <div key={familyKey} className="relative">
            {index === 0 && !isCompareMode && (
              <motion.div 
                className="absolute -top-2 -left-2 z-10 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 500 }}
              >
                Best Match
              </motion.div>
            )}
            <CareerFamilyCard 
              familyKey={familyKey} 
              data={data} 
              index={index}
              isCompareMode={isCompareMode}
              isSelected={selectedFamilies.includes(familyKey)}
              onToggleSelect={() => toggleFamily(familyKey)}
            />
          </div>
        ))}
      </div>

      {/* Summary */}
      {!isCompareMode && (
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
      )}

      {/* Comparison Dialog */}
      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        {comparisonFamilies.length === 2 && (
          <ComparisonView 
            families={comparisonFamilies}
            onClose={() => setShowComparison(false)}
          />
        )}
      </Dialog>
    </div>
  );
}
