import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, CheckCircle2, Loader2, Download, Image as ImageIcon, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Book } from "@/api/books/types";

interface ExportBookModalProps {
    isOpen: boolean;
    onClose: () => void;
    book: Book;
}

export function ExportBookModal({ isOpen, onClose, book }: ExportBookModalProps) {
    const [includeCover, setIncludeCover] = useState(true);
    const [includeToc, setIncludeToc] = useState(true);
    const [includeNumbers, setIncludeNumbers] = useState(true);

    const [isExporting, setIsExporting] = useState(false);
    const [exportStep, setExportStep] = useState(0);

    const exportSteps = [
        "Preparing manuscript data...",
        "Applying formatting rules...",
        "Generating Table of Contents...",
        "Rendering PDF document...",
        "Finalizing download..."
    ];

    useEffect(() => {
        if (!isOpen) {
            // Reset state when closed
            setTimeout(() => {
                setIsExporting(false);
                setExportStep(0);
                setIncludeCover(true);
                setIncludeToc(true);
                setIncludeNumbers(true);
            }, 300);
        }
    }, [isOpen]);

    const handleGenerate = async () => {
        setIsExporting(true);
        setExportStep(0);

        // Simulation mock for the UI/UX. We will replace this with the real backend call in the next step.
        // The real backend call will take 3-5 seconds depending on the book size.
        for (let i = 0; i < exportSteps.length; i++) {
            setExportStep(i);
            await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 600));
        }

        toast.success("PDF generated successfully! (Mocked)");
        
        // TODO: Trigger actual file download from blob
        
        setTimeout(() => {
            onClose();
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div>
                        <h2 className="text-xl font-serif font-medium text-foreground">Export Manuscript</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">Prepare '{book.title}' for publishing</p>
                    </div>
                    {!isExporting && (
                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 hover:bg-foreground/5">
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                <div className="px-6 py-6">
                    <AnimatePresence mode="wait">
                        {!isExporting ? (
                            <motion.div
                                key="config"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="space-y-6"
                            >
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Print Configuration</h3>
                                    
                                    {/* Toggles */}
                                    <div 
                                        className={cn("flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-colors", includeCover ? "bg-foreground/[0.02] border-foreground/30" : "bg-white border-transparent hover:border-foreground/10")}
                                        onClick={() => setIncludeCover(!includeCover)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn("flex h-8 w-8 items-center justify-center rounded-full", includeCover ? "bg-luxury-gold/10 text-luxury-gold" : "bg-stone-100 text-stone-400")}>
                                                <ImageIcon className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm">Include Cover Page</div>
                                                <div className="text-xs text-muted-foreground">Title and cover image on page 1</div>
                                            </div>
                                        </div>
                                        <div className={cn("h-5 w-5 rounded-full border flex items-center justify-center transition-colors", includeCover ? "border-luxury-gold bg-luxury-gold" : "border-stone-300")}>
                                            {includeCover && <CheckCircle2 className="h-3 w-3 text-white" />}
                                        </div>
                                    </div>

                                    <div 
                                        className={cn("flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-colors", includeToc ? "bg-foreground/[0.02] border-foreground/30" : "bg-white border-transparent hover:border-foreground/10")}
                                        onClick={() => setIncludeToc(!includeToc)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn("flex h-8 w-8 items-center justify-center rounded-full", includeToc ? "bg-luxury-gold/10 text-luxury-gold" : "bg-stone-100 text-stone-400")}>
                                                <List className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm">Generate Table of Contents</div>
                                                <div className="text-xs text-muted-foreground">Dynamic index with page numbers</div>
                                            </div>
                                        </div>
                                        <div className={cn("h-5 w-5 rounded-full border flex items-center justify-center transition-colors", includeToc ? "border-luxury-gold bg-luxury-gold" : "border-stone-300")}>
                                            {includeToc && <CheckCircle2 className="h-3 w-3 text-white" />}
                                        </div>
                                    </div>

                                    <div 
                                        className={cn("flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-colors", includeNumbers ? "bg-foreground/[0.02] border-foreground/30" : "bg-white border-transparent hover:border-foreground/10")}
                                        onClick={() => setIncludeNumbers(!includeNumbers)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn("flex h-8 w-8 items-center justify-center rounded-full", includeNumbers ? "bg-luxury-gold/10 text-luxury-gold" : "bg-stone-100 text-stone-400")}>
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm">Add Page Numbers</div>
                                                <div className="text-xs text-muted-foreground">Standardized footer pagination</div>
                                            </div>
                                        </div>
                                        <div className={cn("h-5 w-5 rounded-full border flex items-center justify-center transition-colors", includeNumbers ? "border-luxury-gold bg-luxury-gold" : "border-stone-300")}>
                                            {includeNumbers && <CheckCircle2 className="h-3 w-3 text-white" />}
                                        </div>
                                    </div>

                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-8"
                            >
                                <div className="relative mb-6">
                                    <Loader2 className="h-12 w-12 animate-spin text-luxury-gold" />
                                </div>
                                
                                <h3 className="text-lg font-serif font-medium text-foreground mb-2">Publishing in progress</h3>
                                <div className="h-5 flex items-center justify-center">
                                    <AnimatePresence mode="wait">
                                        <motion.p
                                            key={exportStep}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            className="text-sm text-muted-foreground font-medium"
                                        >
                                            {exportSteps[exportStep]}
                                        </motion.p>
                                    </AnimatePresence>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full max-w-xs bg-stone-100 rounded-full h-1.5 mt-8 overflow-hidden">
                                    <motion.div 
                                        className="h-full bg-luxury-gold rounded-full"
                                        initial={{ width: "0%" }}
                                        animate={{ width: `${Math.max(5, ((exportStep + 1) / exportSteps.length) * 100)}%` }}
                                        transition={{ duration: 0.4 }}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {!isExporting && (
                    <div className="border-t bg-stone-50/50 px-6 py-4 flex items-center justify-between">
                        <div className="text-xs text-muted-foreground font-medium">Standard A4 Format</div>
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" onClick={onClose} className="hover:bg-foreground/5">
                                Cancel
                            </Button>
                            <Button onClick={handleGenerate} className="bg-foreground text-background hover:bg-foreground/90 shadow-md">
                                <Download className="mr-2 h-4 w-4" /> Export PDF
                            </Button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
