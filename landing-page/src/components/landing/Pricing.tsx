
import Link from "next/link";
import { pricingTiers } from "@/data/content";
import { Button } from "@/components/ui/button";

export const Pricing = () => {
    return (
        <section id="pricing" className="py-16 md:py-20 bg-background border-t border-border/40">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-14 md:mb-16">
                    <span className="text-sm font-sans font-medium tracking-widest uppercase text-muted-foreground/60">
                        Editions
                    </span>
                    <h2 className="text-4xl md:text-5xl font-serif font-medium tracking-tight text-foreground">
                        Create Your Legacy
                    </h2>
                    <p className="text-sm md:text-base font-sans text-muted-foreground max-w-2xl leading-relaxed">
                        <span className="text-luxury-gold font-medium">$49 per month</span> or save and get <span className="text-luxury-gold font-medium">12 months’ subscription for just $294</span>. Get 6 months free access and enjoy the process without pressure.
                    </p>
                </div>

                <div className="flex md:grid-cols-1 gap-x-12 gap-y-16 max-w-5xl mx-auto justify-center">
                    {pricingTiers.map((tier) => (
                        <div key={tier.name} className="flex flex-col group">
                            {/* Header */}
                            <div className={`border-t pt-6 min-h-[180px] ${tier.mostPopular ? "border-luxury-gold/40" : "border-foreground/10"}`}>
                                <div className="flex justify-between items-baseline mb-4">
                                    <h3 className="text-xl font-serif font-medium text-foreground">
                                        {tier.name}
                                    </h3>
                                    {tier.mostPopular && (
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-luxury-gold px-3 py-1 border border-luxury-gold/40 rounded-full">
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
                                            <span className="mr-3 text-luxury-gold">—</span>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* CTA */}
                            <div className="pt-4">
                                <Link target="_blank" href="https://remember-publisher.vercel.app/">
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
