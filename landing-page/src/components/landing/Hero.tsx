
"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { content } from "@/data/content";

export function Hero() {
    const { hero } = content;

    return (
        <section className="relative min-h-[90vh] flex flex-col justify-center items-center overflow-hidden bg-background pt-32 pb-20">

            <div className="container px-4 md:px-6 relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto">

                {/* Subtle Social Proof / Label - "Eyebrow" text */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-8"
                >
                    <span className="text-sm font-semibold tracking-widest uppercase text-muted-foreground/80">
                        {hero.socialProof.split('|')[0].trim()}
                    </span>
                </motion.div>

                {/* Headline: The Star of the Show */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tighter text-foreground mb-8 leading-[1.05] text-balance"
                >
                    {hero.headline}
                </motion.h1>

                {/* Subheadline: Large, readable, clean */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="text-xl md:text-2xl text-muted-foreground/90 max-w-2xl mb-12 leading-relaxed font-medium tracking-tight"
                >
                    {hero.subheadline}
                </motion.p>

                {/* CTAs: Simple, pill-shaped */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col sm:flex-row items-center gap-6"
                >
                    <Button
                        size="lg"
                        className="rounded-full px-8 h-14 text-lg font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-none"
                    >
                        {hero.primaryCta}
                    </Button>
                    <Button
                        variant="link"
                        size="lg"
                        className="text-lg text-primary font-medium hover:no-underline hover:opacity-70 transition-opacity"
                    >
                        {hero.secondaryCta} <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                </motion.div>
            </div>

            {/* Hero Image/Graphic Placeholder - Clean and minimal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="mt-20 w-full max-w-[1200px] px-4 md:px-6"
            >
                <div className="aspect-[21/9] bg-secondary/50 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center border border-border/50">
                    <span className="text-muted-foreground/30 text-lg font-medium tracking-widest uppercase">
                        Product Interface Placeholder
                    </span>
                </div>
            </motion.div>

        </section>
    );
}
