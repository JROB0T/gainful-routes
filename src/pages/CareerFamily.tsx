import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Briefcase, Wrench, Cpu, Settings, DollarSign, Clock, 
  GraduationCap, TrendingUp, CheckCircle2, ChevronRight, Award,
  Building2, Users, Hammer, Cog
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type RoleData = {
  title: string;
  description: string;
  salaryRange: string;
  demandLevel: "High" | "Medium" | "Growing";
  certifications: string[];
  entryPath: string[];
  timeToEntry: string;
  growthPotential: string;
};

type CareerFamilyData = {
  label: string;
  icon: typeof Briefcase;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  overview: string;
  roles: RoleData[];
};

const careerFamilyData: Record<string, CareerFamilyData> = {
  technical: {
    label: "Technical Careers",
    icon: Cpu,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    description: "Data, analytics, engineering, product management, and IT roles",
    overview: "Technical careers leverage analytical thinking, problem-solving, and technology skills. These roles are in high demand across all industries and offer strong earning potential with clear advancement paths.",
    roles: [
      {
        title: "Data Analyst",
        description: "Analyze data to help organizations make informed decisions. Work with SQL, Excel, and visualization tools.",
        salaryRange: "$55,000 - $95,000",
        demandLevel: "High",
        certifications: ["Google Data Analytics Certificate", "Microsoft Power BI", "SQL Certification"],
        entryPath: [
          "Complete an online data analytics bootcamp or certificate (3-6 months)",
          "Build portfolio with 3-5 real-world projects using public datasets",
          "Learn SQL, Excel, and one visualization tool (Tableau or Power BI)",
          "Apply for junior analyst or business analyst roles",
          "Consider entry through data entry or reporting roles for experience"
        ],
        timeToEntry: "3-6 months",
        growthPotential: "Senior Analyst → Data Scientist → Analytics Manager"
      },
      {
        title: "Product Manager",
        description: "Lead product strategy and development, working at the intersection of business, technology, and design.",
        salaryRange: "$85,000 - $160,000",
        demandLevel: "High",
        certifications: ["Product School Certificate", "Pragmatic Institute", "Certified Scrum Product Owner"],
        entryPath: [
          "Gain experience in adjacent role (analyst, project manager, engineering, or design)",
          "Complete a product management certificate program",
          "Build case studies demonstrating product thinking",
          "Apply for Associate PM or junior PM roles",
          "Network with PMs and seek internal transfer opportunities"
        ],
        timeToEntry: "1-2 years",
        growthPotential: "APM → PM → Senior PM → Director of Product → VP/CPO"
      },
      {
        title: "IT Support Specialist",
        description: "Provide technical support for hardware, software, and network issues. Entry point into IT careers.",
        salaryRange: "$40,000 - $65,000",
        demandLevel: "High",
        certifications: ["CompTIA A+", "CompTIA Network+", "Google IT Support Certificate"],
        entryPath: [
          "Earn CompTIA A+ certification (1-3 months study)",
          "Set up home lab to practice troubleshooting",
          "Apply for help desk or IT support roles",
          "Gain experience with ticketing systems and customer service",
          "Progress to specialized roles (network admin, security, cloud)"
        ],
        timeToEntry: "1-3 months",
        growthPotential: "IT Support → System Admin → Network Engineer → IT Manager"
      },
      {
        title: "Business Intelligence Analyst",
        description: "Create dashboards and reports that drive business decisions. Bridge between data and business strategy.",
        salaryRange: "$65,000 - $110,000",
        demandLevel: "High",
        certifications: ["Tableau Desktop Specialist", "Microsoft Certified: Data Analyst", "AWS Data Analytics"],
        entryPath: [
          "Master SQL and one BI tool (Tableau, Power BI, or Looker)",
          "Learn basic data modeling and ETL concepts",
          "Build portfolio of interactive dashboards",
          "Start in reporting or analyst role to gain domain knowledge",
          "Transition to dedicated BI role within 1-2 years"
        ],
        timeToEntry: "6-12 months",
        growthPotential: "BI Analyst → Senior BI → BI Manager → Head of Analytics"
      },
      {
        title: "Cybersecurity Analyst",
        description: "Protect organizations from cyber threats. Monitor systems, respond to incidents, and implement security measures.",
        salaryRange: "$70,000 - $120,000",
        demandLevel: "High",
        certifications: ["CompTIA Security+", "Certified Ethical Hacker (CEH)", "CISSP (advanced)"],
        entryPath: [
          "Build foundation with CompTIA Security+ (2-3 months)",
          "Set up home lab for hands-on security practice",
          "Learn networking fundamentals (CompTIA Network+)",
          "Participate in CTF competitions and bug bounties",
          "Start in IT support or SOC analyst role, then specialize"
        ],
        timeToEntry: "6-12 months",
        growthPotential: "SOC Analyst → Security Engineer → Security Architect → CISO"
      }
    ]
  },
  white_collar: {
    label: "White-Collar (Non-Technical)",
    icon: Briefcase,
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    description: "Operations, HR, sales, marketing, customer success, and management roles",
    overview: "White-collar careers focus on business operations, people management, and customer relationships. These roles value communication, organizational skills, and strategic thinking.",
    roles: [
      {
        title: "Operations Coordinator",
        description: "Manage day-to-day operations, coordinate projects, and improve business processes.",
        salaryRange: "$45,000 - $70,000",
        demandLevel: "High",
        certifications: ["Project Management Professional (PMP)", "Six Sigma Green Belt", "Certified Administrative Professional"],
        entryPath: [
          "Start in administrative or coordinator role",
          "Learn project management fundamentals",
          "Develop proficiency in Excel and process documentation",
          "Take on increasing responsibility for process improvement",
          "Pursue operations manager roles after 2-3 years experience"
        ],
        timeToEntry: "0-3 months",
        growthPotential: "Coordinator → Operations Manager → Director of Operations → COO"
      },
      {
        title: "Customer Success Manager",
        description: "Ensure customer satisfaction and retention. Build relationships and drive product adoption.",
        salaryRange: "$55,000 - $95,000",
        demandLevel: "High",
        certifications: ["Gainsight Customer Success Certificate", "HubSpot Customer Service", "SuccessHacker CSM Certification"],
        entryPath: [
          "Gain experience in customer service or account management",
          "Learn CRM tools (Salesforce, HubSpot) and CS platforms",
          "Develop strong communication and problem-solving skills",
          "Start as Customer Success Associate or junior CSM",
          "Build portfolio of customer success stories and metrics"
        ],
        timeToEntry: "3-6 months",
        growthPotential: "CSM → Senior CSM → CS Manager → VP of Customer Success"
      },
      {
        title: "HR Generalist",
        description: "Support all aspects of human resources including recruiting, onboarding, benefits, and employee relations.",
        salaryRange: "$50,000 - $80,000",
        demandLevel: "Medium",
        certifications: ["SHRM-CP", "PHR (Professional in Human Resources)", "LinkedIn Talent Solutions"],
        entryPath: [
          "Start in HR coordinator or recruiting coordinator role",
          "Learn HR information systems (Workday, BambooHR)",
          "Understand employment law basics and compliance",
          "Pursue SHRM-CP certification for credibility",
          "Specialize or remain generalist based on career goals"
        ],
        timeToEntry: "3-6 months",
        growthPotential: "HR Coordinator → HR Generalist → HR Manager → HR Director → CHRO"
      },
      {
        title: "Sales Development Representative",
        description: "Generate and qualify leads for sales teams. First step into sales careers with high earning potential.",
        salaryRange: "$45,000 - $75,000 (base + commission)",
        demandLevel: "High",
        certifications: ["HubSpot Sales Software", "Salesforce Administrator", "Sandler Sales Training"],
        entryPath: [
          "No prior experience required - companies train SDRs",
          "Learn sales methodology (SPIN, Challenger, etc.)",
          "Master CRM tools and sales engagement platforms",
          "Develop cold calling and email outreach skills",
          "Aim for promotion to Account Executive within 12-18 months"
        ],
        timeToEntry: "0-1 month",
        growthPotential: "SDR → Account Executive → Senior AE → Sales Manager → VP Sales"
      },
      {
        title: "Marketing Coordinator",
        description: "Support marketing campaigns, manage content, and coordinate events. Entry point to marketing careers.",
        salaryRange: "$42,000 - $65,000",
        demandLevel: "Medium",
        certifications: ["Google Analytics", "HubSpot Marketing Software", "Meta Blueprint"],
        entryPath: [
          "Build skills in content creation and social media",
          "Learn marketing analytics and basic SEO",
          "Complete HubSpot or Google certifications",
          "Create portfolio showcasing marketing projects",
          "Apply for coordinator or associate marketing roles"
        ],
        timeToEntry: "1-3 months",
        growthPotential: "Coordinator → Marketing Manager → Director → CMO"
      }
    ]
  },
  blue_collar: {
    label: "Blue-Collar / Skilled Trades",
    icon: Wrench,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    description: "Electrician, HVAC, plumbing, construction, mechanics, and field service roles",
    overview: "Skilled trades offer excellent earning potential, job security, and the satisfaction of hands-on work. Many trades have strong demand due to workforce shortages and aging infrastructure.",
    roles: [
      {
        title: "Electrician",
        description: "Install, maintain, and repair electrical systems in residential, commercial, or industrial settings.",
        salaryRange: "$50,000 - $95,000",
        demandLevel: "High",
        certifications: ["Journeyman Electrician License", "Master Electrician License", "OSHA 10/30"],
        entryPath: [
          "Complete electrical trade school or community college program (6-12 months)",
          "Enter apprenticeship program (4-5 years typically)",
          "Work under licensed electricians gaining hours",
          "Pass journeyman examination after apprenticeship",
          "Consider specialization (residential, commercial, industrial)"
        ],
        timeToEntry: "6-12 months to start apprenticeship",
        growthPotential: "Apprentice → Journeyman → Master Electrician → Contractor/Business Owner"
      },
      {
        title: "HVAC Technician",
        description: "Install, maintain, and repair heating, ventilation, and air conditioning systems.",
        salaryRange: "$45,000 - $80,000",
        demandLevel: "High",
        certifications: ["EPA 608 Certification", "NATE Certification", "State HVAC License"],
        entryPath: [
          "Complete HVAC training program (6-12 months)",
          "Obtain EPA 608 certification (required for refrigerants)",
          "Start as HVAC helper or installer assistant",
          "Gain experience and pursue NATE certification",
          "Specialize in commercial, residential, or refrigeration"
        ],
        timeToEntry: "6-12 months",
        growthPotential: "Helper → Technician → Senior Tech → Service Manager → Business Owner"
      },
      {
        title: "Plumber",
        description: "Install and repair water, gas, and drainage systems. Essential trade with consistent demand.",
        salaryRange: "$48,000 - $90,000",
        demandLevel: "High",
        certifications: ["Journeyman Plumber License", "Master Plumber License", "Backflow Prevention"],
        entryPath: [
          "Complete plumbing trade program or enter apprenticeship directly",
          "Work through 4-5 year apprenticeship program",
          "Learn local codes and pass journeyman exam",
          "Consider specialization (service, new construction, commercial)",
          "Master license opens business ownership opportunities"
        ],
        timeToEntry: "3-6 months to start apprenticeship",
        growthPotential: "Apprentice → Journeyman → Master Plumber → Contractor"
      },
      {
        title: "Automotive Technician",
        description: "Diagnose, repair, and maintain vehicles. Growing complexity with electric and hybrid vehicles.",
        salaryRange: "$40,000 - $75,000",
        demandLevel: "High",
        certifications: ["ASE Certifications", "Manufacturer-Specific Training", "EV Certification"],
        entryPath: [
          "Complete automotive technology program (1-2 years)",
          "Start as lube tech or apprentice mechanic",
          "Pursue ASE certifications in specific areas",
          "Specialize in particular systems or vehicle types",
          "Consider manufacturer dealership for advanced training"
        ],
        timeToEntry: "6-12 months",
        growthPotential: "Apprentice → Technician → Master Tech → Service Manager → Shop Owner"
      },
      {
        title: "Welder",
        description: "Join metal parts using various welding techniques. Used in construction, manufacturing, and repair.",
        salaryRange: "$42,000 - $80,000",
        demandLevel: "Growing",
        certifications: ["AWS Certified Welder", "Structural Welding (D1.1)", "Pipe Welding Certifications"],
        entryPath: [
          "Complete welding certificate program (3-9 months)",
          "Learn multiple welding processes (MIG, TIG, Stick)",
          "Obtain AWS certifications for specific applications",
          "Start in manufacturing or fabrication shop",
          "Specialize for higher pay (pipe, underwater, aerospace)"
        ],
        timeToEntry: "3-9 months",
        growthPotential: "Welder → Certified Welder → Welding Inspector → Welding Supervisor"
      }
    ]
  },
  hybrid: {
    label: "Hybrid Technical-Trade",
    icon: Settings,
    color: "text-teal-600",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/30",
    description: "Industrial technicians, CNC machining, robotics maintenance, IT field tech",
    overview: "Hybrid roles combine hands-on technical skills with digital technology. These positions offer the best of both worlds - practical work with modern technology - and are in high demand as industries automate.",
    roles: [
      {
        title: "Industrial Maintenance Technician",
        description: "Maintain and repair industrial equipment, combining mechanical, electrical, and PLC skills.",
        salaryRange: "$50,000 - $85,000",
        demandLevel: "High",
        certifications: ["Industrial Maintenance Technician (IMT)", "PLC Programming", "Electrical License"],
        entryPath: [
          "Complete industrial maintenance program (1-2 years)",
          "Learn fundamentals of mechanical, electrical, and hydraulics",
          "Gain PLC programming basics (Allen-Bradley, Siemens)",
          "Start as maintenance helper in manufacturing facility",
          "Pursue specialization certifications as you advance"
        ],
        timeToEntry: "6-12 months",
        growthPotential: "Helper → Technician → Senior Tech → Maintenance Supervisor → Plant Engineer"
      },
      {
        title: "CNC Machinist",
        description: "Operate computer-controlled machines to create precision parts. Blend of programming and machining.",
        salaryRange: "$45,000 - $75,000",
        demandLevel: "High",
        certifications: ["NIMS Machining Certification", "CNC Programming Certificate", "CAD/CAM Certification"],
        entryPath: [
          "Complete CNC machining program (6-12 months)",
          "Learn G-code programming and CAD/CAM software",
          "Start as machine operator or setup technician",
          "Progress to programming and complex setups",
          "Specialize in specific industries (aerospace, medical, automotive)"
        ],
        timeToEntry: "6-12 months",
        growthPotential: "Operator → Machinist → Programmer → Lead Machinist → Manufacturing Engineer"
      },
      {
        title: "Robotics Technician",
        description: "Install, program, and maintain industrial robots and automated systems.",
        salaryRange: "$55,000 - $90,000",
        demandLevel: "Growing",
        certifications: ["FANUC Robot Certification", "ABB Robot Certification", "Mechatronics Certificate"],
        entryPath: [
          "Complete mechatronics or robotics technology program",
          "Learn PLC programming and industrial networking",
          "Obtain manufacturer-specific robot certifications",
          "Start in maintenance role with automation exposure",
          "Specialize in specific robot brands or applications"
        ],
        timeToEntry: "12-18 months",
        growthPotential: "Technician → Senior Tech → Automation Engineer → Automation Manager"
      },
      {
        title: "IT Field Technician",
        description: "Install and support IT infrastructure at customer locations. Combines IT skills with field service.",
        salaryRange: "$45,000 - $70,000",
        demandLevel: "High",
        certifications: ["CompTIA A+", "CompTIA Network+", "Vendor-Specific Certifications"],
        entryPath: [
          "Earn CompTIA A+ and Network+ certifications",
          "Develop strong customer service and communication skills",
          "Start with IT service company or MSP",
          "Build experience with diverse hardware and software",
          "Specialize in areas like networking, security, or cloud"
        ],
        timeToEntry: "2-4 months",
        growthPotential: "Field Tech → Senior Tech → Team Lead → Field Services Manager"
      },
      {
        title: "Wind Turbine Technician",
        description: "Install, maintain, and repair wind turbines. Growing field in renewable energy.",
        salaryRange: "$52,000 - $80,000",
        demandLevel: "Growing",
        certifications: ["Wind Energy Certificate", "OSHA Safety Training", "Electrical Training"],
        entryPath: [
          "Complete wind energy technician program (9-24 months)",
          "Must be comfortable working at heights",
          "Obtain safety certifications (OSHA, climbing, rescue)",
          "Start with turbine manufacturer or wind farm operator",
          "Progress to lead technician or specialized roles"
        ],
        timeToEntry: "9-24 months",
        growthPotential: "Technician → Lead Tech → Site Supervisor → Regional Manager"
      }
    ]
  }
};

