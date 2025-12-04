import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Sparkles, Linkedin, Globe, Twitter, Loader2, Upload, FileText, X } from "lucide-react";
import { WizardData } from "@/pages/GetStarted";
import { useRef, useState } from "react";
import { toast } from "sonner";
import * as pdfjsLib from "pdfjs-dist";

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js`;

interface Step2Props {
  data: WizardData;
  updateData: (data: Partial<WizardData>) => void;
  onBack: () => void;
  onAutoFill: () => void;
  isAnalyzing: boolean;
}

export function Step2Upload({ data, updateData, onBack, onAutoFill, isAnalyzing }: Step2Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const hasContent = data.resumeText || data.linkedinUrl;

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      fullText += pageText + "\n\n";
    }

    return fullText.trim();
  };

  const extractTextFromTxt = async (file: File): Promise<string> => {
    return await file.text();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File too large. Maximum size is 10MB.");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (!allowedTypes.includes(file.type) && !file.name.endsWith(".txt")) {
      toast.error("Please upload a PDF, TXT, or Word document.");
      return;
    }

    setIsProcessing(true);
    setUploadedFile(file);

    try {
      let text = "";

      if (file.type === "application/pdf") {
        text = await extractTextFromPdf(file);
      } else if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        text = await extractTextFromTxt(file);
      } else if (file.type.includes("word") || file.name.endsWith(".doc") || file.name.endsWith(".docx")) {
        // For Word docs, we can't parse client-side easily, so inform the user
        toast.info("Word document detected. For best results, please also paste the text content.");
        text = `[Word document uploaded: ${file.name}]\n\nPlease paste the key content from your resume below for AI analysis.`;
      }

      if (text) {
        updateData({ resumeText: text });
        toast.success("Resume text extracted successfully!");
      }
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Failed to extract text from file. Please try pasting the content instead.");
    } finally {
      setIsProcessing(false);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    updateData({ resumeText: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Share your experience
        </h2>
        <p className="text-muted-foreground">
          Upload your resume or add social links. Our AI will extract and auto-fill your profile.
        </p>
      </div>

      <div className="space-y-5">
        {/* File upload */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Upload Resume
          </Label>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.doc,.docx,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileUpload}
            className="hidden"
          />

          {!uploadedFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
            >
              {isProcessing ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">Processing your resume...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Click to upload your resume</p>
                    <p className="text-sm text-muted-foreground">PDF, TXT, or Word (max 10MB)</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{uploadedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(uploadedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={clearFile}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or add links</span>
          </div>
        </div>

        {/* LinkedIn */}
        <div className="space-y-2">
          <Label htmlFor="linkedin" className="flex items-center gap-2">
            <Linkedin className="w-4 h-4 text-[#0A66C2]" />
            LinkedIn Profile URL
          </Label>
          <Input
            id="linkedin"
            type="url"
            placeholder="https://linkedin.com/in/yourprofile"
            value={data.linkedinUrl}
            onChange={(e) => updateData({ linkedinUrl: e.target.value })}
          />
        </div>

        {/* Twitter */}
        <div className="space-y-2">
          <Label htmlFor="twitter" className="flex items-center gap-2">
            <Twitter className="w-4 h-4 text-muted-foreground" />
            X/Twitter URL (optional)
          </Label>
          <Input
            id="twitter"
            type="url"
            placeholder="https://x.com/yourhandle"
            value={data.twitterUrl}
            onChange={(e) => updateData({ twitterUrl: e.target.value })}
          />
        </div>

        {/* Portfolio */}
        <div className="space-y-2">
          <Label htmlFor="portfolio" className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            Personal Website/Portfolio (optional)
          </Label>
          <Input
            id="portfolio"
            type="url"
            placeholder="https://yourwebsite.com"
            value={data.portfolioUrl}
            onChange={(e) => updateData({ portfolioUrl: e.target.value })}
          />
        </div>

        {/* Resume text */}
        <div className="space-y-2">
          <Label htmlFor="resume">Resume Content</Label>
          <Textarea
            id="resume"
            placeholder="Your resume text will appear here after upload, or you can paste it directly..."
            value={data.resumeText}
            onChange={(e) => updateData({ resumeText: e.target.value })}
            className="min-h-[150px] resize-y"
          />
          <p className="text-xs text-muted-foreground">
            Tip: The more detail you provide, the better your recommendations will be.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Button
          variant="accent"
          size="lg"
          onClick={onAutoFill}
          disabled={!hasContent || isAnalyzing}
          className="group"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Auto-fill My Profile
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
