import { Link, Outlet, useLocation } from "react-router-dom";
import { Library } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { cn } from "@/lib/utils";

export function Layout() {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-background font-sans text-foreground selection:bg-foreground/10 flex flex-col">
            {/* Minimal Navbar */}
            <header className="sticky top-0 z-50 w-full border-b border-foreground/5 bg-background/80 backdrop-blur-md">
                <div className="container mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                            <span className="font-serif font-bold text-lg">R</span>
                        </div>
                        <span className="font-serif font-semibold text-lg tracking-tight hidden sm:block">
                            Remember
                        </span>
                    </Link>

                    <nav className="flex items-center gap-6">
                        <Link
                            to="/"
                            className={cn(
                                "flex items-center gap-2 text-sm font-medium transition-colors hover:text-foreground",
                                location.pathname === "/" ? "text-foreground" : "text-muted-foreground"
                            )}
                        >
                            <Library className="w-4 h-4" />
                            Library
                        </Link>
                        <SignedIn>
                            <UserButton />
                        </SignedIn>
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                    Sign In
                                </button>
                            </SignInButton>
                        </SignedOut>
                    </nav>
                </div>
            </header>

            <main className="flex-1 container mx-auto max-w-6xl px-4 py-8">
                {<Outlet />}
            </main>

            <footer className="border-t border-foreground/5 py-8 mt-auto">
                <div className="container mx-auto max-w-6xl px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                    <p>© 2026 Remember Publisher. All rights reserved.</p>
                    <div className="flex gap-4">
                        <a href="#" className="hover:text-foreground">Privacy</a>
                        <a href="#" className="hover:text-foreground">Terms</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
