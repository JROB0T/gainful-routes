import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CollapsibleSection } from "./CollapsibleSection";

const faqs = [
  {
    question: "Why does CareerMovr work?",
    answer:
      "CareerMovr uses AI-powered pattern matching personalized to your background — not a generic personality quiz. You get actionable next steps and clarity in minutes, based on your actual skills, experience, and goals.",
  },
  {
    question: "How long does the assessment take?",
    answer:
      "The assessment takes about 3-5 minutes to complete. You can paste your resume or describe your experience, and we'll auto-fill much of your profile, making it even faster.",
  },
  {
    question: "Are the results actually personalized?",
    answer:
      "Yes! Our AI analyzes your specific skills, experience, interests, and goals to generate recommendations tailored to your unique background. No two reports are alike.",
  },
  {
    question: "Is this better than personality quizzes?",
    answer:
      "Absolutely. Unlike generic personality tests, CareerMovr considers your actual work history, skills, and career goals — not just abstract traits. You get actionable paths, not vague categories.",
  },
  {
    question: "Can I use it if I'm unsure what I want?",
    answer:
      "That's exactly who this is for! CareerMovr helps you discover possibilities you might not have considered based on your existing strengths and interests.",
  },
  {
    question: "What do I get with the free version?",
    answer:
      "You can start your profile, begin the assessment, and see a preview of insights. The full career report, 30-day plan, and all detailed recommendations are unlocked with Premium.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. Your data is encrypted and never shared with third parties. We use it only to generate your personalized recommendations.",
  },
];

export function FAQ() {
  return (
    <CollapsibleSection
      id="faq"
      className="py-12 md:py-24 bg-background"
      title={
        <>
          Frequently Asked{" "}
          <span className="text-gradient-primary">Questions</span>
        </>
      }
      subtitle="Everything you need to know before getting started"
    >
      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-border rounded-xl px-6 bg-card data-[state=open]:border-primary/30"
            >
              <AccordionTrigger className="text-left text-foreground hover:no-underline py-4 [&>svg]:text-primary">
                <span className="pr-4">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </CollapsibleSection>
  );
}
