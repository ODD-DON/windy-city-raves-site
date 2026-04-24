"use client"

import { Hero } from "@/components/hero"
import { PartnersSection } from "@/components/partners-section"
import { ProofSection } from "@/components/proof-section"
import { WhySection } from "@/components/why-section"
import { ResultsSection } from "@/components/results-section"
import { PackagesSection } from "@/components/packages-section"
import { AddOnsSection } from "@/components/addons-section"
import { WhyWorksSection } from "@/components/why-works-section"

import { FAQSection } from "@/components/faq-section"
import { FinalCTA } from "@/components/final-cta"
import { ContactForm } from "@/components/contact-form"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-white w-full max-w-full overflow-x-clip">
      <Hero />
      <PartnersSection />
      <ProofSection />
      <WhySection />
      <ResultsSection />
      <PackagesSection />
      <AddOnsSection />
      <WhyWorksSection />
      <FAQSection />
      <FinalCTA />
      <ContactForm />
      <Footer />
    </main>
  )
}
