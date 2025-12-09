import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "CareerMovr gave me the confidence to make a career pivot I'd been considering for years.",
    author: "Sarah M.",
    role: "Marketing → Product",
  },
  {
    quote:
      "The roadmap helped me understand exactly what steps to take. No more guessing.",
    author: "James T.",
    role: "Engineering Manager",
  },
  {
    quote:
      "It finally matched me to roles that make sense for my background and interests.",
    author: "Emily R.",
    role: "Recent Graduate",
  },
];

export function Testimonials() {
  return (
    <section className="py-12 md:py-24 bg-secondary/30">
      <div className="container px-4 md:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
            What Users <span className="text-gradient-primary">Say</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Real feedback from people who found their path
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative p-6 rounded-2xl bg-card border border-border"
              style={{ maxWidth: "90%", margin: "0 auto" }}
            >
              <Quote className="w-8 h-8 text-primary/20 mb-4" />
              
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-warning text-warning"
                  />
                ))}
              </div>

              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>

              <div className="border-t border-border pt-4">
                <p className="font-semibold text-foreground">
                  {testimonial.author}
                </p>
                <p className="text-sm text-muted-foreground">
                  {testimonial.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
