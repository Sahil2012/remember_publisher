
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
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border/40 py-4" : "bg-transparent py-6"
                }`}
        >
            <div className="container mx-auto px-6 md:px-8 max-w-7xl flex items-center justify-between">

                {/* Brand */}
                <Link href="/" className="text-xl font-semibold tracking-tight text-foreground">
                    Life Scribe
                </Link>

                {/* Desktop Nav - Centered & Minimal */}
                <nav className="hidden md:flex items-center space-x-8">
                    {footer.links.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <Link href="#" className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Log in
                    </Link>
                    <Button size="sm" className="rounded-full px-5 h-9 font-medium text-sm bg-foreground text-background hover:bg-foreground/90 transition-colors">
                        Get Started
                    </Button>
                </div>

            </div>
        </motion.header>
    );
}
