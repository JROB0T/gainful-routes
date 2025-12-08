import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import { CheckCircle2, Circle, TrendingUp, Zap, Clock, Target, Brain, Shield, Lightbulb } from 'lucide-react';
import { useState } from 'react';

type Results = {
  recommendations: any[];
  ai_centric_opportunities: any[];
  ai_proof_opportunities: any[];
  alternative_paths: any[];
  success_plan: {
    strengths: string[];
    skill_gaps: string[];
    fast_wins: string[];
    thirty_day_plan: { week: number; focus: string; tasks: string[] }[];
    quickest_path_to_income: any[];
    best_long_term_bets: any[];
    encouragement_summary: string;
  };
  low_hanging_fruit: string[];
  profile_summary: {
    headline: string;
    top_skills: string[];
    experience_level: string;
    best_fit_types: string[];
  };
};

type WizardData = {
  structurePreference: number;
  riskTolerance: number;
  balanceVsIncome: number;
  skills: string[];
  interests: string[];
  credentials: string[];
  physicalAssets: string[];
  digitalAssets: string[];
  timeAvailable: string;
};

interface AnalyticsChartsProps {
  results: Results;
  wizardData?: WizardData | null;
}

const COLORS = {
  primary: '#6366f1',
  blue: '#3b82f6',
  green: '#10b981',
  amber: '#f59e0b',
  purple: '#8b5cf6',
  pink: '#ec4899',
  teal: '#14b8a6',
  orange: '#f97316',
};

const TYPE_COLORS: Record<string, string> = {
  career: COLORS.blue,
  consulting: COLORS.purple,
  freelance: COLORS.primary,
  rental: COLORS.amber,
  'side-hustle': COLORS.green,
  business: COLORS.orange,
  creator: COLORS.pink,
  'passive-income': COLORS.teal,
};

export function WorkStyleRadarChart({ wizardData }: { wizardData?: WizardData | null }) {
  const data = [
    { trait: 'Risk Tolerance', value: wizardData?.riskTolerance || 3, fullMark: 5 },
    { trait: 'Structure Need', value: wizardData?.structurePreference || 3, fullMark: 5 },
    { trait: 'Income Focus', value: wizardData?.balanceVsIncome || 3, fullMark: 5 },
    { trait: 'Autonomy', value: 6 - (wizardData?.structurePreference || 3), fullMark: 5 },
    { trait: 'Flexibility', value: 6 - (wizardData?.balanceVsIncome || 3), fullMark: 5 },
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-primary" />
        Work Style Profile
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis 
              dataKey="trait" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 5]} 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            />
            <Radar
              name="Your Profile"
              dataKey="value"
              stroke={COLORS.primary}
              fill={COLORS.primary}
              fillOpacity={0.3}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span>Higher = More of that trait</span>
        </div>
      </div>
    </div>
  );
}

