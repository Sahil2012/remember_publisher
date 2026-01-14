
"use client";

import { motion } from "framer-motion";
import { content } from "@/data/content";

export function Testimonials() {
    const { testimonials } = content;

    return (
        <section id="stories" className="py-32 bg-secondary/5 relative overflow-hidden">
            {/* Elegant Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] mix-blend-multiply"></div>

            <div className="container px-6 md:px-8 mx-auto max-w-7xl relative z-10">
                <div className="mb-24 text-center max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl md:text-6xl font-serif font-normal tracking-tight mb-6 text-foreground">
                            Stories Worth Keeping.
                            <span className="text-pencil-red ml-1">.</span>
                        </h2>
                        <p className="text-lg md:text-xl text-muted-foreground/80 font-sans font-light leading-relaxed">
                            Hear from those who have turned their memories into a legacy.
                        </p>
                    </motion.div>
                </div>

                {/* Staggered Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 max-w-5xl mx-auto items-start">
                    {testimonials.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: index * 0.2 }}
                            className={`relative group bg-background p-10 rounded-[2rem] shadow-sm border border-border/40 hover:shadow-md transition-shadow duration-500 ${index % 2 === 1 ? 'md:mt-24' : ''
                                }`}
                        >
                            {/* Decorative Quote Mark */}
                            <div className="absolute -top-6 -left-4 text-primary/10 transition-transform duration-500 group-hover:scale-110">
                                <svg width="60" height="60" viewBox="0 0 100 100" fill="currentColor">
                                    <path d="M20,40 Q20,20 40,20 H50 V50 H30 Q30,60 40,70 L30,80 Q10,60 20,40 Z" />
                                </svg>
                            </div>

                            <div className="relative z-10">
                                <p className="text-xl md:text-2xl font-serif text-foreground leading-relaxed mb-8">
                                    “{item.quote}”
                                </p>

                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-foreground font-serif text-lg font-medium">
                                        {item.author.charAt(0)}
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <div className="font-sans font-semibold text-foreground tracking-wide text-sm uppercase">{item.author}</div>
                                        <div className="font-serif italic text-muted-foreground text-sm">{item.role}</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
