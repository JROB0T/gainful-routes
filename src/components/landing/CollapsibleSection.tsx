import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CollapsibleSectionProps {
  title: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  id?: string;
}

export function CollapsibleSection({
  title,
  subtitle,
  children,
  defaultOpen = false,
  className = "",
  id,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section id={id} className={className}>
      <div className="container px-4 md:px-6 max-w-7xl mx-auto">
        {/* Clickable Header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full text-center mb-8 md:mb-12 group cursor-pointer focus:outline-none"
          aria-expanded={isOpen}
        >
          <div className="flex flex-col items-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4 transition-colors group-hover:text-primary/90">
              {title}
            </h2>
            {subtitle && (
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
                {subtitle}
              </p>
            )}
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors"
            >
              <ChevronDown className="w-5 h-5 text-primary" />
            </motion.div>
          </div>
        </button>

        {/* Collapsible Content */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ 
                height: "auto", 
                opacity: 1,
                transition: {
                  height: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
                  opacity: { duration: 0.3, delay: 0.1 }
                }
              }}
              exit={{ 
                height: 0, 
                opacity: 0,
                transition: {
                  height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
                  opacity: { duration: 0.2 }
                }
              }}
              className="overflow-hidden"
            >
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                exit={{ y: -20 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                {children}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
