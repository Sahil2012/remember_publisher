import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Wand2, Copy, Check, ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ToneSelector } from "./ToneSelector";
import { TiptapEditor } from "./TiptapEditor";
import { CategorySelector, type Category } from "./CategorySelector";
import { MEMOIR_TONES, BUSINESS_TONES } from "@/config/tones";

import { RevampService } from "@/services/revamp";

const LOADING_MESSAGES = [
    "Analyzing your tone...",
    "Brainstorming creative angles...",
    "Polishing the prose...",
    "Crafting the perfect phrasing...",
    "Enhancing clarity and flow...",
    "Applying the finishing touches...",
];

function LoadingMessage() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.p
            key={index}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-sm font-medium text-muted-foreground animate-in fade-in"
        >
            {LOADING_MESSAGES[index]}
        </motion.p>
    );
}


export function TextRevamp() {
    const { bookId } = useParams();
    const [inputText, setInputText] = useState("");
    const [outputText, setOutputText] = useState("");

    // Default to Memoir
    const [selectedCategory, setSelectedCategory] = useState<Category>("Memoir");
    // Default tone: First one of the list
    const [selectedTone, setSelectedTone] = useState<string>(MEMOIR_TONES[0].id);

    const [isLoading, setIsLoading] = useState(false);
    const [showOutput, setShowOutput] = useState(false);
    const [copied, setCopied] = useState(false);

    // Get active tones based on category
    const activeTones = selectedCategory === "Memoir" ? MEMOIR_TONES : BUSINESS_TONES;

    // Reset tone when category changes
    useEffect(() => {
        setSelectedTone(activeTones[0].id);
    }, [selectedCategory]);

    const handleRevamp = async () => {
        if (!inputText.trim()) return;

        setIsLoading(true);
        setShowOutput(false);

        try {
            const result = await RevampService.revampText(inputText, selectedTone, selectedCategory);
            setOutputText(result);
            setShowOutput(true);
        } catch (error) {
            console.error("Failed to revamp text:", error);
            // Optional: Add toast notification here
            alert("Failed to generate text. Please check the backend connection.");
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        // Create a temporary element to decode HTML entities (like &nbsp;)
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = outputText;
        const cleanText = tempDiv.textContent || tempDiv.innerText || "";

        navigator.clipboard.writeText(cleanText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 text-foreground selection:bg-foreground/10">
            <div className="mx-auto max-w-6xl space-y-8">
                {/* Header Section - Centered & Serif */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-foreground/10 pb-8">
                    <div className="space-y-4 max-w-2xl">
                        <Link to={`/book/${bookId}`} className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-2 group">
                            <ArrowLeft className="mr-1 h-3 w-3 group-hover:-translate-x-1 transition-transform" />
                            Back to Book
                        </Link>

                        <div className="flex items-center gap-3">
                            <div className="inline-flex items-center rounded-full border border-luxury-gold/20 bg-luxury-gold/5 px-3 py-1 text-xs font-medium text-luxury-gold backdrop-blur-sm">
                                <Wand2 className="mr-2 h-3.5 w-3.5" />
                                AI Editor
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight text-foreground">
                            Refine your story.
                        </h1>
                        <p className="text-lg text-muted-foreground/80 font-light max-w-lg">
                            Paste your rough draft and let us help you find the right words.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <CategorySelector
                            selectedCategory={selectedCategory}
                            onSelect={setSelectedCategory}
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 min-h-[600px]">
                    {/* Left Column: Input */}
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold tracking-wide uppercase text-muted-foreground/70">Original Draft</label>
                        </div>

                        <div className="flex-1 flex flex-col gap-4 relative">
                            {/* Input Card - Paper feel */}
                            <div className="flex-1 bg-white rounded-2xl border border-foreground/5 shadow-sm overflow-hidden focus-within:ring-1 focus-within:ring-luxury-gold/20 transition-all hover:shadow-md relative group">
                                <TiptapEditor
                                    content={inputText}
                                    onChange={setInputText}
                                    placeholder="Start typing or paste your content here..."
                                    className="h-full min-h-[400px]"
                                />

                                {/* Floating Gradient Border Effect on Focus */}
                                <div className="absolute inset-0 border-2 border-transparent focus-within:border-luxury-gold/30 pointer-events-none rounded-2xl transition-all" />
                            </div>

                            {/* Controls - Floating Panel */}
                            <div className="bg-background/80 backdrop-blur-md rounded-2xl border border-foreground/10 p-5 shadow-sm space-y-5 bottom-4 z-10">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-foreground">Tone</label>
                                        <span className="text-xs text-muted-foreground italic">Select to apply</span>
                                    </div>
                                    <ToneSelector
                                        selectedTone={selectedTone}
                                        onSelect={setSelectedTone}
                                        tones={activeTones}
                                        disabled={isLoading}
                                    />
                                </div>

                                <Button
                                    size="lg"
                                    onClick={handleRevamp}
                                    disabled={isLoading || !inputText.trim()}
                                    className="w-full text-base font-medium rounded-full shadow-lg hover:shadow-xl transition-all active:scale-[0.98] h-12"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin text-luxury-gold" />
                                            Refining...
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 className="mr-2 h-5 w-5 text-luxury-gold" />
                                            Revamp Content
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Output */}
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between min-h-[24px]">
                            <label className="text-sm font-semibold tracking-wide uppercase text-foreground">Polished Version</label>
                            {showOutput && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                                    onClick={copyToClipboard}
                                >
                                    {copied ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
                                    {copied ? "Copied" : "Copy to clipboard"}
                                </Button>
                            )}
                        </div>

                        <div className={cn(
                            "flex-1 rounded-2xl border transition-all overflow-hidden relative min-h-[500px] flex flex-col",
                            showOutput
                                ? "bg-white border-foreground/5 shadow-sm"
                                : "bg-foreground/[0.02] border-dashed border-foreground/10"
                        )}>
                            <div className="flex-1 relative p-1">
                                {showOutput ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.6, ease: "easeOut" }}
                                        className="h-full"
                                    >
                                        <TiptapEditor
                                            content={outputText}
                                            onChange={setOutputText}
                                            readOnly={false}
                                            className="h-full"
                                        />
                                    </motion.div>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                                        {isLoading ? (
                                            <div className="space-y-8 max-w-xs w-full flex flex-col items-center">
                                                <div className="relative">
                                                    {/* Hand-drawn circle effect */}
                                                    <svg className="absolute -inset-8 w-[200%] h-[200%] text-luxury-gold/10 animate-spin-slow pointer-events-none" viewBox="0 0 100 100">
                                                        <path d="M50,10 A40,40 0 1,1 49,10" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="5 5" />
                                                    </svg>
                                                    <Loader2 className="h-10 w-10 text-luxury-gold/80 animate-spin" />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm font-serif italic text-foreground/80">Thinking...</p>
                                                    <LoadingMessage />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4 max-w-sm opacity-60">
                                                <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center mx-auto mb-4">
                                                    <Wand2 className="h-6 w-6 text-foreground/40" />
                                                </div>
                                                <p className="text-sm font-medium text-foreground/60 leading-relaxed font-serif">
                                                    "The best writing is rewriting."
                                                    <br />
                                                    <span className="text-xs font-sans not-italic text-muted-foreground mt-2 block">- E.B. White</span>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
