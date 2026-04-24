"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "What types of events do you promote?",
    answer:
      "We promote a wide range of events including club nights, festivals, concert series, DJ performances, warehouse parties, and special event nights. If it's EDM or nightlife-related in Chicago, we can help.",
  },
  {
    question: "Do you only promote EDM events?",
    answer:
      "While our primary audience is the Chicago EDM community, we also work with events that overlap with nightlife culture—house, techno, bass music, and genre-blending events are all a great fit.",
  },
  {
    question: "How far in advance should I book?",
    answer:
      "We recommend booking at least 1-2 weeks before your event for optimal results. However, we can accommodate last-minute requests when possible. For major events or festivals, booking 3-4 weeks out is ideal.",
  },
  {
    question: "Can I customize a package?",
    answer:
      "Absolutely. Our packages are starting points—we're happy to create custom promotional campaigns based on your specific event, budget, and goals. Reach out and we'll build something tailored.",
  },
  {
    question: "Do you offer giveaways?",
    answer:
      "Yes! Giveaways are one of our most effective promotional tools. They drive high engagement and expand reach significantly. You can add a giveaway boost to any package or include it in a custom campaign.",
  },
  {
    question: "Do you create content too?",
    answer:
      "Yes, we write professional captions and can create reel content for an additional fee. We handle the creative so you can focus on your event.",
  },
]

export function FAQSection() {
  return (
    <section id="faq" className="py-20 md:py-28 relative overflow-x-clip w-full max-w-full">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-4 mb-6">
            Questions?
          </h2>
        </div>

        {/* Accordion */}
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-primary/50 transition-colors"
            >
              <AccordionTrigger className="text-left text-foreground hover:text-primary py-5">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
