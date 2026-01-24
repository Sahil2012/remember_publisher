
"use client";

import { motion } from "framer-motion";
import { BookHeart, Briefcase, Calendar, ArrowRight } from "lucide-react";
import { content } from "@/data/content";
import Image from "next/image";

const iconMap: Record<string, React.ElementType> = {
    BookHeart,
    Briefcase,
    Calendar,
};

const imageMap: Record<number, string> = {
    0: "/life_story.png",
    1: "/business-book.png",
    2: "/yearbook.png",
};

export function Features() {
    const { offerings } = content;

    return (
        <section id="offerings" className="pt-16 pb-24 bg-background overflow-hidden scroll-mt-12">
            <div className="container px-6 md:px-8 mx-auto max-w-7xl">

                {/* Section Header */}
                <div className="mb-12 md:mb-24 text-center max-w-3xl mx-auto">

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl md:text-6xl font-serif font-medium tracking-tight mb-4 text-foreground"
                    >
                        Preserve Every Chapter.
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="hidden md:block text-xl text-muted-foreground font-sans font-light leading-relaxed"
                    >
                        Choose the perfect format for your story. From personal memoirs to corporate legacies, we craft timeless heirlooms.
                    </motion.p>
                </div>

                {/* Offerings Zig-Zag Layout */}
                <div className="space-y-24 md:space-y-24">
                    {offerings.map((offer, index) => {
                        const Icon = iconMap[offer.icon] || BookHeart;
                        const isEven = index % 2 === 0;

                        return (
                            <div
                                key={index}
                                className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12 md:gap-24`}
                            >
                                {/* Content Side */}
                                <motion.div
                                    initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="flex-1 space-y-8"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center justify-center w-12 h-12 bg-luxury-gold/10 rounded-2xl text-luxury-gold">
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <span className="text-sm font-bold tracking-widest uppercase text-muted-foreground/60">
                                            {offer.label}
                                        </span>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-3xl md:text-4xl font-serif font-medium leading-tight text-foreground">
                                            {offer.title}
                                        </h3>
                                        <p className="text-lg md:text-xl text-muted-foreground font-sans font-light leading-relaxed">
                                            {offer.description}
                                        </p>
                                    </div>

                                    <motion.button
                                        whileHover={{ x: 5 }}
                                        className="cursor-pointer group flex items-center gap-2 text-foreground font-medium border-b border-luxury-gold/30 pb-1 hover:border-luxury-gold transition-all"
                                    >
                                        Explore this format
                                        <ArrowRight className="w-4 h-4 text-luxury-gold group-hover:translate-x-1 transition-transform" />
                                    </motion.button>
                                </motion.div>

                                {/* Image/Mockup Side */}
                                <motion.div
                                    initial={{ opacity: 0, x: isEven ? 40 : -40 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                                    className="flex-1 w-full"
                                >
                                    <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl group">
                                        <Image
                                            src={imageMap[index]}
                                            alt={offer.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    </div>
                                </motion.div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
