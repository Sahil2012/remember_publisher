
"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { content } from "@/data/content";

export function Testimonials() {
    const { testimonials } = content;

    return (
        <section id="examples" className="py-32 bg-secondary/30">
            <div className="container px-6 md:px-8 mx-auto max-w-7xl">
                <div className="mb-24">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-semibold tracking-tighter mb-4 text-center"
                    >
                        Stories Worth Keeping.
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 max-w-5xl mx-auto">
                    {testimonials.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="flex flex-col items-center text-center"
                        >
                            <Quote className="w-8 h-8 text-primary/20 mb-8" />

                            <p className="text-2xl md:text-3xl font-medium tracking-tight text-foreground mb-8 leading-snug">
                                “{item.quote}”
                            </p>

                            <div className="flex flex-col items-center gap-1">
                                <div className="font-semibold text-foreground tracking-tight">{item.author}</div>
                                <div className="text-sm text-muted-foreground uppercase tracking-widest text-xs font-medium">{item.role}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
