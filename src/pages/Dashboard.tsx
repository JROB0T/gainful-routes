import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  Compass, LogOut, User, Calendar, RefreshCw, Download, ChevronRight, ChevronDown,
  Sparkles, Lock, Target, Zap, TrendingUp, Clock, DollarSign, CheckCircle2,
  Brain, Shield, Rocket, Star, ArrowRight, Printer, Lightbulb, Package, Loader2, BarChart3
} from "lucide-react";
import { toast } from "sonner";
import {
  WorkStyleRadarChart,
  OpportunityTypeChart,
  IncomePotentialChart,
  DifficultyIncomeMatrix,
  CategoryBreakdown,
  StrengthsCloud,
  SkillGapsProgress,
  ThirtyDayProgress,
  QuickWinsChecklist,
  ProfileCompleteness,
  AssetInventory,
  TimeToIncomeTimeline,
} from "@/components/dashboard/AnalyticsCharts";

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

type AlternativePath = BaseOpportunity & {
  resource_leveraged: string;
  effort_level: string;
  passive_potential: string;
};

type AlternativeOption = BaseOpportunity & {
  why_unconventional: string;
  personality_match: string;
  transferable_strengths: string[];
  realistic_entry: string;
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
  alternative_paths: AlternativePath[];
  alternative_options?: AlternativeOption[];
  success_plan: SuccessPlan;
  low_hanging_fruit: string[];
  profile_summary: ProfileSummary;
};

