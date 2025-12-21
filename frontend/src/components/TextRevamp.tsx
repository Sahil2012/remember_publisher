import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Wand2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToneSelector, type Tone } from "./ToneSelector";
import { Editor } from "./Editor";

export function TextRevamp() {
    const [inputText, setInputText] = useState("");
    const [outputText, setOutputText] = useState("");
    const [selectedTone, setSelectedTone] = useState<Tone>("Professional");
    const [isLoading, setIsLoading] = useState(false);
    const [showOutput, setShowOutput] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleRevamp = async () => {
        if (!inputText.trim()) return;

        setIsLoading(true);
        setShowOutput(false);

        // Simulate backend API call
        setTimeout(() => {
            const responses: Record<Tone, string> = {
                Professional: `Here is a professionally revised version of your text:\n\n${inputText.replace(/<[^>]*>?/gm, "")} \n\nThis version communicates your message with clarity and authority, suitable for business correspondence.`,
                Casual: `Hey there! Here's a more chill version:\n\n${inputText.replace(/<[^>]*>?/gm, "")} \n\nHope this vibes well with what you're trying to say!`,
                Enthusiastic: `Wow! Here is an incredible rewrite for you:\n\n${inputText.replace(/<[^>]*>?/gm, "")} \n\nThis is absolutely amazing and full of energy!`,
                Witty: `Here's a clever spin on your words:\n\n${inputText.replace(/<[^>]*>?/gm, "")} \n\nShort, sharp, and maybe a little cheeky.`,
                Persuasive: `Compelling argument loading... done:\n\n${inputText.replace(/<[^>]*>?/gm, "")} \n\nThis ensures your reader will be convinced immediately.`,
            };

            setOutputText(responses[selectedTone]);
            setIsLoading(false);
            setShowOutput(true);
        }, 2000);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(outputText.replace(/<[^>]*>?/gm, ""));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] dark:bg-black/5 py-12 px-4 font-sans text-foreground">

            <div className="mx-auto max-w-5xl space-y-8">
                {/* Header */}
                <div className="flex flex-col items-start gap-2 border-b border-border/40 pb-6 mb-8">
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground/90">
                        Editor
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Write your draft and let AI refine the tone.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 items-stretch h-[600px]">
                    {/* Left Column: Input + Controls */}
                    <div className="flex flex-col gap-4 h-full">
                        <div className="flex items-center justify-between h-6">
                            <label className="text-xs font-bold text-[#D97736] uppercase tracking-wider">Original Draft</label>
                        </div>

                        <div className="flex-1 flex flex-col gap-4">
                            <div className="flex-1 group rounded-2xl border border-border/60 bg-white dark:bg-card shadow-sm transition-all focus-within:ring-2 focus-within:ring-[#D97736]/10 hover:border-[#D97736]/30 overflow-hidden">
                                <Editor
                                    value={inputText}
                                    onChange={setInputText}
                                    placeholder="Start writing or paste your text here..."
                                    className="h-full border-none"
                                />
                            </div>

                            {/* Action Panel - Fixed Height at bottom of column */}
                            <div className="rounded-2xl border border-border/60 bg-white/50 dark:bg-card/50 backdrop-blur-sm p-4 shadow-sm flex flex-col gap-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="space-y-1.5 flex-1">
                                        <label className="text-xs font-medium text-muted-foreground ml-1">Tone Preference</label>
                                        <ToneSelector selectedTone={selectedTone} onSelect={setSelectedTone} disabled={isLoading} />
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
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            className="relative"
                                        >
                                            <div className="absolute inset-0 rounded-full blur-md bg-[#D97736]/30" />
                                            <Loader2 className="h-10 w-10 text-[#D97736] relative z-10" />
                                        </motion.div>
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
