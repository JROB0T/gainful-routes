import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Home, DollarSign, Car, Laptop, GraduationCap, Network, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Step6AssetsProps {
  data: {
    ownsHome: boolean;
    hasExtraSpace: boolean;
    extraSpaceDetails: string;
    capitalAvailable: string;
    physicalAssets: string[];
    digitalAssets: string[];
    credentials: string[];
    networkStrength: string;
  };
  updateData: (data: Partial<Step6AssetsProps["data"]>) => void;
  onNext: () => void;
  onBack: () => void;
}

const CAPITAL_OPTIONS = [
  { id: "none", label: "None", description: "No available capital" },
  { id: "small", label: "Small", description: "Under $1,000" },
  { id: "moderate", label: "Moderate", description: "$1,000 - $10,000" },
  { id: "higher", label: "Higher", description: "$10,000+" },
];

const PHYSICAL_ASSETS = ["Vehicle", "Tools", "Camera/Equipment", "Specialized Equipment", "Storage Space"];
const DIGITAL_ASSETS = ["Newsletter", "Social Following", "Website/Blog", "YouTube Channel", "TikTok", "Podcast"];

export function Step6Assets({ data, updateData, onNext, onBack }: Step6AssetsProps) {
  const [newCredential, setNewCredential] = useState("");

  const togglePhysical = (asset: string) => {
    if (data.physicalAssets.includes(asset)) {
      updateData({ physicalAssets: data.physicalAssets.filter((a) => a !== asset) });
    } else {
      updateData({ physicalAssets: [...data.physicalAssets, asset] });
    }
  };

  const toggleDigital = (asset: string) => {
    if (data.digitalAssets.includes(asset)) {
      updateData({ digitalAssets: data.digitalAssets.filter((a) => a !== asset) });
    } else {
      updateData({ digitalAssets: [...data.digitalAssets, asset] });
    }
  };

  const addCredential = () => {
    if (newCredential && !data.credentials.includes(newCredential)) {
      updateData({ credentials: [...data.credentials, newCredential] });
      setNewCredential("");
    }
  };

  const removeCredential = (cred: string) => {
    updateData({ credentials: data.credentials.filter((c) => c !== cred) });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Assets & Resources
        </h2>
        <p className="text-muted-foreground">
          What resources do you have that could help you earn?
        </p>
      </div>

      {/* Housing */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Home className="w-5 h-5 text-primary" />
          <Label className="text-base font-semibold">Housing</Label>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="p-4 rounded-xl border border-border bg-card">
            <p className="text-sm mb-3">Do you own a home?</p>
            <div className="flex gap-2">
              <button
                onClick={() => updateData({ ownsHome: true })}
                className={cn(
                  "px-4 py-2 rounded-lg border text-sm transition-all",
                  data.ownsHome ? "border-primary bg-primary/10" : "border-border hover:border-primary/30"
                )}
              >
                Yes
              </button>
              <button
                onClick={() => updateData({ ownsHome: false })}
                className={cn(
                  "px-4 py-2 rounded-lg border text-sm transition-all",
                  !data.ownsHome ? "border-primary bg-primary/10" : "border-border hover:border-primary/30"
                )}
              >
                No
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card">
            <p className="text-sm mb-3">Extra rooms or usable spaces?</p>
            <div className="flex gap-2">
              <button
                onClick={() => updateData({ hasExtraSpace: true })}
                className={cn(
                  "px-4 py-2 rounded-lg border text-sm transition-all",
                  data.hasExtraSpace ? "border-primary bg-primary/10" : "border-border hover:border-primary/30"
                )}
              >
                Yes
              </button>
              <button
                onClick={() => updateData({ hasExtraSpace: false })}
                className={cn(
                  "px-4 py-2 rounded-lg border text-sm transition-all",
                  !data.hasExtraSpace ? "border-primary bg-primary/10" : "border-border hover:border-primary/30"
                )}
              >
                No
              </button>
            </div>
          </div>
        </div>

        {data.hasExtraSpace && (
          <Input
            value={data.extraSpaceDetails}
            onChange={(e) => updateData({ extraSpaceDetails: e.target.value })}
            placeholder="Describe the space (e.g., spare bedroom, garage, backyard...)"
          />
        )}
      </div>

      {/* Capital */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          <Label className="text-base font-semibold">Capital available to invest</Label>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CAPITAL_OPTIONS.map(({ id, label, description }) => (
            <button
              key={id}
              onClick={() => updateData({ capitalAvailable: id })}
              className={cn(
                "p-3 rounded-xl border text-center transition-all",
                data.capitalAvailable === id
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/30"
              )}
            >
              <div className="font-medium text-sm">{label}</div>
              <div className="text-xs text-muted-foreground">{description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Physical assets */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Car className="w-5 h-5 text-primary" />
          <Label className="text-base font-semibold">Physical assets</Label>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {PHYSICAL_ASSETS.map((asset) => (
            <Badge
              key={asset}
              variant={data.physicalAssets.includes(asset) ? "secondary" : "outline"}
              className="cursor-pointer transition-colors px-3 py-1.5"
              onClick={() => togglePhysical(asset)}
            >
              {data.physicalAssets.includes(asset) && "✓ "}{asset}
            </Badge>
          ))}
        </div>
      </div>

      {/* Digital assets */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Laptop className="w-5 h-5 text-primary" />
          <Label className="text-base font-semibold">Digital assets</Label>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {DIGITAL_ASSETS.map((asset) => (
            <Badge
              key={asset}
              variant={data.digitalAssets.includes(asset) ? "secondary" : "outline"}
              className="cursor-pointer transition-colors px-3 py-1.5"
              onClick={() => toggleDigital(asset)}
            >
              {data.digitalAssets.includes(asset) && "✓ "}{asset}
            </Badge>
          ))}
        </div>
      </div>

      {/* Credentials */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary" />
          <Label className="text-base font-semibold">Degrees, licenses, certifications</Label>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-2">
          {data.credentials.map((cred) => (
            <Badge key={cred} variant="secondary" className="px-3 py-1.5">
              {cred}
              <button onClick={() => removeCredential(cred)} className="ml-2 hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={newCredential}
            onChange={(e) => setNewCredential(e.target.value)}
            placeholder="Add a credential..."
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCredential())}
          />
          <Button variant="outline" onClick={addCredential}>Add</Button>
        </div>
      </div>

      {/* Network */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-primary" />
          <Label className="text-base font-semibold">Your network</Label>
        </div>
        
        <Textarea
          value={data.networkStrength}
          onChange={(e) => updateData({ networkStrength: e.target.value })}
          placeholder="Are you well-connected in any industry or community? (e.g., 'Strong network in tech startups', 'Know many local business owners'...)"
          rows={3}
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext}>
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