type AssessmentSummary = {
  id: string;
  created_at: string;
  status: string;
  expires_at: string | null;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<Results | null>(null);
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [daysLeft, setDaysLeft] = useState(30);
  const [runsLeft] = useState(3);
  const [assessmentStatus, setAssessmentStatus] = useState<string | null>(null);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentSummary[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [wizardData, setWizardData] = useState<any>(null);

  const loadAssessment = async (id: string) => {
    setIsLoading(true);
    const { data: assessment, error } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error || !assessment) {
      console.error("Failed to fetch assessment:", error);
      setIsLoading(false);
      return;
    }
    
    setAssessmentId(assessment.id);
    setWizardData(assessment.wizard_data);
    
    if (assessment.status === 'completed' && assessment.recommendations) {
      setResults(assessment.recommendations as unknown as Results);
      setAssessmentStatus('completed');
      
      // Calculate days left
      if (assessment.expires_at) {
        const expiresAt = new Date(assessment.expires_at);
        const now = new Date();
        const diffTime = expiresAt.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysLeft(Math.max(0, diffDays));
      }
    } else if (assessment.status === 'processing') {
      setAssessmentStatus('processing');
      setResults(null);
    } else if (assessment.status === 'failed') {
      setAssessmentStatus('failed');
      setResults(null);
    }
    
    // Update URL without navigation
    setSearchParams({ id: assessment.id });
    setShowHistory(false);
    setIsLoading(false);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      
      // Fetch all assessments for history
      const { data: allAssessments, error: historyError } = await supabase
        .from('assessment_results')
        .select('id, created_at, status, expires_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (!historyError && allAssessments) {
        setAssessmentHistory(allAssessments as AssessmentSummary[]);
      }
      
      // Check for assessment ID in URL params
      const urlAssessmentId = searchParams.get('id');
      const isPending = searchParams.get('pending') === 'true';
      
      // First try sessionStorage for immediate results
      const stored = sessionStorage.getItem("careermovr_results");
      if (stored && !isPending && !urlAssessmentId) {
        try {
          setResults(JSON.parse(stored));
          setAssessmentStatus('completed');
        } catch (e) {
          console.error("Failed to parse results:", e);
        }
      }
      
      // If we have an assessment ID, fetch from database
      if (urlAssessmentId) {
        setAssessmentId(urlAssessmentId);
        await fetchAssessmentResults(urlAssessmentId);
      } else if (allAssessments && allAssessments.length > 0) {
        // Load the most recent assessment
        const mostRecent = allAssessments[0];
        setAssessmentId(mostRecent.id);
        await fetchAssessmentResults(mostRecent.id);
      }
      
      setIsLoading(false);
    };
    
    const fetchAssessmentResults = async (id: string) => {
      const { data: assessment, error } = await supabase
        .from('assessment_results')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error || !assessment) {
        console.error("Failed to fetch assessment:", error);
        return;
      }
      
      setWizardData(assessment.wizard_data);
      
      if (assessment.status === 'completed' && assessment.recommendations) {
        setResults(assessment.recommendations as unknown as Results);
        setAssessmentStatus('completed');
        
        // Calculate days left
        if (assessment.expires_at) {
          const expiresAt = new Date(assessment.expires_at);
          const now = new Date();
          const diffTime = expiresAt.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setDaysLeft(Math.max(0, diffDays));
        }
      } else if (assessment.status === 'processing') {
        setAssessmentStatus('processing');
        subscribeToAssessment(id);
      } else if (assessment.status === 'failed') {
        setAssessmentStatus('failed');
      }
    };
    
    const subscribeToAssessment = (id: string) => {
      const channel = supabase
        .channel(`assessment-${id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'assessment_results',
            filter: `id=eq.${id}`,
          },
          (payload) => {
            console.log("Assessment update received:", payload);
            const newData = payload.new as any;
            if (newData.status === 'completed' && newData.recommendations) {
              setResults(newData.recommendations as unknown as Results);
              setAssessmentStatus('completed');
              toast.success("Your assessment results are ready!");
              supabase.removeChannel(channel);
            } else if (newData.status === 'failed') {
              setAssessmentStatus('failed');
              toast.error("Assessment generation failed. Please try again.");
              supabase.removeChannel(channel);
            }
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
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
  }, [navigate, searchParams]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem("careermovr_results");
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleExportPDF = async () => {
    if (!results) return;
    
    toast.info("Generating your personalized PDF report...");
    
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let y = 20;
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      
      // Color palette matching app design
      const colors = {
        primary: [99, 102, 241] as [number, number, number],      // Indigo
        primaryDark: [79, 70, 229] as [number, number, number],   // Darker indigo
        secondary: [241, 245, 249] as [number, number, number],   // Light gray
        accent: [16, 185, 129] as [number, number, number],       // Green
        warning: [245, 158, 11] as [number, number, number],      // Amber
        dark: [15, 23, 42] as [number, number, number],           // Slate 900
        text: [30, 41, 59] as [number, number, number],           // Slate 800
        muted: [100, 116, 139] as [number, number, number],       // Slate 500
        white: [255, 255, 255] as [number, number, number],
        blue: [59, 130, 246] as [number, number, number],
        purple: [139, 92, 246] as [number, number, number],
        teal: [20, 184, 166] as [number, number, number],
      };
      
      const checkPageBreak = (neededSpace: number) => {
        if (y + neededSpace > pageHeight - 20) {
          doc.addPage();
          y = 20;
          return true;
        }
        return false;
      };
      
      const addWrappedText = (text: string, x: number, maxWidth: number, fontSize = 10, color = colors.text) => {
        doc.setFontSize(fontSize);
        doc.setTextColor(...color);
        const lines = doc.splitTextToSize(text, maxWidth);
        lines.forEach((line: string) => {
          checkPageBreak(6);
          doc.text(line, x, y);
          y += fontSize * 0.4 + 2;
        });
      };
      
      const addSectionHeader = (title: string, color: [number, number, number]) => {
        checkPageBreak(25);
        y += 8;
        
        // Background bar
        doc.setFillColor(...color);
        doc.roundedRect(margin, y - 6, contentWidth, 12, 2, 2, 'F');
        
        // Title
        doc.setTextColor(...colors.white);
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.text(title, margin + 5, y + 2);
        
        doc.setTextColor(...colors.text);
        doc.setFont("helvetica", "normal");
        y += 14;
      };
      
      const addSubHeader = (title: string) => {
        checkPageBreak(15);
        y += 4;
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...colors.primaryDark);
        doc.text(title, margin, y);
        y += 7;
        doc.setFont("helvetica", "normal");
      };
      
      const addOpportunityCard = (opp: any, index: number, type: string) => {
        checkPageBreak(50);
        
        // Card background
        doc.setFillColor(...colors.secondary);
        doc.roundedRect(margin, y - 2, contentWidth, 8, 1, 1, 'F');
        
        // Title
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...colors.dark);
        doc.text(`${index + 1}. ${opp.title}`, margin + 3, y + 4);
        y += 12;
        
        // Type badge
        const badgeColors: Record<string, [number, number, number]> = {
          career: colors.blue,
          consulting: colors.purple,
          freelance: [99, 102, 241],
          rental: colors.warning,
          "side-hustle": colors.accent,
          business: [249, 115, 22],
          creator: [236, 72, 153],
          "passive-income": colors.teal,
        };
        const badgeColor = badgeColors[opp.type] || colors.muted;
        
        doc.setFillColor(...badgeColor);
        doc.roundedRect(margin + 3, y - 4, doc.getTextWidth(opp.type) + 6, 6, 1, 1, 'F');
        doc.setTextColor(...colors.white);
        doc.setFontSize(8);
        doc.text(opp.type.toUpperCase(), margin + 6, y);
        
        // Metrics row - use proper spacing
        const diffLabel = { L: "Low", M: "Medium", H: "High" }[opp.difficulty] || opp.difficulty;
        const incomeLabel = { L: "$0-2k/mo", M: "$2-5k/mo", H: "$5k+/mo" }[opp.income_potential] || opp.income_potential;
        
        doc.setTextColor(...colors.muted);
        doc.setFontSize(7);
        const metricsText = `Difficulty: ${diffLabel}  |  Time: ${opp.time_commitment}  |  Ramp: ${opp.ramp_time}  |  Income: ${incomeLabel}`;
        doc.text(metricsText, margin + 35, y);
        y += 8;
        
        // Why it fits
        if (opp.reason_fit?.length) {
          doc.setFontSize(9);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...colors.text);
          doc.text("Why This Fits You:", margin + 3, y);
          y += 5;
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...colors.muted);
          opp.reason_fit.forEach((reason: string) => {
            checkPageBreak(10);
            doc.setFontSize(8);
            const reasonLines = doc.splitTextToSize(`-  ${reason}`, contentWidth - 10);
            reasonLines.forEach((line: string) => {
              doc.text(line, margin + 5, y);
              y += 4;
            });
          });
        }
        
        // Type-specific fields
        if (type === "ai-centric" && opp.skill_bridge) {
          y += 2;
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...colors.blue);
          doc.text("Skill Bridge:", margin + 3, y);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...colors.muted);
          y += 4;
          const bridgeLines = doc.splitTextToSize(opp.skill_bridge, contentWidth - 10);
          bridgeLines.forEach((line: string) => {
            doc.text(line, margin + 5, y);
            y += 4;
          });
          
          if (opp.competitive_edge) {
            y += 2;
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...colors.blue);
            doc.text("Competitive Edge:", margin + 3, y);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...colors.muted);
            y += 4;
            const edgeLines = doc.splitTextToSize(opp.competitive_edge, contentWidth - 10);
            edgeLines.forEach((line: string) => {
              doc.text(line, margin + 5, y);
              y += 4;
            });
          }
          
          if (opp.entry_points?.length) {
            y += 2;
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...colors.blue);
            doc.text("Entry Points:", margin + 3, y);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...colors.muted);
            y += 4;
            opp.entry_points.forEach((ep: string) => {
              checkPageBreak(8);
              const epLines = doc.splitTextToSize(`-  ${ep}`, contentWidth - 10);
              epLines.forEach((line: string) => {
                doc.text(line, margin + 5, y);
                y += 4;
              });
            });
          }
        }
        
        if (type === "ai-proof" && opp.human_advantage) {
          y += 2;
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...colors.accent);
          doc.text("Human Advantage:", margin + 3, y);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...colors.muted);
          y += 4;
          const advantageLines = doc.splitTextToSize(opp.human_advantage, contentWidth - 10);
          advantageLines.forEach((line: string) => {
            doc.text(line, margin + 5, y);
            y += 4;
          });
          
          if (opp.monetization_path) {
            y += 2;
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...colors.accent);
            doc.text("Path to Income:", margin + 3, y);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...colors.muted);
            y += 4;
            const pathLines = doc.splitTextToSize(opp.monetization_path, contentWidth - 10);
            pathLines.forEach((line: string) => {
              doc.text(line, margin + 5, y);
              y += 4;
            });
          }
        }
        
        if (type === "alternative" && opp.resource_leveraged) {
          y += 2;
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...colors.warning);
          doc.text("Resource Leveraged:", margin + 3, y);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...colors.muted);
          y += 4;
          const resourceLines = doc.splitTextToSize(opp.resource_leveraged, contentWidth - 10);
          resourceLines.forEach((line: string) => {
            doc.text(line, margin + 5, y);
            y += 4;
          });
          
          doc.text(`Effort Level: ${opp.effort_level}`, margin + 5, y);
          y += 5;
          
          if (opp.passive_potential) {
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...colors.warning);
            doc.text("Passive Potential:", margin + 3, y);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...colors.muted);
            y += 4;
            const passiveLines = doc.splitTextToSize(opp.passive_potential, contentWidth - 10);
            passiveLines.forEach((line: string) => {
              doc.text(line, margin + 5, y);
              y += 4;
            });
          }
        }
        
        // First 3 steps
        if (opp.first_3_steps?.length) {
          y += 2;
          doc.setFontSize(9);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...colors.text);
          doc.text("First 3 Steps:", margin + 3, y);
          y += 5;
          doc.setFont("helvetica", "normal");
          opp.first_3_steps.forEach((step: string, i: number) => {
            checkPageBreak(8);
            doc.setFillColor(...colors.primary);
            doc.circle(margin + 6, y - 1.5, 2.5, 'F');
            doc.setTextColor(...colors.white);
            doc.setFontSize(7);
            doc.text(`${i + 1}`, margin + 5, y);
            doc.setTextColor(...colors.muted);
            doc.setFontSize(8);
            doc.text(step, margin + 12, y);
            y += 5;
          });
        }
        
        y += 6;
      };
      
      // ==================== COVER PAGE ====================
      // Full background
      doc.setFillColor(...colors.dark);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      
      // Accent stripe
      doc.setFillColor(...colors.primary);
      doc.rect(0, 80, pageWidth, 8, 'F');
      
      // Logo/Brand
      doc.setTextColor(...colors.white);
      doc.setFontSize(36);
      doc.setFont("helvetica", "bold");
      doc.text("CareerMovr", margin, 55);
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...colors.muted);
      doc.text("Your Personalized Career Assessment", margin, 68);
      
      // Profile headline
      if (results.profile_summary?.headline) {
        doc.setTextColor(...colors.white);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        const headlineLines = doc.splitTextToSize(results.profile_summary.headline, contentWidth);
        let headlineY = 110;
        headlineLines.forEach((line: string) => {
          doc.text(line, margin, headlineY);
          headlineY += 10;
        });
      }
      
      // Stats boxes
      const statsY = 160;
      const boxWidth = (contentWidth - 15) / 4;
      const stats = [
        { label: "Opportunities", value: results.recommendations?.length || 0, color: colors.primary },
        { label: "AI Roles", value: results.ai_centric_opportunities?.length || 0, color: colors.blue },
        { label: "AI-Proof", value: results.ai_proof_opportunities?.length || 0, color: colors.accent },
        { label: "Resource Paths", value: results.alternative_paths?.length || 0, color: colors.warning },
      ];
      
      stats.forEach((stat, i) => {
        const boxX = margin + i * (boxWidth + 5);
        doc.setFillColor(...stat.color);
        doc.roundedRect(boxX, statsY, boxWidth, 35, 3, 3, 'F');
        
        doc.setTextColor(...colors.white);
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.text(String(stat.value), boxX + boxWidth / 2, statsY + 18, { align: "center" });
        
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(stat.label, boxX + boxWidth / 2, statsY + 28, { align: "center" });
      });
      
      // Date and details
      doc.setTextColor(...colors.muted);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, margin, 220);
      
      if (results.profile_summary) {
        doc.text(`Experience Level: ${results.profile_summary.experience_level}`, margin, 230);
        doc.text(`Best Fit Types: ${results.profile_summary.best_fit_types?.join(", ")}`, margin, 240);
      }
      
      // Top skills
      if (results.profile_summary?.top_skills?.length) {
        doc.setTextColor(...colors.white);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("Top Skills", margin, 260);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...colors.muted);
        const skillsText = results.profile_summary.top_skills.join("  |  ");
        const skillLines = doc.splitTextToSize(skillsText, contentWidth);
        let skillY = 268;
        skillLines.forEach((line: string) => {
          doc.text(line, margin, skillY);
          skillY += 6;
        });
      }
      
      // ==================== PAGE 2+: CONTENT ====================
      doc.addPage();
      doc.setFillColor(...colors.white);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      y = 20;
      
      // Encouragement
      if (results.success_plan?.encouragement_summary) {
        doc.setFillColor(254, 243, 199); // Amber 100
        doc.roundedRect(margin, y, contentWidth, 25, 3, 3, 'F');
        doc.setTextColor(...colors.warning);
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        const encourageLines = doc.splitTextToSize(`"${results.success_plan.encouragement_summary}"`, contentWidth - 10);
        let ey = y + 8;
        encourageLines.forEach((line: string) => {
          doc.text(line, margin + 5, ey);
          ey += 5;
        });
        y += 30;
      }
      
      // Low Hanging Fruit
      if (results.low_hanging_fruit?.length) {
        addSectionHeader("Quick Wins - Start Here", colors.accent);
        results.low_hanging_fruit.forEach((item) => {
          checkPageBreak(15);
          doc.setFillColor(...colors.accent);
          doc.circle(margin + 4, y - 1, 2, 'F');
          doc.setTextColor(...colors.text);
          doc.setFontSize(10);
          const itemLines = doc.splitTextToSize(item, contentWidth - 12);
          itemLines.forEach((line: string, i: number) => {
            doc.text(line, margin + 10, y + i * 5);
          });
          y += itemLines.length * 5 + 3;
        });
        y += 5;
      }
      
      // Main Recommendations
      if (results.recommendations?.length) {
        addSectionHeader(`Career Opportunities (${results.recommendations.length})`, colors.primary);
        results.recommendations.forEach((opp, i) => addOpportunityCard(opp, i, "main"));
      }
      
      // AI-Centric
      if (results.ai_centric_opportunities?.length) {
        addSectionHeader(`AI-Centric Opportunities (${results.ai_centric_opportunities.length})`, colors.blue);
        doc.setFontSize(9);
        doc.setTextColor(...colors.muted);
        doc.text("Roles that leverage AI tools and your existing skills", margin, y);
        y += 8;
        results.ai_centric_opportunities.forEach((opp, i) => addOpportunityCard(opp, i, "ai-centric"));
      }
      
      // AI-Proof
      if (results.ai_proof_opportunities?.length) {
        addSectionHeader(`AI-Proof Opportunities (${results.ai_proof_opportunities.length})`, colors.accent);
        doc.setFontSize(9);
        doc.setTextColor(...colors.muted);
        doc.text("Automation-resistant roles based on your human strengths", margin, y);
        y += 8;
        results.ai_proof_opportunities.forEach((opp, i) => addOpportunityCard(opp, i, "ai-proof"));
      }
      
      // Alternative Paths
      if (results.alternative_paths?.length) {
        addSectionHeader(`Alternative Paths & Resource Opportunities (${results.alternative_paths.length})`, colors.warning);
        doc.setFontSize(9);
        doc.setTextColor(...colors.muted);
        doc.text("Ways to leverage your existing resources, assets, and interests", margin, y);
        y += 8;
        results.alternative_paths.forEach((opp, i) => addOpportunityCard(opp, i, "alternative"));
      }
      
      // ==================== SUCCESS PLAN ====================
      addSectionHeader("Your 30-Day Success Plan", colors.purple);
      
      // Strengths
      if (results.success_plan?.strengths?.length) {
        addSubHeader("Your Key Strengths");
        doc.setFontSize(9);
        doc.setTextColor(...colors.text);
        
        results.success_plan.strengths.forEach((strength) => {
          checkPageBreak(15);
          doc.setFillColor(254, 249, 195); // Yellow 100
          const strengthLines = doc.splitTextToSize(strength, contentWidth - 20);
          const boxHeight = strengthLines.length * 5 + 4;
          doc.roundedRect(margin, y - 4, contentWidth, boxHeight, 2, 2, 'F');
          
          strengthLines.forEach((line: string, i: number) => {
            doc.text(`${i === 0 ? '> ' : '   '}${line}`, margin + 5, y + i * 5);
          });
          y += boxHeight + 2;
        });
        y += 4;
      }
      
      // Skill Gaps
      if (results.success_plan?.skill_gaps?.length) {
        addSubHeader("Skills to Develop");
        results.success_plan.skill_gaps.forEach((skill) => {
          checkPageBreak(15);
          doc.setFontSize(9);
          doc.setTextColor(...colors.text);
          const skillLines = doc.splitTextToSize(skill, contentWidth - 15);
          const boxHeight = skillLines.length * 5 + 4;
          doc.setFillColor(...colors.secondary);
          doc.roundedRect(margin, y - 4, contentWidth, boxHeight, 2, 2, 'F');
          
          skillLines.forEach((line: string, i: number) => {
            doc.text(line, margin + 5, y + i * 5);
          });
          y += boxHeight + 2;
        });
        y += 5;
      }
      
      // Fast Wins
      if (results.success_plan?.fast_wins?.length) {
        addSubHeader("7-Day Fast Wins");
        results.success_plan.fast_wins.forEach((win) => {
          checkPageBreak(15);
          doc.setFillColor(...colors.accent);
          doc.circle(margin + 4, y - 1, 3, 'F');
          doc.setTextColor(...colors.text);
          doc.setFontSize(9);
          const winLines = doc.splitTextToSize(win, contentWidth - 12);
          winLines.forEach((line: string, li: number) => {
            doc.text(line, margin + 10, y + li * 5);
          });
          y += winLines.length * 5 + 4;
        });
        y += 5;
      }
      
      // 30-Day Plan
      if (results.success_plan?.thirty_day_plan?.length) {
        addSubHeader("Week-by-Week 30-Day Plan");
        
        results.success_plan.thirty_day_plan.forEach((week) => {
          checkPageBreak(40);
          
          // Week header
          doc.setFillColor(...colors.primary);
          doc.roundedRect(margin, y - 4, contentWidth, 10, 2, 2, 'F');
          doc.setTextColor(...colors.white);
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.text(`Week ${week.week}: ${week.focus}`, margin + 5, y + 2);
          y += 14;
          
          doc.setFont("helvetica", "normal");
          week.tasks?.forEach((task) => {
            checkPageBreak(15);
            doc.setFontSize(9);
            doc.setTextColor(...colors.muted);
            doc.text("-", margin + 5, y);
            doc.setTextColor(...colors.text);
            const taskLines = doc.splitTextToSize(task, contentWidth - 12);
            taskLines.forEach((line: string, i: number) => {
              doc.text(line, margin + 10, y + i * 5);
            });
            y += taskLines.length * 5 + 3;
          });
          y += 6;
        });
      }
      
      // Quickest Path to Income
      if (results.success_plan?.quickest_path_to_income?.length) {
        addSubHeader("Quickest Path to Income");
        results.success_plan.quickest_path_to_income.forEach((path) => {
          checkPageBreak(30);
          
          doc.setFillColor(209, 250, 229); // Green 100
          doc.roundedRect(margin, y - 4, contentWidth, 8, 2, 2, 'F');
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...colors.accent);
          doc.text(path.opportunity, margin + 5, y + 1);
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.text(`Timeline: ${path.timeline}`, margin + contentWidth - 40, y + 1);
          y += 12;
          
          path.steps?.forEach((step, i) => {
            checkPageBreak(15);
            doc.setFillColor(...colors.accent);
            doc.circle(margin + 6, y - 1.5, 2.5, 'F');
            doc.setTextColor(...colors.white);
            doc.setFontSize(7);
            doc.text(`${i + 1}`, margin + 5, y);
            doc.setTextColor(...colors.text);
            doc.setFontSize(9);
            const stepLines = doc.splitTextToSize(step, contentWidth - 15);
            stepLines.forEach((line: string, li: number) => {
              doc.text(line, margin + 12, y + li * 5);
            });
            y += stepLines.length * 5 + 2;
          });
          y += 6;
        });
      }
      
      // Long Term Bets
      if (results.success_plan?.best_long_term_bets?.length) {
        addSubHeader("Best Long-Term Bets");
        results.success_plan.best_long_term_bets.forEach((bet) => {
          checkPageBreak(40);
          
          // Calculate dynamic height based on content
          const whyLines = doc.splitTextToSize(bet.why, contentWidth - 15);
          const potentialLines = doc.splitTextToSize(`Potential: ${bet.potential}`, contentWidth - 15);
          const totalHeight = 12 + (whyLines.length * 5) + 4 + (potentialLines.length * 5) + 4;
          
          doc.setFillColor(219, 234, 254); // Blue 100
          doc.roundedRect(margin, y - 4, contentWidth, totalHeight, 2, 2, 'F');
          
          // Title
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...colors.blue);
          doc.text(bet.opportunity, margin + 5, y + 2);
          y += 10;
          
          // Why
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(...colors.text);
          whyLines.forEach((line: string) => {
            doc.text(line, margin + 5, y);
            y += 5;
          });
          y += 2;
          
          // Potential
          doc.setTextColor(...colors.primary);
          doc.setFont("helvetica", "bold");
          potentialLines.forEach((line: string) => {
            doc.text(line, margin + 5, y);
            y += 5;
          });
          
          y += 6;
        });
      }
      
      // ==================== FOOTER ON LAST PAGE ====================
      checkPageBreak(30);
      y = pageHeight - 25;
      doc.setDrawColor(...colors.secondary);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;
      doc.setFontSize(8);
      doc.setTextColor(...colors.muted);
      doc.text("Generated by CareerMovr - Your AI-Powered Career Discovery Platform", pageWidth / 2, y, { align: "center" });
      doc.text(`© ${new Date().getFullYear()} CareerMovr. All rights reserved.`, pageWidth / 2, y + 5, { align: "center" });
      
      doc.save("careermovr-assessment.pdf");
      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF");
    }
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
      "passive-income": "bg-teal-500/10 text-teal-600 border-teal-500/20",
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
      <div className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/30 transition-all max-w-full">
        <div
          className="p-4 sm:p-5 cursor-pointer"
          onClick={() => setExpandedCard(isExpanded ? null : opp.title)}
        >
          <div className="flex items-start justify-between mb-3">
            <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getTypeColor(opp.type)} truncate max-w-[70%]`}>
              {opp.type}
            </span>
            {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
          </div>
          
          <h3 className="font-display font-bold text-foreground mb-3 break-words">{opp.title}</h3>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{opp.time_commitment}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
              <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{getIncomeLabel(opp.income_potential)}</span>
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" />
              <span className={`${diffInfo.color} truncate`}>{diffInfo.label}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
              <Zap className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{opp.ramp_time}</span>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-border pt-4 space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Why This Fits You</h4>
              <ul className="space-y-1">
                {opp.reason_fit?.map((r: string, i: number) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="break-words">{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            {type === "ai-centric" && opp.skill_bridge && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Skill Bridge</h4>
                <p className="text-sm text-muted-foreground break-words">{opp.skill_bridge}</p>
                {opp.entry_points && (
                  <div className="mt-2">
                    <span className="text-xs text-muted-foreground">Entry Points: </span>
                    <span className="text-xs text-foreground break-words">{opp.entry_points.join(", ")}</span>
                  </div>
                )}
                {opp.competitive_edge && (
                  <div className="mt-1">
                    <span className="text-xs text-muted-foreground">Competitive Edge: </span>
                    <span className="text-xs text-foreground break-words">{opp.competitive_edge}</span>
                  </div>
                )}
              </div>
            )}

            {type === "ai-proof" && opp.human_advantage && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Human Advantage</h4>
                <p className="text-sm text-muted-foreground break-words">{opp.human_advantage}</p>
                {opp.monetization_path && (
                  <div className="mt-2">
                    <span className="text-xs text-muted-foreground">Path to Income: </span>
                    <span className="text-xs text-foreground break-words">{opp.monetization_path}</span>
                  </div>
                )}
              </div>
            )}

            {type === "alternative" && opp.resource_leveraged && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Resource Leveraged</h4>
                <p className="text-sm text-muted-foreground break-words">{opp.resource_leveraged}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {opp.effort_level && (
                    <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                      Effort: {opp.effort_level}
                    </span>
                  )}
                </div>
                {opp.passive_potential && (
                  <div className="mt-2">
                    <span className="text-xs text-muted-foreground">Passive Potential: </span>
                    <span className="text-xs text-foreground break-words">{opp.passive_potential}</span>
                  </div>
                )}
              </div>
            )}

            {type === "alternative-option" && (
              <div className="space-y-3">
                {opp.why_unconventional && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">Why This Is Different</h4>
                    <p className="text-sm text-muted-foreground break-words">{opp.why_unconventional}</p>
                  </div>
                )}
                {opp.personality_match && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">Personality Match</h4>
                    <p className="text-sm text-muted-foreground break-words">{opp.personality_match}</p>
                  </div>
                )}
                {opp.transferable_strengths && opp.transferable_strengths.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">Transferable Strengths</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {opp.transferable_strengths.map((strength: string, i: number) => (
                        <span key={i} className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20 break-words">
                          {strength}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {opp.realistic_entry && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">How to Get Started</h4>
                    <p className="text-sm text-muted-foreground break-words">{opp.realistic_entry}</p>
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
                    <span className="break-words">{step}</span>
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

  // Show processing state
  if (assessmentStatus === 'processing') {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card sticky top-0 z-50">
          <div className="container px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Compass className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg text-foreground">CareerMovr</span>
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
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-4">
              Generating Your Assessment
            </h1>
            <p className="text-muted-foreground mb-4">
              Our AI is analyzing your profile and creating personalized recommendations.
              This usually takes 1-2 minutes.
            </p>
            <div className="bg-card rounded-xl border border-border p-6 mb-6">
              <p className="text-sm text-muted-foreground mb-2">
                You can safely close this page - we'll email you when your results are ready!
              </p>
              <p className="text-xs text-muted-foreground">
                Check your inbox for an email from CareerMovr with a link to view your results.
              </p>
            </div>
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Check Status
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Show failed state
  if (assessmentStatus === 'failed') {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card sticky top-0 z-50">
          <div className="container px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Compass className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg text-foreground">CareerMovr</span>
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
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <Target className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-4">
              Assessment Generation Failed
            </h1>
            <p className="text-muted-foreground mb-8">
              We encountered an issue while generating your assessment. Please try again.
            </p>
            <Button variant="hero" size="xl" onClick={() => navigate("/get-started")}>
              <RefreshCw className="w-5 h-5" />
              Try Again
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (!hasResults) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card sticky top-0 z-50">
          <div className="container px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Compass className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg text-foreground">CareerMovr</span>
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
    <div className="min-h-screen bg-background overflow-x-hidden max-w-[100vw] overflow-y-auto">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50 overflow-hidden">
        <div className="container px-4 py-4 flex items-center justify-between max-w-full">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Compass className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">CareerMovr</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground font-medium">{daysLeft} days left</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-sm">
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground font-medium">{runsLeft} runs left</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/get-started")} className="hidden sm:flex">
              <RefreshCw className="w-4 h-4 mr-2" />
              New Assessment
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/get-started")} className="sm:hidden">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container px-4 py-6 pb-20 max-w-full overflow-x-hidden">
        <div className="flex gap-6 max-w-full">
          {/* Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <nav className="sticky top-24 space-y-1">
              <NavItem id="overview" label="Overview" icon={Compass} />
              <NavItem id="analytics" label="Analytics" icon={BarChart3} />
              <NavItem id="recommendations" label="Recommendations" icon={Target} count={results.recommendations?.length} />
              <NavItem id="ai-centric" label="AI Opportunities" icon={Brain} count={results.ai_centric_opportunities?.length} />
              <NavItem id="ai-proof" label="AI-Proof Roles" icon={Shield} count={results.ai_proof_opportunities?.length} />
              <NavItem id="alternative-paths" label="Resource & Asset Paths" icon={Lightbulb} count={results.alternative_paths?.length} />
              <NavItem id="alternative-options" label="Alternative Options" icon={Sparkles} count={results.alternative_options?.length} />
              <NavItem id="quick-wins" label="Quick Wins" icon={Rocket} />
              <NavItem id="success-plan" label="Success Plan" icon={Star} />
              
              <div className="pt-4 border-t border-border mt-4">
                <Button variant="outline" size="sm" className="w-full" onClick={handleExportPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
              
              {/* Current Assessment Info */}
              {assessmentHistory.length >= 1 && (
                <div className="pt-4 border-t border-border mt-4">
                  <div className="px-3 py-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">Current Assessment</span>
                    </div>
                    {assessmentHistory.find(a => a.id === assessmentId) && (() => {
                      const current = assessmentHistory.find(a => a.id === assessmentId)!;
                      const date = new Date(current.created_at);
                      const isExpired = current.expires_at && new Date(current.expires_at) < new Date();
                      return (
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Created:</span>
                            <span className="text-foreground">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            {current.status === 'completed' && !isExpired && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600">Completed</span>
                            )}
                            {current.status === 'processing' && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600">Processing</span>
                            )}
                            {current.status === 'failed' && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-600">Failed</span>
                            )}
                            {isExpired && current.status === 'completed' && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Expired</span>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
              
              {/* Assessment History */}
              {assessmentHistory.length > 1 && (
                <div className="pt-4 border-t border-border mt-4">
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Assessment History
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showHistory && (
                    <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                      {assessmentHistory.map((assessment) => {
                        const isActive = assessment.id === assessmentId;
                        const date = new Date(assessment.created_at);
                        const isExpired = assessment.expires_at && new Date(assessment.expires_at) < new Date();
                        
                        return (
                          <button
                            key={assessment.id}
                            onClick={() => !isActive && loadAssessment(assessment.id)}
                            disabled={isActive}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                              isActive 
                                ? 'bg-primary/10 text-primary font-medium' 
                                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              {assessment.status === 'processing' && (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-600">Processing</span>
                              )}
                              {assessment.status === 'failed' && (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/10 text-red-600">Failed</span>
                              )}
                              {isExpired && assessment.status === 'completed' && (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Expired</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </nav>
          </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 overflow-x-hidden pb-8">
            {/* Mobile Nav */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide -mx-4 px-4">
              <NavItem id="overview" label="Overview" icon={Compass} />
              <NavItem id="analytics" label="Analytics" icon={BarChart3} />
              <NavItem id="recommendations" label="Recommendations" icon={Target} />
              <NavItem id="ai-centric" label="AI Opps" icon={Brain} />
              <NavItem id="ai-proof" label="AI-Proof" icon={Shield} />
              <NavItem id="alternative-paths" label="Resources" icon={Lightbulb} />
              <NavItem id="alternative-options" label="Alt Options" icon={Sparkles} />
              <NavItem id="success-plan" label="Plan" icon={Star} />
              {assessmentHistory.length > 1 && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary whitespace-nowrap"
                >
                  <Calendar className="w-4 h-4" />
                  History
                </button>
              )}
            </div>
            
            {/* Mobile Current Assessment Info */}
            {assessmentHistory.length >= 1 && !showHistory && (
              <div className="lg:hidden mb-4 bg-card rounded-xl border border-border p-3">
                {assessmentHistory.find(a => a.id === assessmentId) && (() => {
                  const current = assessmentHistory.find(a => a.id === assessmentId)!;
                  const date = new Date(current.created_at);
                  const isExpired = current.expires_at && new Date(current.expires_at) < new Date();
                  return (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      {current.status === 'completed' && !isExpired && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600">Completed</span>
                      )}
                      {current.status === 'processing' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600">Processing</span>
                      )}
                      {current.status === 'failed' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-600">Failed</span>
                      )}
                      {isExpired && current.status === 'completed' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Expired</span>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Mobile History Dropdown */}
            {showHistory && assessmentHistory.length > 1 && (
              <div className="lg:hidden mb-4 bg-card rounded-xl border border-border p-4">
                <h4 className="font-medium text-foreground mb-3">Assessment History</h4>
                <div className="space-y-2">
                  {assessmentHistory.map((assessment) => {
                    const isActive = assessment.id === assessmentId;
                    const date = new Date(assessment.created_at);
                    const isExpired = assessment.expires_at && new Date(assessment.expires_at) < new Date();
                    
                    return (
                      <button
                        key={assessment.id}
                        onClick={() => !isActive && loadAssessment(assessment.id)}
                        disabled={isActive}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive 
                            ? 'bg-primary/10 text-primary font-medium' 
                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          {assessment.status === 'processing' && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-600">Processing</span>
                          )}
                          {assessment.status === 'failed' && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/10 text-red-600">Failed</span>
                          )}
                          {isExpired && assessment.status === 'completed' && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Expired</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Analytics Section */}
            {activeSection === "analytics" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-primary" />
                  Analytics & Insights
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <WorkStyleRadarChart wizardData={wizardData} />
                  <OpportunityTypeChart results={results} />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <IncomePotentialChart results={results} />
                  <CategoryBreakdown results={results} />
                </div>
                
                <DifficultyIncomeMatrix results={results} />
                
                <div className="grid md:grid-cols-2 gap-6">
                  <StrengthsCloud results={results} />
                  <TimeToIncomeTimeline results={results} />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <ProfileCompleteness wizardData={wizardData} />
                  <AssetInventory wizardData={wizardData} />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <QuickWinsChecklist results={results} />
                  <SkillGapsProgress results={results} />
                </div>
                
                <ThirtyDayProgress results={results} />
              </div>
            )}

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
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                    <div className="text-3xl font-display font-bold text-amber-500">{results.alternative_paths?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Resource Paths</div>
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

            {/* Alternative Paths Section */}
            {activeSection === "alternative-paths" && (
              <div className="space-y-4">
                <div className="mb-6">
                  <h2 className="text-2xl font-display font-bold text-foreground mb-2 flex items-center gap-2">
                    <Lightbulb className="w-6 h-6 text-amber-500" />
                    Alternative Paths & Resource Opportunities
                  </h2>
                  <p className="text-muted-foreground">Ways to leverage your existing resources, assets, and interests for additional income—even without changing careers</p>
                </div>
                {results.alternative_paths && results.alternative_paths.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {results.alternative_paths.map((opp, i) => (
                      <OpportunityCard key={i} opp={opp} type="alternative" />
                    ))}
                  </div>
                ) : (
                  <div className="bg-card rounded-xl border border-border p-8 text-center">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No alternative paths generated. Try running a new assessment with more details about your assets and interests.</p>
                  </div>
                )}
              </div>
            )}

            {/* Alternative Options Section */}
            {activeSection === "alternative-options" && (
              <div className="space-y-4">
                <div className="mb-6">
                  <h2 className="text-2xl font-display font-bold text-foreground mb-2 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-purple-500" />
                    Alternative Options
                  </h2>
                  <p className="text-muted-foreground">Unconventional career paths completely outside your experience that could be a great fit based on your personality, interests, and transferable strengths</p>
                </div>
                {results.alternative_options && results.alternative_options.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {results.alternative_options.map((opp, i) => (
                      <OpportunityCard key={i} opp={opp} type="alternative-option" />
                    ))}
                  </div>
                ) : (
                  <div className="bg-card rounded-xl border border-border p-8 text-center">
                    <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No alternative options generated yet. Run a new assessment to get unconventional career suggestions based on your personality and interests.</p>
                  </div>
                )}
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
