import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2, Wand2, Copy, Check, Mic, Square, AlertCircle, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToneSelector } from "./ToneSelector";
import { Editor } from "./Editor";
import { CategorySelector, type Category } from "./CategorySelector";
import { LIFE_STORY_TONES, BUSINESS_TONES, YEARBOOK_TONES } from "@/config/tones";
import { useAPIClient } from "@/api/useAPIClient";
import { useDictation } from "@/hooks/useDictation";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PricingModal } from "./PricingModal";
import { Sparkles, ArrowRight } from "lucide-react";
import { useAuthUser } from "@/hooks/useAuthUser";

const LOADING_MESSAGES = [
    "Reading your draft...",
    "Finding the right tone...",
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

function stripHtml(html: string) {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}

function countWords(str: string) {
    const plain = stripHtml(str);
    const matches = plain.match(/\S+/g);
    return matches ? matches.length : 0;
}

export function TextRevamp() {
    const apiClient = useAPIClient();
    const navigate = useNavigate();

    const [inputText, setInputText] = useState("");
    const [outputText, setOutputText] = useState("");

    const [selectedCategory, setSelectedCategory] = useState<Category>("Life Story");
    
    const getActiveTones = (category: Category) => {
        switch (category) {
            case "Life Story": return LIFE_STORY_TONES;
            case "Yearbook": return YEARBOOK_TONES;
            case "Business": return BUSINESS_TONES;
            default: return LIFE_STORY_TONES;
        }
    };

    const activeTones = getActiveTones(selectedCategory);
    const [selectedTone, setSelectedTone] = useState<string>(activeTones[0].id);

    const [isLoading, setIsLoading] = useState(false);
    const [showOutput, setShowOutput] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

    const { data: user } = useAuthUser();
    const usedDictationSeconds = user?.dailyDictationSeconds || 0;
    const isSubscribed = user?.isSubscribed;

    const [isRecording, setIsRecording] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(300);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const onTransientText = useCallback((_text: string) => {
        // Here we could append it to a temp state to show real-time
    }, []);

    const onFinalText = useCallback((text: string) => {
        setInputText(prev => prev + (prev.trim() ? " " : "") + text);
    }, []);

    const dictation = useDictation(onTransientText, onFinalText);

    // 3-minute limit timer logic
    useEffect(() => {
        if (dictation.isRecording) {
            setIsRecording(true);
            // If subscribed, they have 3 mins per session limit here (frontend only)
            // If trial, they have 5 mins total limit.
            // If subscribed, they have 3 mins per session limit here (frontend only)
            // If trial, they have 5 mins total limit.
            const initialTime = isSubscribed ? 180 : Math.max(0, 300 - usedDictationSeconds);
            setTimeRemaining(initialTime); 
            timerRef.current = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        dictation.stopRecording();
                        setIsRecording(false);
                        toast(`Recording stopped: ${isSubscribed ? '3 minutes' : 'Trial'} limit reached.`);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    }, [dictation.isRecording]);

    const wordCount = countWords(inputText);
    const isOverLimit = wordCount > 300;

    useEffect(() => {
        setSelectedTone(activeTones[0].id);
    }, [selectedCategory, activeTones]);

    const handleRevamp = async () => {
        if (!inputText.trim()) return;
        if (isOverLimit) {
            toast.error("Text exceeds the 300 words limit.");
            return;
        }

        setIsLoading(true);
        setShowOutput(false);

        try {
            const response = await apiClient.post("/standalone-revamp", {
                text: stripHtml(inputText),
                category: selectedCategory,
                tone: selectedTone
            });
            setOutputText(response.data.revamped);
            setShowOutput(true);
        } catch (error: any) {
            console.error("Failed to revamp text:", error);
            if (error.response?.status === 402) {
                toast.error("You have already used your 3 complimentary trial sessions. Subscribe to continue.");
                setIsPricingModalOpen(true);
            } else {
                const errorMessage = error.response?.data?.message || "Failed to process your draft. Please try again.";
                toast.error(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        const cleanText = stripHtml(outputText);
        navigator.clipboard.writeText(cleanText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const toggleDictation = () => {
        if (dictation.isRecording) {
            dictation.stopRecording();
        } else {
            dictation.startRecording();
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] dark:bg-black/5 py-12 px-4 font-sans text-foreground">

            {/* Free Gift Banner */}
            <div className="mx-auto max-w-5xl mb-8">
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="relative overflow-hidden rounded-3xl shadow-md"
                    style={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(45 40% 50% / 0.35)",
                        boxShadow: "0 4px 32px hsl(45 40% 50% / 0.1), 0 1px 4px hsl(220 10% 15% / 0.06)",
                    }}
                >
                    {/* Gold shimmer top bar */}
                    <div
                        className="h-1.5 w-full"
                        style={{
                            background: "linear-gradient(90deg, hsl(45 40% 50% / 0.3), hsl(45 40% 55%), hsl(45 40% 65%), hsl(45 40% 55%), hsl(45 40% 50% / 0.3))",
                        }}
                    />

                    {/* Radial gold glow from top */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: "radial-gradient(ellipse at top, hsl(45 40% 50% / 0.07) 0%, transparent 65%)",
                        }}
                    />

                    <div className="relative px-8 py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        {/* Left: icon + text */}
                        <div className="flex items-start gap-5">
                            {/* Animated icon */}
                            <motion.div
                                initial={{ rotate: -12, scale: 0.8 }}
                                animate={{ rotate: 0, scale: 1 }}
                                transition={{ type: "spring", damping: 14, stiffness: 200, delay: 0.1 }}
                                className="relative shrink-0"
                            >
                                <div
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                                    style={{
                                        background: "linear-gradient(135deg, hsl(45 40% 50% / 0.2), hsl(45 40% 50% / 0.06))",
                                        border: "1px solid hsl(45 40% 50% / 0.3)",
                                        boxShadow: "0 4px 20px hsl(45 40% 50% / 0.15)",
                                    }}
                                >
                                    <Gift className="h-6 w-6" style={{ color: "hsl(45 40% 45%)" }} />
                                </div>
                                <span
                                    className="absolute -top-1 -right-1"
                                    style={{ animation: "spin 8s linear infinite" }}
                                >
                                    <Sparkles className="w-3.5 h-3.5" style={{ color: "hsl(45 40% 50%)" }} />
                                </span>
                            </motion.div>

                            {/* Text */}
                            <div className="space-y-1.5">
                                <motion.p
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                    className="text-[10px] font-bold uppercase tracking-widest"
                                    style={{ color: "hsl(45 40% 45%)" }}
                                >
                                    Welcome Gift — No strings attached
                                </motion.p>
                                <motion.h3
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-lg font-semibold leading-snug text-foreground"
                                >
                                    This is our gift to you — completely free.
                                </motion.h3>
                                <motion.p
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25 }}
                                    className="text-sm text-muted-foreground leading-relaxed max-w-lg"
                                >
                                    Try the RP Editor free for 3 sessions and 5 minutes of voice-to-text, on us. No conditions. Love it? Explore unlimited books, PDF generation, and your personal archive with a full plan.
                                </motion.p>
                            </div>
                        </div>

                        {/* CTA button */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="shrink-0"
                        >
                            <button
                                onClick={() => setIsPricingModalOpen(true)}
                                className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                                style={{
                                    background: "hsl(45 40% 50%)",
                                    color: "hsl(220 10% 12%)",
                                    boxShadow: "0 4px 16px hsl(45 40% 50% / 0.3)",
                                }}
                            >
                                See Full Plans
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </motion.div>
                    </div>
                </motion.div>
            </div>


            <div className="mx-auto max-w-5xl space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/40 pb-6 mb-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-semibold tracking-tight text-foreground/90">
                                RP Editor
                            </h1>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#a88a4b] bg-[#a88a4b]/10 px-2.5 py-1 rounded-full border border-[#a88a4b]/20">
                                <Gift className="h-3 w-3" />
                                Free Trial
                            </span>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            Paste or dictate your draft below — the RP Editor will reshape the tone and style to bring your story to life. Three free uses and 5 minutes of voice-to-text trial included.
                        </p>
                    </div>
                    <CategorySelector selectedCategory={selectedCategory} onSelect={setSelectedCategory} disabled={isLoading} />
                </div>

                <div className="grid lg:grid-cols-2 gap-8 items-stretch lg:h-[600px]">
                    {/* Left Column: Input */}
                    <div className="flex flex-col gap-4 h-full">
                        <div className="flex items-center justify-between h-6">
                            <label className="text-xs font-bold text-luxury-gold uppercase tracking-wider">Your Draft</label>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${isOverLimit ? 'bg-red-100 text-red-600' : 'bg-muted/30 text-muted-foreground'}`}>
                                {wordCount} / 300 words
                            </span>
                        </div>

                        <div className={`flex-1 flex flex-col min-h-[300px] lg:min-h-0 relative rounded-2xl border ${isOverLimit ? 'border-red-500 ring-2 ring-red-500/20' : 'border-border/60 focus-within:ring-2 focus-within:ring-luxury-gold/10 hover:border-luxury-gold/30'} bg-white dark:bg-card shadow-sm transition-all overflow-hidden`}>
                            <Editor
                                value={inputText}
                                onChange={setInputText}
                                placeholder={`Start writing or use the dictation button to speak your ${selectedCategory.toLowerCase()} into words...`}
                                className="h-full border-none"
                            />
                        </div>

                        {/* Action Panel */}
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
                                <div className="flex items-end gap-2 pb-0.5">
                                    <Button
                                        size="lg"
                                        variant={isRecording ? "destructive" : "outline"}
                                        onClick={toggleDictation}
                                        className="rounded-full flex gap-2 w-32"
                                    >
                                        {isRecording ? (
                                            <>
                                                <Square className="h-4 w-4" />
                                                <span>Stop</span>
                                                <span className="text-xs opacity-80 block w-full">{formatTime(timeRemaining)}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Mic className="h-4 w-4" />
                                                Dictate
                                            </>
                                        )}
                                    </Button>

                                    {dictation.errorState && (
                                        <div className="flex items-center gap-2 text-[11px] text-red-500 mt-1 font-medium bg-red-50 px-2 py-0.5 rounded border border-red-100">
                                            <AlertCircle className="h-3 w-3" />
                                            <span>{dictation.errorState}</span>
                                        </div>
                                    )}

                                    <Button
                                        size="lg"
                                        onClick={handleRevamp}
                                        disabled={isLoading || !inputText.trim() || isOverLimit}
                                        className="rounded-full bg-luxury-gold hover:bg-luxury-gold/90 text-white shadow-lg shadow-luxury-gold/20 px-8 transition-all hover:scale-105 active:scale-95"
                                    >
                                        {isLoading ? (
                                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Working...</>
                                        ) : (
                                            <><Wand2 className="mr-2 h-4 w-4" /> Revamp</>
                                        )}
                                    </Button>
                                </div>
                            </div>
                            {isOverLimit && (
                                <div className="flex items-center gap-2 text-sm text-red-500 mt-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>Your draft exceeds 300 words. Please shorten it before revamping.</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Output */}
                    <div className="flex flex-col gap-4 h-full">
                        <div className="flex items-center justify-between h-6">
                            <label className="text-xs font-bold text-luxury-gold uppercase tracking-wider">RP Editor Result</label>
                            {showOutput && (
                                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground hover:text-luxury-gold hover:bg-luxury-gold/10" onClick={copyToClipboard}>
                                    {copied ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
                                    {copied ? "Copied" : "Copy"}
                                </Button>
                            )}
                        </div>

                        <div className={`relative flex-1 min-h-[300px] lg:min-h-0 rounded-2xl border transition-all overflow-hidden flex flex-col ${showOutput ? "bg-white dark:bg-card border-border shadow-sm" : "bg-muted/5 border-dashed border-border hover:border-luxury-gold/30"}`}>
                            {showOutput ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col h-full">
                                    <Editor value={outputText} onChange={setOutputText} readOnly={false} className="h-full flex-1" />
                                </motion.div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/40 p-8 text-center space-y-4">
                                    {isLoading ? (
                                        <div className="flex flex-col items-center justify-center w-full h-full gap-8 pb-12">
                                            <div className="w-full max-w-md space-y-4 px-8">
                                                <motion.div className="h-4 bg-luxury-gold/20 rounded-md w-3/4" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} />
                                                <motion.div className="h-4 bg-luxury-gold/20 rounded-md w-full" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} />
                                                <motion.div className="h-4 bg-luxury-gold/20 rounded-md w-5/6" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }} />
                                            </div>
                                            <div className="flex flex-col items-center gap-2">
                                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                                                    <Loader2 className="h-6 w-6 text-luxury-gold" />
                                                </motion.div>
                                                <LoadingMessage />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="h-16 w-16 rounded-full bg-luxury-gold/10 flex items-center justify-center mb-2">
                                                <Wand2 className="h-8 w-8 text-luxury-gold/60" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-foreground/70">Your revamped draft will appear here</p>
                                                <p className="text-xs text-muted-foreground/60 max-w-[220px] mx-auto">
                                                    Select a tone and click Revamp to see the RP Editor in action.
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

            <PricingModal 
                isOpen={isPricingModalOpen} 
                onClose={() => setIsPricingModalOpen(false)} 
            />
        </div>
    );
}
