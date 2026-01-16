"use client";

import { motion } from "framer-motion";
import { content } from "@/data/content";

export function HowItWorks() {
    const { howItWorks } = content;

    return (
        <section id="process" className="py-24 bg-background relative overflow-hidden">



            <div className="container px-6 md:px-8 mx-auto max-w-6xl relative z-10">

                <div className="text-center mb-24">
                    <span className="text-sm font-sans font-semibold tracking-widest uppercase text-muted-foreground mb-4 block">
                        The Process
                    </span>
                    <h2 className="text-4xl md:text-6xl font-serif font-medium tracking-tight text-foreground">
                        {howItWorks.heading}
                    </h2>
                </div>

                <div className="space-y-24 md:space-y-32 relative">
                    {howItWorks.steps.map((item, index) => {
                        const isEven = index % 2 === 0;

                        return (
                            <div key={index} className="relative">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.7, ease: "easeOut" }}
                                    className={`flex flex-col md:flex-row gap-8 md:gap-16 items-center ${isEven ? "" : "md:flex-row-reverse"}`}
                                >
                                    {/* VISUAL / NUMBER SIDE */}
                                    <div className="flex-1 flex justify-center md:justify-end">
                                        {/* If even (Left Text, Right Image) -> This logic is inverse.
                                            Let's standarize: 
                                            isEven (Row 0): Text Left, Image Right? 
                                            The code below puts "Content Side" and "Visual Side".
                                            If I want Text Left for Row 0, I should have flex-row-reverse? 
                                            No, default flex-row is Item 1 (Left), Item 2 (Right).
                                            
                                            Let's restructure for clarity:
                                            We want:
                                            Row 0: Text [Left] --- Image [Right]
                                            Row 1: Image [Left] --- Text [Right]
                                            
                                            So for Row 0 (isEven): order should be Text, Image.
                                            For Row 1 (isOdd): order should be Image, Text.
                                            
                                            We can achieve this by swapping the DOM order or using flex-direction.
                                            Let's use flex-direction.
                                            
                                            Default: Image is first in DOM? Or Text?
                                            Let's put TEXT first in DOM for semantics? Or Image? 
                                            Usually visual first is fine too.
                                            
                                            Let's write DOM: [Text] [Image].
                                            Row 0 (Even) -> Text Left, Image Right -> flex-row
                                            Row 1 (Odd) -> Image Left, Text Right -> flex-row-reverse
                                         */}

                                        {/* WAIT, I want the TEXT on the LEFT for the first item?
                                             Let's look at the mapping logic I wrote above:
                                             `isEven ? "" : "md:flex-row-reverse"`
                                             If DOM is [A, B].
                                             Even: [A, B] (A left, B right).
                                             Odd: [B, A] (B left, A right).
                                             
                                             So if I want Text Left on Even, A should be Text.
                                         */}

                                        {/* TEXT SIDE (A) */}
                                        <div className={`flex-1 text-center ${isEven ? "md:text-left" : "md:text-right"}`}>
                                            <h3 className="text-3xl md:text-5xl font-serif font-medium text-foreground mb-6">
                                                {item.title}
                                            </h3>
                                            <p className="text-lg md:text-xl text-muted-foreground/90 leading-relaxed font-sans font-light">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* IMAGE / NUMBER SIDE (B) */}
                                    <div className="flex-1 flex justify-center md:justify-start">
                                        <div className="relative w-40 h-40 md:w-56 md:h-56 flex-shrink-0 flex items-center justify-center bg-background rounded-full border border-luxury-gold/20 shadow-xl">

                                            <svg className="absolute inset-0 w-full h-full text-luxury-gold/10 rotate-12" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                                                <circle cx="50" cy="50" r="49" strokeWidth="0.5" />
                                                <path d="M50,2 Q98,20 98,50 T50,98 T2,50 T50,2" strokeWidth="0.5" opacity="0.8" />
                                            </svg>

                                            <span className="text-6xl md:text-8xl font-serif font-bold text-foreground/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none">
                                                {item.step}
                                            </span>

                                            {/* Icon or "Step 01" Text cleanly */}
                                            <span className="text-2xl md:text-4xl font-serif font-medium text-luxury-gold relative z-10">
                                                {item.step}
                                            </span>
                                        </div>
                                    </div>

                                </motion.div>

                                {/* CONNECTOR ARROWS */}
                                {index < howItWorks.steps.length - 1 && (
                                    <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none z-0 mix-blend-multiply opacity-40">
                                        {isEven ? (
                                            /* Arrow from Right (Row 0 Img) down to Left (Row 1 Img) 
                                               Actually, the container is relative to the ROW? No, row relative.
                                               We need it absolute to the wrapper or just generally positioned between rows.
                                               
                                               Let's make this div wrap the entire row or put the arrow OUTSIDE the row.
                                               Putting it inside `relative` row means it's positioned relative to that row.
                                               We want it to point to the NEXT row.
                                               
                                               Row 0 (Text | Img). Arrow needs to go from Img (Right side) -> Down/Left -> Img (Left side of next row).
                                            */
                                            <svg className="absolute top-[60%] right-[10%] w-64 h-48 text-luxury-gold transform rotate-12" viewBox="0 0 200 150" fill="none" stroke="currentColor">
                                                {/* Curve from Top Right to Bottom Left */}
                                                <path d="M180,10 C180,80 20,40 20,140" strokeWidth="2" strokeDasharray="8 8" strokeLinecap="round" markerEnd="url(#arrowhead)" />
                                            </svg>
                                        ) : (
                                            /* Arrow from Left (Row 1 Img) down to Right (Row 2 Img) */
                                            <svg className="absolute top-[60%] left-[10%] w-64 h-48 text-luxury-gold transform -rotate-12" viewBox="0 0 200 150" fill="none" stroke="currentColor">
                                                {/* Curve from Top Left to Bottom Right */}
                                                <path d="M20,10 C20,80 180,40 180,140" strokeWidth="2" strokeDasharray="8 8" strokeLinecap="round" markerEnd="url(#arrowhead)" />
                                            </svg>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Global Defs for Arrowhead */}
                <svg className="hidden">
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
                        </marker>
                    </defs>
                </svg>

            </div>
        </section>
    );
}

// NOTE: 
// The layout logic above: 
// Map -> Div [Relative] -> Flex Row
// DOM Order: [Text Side] [Image Side]
// Even (0): Flex Row -> [Text - Left] ... [Image - Right]
// Odd (1): Flex Row Reverse -> [Image - Left] ... [Text - Right]
// Arrow (Even): From Image (Right) -> Next Image (Left).  Path: Right to Left.
// Arrow (Odd): From Image (Left) -> Next Image (Right). Path: Left to Right.
// 
// Arrow SVG positioning:
// Even: `top-[60%] right-[10%]`. Starts near Right Image, curves to Left.
// Odd: `top-[60%] left-[10%]`. Starts near Left Image, curves to Right.

