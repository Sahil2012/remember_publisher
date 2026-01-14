
"use client";

import { motion } from "framer-motion";
import { content } from "@/data/content";

export function HowItWorks() {
    const { howItWorks } = content;

    return (
        <section id="process" className="py-32 bg-background relative overflow-hidden">

            <div className="container px-6 md:px-8 mx-auto max-w-4xl relative z-10">

                <div className="text-center mb-32">
                    <span className="text-sm font-sans font-semibold tracking-widest uppercase text-muted-foreground mb-4 block">
                        The Process
                    </span>
                    <h2 className="text-4xl md:text-6xl font-serif font-medium tracking-tight text-foreground">
                        {howItWorks.heading}
                    </h2>
                </div>

                <div className="space-y-36">
                    {howItWorks.steps.map((item, index) => (
                        <div key={index} className="relative group">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className={`flex flex-col md:flex-row gap-8 md:gap-20 items-center ${index % 2 === 1 ? "md:flex-row-reverse" : ""
                                    }`}
                            >
                                {/* Number Circle - Thin Elegant Ring */}
                                <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
                                    <svg className="absolute inset-0 w-full h-full text-marker-blue/30 rotate-45" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                                        <circle cx="50" cy="50" r="48" strokeWidth="1" />
                                        {/* Inner inconsistent ring for slight handmade feel but very subtle */}
                                        <path d="M50,10 Q90,10 90,50 T50,90 T10,50 T50,10" strokeWidth="0.5" opacity="0.5" />
                                    </svg>
                                    <span className="text-5xl font-serif font-bold text-foreground relative z-10">
                                        {item.step}
                                    </span>
                                </div>

                                <div className={`text-center md:text-left ${index % 2 === 1 ? "md:text-right" : ""}`}>
                                    <h3 className="text-3xl font-serif font-medium text-foreground mb-4">
                                        {item.title}
                                    </h3>
                                    <p className="text-xl text-muted-foreground/90 leading-relaxed font-sans font-light">
                                        {item.description}
                                    </p>
                                </div>
                            </motion.div>

                            {/* Graceful Connector Line (Thin) */}
                            {index < howItWorks.steps.length - 1 && (
                                <div className={`hidden md:block absolute -bottom-32 w-px h-32 bg-foreground/10 pointer-events-none transform
                        ${index % 2 === 0 ? "left-1/2" : "left-1/2"}
                    `}>
                                    {/* Option B: Simple straight line down middle for structure */}
                                </div>
                            )}

                            {/* Alternative Connector: Curved thin line */}
                            {index < howItWorks.steps.length - 1 && (
                                <svg className="hidden md:block absolute -bottom-32 left-1/2 -translate-x-1/2 w-48 h-32 text-foreground/10 pointer-events-none" viewBox="0 0 200 100" fill="none" stroke="currentColor">
                                    {index % 2 === 0
                                        ? <path d="M100,0 Q150,50 100,100" strokeWidth="1" />
                                        : <path d="M100,0 Q50,50 100,100" strokeWidth="1" />
                                    }
                                </svg>
                            )}

                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
