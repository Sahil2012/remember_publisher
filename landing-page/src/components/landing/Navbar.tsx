
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Button } from "@/components/ui/button";
import { content } from "@/data/content";

export function Navbar() {
    const { footer } = content;
    const [scrolled, setScrolled] = useState(false);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        setScrolled(latest > 20);
    });

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/80 backdrop-blur-md border-b border-border/40 py-2 shadow-sm" : "bg-transparent py-2"
                }`}
        >
            <div className="container mx-auto px-6 md:px-8 max-w-7xl flex items-center justify-between">

                {/* Brand - Now in Serif */}
                {/* Brand */}
                <Link href="/" className="relative w-50 h-15">
                    <img src="/rb-press.png" alt="Remember Press" className="object-contain w-full h-full object-left" />
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center space-x-8">
                    {footer.links.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="text-sm font-sans font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-4">

                    <Link href="https://remember-publisher.vercel.app/">
                        <Button size="sm" className="cursor-pointer rounded-full px-6 h-10 font-sans font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors shadow-md">
                            Get Started
                        </Button>
                    </Link>
                </div>

            </div>
        </motion.header>
    );
}
