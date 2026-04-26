
import Link from "next/link";
import { pricingTiers } from "@/data/content";
import { Button } from "@/components/ui/button";

export const Pricing = () => {
    return (
        <section id="pricing" className="py-16 md:py-20 bg-background border-t border-border/40">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-14 md:mb-16 px-4">
                    <span className="text-sm font-sans font-medium tracking-widest uppercase text-muted-foreground/60">
                        Editions
                    </span>
                    <h2 className="text-4xl md:text-5xl font-serif font-medium tracking-tight text-foreground">
                        Create Your Legacy
                    </h2>
                    <p className="text-sm md:text-base font-sans text-muted-foreground max-w-2xl leading-relaxed">
                        Start with a flexible <span className="text-luxury-gold font-medium">Monthly Membership</span> or choose the <span className="text-luxury-gold font-medium">Yearly Legacy</span> to save 50%—effectively getting 6 months of free access to perfect your story.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-8 lg:gap-12 max-w-5xl mx-auto justify-center px-4">
                    {pricingTiers.map((tier) => (
                        <div key={tier.name} className="flex flex-col group w-full md:w-[400px]">
                            {/* Header */}
                            <div className={`border-t pt-8 min-h-[160px] ${tier.mostPopular ? "border-luxury-gold/60" : "border-foreground/10"}`}>
                                <div className="flex justify-between items-baseline mb-5">
                                    <h3 className="text-2xl font-serif font-medium text-foreground">
                                        {tier.name}
                                    </h3>
                                    {tier.mostPopular && (
                                        <span className="text-[10px] uppercase tracking-widest font-bold bg-luxury-gold/10 text-luxury-gold px-3 py-1 border border-luxury-gold/30 rounded-full">
                                            Recommended
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-baseline text-foreground mb-6">
                                    <span className="text-5xl font-serif font-normal tracking-tight">
                                        {tier.price}
                                    </span>
                                    {tier.unit && (
                                        <span className="ml-2 text-sm text-muted-foreground font-sans lowercase">
                                            {tier.unit}
                                        </span>
                                    )}
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
                                            <span className="mr-3 text-luxury-gold">—</span>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* CTA */}
                            <div className="pt-4">
                                <Link target="_blank" href="https://app.rememberpress.com/">
                                    <Button
                                        className={`w-full h-12 text-sm font-medium rounded-full transition-all duration-300 ${tier.mostPopular
                                            ? "bg-foreground text-background hover:bg-foreground/90 shadow-md"
                                            : "bg-transparent text-foreground border border-foreground/20 hover:border-foreground hover:bg-transparent"
                                            }`}
                                        variant={tier.mostPopular ? "default" : "outline"}
                                    >
                                        {tier.cta}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