function getDemandColor(level: string) {
  switch (level) {
    case "High": return "bg-green-500/10 text-green-700 border-green-500/30";
    case "Growing": return "bg-blue-500/10 text-blue-700 border-blue-500/30";
    default: return "bg-amber-500/10 text-amber-700 border-amber-500/30";
  }
}

export default function CareerFamily() {
  const { familyId } = useParams<{ familyId: string }>();
  const navigate = useNavigate();
  
  const family = familyId ? careerFamilyData[familyId] : null;
  
  if (!family) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Career Family Not Found</h1>
          <Button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }
  
  const Icon = family.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className={cn("border-b", family.borderColor, family.bgColor)}>
        <div className="container px-4 py-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={cn("p-4 rounded-xl bg-background", family.color)}>
              <Icon className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{family.label}</h1>
              <p className="text-muted-foreground mt-1">{family.description}</p>
            </div>
          </motion.div>
        </div>
      </header>

      <main className="container px-4 py-8">
        {/* Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-8">
            <CardContent className="pt-6">
              <p className="text-lg text-muted-foreground leading-relaxed">
                {family.overview}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Roles Grid */}
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          Roles in This Career Family
        </h2>
        
        <div className="grid gap-6">
          {family.roles.map((role, index) => (
            <motion.div
              key={role.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className={cn("pb-4", family.bgColor)}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl">{role.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className={getDemandColor(role.demandLevel)}>
                        {role.demandLevel} Demand
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-6 space-y-6">
                  {/* Key Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-secondary/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <DollarSign className="w-4 h-4" />
                        Salary Range
                      </div>
                      <div className="font-bold text-lg">{role.salaryRange}</div>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <Clock className="w-4 h-4" />
                        Time to Entry
                      </div>
                      <div className="font-bold text-lg">{role.timeToEntry}</div>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-4 col-span-2 md:col-span-1">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <TrendingUp className="w-4 h-4" />
                        Growth Path
                      </div>
                      <div className="font-medium text-sm">{role.growthPotential}</div>
                    </div>
                  </div>

                  {/* Certifications */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-primary" />
                      Recommended Certifications
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {role.certifications.map((cert, idx) => (
                        <Badge 
                          key={idx} 
                          variant="secondary"
                          className="text-sm"
                        >
                          <Award className="w-3 h-3 mr-1" />
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Entry Path */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Step-by-Step Entry Path
                    </h4>
                    <ol className="space-y-3">
                      {role.entryPath.map((step, idx) => (
                        <motion.li 
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + idx * 0.05 }}
                          className="flex items-start gap-3"
                        >
                          <span className={cn(
                            "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white",
                            family.color.replace("text-", "bg-").replace("-600", "-500")
                          )}>
                            {idx + 1}
                          </span>
                          <span className="text-muted-foreground">{step}</span>
                        </motion.li>
                      ))}
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12"
        >
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6 text-center">
              <h3 className="text-xl font-bold mb-2">Ready to Explore Your Options?</h3>
              <p className="text-muted-foreground mb-4">
                Return to your dashboard to see how these roles match your personal profile and strengths.
              </p>
              <Button onClick={() => navigate("/dashboard")} variant="default">
                View Your Career Scorecard
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
