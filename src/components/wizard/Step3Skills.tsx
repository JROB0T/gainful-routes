import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Plus, X } from "lucide-react";
import { useState } from "react";

interface Step3SkillsProps {
  data: {
    skills: string[];
    interests: string[];
    helpTopics: string;
    enjoyWithoutPay: string;
  };
  updateData: (data: Partial<Step3SkillsProps["data"]>) => void;
  onNext: () => void;
  onBack: () => void;
}

const SUGGESTED_SKILLS = [
  "Project Management", "Data Analysis", "Writing", "Marketing", 
  "Sales", "Design", "Programming", "Leadership", "Communication",
  "Problem Solving", "Customer Service", "Financial Planning"
];

const SUGGESTED_INTERESTS = [
  "Technology", "Healthcare", "Education", "Finance", "Creative Arts",
  "Real Estate", "E-commerce", "Consulting", "Coaching", "Content Creation"
];

export function Step3Skills({ data, updateData, onNext, onBack }: Step3SkillsProps) {
  const [newSkill, setNewSkill] = useState("");
  const [newInterest, setNewInterest] = useState("");

  const addSkill = (skill: string) => {
    if (skill && !data.skills.includes(skill)) {
      updateData({ skills: [...data.skills, skill] });
    }
    setNewSkill("");
  };

  const removeSkill = (skill: string) => {
    updateData({ skills: data.skills.filter((s) => s !== skill) });
  };

  const addInterest = (interest: string) => {
    if (interest && !data.interests.includes(interest)) {
      updateData({ interests: [...data.interests, interest] });
    }
    setNewInterest("");
  };

  const removeInterest = (interest: string) => {
    updateData({ interests: data.interests.filter((i) => i !== interest) });
  };

  const canProceed = data.skills.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Skills & Interests
        </h2>
        <p className="text-muted-foreground">
          Tell us about your skills and what you enjoy doing.
        </p>
      </div>

      {/* Skills */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Your Skills</Label>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {data.skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="px-3 py-1.5">
              {skill}
              <button onClick={() => removeSkill(skill)} className="ml-2 hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add a skill..."
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill(newSkill))}
          />
          <Button variant="outline" size="icon" onClick={() => addSkill(newSkill)}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {SUGGESTED_SKILLS.filter((s) => !data.skills.includes(s)).slice(0, 8).map((skill) => (
            <Badge
              key={skill}
              variant="outline"
              className="cursor-pointer hover:bg-primary/10 transition-colors"
              onClick={() => addSkill(skill)}
            >
              + {skill}
            </Badge>
          ))}
        </div>
      </div>

      {/* Interests */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Your Interests</Label>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {data.interests.map((interest) => (
            <Badge key={interest} variant="secondary" className="px-3 py-1.5">
              {interest}
              <button onClick={() => removeInterest(interest)} className="ml-2 hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            placeholder="Add an interest..."
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInterest(newInterest))}
          />
          <Button variant="outline" size="icon" onClick={() => addInterest(newInterest)}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {SUGGESTED_INTERESTS.filter((i) => !data.interests.includes(i)).slice(0, 6).map((interest) => (
            <Badge
              key={interest}
              variant="outline"
              className="cursor-pointer hover:bg-primary/10 transition-colors"
              onClick={() => addInterest(interest)}
            >
              + {interest}
            </Badge>
          ))}
        </div>
      </div>

      {/* Free-text questions */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="helpTopics">What do people ask you for help with?</Label>
          <Textarea
            id="helpTopics"
            value={data.helpTopics}
            onChange={(e) => updateData({ helpTopics: e.target.value })}
            placeholder="e.g., Friends often ask me for advice on budgeting, tech troubleshooting..."
            rows={3}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="enjoyWithoutPay">What's something you enjoy even without pay?</Label>
          <Textarea
            id="enjoyWithoutPay"
            value={data.enjoyWithoutPay}
            onChange={(e) => updateData({ enjoyWithoutPay: e.target.value })}
            placeholder="e.g., I love teaching people new skills, organizing events..."
            rows={3}
            className="mt-2"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext} disabled={!canProceed}>
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
