
"use client";

import { motion } from "framer-motion";
import { BookHeart, Briefcase, Calendar, Star } from "lucide-react";
import { content } from "@/data/content";

const iconMap: Record<string, React.ElementType> = {
    BookHeart,
    Briefcase,
    Calendar,
};

export function Features() {
    const { offerings } = content;

    return (
        <section id="offerings" className="py-32 bg-background border-t border-dashed border-border/60">
            <div className="container px-6 md:px-8 mx-auto max-w-7xl">

                <div className="mb-24 max-w-2xl">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl md:text-5xl font-serif font-medium tracking-tight mb-6 text-foreground"
                    >
                        Preserve Every Chapter.
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-xl text-muted-foreground/90 font-sans font-light leading-relaxed"
                    >
                        Choose the perfect format for your story. Designed to be timeless.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-16">
                    {offerings.map((offer, index) => {
                        const Icon = iconMap[offer.icon] || Star;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="group p-6 -ml-6 rounded-3xl hover:bg-secondary/30 transition-colors duration-500"
                            >
                                <div className="flex items-center justify-center w-14 h-14 bg-white shadow-sm rounded-2xl mb-8 text-foreground border border-black/5">
                                    <Icon className="w-7 h-7 stroke-[1.5]" />
                                </div>

                                <h3 className="text-2xl font-serif font-medium tracking-tight mb-4 text-foreground group-hover:text-primary transition-colors">
                                    {offer.title}
                                </h3>

                                <p className="text-lg text-muted-foreground leading-relaxed font-sans font-light">
                                    {offer.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
}
