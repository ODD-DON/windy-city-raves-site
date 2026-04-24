"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Send, CheckCircle, Gift, Video, Pin, Bell } from "lucide-react"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"

const packages = [
  { id: "boost", name: "Boost", price: 99 },
  { id: "amplify", name: "Amplify", price: 249 },
  { id: "takeover", name: "Takeover", price: 599 },
  { id: "custom", name: "Custom Package", price: 0 },
]

const addons = [
  { id: "giveaway", name: "Giveaway Boost", price: 150, icon: Gift },
  { id: "reel", name: "Reel Creation", price: 150, icon: Video },
  { id: "pinned", name: "Pinned Post / Priority", price: 75, icon: Pin },
  { id: "reminder", name: "Extra Story Reminder", price: 40, icon: Bell },
]

export function ContactForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<string>("")
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])

  const totalPrice = useMemo(() => {
    const pkg = packages.find((p) => p.id === selectedPackage)
    const packagePrice = pkg?.price || 0
    const addonsPrice = selectedAddons.reduce((sum, addonId) => {
      const addon = addons.find((a) => a.id === addonId)
      return sum + (addon?.price || 0)
    }, 0)
    return packagePrice + addonsPrice
  }, [selectedPackage, selectedAddons])

  const handleAddonToggle = (addonId: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId)
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId]
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const pkg = packages.find((p) => p.id === selectedPackage)
    const selectedAddonDetails = selectedAddons.map((id) => {
      const addon = addons.find((a) => a.id === id)
      return { name: addon?.name || "", price: addon?.price || 0 }
    })

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          company: formData.get("company"),
          eventName: formData.get("eventName"),
          eventDate: formData.get("eventDate"),
          venue: formData.get("venue"),
          instagram: formData.get("instagram"),
          email: formData.get("email"),
          packageName: pkg?.name || "Custom",
          packagePrice: pkg?.price || 0,
          addons: selectedAddonDetails,
          totalPrice,
          assetsLink: formData.get("assetsLink"),
          message: formData.get("message"),
        }),
      })

      if (response.ok) {
        setIsSubmitted(true)
      } else {
        alert("Failed to send inquiry. Please try again.")
      }
    } catch {
      alert("Failed to send inquiry. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <section id="contact" className="py-20 md:py-28 relative overflow-x-clip overflow-y-visible w-full max-w-full">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-12 rounded-2xl bg-card border border-primary/30">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Inquiry Sent!
            </h3>
            <p className="text-muted-foreground">
              {"Thanks for reaching out. We'll get back to you within 24 hours to discuss your event promotion."}
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="contact" className="py-20 md:py-28 relative overflow-x-clip overflow-y-visible w-full max-w-full">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent pointer-events-none" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">
            Get Started
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-4 mb-6">
            Book Your Promotion
          </h2>
          <p className="text-muted-foreground text-lg">
            Fill out the form below and we&apos;ll get back to you within 24 hours.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Name *</FieldLabel>
                <Input
                  id="name"
                  name="name"
                  placeholder="Your name"
                  required
                  className="bg-card border-border focus:border-primary"
                />
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="company">Company / Brand</FieldLabel>
                <Input
                  id="company"
                  name="company"
                  placeholder="Company or brand name"
                  className="bg-card border-border focus:border-primary"
                />
              </Field>
            </FieldGroup>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="eventName">Event Name *</FieldLabel>
                <Input
                  id="eventName"
                  name="eventName"
                  placeholder="Name of your event"
                  required
                  className="bg-card border-border focus:border-primary"
                />
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="eventDate">Event Date</FieldLabel>
                <Input
                  id="eventDate"
                  name="eventDate"
                  type="date"
                  className="bg-card border-border focus:border-primary"
                />
              </Field>
            </FieldGroup>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="venue">Venue</FieldLabel>
                <Input
                  id="venue"
                  name="venue"
                  placeholder="Venue name"
                  className="bg-card border-border focus:border-primary"
                />
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="instagram">Instagram Handle</FieldLabel>
                <Input
                  id="instagram"
                  name="instagram"
                  placeholder="@yourhandle"
                  className="bg-card border-border focus:border-primary"
                />
              </Field>
            </FieldGroup>
          </div>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email *</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                required
                className="bg-card border-border focus:border-primary"
              />
            </Field>
          </FieldGroup>

          {/* Package Selection */}
          <FieldGroup>
            <Field>
              <FieldLabel>Package *</FieldLabel>
              <Select 
                name="package" 
                value={selectedPackage}
                onValueChange={setSelectedPackage}
                required
              >
                <SelectTrigger className="bg-card border-border">
                  <SelectValue placeholder="Select a package" />
                </SelectTrigger>
                <SelectContent>
                  {packages.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      {pkg.name} {pkg.price > 0 && `($${pkg.price})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>

          {/* Add-ons Multi-select */}
          <FieldGroup>
            <Field>
              <FieldLabel>Add-Ons (Optional)</FieldLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {addons.map((addon) => (
                  <label
                    key={addon.id}
                    className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedAddons.includes(addon.id)
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-muted-foreground/50"
                    }`}
                  >
                    <Checkbox
                      checked={selectedAddons.includes(addon.id)}
                      onCheckedChange={() => handleAddonToggle(addon.id)}
                    />
                    <addon.icon className="w-4 h-4 text-secondary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-foreground block truncate">
                        {addon.name}
                      </span>
                      <span className="text-xs text-primary font-semibold">
                        +${addon.price}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </Field>
          </FieldGroup>

          {/* Price Total */}
          {(selectedPackage || selectedAddons.length > 0) && selectedPackage !== "custom" && (
            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estimated Total</span>
                <span className="text-2xl font-bold text-foreground">
                  ${totalPrice}
                </span>
              </div>
              {selectedAddons.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  {packages.find((p) => p.id === selectedPackage)?.name || "Package"} + {selectedAddons.length} add-on{selectedAddons.length > 1 ? "s" : ""}
                </p>
              )}
            </div>
          )}

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="assetsLink">Link to Assets (Google Drive, Dropbox, etc.)</FieldLabel>
              <Input
                id="assetsLink"
                name="assetsLink"
                placeholder="https://drive.google.com/..."
                className="bg-card border-border focus:border-primary"
              />
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="message">Message</FieldLabel>
              <Textarea
                id="message"
                name="message"
                placeholder="Tell us about your event and what you're looking for..."
                rows={4}
                className="bg-card border-border focus:border-primary resize-none"
              />
            </Field>
          </FieldGroup>

          <Button
            type="submit"
            size="lg"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg py-6 transition-all hover:scale-[1.02]"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Sending...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Secure My Spot
                <Send className="w-5 h-5" />
              </span>
            )}
          </Button>
        </form>
      </div>
    </section>
  )
}
