import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, CheckCircle2, Loader2, Download, Image as ImageIcon, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Book } from "@/api/books/types";
import { useAPIClient } from "@/api/useAPIClient";
import { useReactToPrint } from "react-to-print";

interface ExportBookModalProps {
    isOpen: boolean;
    onClose: () => void;
    book: Book;
    isSnapshot?: boolean;
}

export function ExportBookModal({ isOpen, onClose, book, isSnapshot }: ExportBookModalProps) {
    const apiClient = useAPIClient();

    const [includeCover, setIncludeCover] = useState(true);
    const [includeToc, setIncludeToc] = useState(true);
    const [includeNumbers, setIncludeNumbers] = useState(true);

    const [isExporting, setIsExporting] = useState(false);
    const [exportStep, setExportStep] = useState(0);
    
    const [fullBookData, setFullBookData] = useState<any>(null);
    const printRef = useRef<HTMLDivElement>(null);

    const reactToPrintFn = useReactToPrint({
        contentRef: printRef,
        documentTitle: book.title ? `${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}` : 'Book_Export',
        onAfterPrint: () => {
            toast.success("PDF exported successfully!");
            onClose();
        }
    });

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

        const interval = setInterval(() => {
            setExportStep((prev) => {
                if (prev < exportSteps.length - 2) return prev + 1;
                return prev;
            });
        }, 1200);

        try {
            if (isSnapshot) {
                // The public reader already has the fully populated JSON snapshot
                setFullBookData(book);
            } else {
                // Fetch the entire populated DB object for private drafts
                const response = await apiClient.get(`/books/${book.id}/full`);
                setFullBookData(response.data);
            }

            clearInterval(interval);
            setExportStep(exportSteps.length - 1);

            // Wait a brief moment for React to flush the DOM
            setTimeout(() => {
                if (reactToPrintFn) reactToPrintFn();
            }, 800);

        } catch (error) {
            clearInterval(interval);
            console.error("Failed to fetch full book data:", error);
            toast.error("Failed to generate PDF. Could not sync with database.");
            setIsExporting(false);
            setExportStep(0);
        }
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

            {/* INVISIBLE PRINTABLE DOM */}
            <div className="hidden">
                <div ref={printRef} className="print-container bg-white text-black text-left">
                    <style type="text/css" media="print">
                        {`
                        @page { size: auto; margin: 20mm; }
                        @page:first { margin: 0; }
                        .page-break { page-break-after: always; }
                        /* Strict height violently enforces the exact physical dimensions and prevents arbitrary blank trailing pages */
                        .print-page { 
                            height: calc(100vh - 45mm); 
                            max-height: calc(100vh - 45mm); 
                            overflow: hidden; 
                            padding: 0 2rem; 
                            position: relative; 
                            background: white; 
                            display: flex; 
                            flex-direction: column; 
                            box-sizing: border-box; 
                        }
                        /* Ensure Tailwind default prose doesn't overwrite floating images */
                        .prose img[style*="float: left"] { float: left !important; display: inline-block !important; margin: 0 1.5rem 1rem 0 !important; }
                        .prose img[style*="float: right"] { float: right !important; display: inline-block !important; margin: 0 0 1.5rem 1.5rem !important; }
                        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: white; }
                        `}
                    </style>

                    {fullBookData && (
                        <>
                            {includeCover && (
                                <div className="page-break flex flex-col items-center justify-center w-[100vw] h-[100vh] text-center"
                                     style={
                                         fullBookData.coverImage 
                                            ? { backgroundImage: `url(${fullBookData.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } 
                                            : { backgroundColor: fullBookData.coverColor || '#1a1818' }
                                     }
                                >
                                    {/* Optional texture layer if solid color */}
                                    {!fullBookData.coverImage && (
                                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
                                    )}
                                    <div className="bg-white/90 p-16 rounded-3xl max-w-[80%] shadow-2xl backdrop-blur-xl border border-white/20">
                                        <h1 className="text-5xl font-serif font-bold text-stone-900 tracking-tight mb-6">{fullBookData.title}</h1>
                                        {fullBookData.description && <p className="text-2xl text-stone-600 font-serif leading-relaxed italic">{fullBookData.description}</p>}
                                    </div>
                                </div>
                            )}

                            {includeToc && fullBookData.chapters?.length > 0 && (
                                <div className="page-break print-page">
                                    <h2 className="text-4xl font-serif font-bold border-b-2 border-stone-200 pb-4 mb-12 mt-12 text-stone-900">Table of Contents</h2>
                                    <div className="space-y-6 px-4 flex-grow">
                                        {fullBookData.chapters.map((chapter: any, i: number) => (
                                            <div key={chapter.id} className="flex justify-between items-baseline text-2xl font-serif text-stone-800">
                                                <span>Chapter {i + 1}: {chapter.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {fullBookData.chapters?.map((chapter: any, chapIdx: number) => (
                                <div key={chapter.id} className="chapter-section">
                                    <div className="page-break print-page flex flex-col justify-center items-center">
                                        <div className="text-center space-y-6">
                                            <div className="w-16 h-1 bg-luxury-gold mx-auto rounded-full mb-8"></div>
                                            <h1 className="text-5xl font-serif font-bold text-stone-900 uppercase tracking-widest text-luxury-gold">Chapter {chapIdx + 1}</h1>
                                            <h2 className="text-4xl font-serif text-stone-600 mt-4 italic">{chapter.title}</h2>
                                        </div>
                                    </div>
                                    
                                    {chapter.pages?.map((page: any, pageIdx: number) => (
                                        <div key={page.id} className="page-break print-page flex flex-col w-full">
                                            <div 
                                                className="prose prose-lg prose-stone max-w-4xl mx-auto w-full tiptap flex-grow overflow-hidden relative mb-16"
                                                dangerouslySetInnerHTML={{ __html: page.textContent || "" }}
                                            />
                                            {includeNumbers && (
                                                <div className="absolute bottom-4 left-0 right-0 w-full flex justify-center pt-8 border-t border-stone-100 bg-white">
                                                    <span className="text-stone-400 font-sans text-sm tracking-widest">{chapIdx + 1}.{pageIdx + 1}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
