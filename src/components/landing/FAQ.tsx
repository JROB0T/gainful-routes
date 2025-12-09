import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
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
    <section id="faq" className="py-12 md:py-24 bg-background">
      <div className="container px-4 md:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
            Frequently Asked{" "}
            <span className="text-gradient-primary">Questions</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know before getting started
          </p>
        </div>

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
      </div>
    </section>
  );
}
