
import { pricingTiers } from "@/data/content";
import { Button } from "@/components/ui/button";

export const Pricing = () => {
    return (
        <section id="pricing" className="py-24 bg-background border-t border-border/40">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-24">
                    <span className="text-sm font-sans font-medium tracking-widest uppercase text-muted-foreground/60">
                        Editions
                    </span>
                    <h2 className="text-4xl md:text-5xl font-serif font-medium tracking-tight text-foreground">
                        Invest in Your Legacy
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-16 max-w-7xl mx-auto">
                    {pricingTiers.map((tier) => (
                        <div key={tier.name} className="flex flex-col group">
                            {/* Header */}
                            <div className="border-t border-foreground/10 pt-6 min-h-[180px]">
                                <div className="flex justify-between items-baseline mb-4">
                                    <h3 className="text-xl font-serif font-medium text-foreground">
                                        {tier.name}
                                    </h3>
                                    {tier.mostPopular && (
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-pencil-red">
                                            Recommended
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-baseline text-foreground mb-4">
                                    <span className="text-4xl font-serif font-normal tracking-tight">
                                        {tier.price}
                                    </span>
                                </div>

                                <p className="text-sm text-muted-foreground leading-relaxed font-sans max-w-[90%]">
                                    {tier.description}
                                </p>
                            </div>

                            {/* Features */}
                            <div className="flex-1 py-8">
                                <ul className="space-y-4">
                                    {tier.features.map((feature) => (
                                        <li key={feature} className="flex items-start text-sm text-foreground/80 font-light">
                                            <span className="mr-3 text-pencil-red/60">—</span>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* CTA */}
                            <div className="pt-4">
                                <Button
                                    className={`w-full h-12 text-sm font-medium rounded-full transition-all duration-300 ${tier.mostPopular
                                        ? "bg-foreground text-background hover:bg-foreground/90 shadow-md"
                                        : "bg-transparent text-foreground border border-foreground/20 hover:border-foreground hover:bg-transparent"
                                        }`}
                                    variant={tier.mostPopular ? "default" : "outline"}
                                >
                                    {tier.cta}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
