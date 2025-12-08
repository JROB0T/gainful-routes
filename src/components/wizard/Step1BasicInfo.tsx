import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight } from "lucide-react";
import { WizardData } from "@/pages/GetStarted";

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York",
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming"
];

const SITUATIONS = [
  { value: "unemployed", label: "Unemployed and looking for work" },
  { value: "exploring", label: "Employed but exploring new paths" },
  { value: "extra-income", label: "Employed but need extra income" },
  { value: "just-exploring", label: "Just exploring options" },
];

interface Step1Props {
  data: WizardData;
  updateData: (data: Partial<WizardData>) => void;
  onNext: () => void;
}

export function Step1BasicInfo({ data, updateData, onNext }: Step1Props) {
  const canProceed = data.state && data.situation;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Let's start with the basics
        </h2>
        <p className="text-muted-foreground">
          This helps us tailor opportunities to your location and situation.
        </p>
      </div>

      <div className="space-y-5">
        {/* State */}
        <div className="space-y-2">
          <Label htmlFor="state">U.S. State *</Label>
          <Select
            value={data.state}
            onValueChange={(value) => updateData({ state: value })}
          >
            <SelectTrigger id="state">
              <SelectValue placeholder="Select your state" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="city">City or ZIP (optional)</Label>
          <Input
            id="city"
            placeholder="Your city or ZIP code"
            value={data.city}
            onChange={(e) => updateData({ city: e.target.value })}
          />
        </div>

        {/* Current situation */}
        <div className="space-y-2">
          <Label htmlFor="situation">What best describes your current situation? *</Label>
          <Select
            value={data.situation}
            onValueChange={(value) => updateData({ situation: value })}
          >
            <SelectTrigger id="situation">
              <SelectValue placeholder="Select your situation" />
            </SelectTrigger>
            <SelectContent>
              {SITUATIONS.map((situation) => (
                <SelectItem key={situation.value} value={situation.value}>
                  {situation.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          variant="gradient"
          size="lg"
          onClick={onNext}
          disabled={!canProceed}
          className="group"
        >
          Continue
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </div>
  );
}
