"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function QRSection() {
    return (
        <section className="py-16 md:py-20 bg-background text-foreground relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-luxury-gold via-transparent to-transparent pointer-events-none" />

            <div className="container px-6 md:px-8 mx-auto max-w-5xl relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="lg:col-span-7 space-y-10"
                    >
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium leading-[1.1] tracking-tight text-foreground mb-8">
                            And, with your QR code, stories live FOREVER!
                        </h2>

                        <div className="space-y-6 text-lg md:text-xl text-foreground/70 font-sans font-light leading-relaxed">
                            <p className="text-foreground font-medium">Let&apos;s Chat!</p>

                            <p>
                                Our system gives you a personal QR code to share your book, your story, with the business world, clients, or family and friends -
                            </p>

                            <p>
                                or have it printed on a plaque to tell your loved one&apos;s story to the world.
                            </p>

                            <p>
                                The difference this journey makes is incredible, to everyone who begins...
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="lg:col-span-5 relative"
                    >
                        <div className="relative mb-8 overflow-hidden rounded-sm">
                            <Image
                                src="/qrcodechair.jpg"
                                alt="QR code chair"
                                width={900}
                                height={1200}
                                className="w-full h-auto object-cover"
                            />
                        </div>

                        <div className="relative p-8 md:p-12 before:absolute before:inset-0 before:border-l before:border-b before:border-luxury-gold/40 before:-ml-4 before:-mb-4">
                            <p className="text-3xl md:text-5xl font-serif italic text-luxury-gold leading-tight relative z-10">
                                &quot;Why not now?&quot;
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
