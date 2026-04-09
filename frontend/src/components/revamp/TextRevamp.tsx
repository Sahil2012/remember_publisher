import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2, Wand2, Copy, Check, Mic, Square, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToneSelector } from "./ToneSelector";
import { Editor } from "./Editor";
import { CategorySelector, type Category } from "./CategorySelector";
import { MEMOIR_TONES, BUSINESS_TONES } from "@/config/tones";
import { useAPIClient } from "@/api/useAPIClient";
import { useDictation } from "@/hooks/useDictation";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PricingModal } from "./PricingModal";
import { Sparkles, ArrowRight } from "lucide-react";

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

    const [selectedCategory, setSelectedCategory] = useState<Category>("Memoir");
    const activeTones = selectedCategory === "Memoir" ? MEMOIR_TONES : BUSINESS_TONES;
    const [selectedTone, setSelectedTone] = useState<string>(activeTones[0].id);

    const [isLoading, setIsLoading] = useState(false);
    const [showOutput, setShowOutput] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

    const [isRecording, setIsRecording] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(180);
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
            setTimeRemaining(180); // 3 minutes = 180 seconds
            timerRef.current = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        dictation.stopRecording();
                        setIsRecording(false);
                        toast("Recording stopped: 3 minutes limit reached.");
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
                toast.error("You have already used your free trial.");
                navigate("/billing");
            } else {
                toast.error("Failed to generate text. Please check the backend connection.");
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
            {/* Promotional Banner */}
            <div className="mx-auto max-w-5xl mb-8">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative group overflow-hidden rounded-3xl bg-gradient-to-r from-luxury-gold to-luxury-gold/80 p-[1px] shadow-lg shadow-luxury-gold/10"
                >
                    <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-6 py-4">
                        <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-luxury-gold/10 text-luxury-gold">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">
                                    Unlock Unlimited Access
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Write full-length books, generate PDF ebooks, and more with Remember Press.
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={() => setIsPricingModalOpen(true)}
                            size="sm"
                            className="rounded-full bg-luxury-gold hover:bg-luxury-gold/90 text-white shadow-md shadow-luxury-gold/20 transition-all hover:scale-105"
                        >
                            View Plans
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </motion.div>
            </div>

            <div className="mx-auto max-w-5xl space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/40 pb-6 mb-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-semibold tracking-tight text-foreground/90">
                            AI Writing Assistant
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Try our AI Revamp tool! Write locally or dictate your draft via your microphone, then refine its tone.
                        </p>
                    </div>
                    <CategorySelector selectedCategory={selectedCategory} onSelect={setSelectedCategory} disabled={isLoading} />
                </div>

                <div className="grid lg:grid-cols-2 gap-8 items-stretch h-[600px]">
                    {/* Left Column: Input */}
                    <div className="flex flex-col gap-4 h-full">
                        <div className="flex items-center justify-between h-6">
                            <label className="text-xs font-bold text-luxury-gold uppercase tracking-wider">Original Draft</label>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${isOverLimit ? 'bg-red-100 text-red-600' : 'bg-muted/30 text-muted-foreground'}`}>
                                {wordCount} / 300 words
                            </span>
                        </div>

                        <div className={`flex-1 flex flex-col gap-4 min-h-0 relative rounded-2xl border ${isOverLimit ? 'border-red-500 ring-2 ring-red-500/20' : 'border-border/60 focus-within:ring-2 focus-within:ring-luxury-gold/10 hover:border-luxury-gold/30'} bg-white dark:bg-card shadow-sm transition-all overflow-hidden`}>
                            <Editor
                                value={inputText}
                                onChange={setInputText}
                                placeholder={`Start writing or clicking dictation to draft your ${selectedCategory.toLowerCase()}...`}
                                className="absolute inset-0 border-none"
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

                                    <Button
                                        size="lg"
                                        onClick={handleRevamp}
                                        disabled={isLoading || !inputText.trim() || isOverLimit}
                                        className="rounded-full bg-luxury-gold hover:bg-luxury-gold/90 text-white shadow-lg shadow-luxury-gold/20 px-8 transition-all hover:scale-105 active:scale-95"
                                    >
                                        {isLoading ? (
                                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running...</>
                                        ) : (
                                            <><Wand2 className="mr-2 h-4 w-4" /> Revamp</>
                                        )}
                                    </Button>
                                </div>
                            </div>
                            {isOverLimit && (
                                <div className="flex items-center gap-2 text-sm text-red-500 mt-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>You have exceeded the 300 words limit. Please shorten your draft.</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Output */}
                    <div className="flex flex-col gap-4 h-full">
                        <div className="flex items-center justify-between h-6">
                            <label className="text-xs font-bold text-luxury-gold uppercase tracking-wider">AI Suggestion</label>
                            {showOutput && (
                                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground hover:text-luxury-gold hover:bg-luxury-gold/10" onClick={copyToClipboard}>
                                    {copied ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
                                    {copied ? "Copied" : "Copy"}
                                </Button>
                            )}
                        </div>

                        <div className={`relative flex-1 rounded-2xl border transition-all overflow-hidden flex flex-col ${showOutput ? "bg-white dark:bg-card border-border shadow-sm" : "bg-muted/5 border-dashed border-border hover:border-luxury-gold/30"}`}>
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

            <PricingModal 
                isOpen={isPricingModalOpen} 
                onClose={() => setIsPricingModalOpen(false)} 
            />
        </div>
    );
}