export function OpportunityTypeChart({ results }: { results: Results }) {
  const allOpps = [
    ...(results.recommendations || []),
    ...(results.ai_centric_opportunities || []),
    ...(results.ai_proof_opportunities || []),
    ...(results.alternative_paths || []),
  ];

  const typeCounts: Record<string, number> = {};
  allOpps.forEach(opp => {
    const type = opp.type || 'other';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  const data = Object.entries(typeCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' '),
    value,
    color: TYPE_COLORS[name] || COLORS.primary,
  }));

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-amber-500" />
        Opportunity Types
      </h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap gap-2 justify-center">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-1 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-muted-foreground">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function IncomePotentialChart({ results }: { results: Results }) {
  const allOpps = [
    ...(results.recommendations || []),
    ...(results.ai_centric_opportunities || []),
    ...(results.ai_proof_opportunities || []),
    ...(results.alternative_paths || []),
  ];

  const incomeCounts = { L: 0, M: 0, H: 0 };
  allOpps.forEach(opp => {
    const income = opp.income_potential as keyof typeof incomeCounts;
    if (income in incomeCounts) {
      incomeCounts[income]++;
    }
  });

  const data = [
    { name: '$0-2k/mo', value: incomeCounts.L, fill: COLORS.amber },
    { name: '$2-5k/mo', value: incomeCounts.M, fill: COLORS.blue },
    { name: '$5k+/mo', value: incomeCounts.H, fill: COLORS.green },
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-green-500" />
        Income Potential Distribution
      </h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
            <YAxis 
              type="category" 
              dataKey="name" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              width={70}
            />
            <Tooltip />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function DifficultyIncomeMatrix({ results }: { results: Results }) {
  const allOpps = [
    ...(results.recommendations || []).map(o => ({ ...o, category: 'Career' })),
    ...(results.ai_centric_opportunities || []).map(o => ({ ...o, category: 'AI-Centric' })),
    ...(results.ai_proof_opportunities || []).map(o => ({ ...o, category: 'AI-Proof' })),
    ...(results.alternative_paths || []).map(o => ({ ...o, category: 'Alternative' })),
  ];

  const difficultyMap: Record<string, number> = { L: 1, M: 2, H: 3 };
  const incomeMap: Record<string, number> = { L: 1, M: 2, H: 3 };

  const data = allOpps.map(opp => ({
    x: difficultyMap[opp.difficulty] || 2,
    y: incomeMap[opp.income_potential] || 2,
    z: 100,
    name: opp.title,
    category: opp.category,
  }));

  const categoryColors: Record<string, string> = {
    Career: COLORS.blue,
    'AI-Centric': COLORS.purple,
    'AI-Proof': COLORS.green,
    Alternative: COLORS.amber,
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-purple-500" />
        Difficulty vs Income Matrix
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <XAxis 
              type="number" 
              dataKey="x" 
              domain={[0.5, 3.5]} 
              ticks={[1, 2, 3]}
              tickFormatter={(v) => ['', 'Easy', 'Medium', 'Hard'][v]}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              label={{ value: 'Difficulty', position: 'bottom', fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              domain={[0.5, 3.5]} 
              ticks={[1, 2, 3]}
              tickFormatter={(v) => ['', 'Low', 'Med', 'High'][v]}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              label={{ value: 'Income', angle: -90, position: 'left', fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            />
            <ZAxis type="number" dataKey="z" range={[60, 60]} />
            <Tooltip 
              content={({ payload }) => {
                if (payload && payload[0]) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-popover border border-border rounded-lg p-2 text-xs shadow-lg">
                      <p className="font-medium text-foreground">{data.name}</p>
                      <p className="text-muted-foreground">{data.category}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            {Object.keys(categoryColors).map(cat => (
              <Scatter
                key={cat}
                name={cat}
                data={data.filter(d => d.category === cat)}
                fill={categoryColors[cat]}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap gap-3 justify-center text-xs">
        {Object.entries(categoryColors).map(([cat, color]) => (
          <div key={cat} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-muted-foreground">{cat}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center mt-2">
        Top-left = Easy money | Bottom-right = High effort, lower pay
      </p>
    </div>
  );
}

export function CategoryBreakdown({ results }: { results: Results }) {
  const data = [
    { name: 'Career Paths', count: results.recommendations?.length || 0, icon: Target, color: COLORS.blue },
    { name: 'AI-Centric', count: results.ai_centric_opportunities?.length || 0, icon: Brain, color: COLORS.purple },
    { name: 'AI-Proof', count: results.ai_proof_opportunities?.length || 0, icon: Shield, color: COLORS.green },
    { name: 'Alternative', count: results.alternative_paths?.length || 0, icon: Lightbulb, color: COLORS.amber },
  ];

  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="font-display font-bold text-foreground mb-4">
        Opportunity Categories
      </h3>
      <div className="space-y-3">
        {data.map((item, i) => {
          const Icon = item.icon;
          const percentage = total > 0 ? (item.count / total) * 100 : 0;
          return (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" style={{ color: item.color }} />
                  <span className="text-sm text-foreground">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-foreground">{item.count}</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function StrengthsCloud({ results }: { results: Results }) {
  const strengths = results.success_plan?.strengths || [];
  
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-500" />
        Your Key Strengths
      </h3>
      <div className="flex flex-wrap gap-2">
        {strengths.map((strength, i) => (
          <span 
            key={i}
            className="px-3 py-1.5 rounded-full text-sm font-medium"
            style={{
              backgroundColor: `${Object.values(COLORS)[i % Object.values(COLORS).length]}20`,
              color: Object.values(COLORS)[i % Object.values(COLORS).length],
            }}
          >
            {strength}
          </span>
        ))}
      </div>
    </div>
  );
}

export function SkillGapsProgress({ results }: { results: Results }) {
  const skillGaps = results.success_plan?.skill_gaps || [];
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const toggleComplete = (index: number) => {
    const newCompleted = new Set(completed);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompleted(newCompleted);
  };

  const progress = skillGaps.length > 0 ? (completed.size / skillGaps.length) * 100 : 0;

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-foreground flex items-center gap-2">
          <Target className="w-5 h-5 text-red-500" />
          Skill Gaps to Address
        </h3>
        <span className="text-sm text-muted-foreground">{completed.size}/{skillGaps.length}</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-gradient-to-r from-red-500 to-green-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="space-y-2">
        {skillGaps.map((gap, i) => (
          <button
            key={i}
            onClick={() => toggleComplete(i)}
            className={`w-full flex items-start gap-3 p-2 rounded-lg text-left transition-colors ${
              completed.has(i) ? 'bg-green-500/10' : 'hover:bg-secondary'
            }`}
          >
            {completed.has(i) ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            )}
            <span className={`text-sm ${completed.has(i) ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
              {gap}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function ThirtyDayProgress({ results }: { results: Results }) {
  const plan = results.success_plan?.thirty_day_plan || [];
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const toggleTask = (weekIndex: number, taskIndex: number) => {
    const key = `${weekIndex}-${taskIndex}`;
    const newCompleted = new Set(completedTasks);
    if (newCompleted.has(key)) {
      newCompleted.delete(key);
    } else {
      newCompleted.add(key);
    }
    setCompletedTasks(newCompleted);
  };

  const totalTasks = plan.reduce((sum, week) => sum + (week.tasks?.length || 0), 0);
  const progress = totalTasks > 0 ? (completedTasks.size / totalTasks) * 100 : 0;

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-foreground flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          30-Day Progress Tracker
        </h3>
        <span className="text-sm font-medium text-foreground">{Math.round(progress)}%</span>
      </div>
      <div className="h-3 bg-secondary rounded-full overflow-hidden mb-6">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="space-y-4">
        {plan.map((week, weekIndex) => {
          const weekTasks = week.tasks || [];
          const weekCompleted = weekTasks.filter((_, ti) => completedTasks.has(`${weekIndex}-${ti}`)).length;
          const weekProgress = weekTasks.length > 0 ? (weekCompleted / weekTasks.length) * 100 : 0;

          return (
            <div key={weekIndex} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-foreground">Week {week.week}</span>
                <span className="text-xs text-muted-foreground">{weekCompleted}/{weekTasks.length}</span>
              </div>
              <p className="text-sm text-primary mb-3">{week.focus}</p>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-3">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${weekProgress}%` }}
                />
              </div>
              <div className="space-y-1">
                {weekTasks.map((task, taskIndex) => {
                  const isComplete = completedTasks.has(`${weekIndex}-${taskIndex}`);
                  return (
                    <button
                      key={taskIndex}
                      onClick={() => toggleTask(weekIndex, taskIndex)}
                      className={`w-full flex items-start gap-2 p-1.5 rounded text-left transition-colors ${
                        isComplete ? 'bg-green-500/10' : 'hover:bg-secondary'
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-xs ${isComplete ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                        {task}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function QuickWinsChecklist({ results }: { results: Results }) {
  const fastWins = results.success_plan?.fast_wins || [];
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const toggleComplete = (index: number) => {
    const newCompleted = new Set(completed);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompleted(newCompleted);
  };

  const progress = fastWins.length > 0 ? (completed.size / fastWins.length) * 100 : 0;

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-foreground flex items-center gap-2">
          <Zap className="w-5 h-5 text-green-500" />
          This Week's Quick Wins
        </h3>
        <span className="text-sm text-muted-foreground">{completed.size}/{fastWins.length}</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-green-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="space-y-2">
        {fastWins.map((win, i) => (
          <button
            key={i}
            onClick={() => toggleComplete(i)}
            className={`w-full flex items-start gap-3 p-2 rounded-lg text-left transition-colors ${
              completed.has(i) ? 'bg-green-500/10' : 'hover:bg-secondary'
            }`}
          >
            {completed.has(i) ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            )}
            <span className={`text-sm ${completed.has(i) ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
              {win}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function ProfileCompleteness({ wizardData }: { wizardData?: WizardData | null }) {
  if (!wizardData) return null;

  const fields = [
    { name: 'Skills', filled: (wizardData.skills?.length || 0) > 0 },
    { name: 'Interests', filled: (wizardData.interests?.length || 0) > 0 },
    { name: 'Credentials', filled: (wizardData.credentials?.length || 0) > 0 },
    { name: 'Physical Assets', filled: (wizardData.physicalAssets?.length || 0) > 0 },
    { name: 'Digital Assets', filled: (wizardData.digitalAssets?.length || 0) > 0 },
    { name: 'Time Available', filled: !!wizardData.timeAvailable },
    { name: 'Work Preferences', filled: wizardData.structurePreference !== 3 || wizardData.riskTolerance !== 3 },
  ];

  const filledCount = fields.filter(f => f.filled).length;
  const percentage = Math.round((filledCount / fields.length) * 100);

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="font-display font-bold text-foreground mb-4">
        Profile Completeness
      </h3>
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="35"
              stroke="hsl(var(--secondary))"
              strokeWidth="6"
              fill="none"
            />
            <circle
              cx="40"
              cy="40"
              r="35"
              stroke={COLORS.primary}
              strokeWidth="6"
              fill="none"
              strokeDasharray={`${percentage * 2.2} 220`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-foreground">{percentage}%</span>
          </div>
        </div>
        <div className="flex-1 space-y-1">
          {fields.map((field, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              {field.filled ? (
                <CheckCircle2 className="w-3 h-3 text-green-500" />
              ) : (
                <Circle className="w-3 h-3 text-muted-foreground" />
              )}
              <span className={field.filled ? 'text-foreground' : 'text-muted-foreground'}>
                {field.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AssetInventory({ wizardData }: { wizardData?: WizardData | null }) {
  if (!wizardData) return null;

  const physical = wizardData.physicalAssets || [];
  const digital = wizardData.digitalAssets || [];
  const credentials = wizardData.credentials || [];

  if (physical.length === 0 && digital.length === 0 && credentials.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="font-display font-bold text-foreground mb-4">
        Your Asset Inventory
      </h3>
      <div className="space-y-4">
        {credentials.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Credentials</h4>
            <div className="flex flex-wrap gap-2">
              {credentials.map((item, i) => (
                <span key={i} className="px-2 py-1 bg-purple-500/10 text-purple-600 text-xs rounded-full">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
        {physical.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Physical Assets</h4>
            <div className="flex flex-wrap gap-2">
              {physical.map((item, i) => (
                <span key={i} className="px-2 py-1 bg-amber-500/10 text-amber-600 text-xs rounded-full">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
        {digital.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Digital Assets</h4>
            <div className="flex flex-wrap gap-2">
              {digital.map((item, i) => (
                <span key={i} className="px-2 py-1 bg-blue-500/10 text-blue-600 text-xs rounded-full">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function TimeToIncomeTimeline({ results }: { results: Results }) {
  const quickPaths = results.success_plan?.quickest_path_to_income || [];
  
  if (quickPaths.length === 0) return null;

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-teal-500" />
        Fastest Paths to Income
      </h3>
      <div className="space-y-4">
        {quickPaths.map((path, i) => (
          <div key={i} className="relative pl-6 pb-4 border-l-2 border-primary/30 last:border-l-0 last:pb-0">
            <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
              <span className="text-[10px] text-primary-foreground font-bold">{i + 1}</span>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-foreground">{path.opportunity}</span>
                <span className="text-xs px-2 py-0.5 bg-teal-500/10 text-teal-600 rounded-full">
                  {path.timeline}
                </span>
              </div>
              {path.steps && (
                <ul className="text-xs text-muted-foreground space-y-0.5 mt-2">
                  {path.steps.slice(0, 3).map((step: string, si: number) => (
                    <li key={si} className="flex items-start gap-1">
                      <span className="text-primary">→</span> {step}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
