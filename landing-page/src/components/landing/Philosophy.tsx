"use client";

import { motion } from "framer-motion";

export function Philosophy() {
    return (
        <section className="py-24 md:py-32 bg-foreground text-background relative overflow-hidden">
            {/* Subtle Texture / Gradient for depth */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-luxury-gold via-background to-background pointer-events-none" />

            <div className="container px-6 md:px-8 mx-auto max-w-5xl relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">

                    {/* Left Typography / Quote Focus */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="lg:col-span-7 space-y-10"
                    >
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium leading-[1.1] tracking-tight text-white mb-8">
                            We&apos;ve created our system to make writing doable, enjoyable, and fast.
                        </h2>

                        <div className="space-y-6 text-lg md:text-xl text-white/70 font-sans font-light leading-relaxed">
                            <p>
                                Writing a book doesn&apos;t have to feel overwhelming&mdash;not when you have a roadmap, and a partner in your corner.
                            </p>

                            <p>
                                With our system you have clarity, momentum&mdash;and if it all seems too much just for you?
                            </p>

                            <p className="text-white font-medium">
                                We can supply you with the best editors and ghostwriters there are.
                            </p>

                            <div className="pt-6 mt-6 border-t border-white/10">
                                <p className="text-base font-medium tracking-wide text-luxury-gold uppercase">
                                    We&apos;re not one size fits all&mdash;because we know everyone is different, and every book is different.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Statement block */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="lg:col-span-5 relative"
                    >
                        <div className="relative p-8 md:p-12 before:absolute before:inset-0 before:border-l before:border-b before:border-luxury-gold/30 before:-ml-4 before:-mb-4">
                            <p className="text-3xl md:text-5xl font-serif italic text-luxury-gold leading-tight relative z-10">
                                &quot;Your story deserves to be told. <br /><br />
                                <span className="text-white">Let&apos;s make sure it is.&quot;</span>
                            </p>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
