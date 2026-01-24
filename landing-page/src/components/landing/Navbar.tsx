"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { content } from "@/data/content";

export function Navbar() {
    const { footer } = content;
    const navItems = [
        { label: "Offerings", href: "#offerings" },
        { label: "Process", href: "#process" },
        { label: "Stories", href: "#stories" },
        { label: "Pricing", href: "#pricing" },
    ];
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        setScrolled(latest > 20);
    });

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <>
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || isMenuOpen ? "bg-background/80 backdrop-blur-md border-b border-border/40 py-2 shadow-sm" : "bg-transparent py-2"
                    }`}
            >
                <div className="container mx-auto px-6 md:px-8 max-w-7xl flex items-center justify-between">

                    {/* Brand - Now in Serif */}
                    {/* Brand */}
                    <Link href="/" className="relative w-40 h-14 md:w-48 md:h-14 z-50">
                        <img src="/rb-press.png" alt="Remember Press" className="object-contain w-full h-full object-left" />
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {navItems.map((link) => (
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
                    <div className="flex items-center gap-4 z-50">

                        <Link href="https://remember-publisher.vercel.app/" className="hidden md:block">
                            <Button size="sm" className="cursor-pointer rounded-full px-6 h-10 font-sans font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors shadow-md">
                                Get Started
                            </Button>
                        </Link>

                        {/* Mobile Menu Button */}
                        <Button
                            variant="ghost"
                            onClick={toggleMenu}
                            className="md:hidden text-foreground hover:bg-transparent relative z-50 w-14 h-14 p-0"
                            aria-label="Toggle Menu"
                        >
                            {isMenuOpen ? <X className="w-10 h-10" /> : <Menu className="w-10 h-10" />}
                        </Button>
                    </div>

                </div>
            </motion.header>

            {/* Premium Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: "-100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "-100%" }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed inset-0 z-40 bg-background flex flex-col items-center justify-center p-6 md:hidden"
                    >
                        <motion.nav
                            className="flex flex-col items-center gap-8 w-full"
                            initial="closed"
                            animate="open"
                            exit="closed"
                            variants={{
                                open: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
                                closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } }
                            }}
                        >
                            {navItems.map((link) => (
                                <motion.div
                                    key={link.label}
                                    variants={{
                                        open: { opacity: 1, y: 0 },
                                        closed: { opacity: 0, y: 20 }
                                    }}
                                >
                                    <Link
                                        href={link.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="text-3xl md:text-4xl font-serif text-foreground hover:text-muted-foreground transition-colors tracking-tight"
                                    >
                                        {link.label}
                                    </Link>
                                </motion.div>
                            ))}

                            <motion.div
                                className="pt-8 w-full flex justify-center"
                                variants={{
                                    open: { opacity: 1, y: 0 },
                                    closed: { opacity: 0, y: 20 }
                                }}
                            >
                                <Link href="https://remember-publisher.vercel.app/" onClick={() => setIsMenuOpen(false)} className="w-full max-w-xs">
                                    <Button size="lg" className="w-full rounded-full h-14 text-lg font-medium shadow-xl">
                                        Get Started
                                    </Button>
                                </Link>
                            </motion.div>
                        </motion.nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
