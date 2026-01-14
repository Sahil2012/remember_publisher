
import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
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
          playfair.variable,
          "antialiased font-sans bg-background text-foreground selection:bg-primary/20"
        )}
      >
        {children}
      </body>
    </html>
  );
}
