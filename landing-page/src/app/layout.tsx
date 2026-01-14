
import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const fraunces = Fraunces({
    variable: "--font-serif",
    subsets: ["latin"],
    axes: ["SOFT", "WONK", "opsz"], // Variable font axes for that "soft" humanist feel
});

const inter = Inter({
    variable: "--font-sans",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Life Scribe - Turn Memories Into Lasting Books",
    description: "Upload your voice, photos, and words – Life Scribe helps you transform them into beautifully designed storybooks.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={cn(
                    inter.variable,
                    fraunces.variable,
                    "antialiased font-sans bg-background text-foreground selection:bg-foreground/10"
                )}
            >
                {children}
            </body>
        </html>
    );
}
