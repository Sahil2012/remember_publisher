
"use client";

import { motion } from "framer-motion";
import { content } from "@/data/content";

export function HowItWorks() {
    const { howItWorks } = content;

    return (
        <section id="how-it-works" className="py-32 bg-background">
            <div className="container px-6 md:px-8 mx-auto max-w-4xl">

                <div className="text-center mb-24">
                    <span className="text-sm font-semibold tracking-widest uppercase text-muted-foreground mb-4 block">
                        The Process
                    </span>
                    <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter text-foreground">
                        {howItWorks.heading}
                    </h2>
                </div>

                <div className="space-y-24 relative before:absolute before:left-[19px] md:before:left-1/2 before:top-4 before:bottom-4 before:w-[2px] before:bg-border/50 before:-translate-x-1/2">
                    {howItWorks.steps.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className={`relative flex flex-col md:flex-row gap-8 md:gap-16 items-start md:items-center ${index % 2 === 0 ? "md:flex-row-reverse text-left md:text-right" : "text-left"
                                }`}
                        >
                            {/* Timeline Node */}
                            <div className="absolute left-[19px] md:left-1/2 top-0 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 w-10 h-10 bg-background border-[4px] border-secondary rounded-full z-10 flex items-center justify-center">
                                <div className="w-3 h-3 bg-foreground rounded-full" />
                            </div>

                            {/* Spacer for the other side */}
                            <div className="hidden md:block w-1/2" />

                            {/* Content */}
                            <div className="pl-16 md:pl-0 w-full md:w-1/2">
                                <span className="text-6xl font-semibold text-secondary/40 -ml-1 block mb-2 tracking-tighter">
                                    0{item.step}
                                </span>
                                <h3 className="text-2xl font-semibold text-foreground mb-3 tracking-tight">
                                    {item.title}
                                </h3>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
}
