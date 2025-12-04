import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  Compass, LogOut, User, Calendar, RefreshCw, Download, ChevronRight, ChevronDown,
  Sparkles, Lock, Target, Zap, TrendingUp, Clock, DollarSign, CheckCircle2,
  Brain, Shield, Rocket, Star, ArrowRight, Printer, Lightbulb, Package
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

type AlternativePath = BaseOpportunity & {
  resource_leveraged: string;
  effort_level: string;
  passive_potential: string;
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
        
        // Metrics row
        const diffLabel = { L: "Low", M: "Medium", H: "High" }[opp.difficulty] || opp.difficulty;
        const incomeLabel = { L: "$0-2k/mo", M: "$2-5k/mo", H: "$5k+/mo" }[opp.income_potential] || opp.income_potential;
        
        doc.setTextColor(...colors.muted);
        doc.setFontSize(8);
        const metricsY = y;
        doc.text(`Difficulty: ${diffLabel}`, margin + 35, metricsY);
        doc.text(`Time: ${opp.time_commitment}`, margin + 70, metricsY);
        doc.text(`Ramp: ${opp.ramp_time}`, margin + 110, metricsY);
        doc.text(`Income: ${incomeLabel}`, margin + 145, metricsY);
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
            checkPageBreak(8);
            doc.setFontSize(8);
            doc.text(`-  ${reason}`, margin + 5, y);
            y += 4;
          });
        }
        
        // Type-specific fields
        if (type === "ai-centric" && opp.skill_bridge) {
          y += 2;
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...colors.blue);
          doc.text("Skill Bridge: ", margin + 3, y);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...colors.muted);
          const bridgeWidth = doc.getTextWidth("Skill Bridge: ");
          addWrappedText(opp.skill_bridge, margin + 3 + bridgeWidth, contentWidth - bridgeWidth - 6, 8, colors.muted);
          
          if (opp.competitive_edge) {
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...colors.blue);
            doc.text("Competitive Edge: ", margin + 3, y);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...colors.muted);
            const edgeWidth = doc.getTextWidth("Competitive Edge: ");
            addWrappedText(opp.competitive_edge, margin + 3 + edgeWidth, contentWidth - edgeWidth - 6, 8, colors.muted);
          }
          
          if (opp.entry_points?.length) {
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...colors.blue);
            doc.text("Entry Points: ", margin + 3, y);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...colors.muted);
            y += 4;
            opp.entry_points.forEach((ep: string) => {
              doc.text(`-  ${ep}`, margin + 5, y);
              y += 4;
            });
          }
        }
        
        if (type === "ai-proof" && opp.human_advantage) {
          y += 2;
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...colors.accent);
          doc.text("Human Advantage: ", margin + 3, y);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...colors.muted);
          y += 4;
          addWrappedText(opp.human_advantage, margin + 5, contentWidth - 8, 8, colors.muted);
          
          if (opp.monetization_path) {
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...colors.accent);
            doc.text("Path to Income: ", margin + 3, y);
            doc.setFont("helvetica", "normal");
            y += 4;
            addWrappedText(opp.monetization_path, margin + 5, contentWidth - 8, 8, colors.muted);
          }
        }
        
        if (type === "alternative" && opp.resource_leveraged) {
          y += 2;
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...colors.warning);
          doc.text("Resource Leveraged: ", margin + 3, y);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...colors.muted);
          y += 4;
          addWrappedText(opp.resource_leveraged, margin + 5, contentWidth - 8, 8, colors.muted);
          
          doc.text(`Effort Level: ${opp.effort_level}`, margin + 5, y);
          y += 4;
          
          if (opp.passive_potential) {
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...colors.warning);
            doc.text("Passive Potential: ", margin + 3, y);
            doc.setFont("helvetica", "normal");
            y += 4;
            addWrappedText(opp.passive_potential, margin + 5, contentWidth - 8, 8, colors.muted);
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
      doc.text("NextMove", margin, 55);
      
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
        results.low_hanging_fruit.forEach((item, i) => {
          checkPageBreak(8);
          doc.setFillColor(...colors.accent);
          doc.circle(margin + 4, y - 1, 2, 'F');
          doc.setTextColor(...colors.text);
          doc.setFontSize(10);
          doc.text(item, margin + 10, y);
          y += 7;
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
        doc.setFillColor(254, 249, 195); // Yellow 100
        doc.roundedRect(margin, y - 4, contentWidth, 6 + Math.ceil(results.success_plan.strengths.length / 3) * 8, 2, 2, 'F');
        doc.setFontSize(9);
        doc.setTextColor(...colors.text);
        
        const strengthsPerRow = 3;
        const strengthWidth = (contentWidth - 10) / strengthsPerRow;
        results.success_plan.strengths.forEach((strength, i) => {
          const row = Math.floor(i / strengthsPerRow);
          const col = i % strengthsPerRow;
          doc.text(`> ${strength}`, margin + 5 + col * strengthWidth, y + row * 7);
        });
        y += Math.ceil(results.success_plan.strengths.length / strengthsPerRow) * 7 + 8;
      }
      
      // Skill Gaps
      if (results.success_plan?.skill_gaps?.length) {
        addSubHeader("Skills to Develop");
        results.success_plan.skill_gaps.forEach((skill) => {
          checkPageBreak(8);
          doc.setFillColor(...colors.secondary);
          doc.roundedRect(margin, y - 4, doc.getTextWidth(skill) + 10, 7, 2, 2, 'F');
          doc.setFontSize(9);
          doc.setTextColor(...colors.text);
          doc.text(skill, margin + 5, y);
          y += 10;
        });
        y += 5;
      }
      
      // Fast Wins
      if (results.success_plan?.fast_wins?.length) {
        addSubHeader("7-Day Fast Wins");
        results.success_plan.fast_wins.forEach((win, i) => {
          checkPageBreak(10);
          doc.setFillColor(...colors.accent);
          doc.circle(margin + 4, y - 1, 3, 'F');
          doc.setTextColor(...colors.white);
          doc.setFontSize(8);
          doc.text("", margin + 2.5, y);
          doc.setTextColor(...colors.text);
          doc.setFontSize(9);
          const winLines = doc.splitTextToSize(win, contentWidth - 15);
          winLines.forEach((line: string, li: number) => {
            doc.text(line, margin + 10, y + li * 5);
          });
          y += winLines.length * 5 + 3;
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
            checkPageBreak(8);
            doc.setFontSize(9);
            doc.setTextColor(...colors.muted);
            doc.text("-", margin + 5, y);
            doc.setTextColor(...colors.text);
            const taskLines = doc.splitTextToSize(task, contentWidth - 15);
            taskLines.forEach((line: string, i: number) => {
              doc.text(line, margin + 10, y + i * 5);
            });
            y += taskLines.length * 5 + 2;
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
            checkPageBreak(8);
            doc.setFillColor(...colors.accent);
            doc.circle(margin + 6, y - 1.5, 2.5, 'F');
            doc.setTextColor(...colors.white);
            doc.setFontSize(7);
            doc.text(`${i + 1}`, margin + 5, y);
            doc.setTextColor(...colors.text);
            doc.setFontSize(9);
            doc.text(step, margin + 12, y);
            y += 6;
          });
          y += 6;
        });
      }
      
      // Long Term Bets
      if (results.success_plan?.best_long_term_bets?.length) {
        addSubHeader("Best Long-Term Bets");
        results.success_plan.best_long_term_bets.forEach((bet) => {
          checkPageBreak(25);
          
          doc.setFillColor(219, 234, 254); // Blue 100
          doc.roundedRect(margin, y - 4, contentWidth, 22, 2, 2, 'F');
          
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...colors.blue);
          doc.text(bet.opportunity, margin + 5, y + 2);
          
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(...colors.text);
          const whyLines = doc.splitTextToSize(bet.why, contentWidth - 10);
          doc.text(whyLines[0], margin + 5, y + 9);
          
          doc.setTextColor(...colors.primary);
          doc.setFont("helvetica", "bold");
          doc.text(`Potential: ${bet.potential}`, margin + 5, y + 16);
          
          y += 28;
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
      doc.text("Generated by NextMove - Your AI-Powered Career Discovery Platform", pageWidth / 2, y, { align: "center" });
      doc.text(`© ${new Date().getFullYear()} NextMove. All rights reserved.`, pageWidth / 2, y + 5, { align: "center" });
      
      doc.save("nextmove-assessment.pdf");
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

            {type === "alternative" && opp.resource_leveraged && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Resource Leveraged</h4>
                <p className="text-sm text-muted-foreground">{opp.resource_leveraged}</p>
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
                    <span className="text-xs text-foreground">{opp.passive_potential}</span>
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
              <NavItem id="alternative-paths" label="Resource & Asset Paths" icon={Lightbulb} count={results.alternative_paths?.length} />
              <NavItem id="quick-wins" label="Quick Wins" icon={Rocket} />
              <NavItem id="success-plan" label="Success Plan" icon={Star} />
              
              <div className="pt-4 border-t border-border mt-4">
                <Button variant="outline" size="sm" className="w-full" onClick={handleExportPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
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
              <NavItem id="alternative-paths" label="Resources" icon={Lightbulb} />
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
