import { Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";

const Privacy = () => {
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
            Privacy Policy
          </h1>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-muted-foreground">
            <strong>Effective Date:</strong> December 9, 2025<br />
            <strong>Operator:</strong> CareerMovr is operated by CareerMovr LLC.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Introduction</h2>
          <p className="text-muted-foreground leading-relaxed">
            CareerMovr LLC ("CareerMovr," "we," "our," or "us") provides an online platform that offers personalized career and income opportunity assessments using AI-driven analysis. This Privacy Policy explains how we collect, use, disclose, and protect your information when you use careermovr.com and any related services (the "Service").
          </p>
          <p className="text-muted-foreground leading-relaxed">
            By using the Service, you agree to the terms of this Privacy Policy.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Information We Collect</h2>
          
          <h3 className="text-lg font-medium text-foreground mt-6 mb-3">2.1 Information You Provide Directly</h3>
          <p className="text-muted-foreground leading-relaxed">We collect information you voluntarily provide, including:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
            <li>Name and email address</li>
            <li>Resume text or uploaded content</li>
            <li>Links to social media profiles (e.g., LinkedIn, Twitter)</li>
            <li>Responses to questionnaire prompts</li>
            <li>Payment-related information (processed securely by Stripe; we do not store full payment card data)</li>
          </ul>

          <h3 className="text-lg font-medium text-foreground mt-6 mb-3">2.2 Automatically Collected Information</h3>
          <p className="text-muted-foreground leading-relaxed">When you use the Service, we may automatically collect:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Device information</li>
            <li>Usage data (pages viewed, time spent, etc.)</li>
            <li>Cookies and tracking technologies (for analytics and functionality)</li>
          </ul>

          <h3 className="text-lg font-medium text-foreground mt-6 mb-3">2.3 AI Processing of Your Data</h3>
          <p className="text-muted-foreground leading-relaxed">
            Resume content, questionnaire answers, and social links may be processed by third-party AI models to generate:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
            <li>Skills extraction</li>
            <li>Career recommendations</li>
            <li>Success Plans</li>
            <li>AI-centric and AI-proof career insights</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            CareerMovr does not use your information to train its own AI models.
          </p>

          <h3 className="text-lg font-medium text-foreground mt-6 mb-3">2.4 Optional Data</h3>
          <p className="text-muted-foreground leading-relaxed">
            You may provide additional information (e.g., assets, constraints, goals) to improve recommendation quality.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">We do not require or collect sensitive data such as:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
            <li>Social Security numbers</li>
            <li>Drivers license numbers</li>
            <li>Bank login credentials</li>
            <li>Medical information</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. How We Use Your Information</h2>
          <p className="text-muted-foreground leading-relaxed">We use your information to:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
            <li>Provide and personalize your assessment</li>
            <li>Prepopulate questionnaire fields</li>
            <li>Generate recommendations and success plans</li>
            <li>Maintain your 30-day access window</li>
            <li>Improve the Service and optimize user experience</li>
            <li>Communicate with you about account-related issues</li>
            <li>Prevent fraud or misuse</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3 font-medium">
            We do not sell your personal information to third parties.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. How We Share Information</h2>
          <p className="text-muted-foreground leading-relaxed">We may share information with:</p>

          <h3 className="text-lg font-medium text-foreground mt-6 mb-3">4.1 Service Providers</h3>
          <p className="text-muted-foreground leading-relaxed">Such as:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
            <li>Hosting providers</li>
            <li>AI processing vendors</li>
            <li>Payment processors (Stripe)</li>
            <li>Analytics tools</li>
          </ul>

          <h3 className="text-lg font-medium text-foreground mt-6 mb-3">4.2 Legal Requirements</h3>
          <p className="text-muted-foreground leading-relaxed">
            If required by law, subpoena, or government request.
          </p>

          <h3 className="text-lg font-medium text-foreground mt-6 mb-3">4.3 Business Transfers</h3>
          <p className="text-muted-foreground leading-relaxed">
            In the event of a merger, acquisition, or restructuring, your information may be transferred as part of that process.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3 font-medium">
            We do not share user data with marketers or advertisers.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Payment Processing</h2>
          <p className="text-muted-foreground leading-relaxed">
            All payments are processed by Stripe. CareerMovr does not have access to or store full credit card numbers.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">6. Data Retention</h2>
          <p className="text-muted-foreground leading-relaxed">
            Assessment data is stored for the duration of your 30-day access window and may remain on our servers afterward for your convenience unless you request deletion.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            We may retain anonymized, aggregated analytics indefinitely.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            You may request deletion of your account at any time (see Section 8).
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">7. Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            We implement reasonable administrative, technical, and physical safeguards to protect your data. However, no online system is 100% secure, and we cannot guarantee absolute security.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">8. Your Rights</h2>
          <p className="text-muted-foreground leading-relaxed">
            Depending on your U.S. state, you may have rights to:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion ("Right to Delete")</li>
            <li>Opt-out of data sharing with third parties</li>
            <li>Request a copy of your stored data</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            To exercise these rights, contact us at: <a href="mailto:support@careermovr.com" className="text-primary hover:underline">support@careermovr.com</a>
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            We will verify your identity before processing requests.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">9. Children's Privacy</h2>
          <p className="text-muted-foreground leading-relaxed">
            The Service is intended for individuals 18 years or older. We do not knowingly collect data from children under 13.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">10. Changes to This Policy</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update this Privacy Policy. Updates will be posted with a revised "Effective Date."
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">11. Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            For questions or concerns:<br />
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

export default Privacy;
