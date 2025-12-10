import { Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container px-4 md:px-6 max-w-4xl mx-auto py-4">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container px-4 md:px-6 max-w-4xl mx-auto py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Compass className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Terms of Service
          </h1>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-muted-foreground">
            <strong>Effective Date:</strong> December 9, 2025<br />
            <strong>Operator:</strong> CareerMovr is operated by CareerMovr LLC.
          </p>

          {/* Disclaimer */}
          <div className="bg-secondary/50 border border-border rounded-lg p-4 my-6">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Disclaimer:</strong> CareerMovr provides informational career and income recommendations generated using AI. CareerMovr LLC does not guarantee job placement, income outcomes, or accuracy of AI-generated content. Nothing on this site constitutes professional, legal, financial, or employment advice.
            </p>
          </div>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            By accessing or using the Service, you agree to these Terms of Service ("Terms"). If you do not agree, do not use CareerMovr.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Description of Service</h2>
          <p className="text-muted-foreground leading-relaxed">
            CareerMovr provides AI-powered career and income assessments, including:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
            <li>Personalized recommendations</li>
            <li>Success Plans</li>
            <li>AI-centric opportunities</li>
            <li>AI-proof career insights</li>
            <li>A 30-day access dashboard</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3 font-medium">
            These assessments are informational only and not professional, legal, financial, or employment advice.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Eligibility</h2>
          <p className="text-muted-foreground leading-relaxed">
            You must be 18 years or older to use CareerMovr.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Accounts</h2>
          <p className="text-muted-foreground leading-relaxed">
            To use the Service, you must create an account. You agree to:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
            <li>Provide accurate information</li>
            <li>Maintain confidentiality of your password</li>
            <li>Be responsible for all activity under your account</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            CareerMovr may terminate accounts that violate these Terms.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. One-Time Payment & Access</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
            <li>The assessment costs $10 as a one-time, non-refundable payment.</li>
            <li>Payment grants 30 days of access to the assessment dashboard and results.</li>
            <li>You may receive up to 3 total AI-generated assessments during the access window.</li>
            <li>CareerMovr may offer promotions or discounts at its discretion.</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">6. No Guarantees</h2>
          <p className="text-muted-foreground leading-relaxed">
            CareerMovr does not guarantee:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
            <li>Job placement</li>
            <li>Income outcomes</li>
            <li>Accuracy or completeness of recommendations</li>
            <li>Success in implementing any part of the plan</li>
            <li>That AI outputs will be free of errors or biases</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3 font-medium">
            All recommendations are informational only.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">7. AI-Generated Content</h2>
          <p className="text-muted-foreground leading-relaxed">
            AI-powered outputs may contain:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
            <li>Imperfections</li>
            <li>Inaccuracies</li>
            <li>Outdated information</li>
            <li>Interpretive errors</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            You understand and accept these limitations.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">8. Acceptable Use</h2>
          <p className="text-muted-foreground leading-relaxed">
            You agree not to:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
            <li>Distribute, copy, or scrape the questionnaire structure</li>
            <li>Reverse engineer the Service</li>
            <li>Train models using CareerMovr outputs</li>
            <li>Use the Service for illegal purposes</li>
            <li>Attempt unauthorized access to systems or servers</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            Violation may result in account termination.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">9. Intellectual Property</h2>
          <p className="text-muted-foreground leading-relaxed">
            All software, assessments, questionnaire structure, recommendations, AI prompts, branding/logos, and website content are the property of CareerMovr LLC.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            You may not resell or reproduce any part of the Service.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">10. Refund Policy</h2>
          <p className="text-muted-foreground leading-relaxed">
            All purchases are final. Because the assessment is digital and delivered immediately, refunds are generally not provided.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">11. Termination</h2>
          <p className="text-muted-foreground leading-relaxed">
            CareerMovr may suspend or terminate accounts:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
            <li>For violation of these Terms</li>
            <li>To prevent fraud</li>
            <li>For unlawful use</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            Users may delete their account by contacting support.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">12. Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">
            To the fullest extent allowed by law:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
            <li>CareerMovr LLC is not liable for indirect or consequential damages.</li>
            <li>CareerMovr LLC is not responsible for decisions made based on assessment output.</li>
            <li>Maximum liability shall not exceed the amount paid for the Service ($10).</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">13. Governing Law</h2>
          <p className="text-muted-foreground leading-relaxed">
            These Terms are governed by the laws of the United States and the State of New Jersey.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">14. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            Questions?<br />
            <a href="mailto:support@careermovr.com" className="text-primary hover:underline">support@careermovr.com</a>
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            CareerMovr LLC<br />
            New Jersey, USA
          </p>
        </div>
      </main>
    </div>
  );
};

export default Terms;
