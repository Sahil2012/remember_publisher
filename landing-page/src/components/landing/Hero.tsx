
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { content } from "@/data/content";

export function Hero() {
    const { hero } = content;

    return (
        <section className="relative min-h-[90vh] flex flex-col justify-center pt-24 lg:pt-32 pb-20 overflow-hidden bg-background">

            <div className="container px-6 md:px-8 mx-auto max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">

                    {/* Left Column: Power Content */}
                    <div className="flex flex-col items-start text-left z-20">

                        {/* Minimal Eyebrow - Refined Spacing */}
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="mb-8 pl-1"
                        >
                            <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-muted-foreground/60">
                                {hero.socialProof}
                            </span>
                        </motion.div>

                        {/* Headline - STRICT 2 LINES & Power Words */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                            className="mb-8 relative"
                        >
                            <h1 className="text-5xl md:text-7xl lg:text-[6.5rem] font-serif font-normal tracking-tighter text-foreground leading-[1] whitespace-pre-line">
                                {hero.heading.split(',')[0]},
                                <span className="block text-muted-foreground/80">{hero.heading.split(',')[1].trim()}</span>
                            </h1>

                            {/* Abstract Scribble Accent on Text - Refined position */}
                            <div className="absolute -left-16 top-10 w-32 h-32 text-luxury-gold/30 -z-10 hidden lg:block rotate-12 opacity-80">
                                <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className="scribble-drawn">
                                    <path d="M10,10 Q50,50 10,90 M20,20 Q60,60 20,80" strokeWidth="1" />
                                </svg>
                            </div>

                        </motion.div>

                        {/* Subheadline - Emotional Connect */}
                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className="text-lg md:text-2xl text-muted-foreground/80 max-w-lg mb-10 leading-relaxed font-sans font-light tracking-wide"
                        >
                            {hero.subheadline}
                        </motion.p>

                        {/* CTAs - Apple Style Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="flex flex-col sm:flex-row items-center gap-5 w-full"
                        >
                            <Link target="_blank" href="https://remember-publisher.vercel.app/">
                                <Button
                                    size="lg"
                                    className="cursor-pointer rounded-full px-10 h-14 text-lg font-medium bg-foreground text-background hover:bg-foreground/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto"
                                >
                                    {hero.primaryCta}
                                </Button>
                            </Link>
                            <Link href="#process">
                                <Button
                                    variant="link"
                                    size="lg"
                                    className="text-lg text-foreground/80 font-medium hover:text-foreground hover:no-underline group w-full sm:w-auto justify-start"
                                >
                                    {hero.secondaryCta} <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </motion.div>

                    </div>

                    {/* Right Column: The Photo */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        transition={{ duration: 1.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full aspect-square flex items-center justify-center lg:justify-end"
                    >
                        {/* Image with subtle floating animation */}
                        <motion.div
                            className="relative w-full h-full mx-auto lg:mx-0 lg:ml-auto rounded-3xl overflow-hidden shadow-2xl"
                            animate={{ y: [0, -10, 0] }}
                            transition={{
                                duration: 6,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <Image
                                src="/julie_reading.png"
                                alt="Julie hugging a book on the couch"
                                fill
                                className="object-cover object-center"
                                priority
                            />
                        </motion.div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
