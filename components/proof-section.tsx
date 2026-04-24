export function ProofSection() {
  return (
    <section className="py-12 md:py-16 bg-muted/30 overflow-x-clip w-full max-w-full">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Real Results, Real Reach
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Our top posts consistently reach millions of views across Chicago and beyond.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-card rounded-xl border border-border">
            <div className="text-2xl md:text-3xl font-bold text-primary">7.6M</div>
            <div className="text-xs text-muted-foreground">Top Post Views</div>
          </div>
          <div className="text-center p-4 bg-card rounded-xl border border-border">
            <div className="text-2xl md:text-3xl font-bold text-primary">5.1M</div>
            <div className="text-xs text-muted-foreground">Second Post Views</div>
          </div>
          <div className="text-center p-4 bg-card rounded-xl border border-border">
            <div className="text-2xl md:text-3xl font-bold text-primary">3.1M</div>
            <div className="text-xs text-muted-foreground">Third Post Views</div>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Combined reach of <span className="font-semibold text-foreground">15.8 million views</span> on our top 3 posts alone.
        </p>
      </div>
    </section>
  )
}
