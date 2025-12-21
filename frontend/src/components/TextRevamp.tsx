import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Wand2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToneSelector } from "./ToneSelector";
import { Editor } from "./Editor";
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
        <div className="min-h-screen bg-[#FAFAFA] dark:bg-black/5 py-12 px-4 font-sans text-foreground">

            <div className="mx-auto max-w-5xl space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/40 pb-6 mb-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-semibold tracking-tight text-foreground/90">
                            Editor
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Write your draft and let AI refine the tone.
                        </p>
                    </div>
                    {/* Category Selector placed in Header */}
                    <CategorySelector selectedCategory={selectedCategory} onSelect={setSelectedCategory} disabled={isLoading} />
                </div>

                <div className="grid lg:grid-cols-2 gap-8 items-stretch h-[600px]">
                    {/* Left Column: Input + Controls */}
                    <div className="flex flex-col gap-4 h-full">
                        <div className="flex items-center justify-between h-6">
                            <label className="text-xs font-bold text-[#D97736] uppercase tracking-wider">Original Draft</label>
                            <span className="text-xs text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full">{selectedCategory} Mode</span>
                        </div>

                        <div className="flex-1 flex flex-col gap-4 min-h-0 relative">
                            <div className="flex-1 group rounded-2xl border border-border/60 bg-white dark:bg-card shadow-sm transition-all focus-within:ring-2 focus-within:ring-[#D97736]/10 hover:border-[#D97736]/30 overflow-hidden relative min-h-0">
                                <Editor
                                    value={inputText}
                                    onChange={setInputText}
                                    placeholder={`Start writing your ${selectedCategory.toLowerCase()}...`}
                                    className="absolute inset-0 border-none"
                                />
                            </div>

                            {/* Action Panel - Fixed Height at bottom of column */}
                            <div className="rounded-2xl border border-border/60 bg-white/50 dark:bg-card/50 backdrop-blur-sm p-4 shadow-sm flex flex-col gap-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="space-y-1.5 flex-1">
                                        <label className="text-xs font-medium text-muted-foreground ml-1">Tone Preference</label>
                                        <ToneSelector
                                            selectedTone={selectedTone}
                                            onSelect={setSelectedTone}
                                            tones={activeTones}
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div className="self-end pb-0.5">
                                        <Button
                                            size="lg"
                                            onClick={handleRevamp}
                                            disabled={isLoading || !inputText.trim()}
                                            className="rounded-full bg-[#D97736] hover:bg-[#b9652d] text-white shadow-lg shadow-[#D97736]/20 px-8 transition-all hover:scale-105 active:scale-95"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Running...
                                                </>
                                            ) : (
                                                <>
                                                    <Wand2 className="mr-2 h-4 w-4" />
                                                    Revamp
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Output */}
                    <div className="flex flex-col gap-4 h-full">
                        <div className="flex items-center justify-between h-6">
                            <label className="text-xs font-bold text-[#D97736] uppercase tracking-wider">AI Suggestion</label>
                            {showOutput && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs text-muted-foreground hover:text-[#D97736] hover:bg-[#D97736]/10"
                                    onClick={copyToClipboard}
                                >
                                    {copied ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
                                    {copied ? "Copied" : "Copy"}
                                </Button>
                            )}
                        </div>

                        <div className={`
                          relative flex-1 rounded-2xl border transition-all overflow-hidden flex flex-col
                          ${showOutput
                                ? "bg-white dark:bg-card border-border shadow-sm"
                                : "bg-muted/5 border-dashed border-border hover:border-[#D97736]/30"}
                      `}>
                            {showOutput ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex-1 flex flex-col h-full"
                                >
                                    <Editor
                                        value={outputText}
                                        onChange={setOutputText}
                                        readOnly={false}
                                        className="h-full flex-1"
                                    />
                                </motion.div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/40 p-8 text-center space-y-4">
                                    {isLoading ? (
                                        <div className="flex flex-col items-center justify-center w-full h-full gap-8 pb-12">
                                            {/* Animated Skeleton */}
                                            <div className="w-full max-w-md space-y-4 px-8">
                                                <motion.div
                                                    className="h-4 bg-[#D97736]/20 rounded-md w-3/4"
                                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                                />
                                                <motion.div
                                                    className="h-4 bg-[#D97736]/20 rounded-md w-full"
                                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2, ease: "easeInOut" }}
                                                />
                                                <motion.div
                                                    className="h-4 bg-[#D97736]/20 rounded-md w-5/6"
                                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4, ease: "easeInOut" }}
                                                />
                                                <motion.div
                                                    className="h-4 bg-[#D97736]/20 rounded-md w-4/6"
                                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.6, ease: "easeInOut" }}
                                                />
                                            </div>

                                            {/* Rotating Loading Messages */}
                                            <div className="flex flex-col items-center gap-2">
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                                >
                                                    <Loader2 className="h-6 w-6 text-[#D97736]" />
                                                </motion.div>
                                                <LoadingMessage />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="h-16 w-16 rounded-full bg-[#D97736]/10 flex items-center justify-center mb-2">
                                                <Wand2 className="h-8 w-8 text-[#D97736]/60" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-foreground/70">Ready to transform</p>
                                                <p className="text-xs text-muted-foreground/60 max-w-[200px] mx-auto">
                                                    Select a tone and click revamp to see the magic.
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
