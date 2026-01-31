import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
    footer?: ReactNode;
    className?: string;
}

export function AuthLayout({ children, title, subtitle, footer, className }: AuthLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-5">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
                        <path d="M 8 0 L 0 0 0 8" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    </pattern>
                    <rect width="100" height="100" fill="url(#grid)" />
                </svg>
            </div>

            <header className="relative z-10 p-6 flex justify-between items-center max-w-6xl mx-auto w-full">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                        <span className="font-serif font-bold text-lg">R</span>
                    </div>
                    <span className="font-serif font-semibold text-lg tracking-tight">
                        Remember
                    </span>
                </Link>
            </header>

            <main className="flex-1 flex items-center justify-center p-4 relative z-10">
                <div className={cn("w-full max-w-md bg-card border border-border/40 shadow-xl rounded-2xl p-8 backdrop-blur-sm", className)}>
                    <div className="text-center mb-8">
                        <h1 className="font-serif text-3xl font-bold text-foreground mb-2">{title}</h1>
                        {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
                    </div>

                    {children}

                    {footer && (
                        <>
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-border/60" />
                                </div>
                            </div>
                            <div className="text-center text-sm text-muted-foreground">
                                {footer}
                            </div>
                        </>
                    )}
                </div>
            </main>

            <footer className="relative z-10 p-6 text-center text-xs text-muted-foreground">
                © 2026 Remember Publisher. Ink & Paper.
            </footer>
        </div>
    );
}
