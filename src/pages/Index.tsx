import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { WhatYouGet } from "@/components/landing/WhatYouGet";
import { ReportPreview } from "@/components/landing/ReportPreview";
import { WhoIsThisFor } from "@/components/landing/WhoIsThisFor";
import { WhyItWorks } from "@/components/landing/WhyItWorks";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden max-w-[100vw]">
      <Navbar />
      <main>
        <Hero />
        <TrustStrip />
        <HowItWorks />
        <WhatYouGet />
        <ReportPreview />
        <WhoIsThisFor />
        <WhyItWorks />
        <Testimonials />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
