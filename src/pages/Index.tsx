import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ReportPreview } from "@/components/landing/ReportPreview";
import { WhoIsThisFor } from "@/components/landing/WhoIsThisFor";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import { BackgroundElements } from "@/components/landing/BackgroundElements";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden max-w-[100vw] relative">
      <BackgroundElements />
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <HowItWorks />
        <ReportPreview />
        <WhoIsThisFor />
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
