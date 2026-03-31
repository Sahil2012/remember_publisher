import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, QrCode, Globe, CheckCircle2, Loader2, Lock, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import type { Book } from "@/api/books/types";
import { useBookActions } from "@/api/books/hooks/useBookActions";

interface ShareBookModalProps {
    isOpen: boolean;
    onClose: () => void;
    book: Book;
}

export function ShareBookModal({ isOpen, onClose, book }: ShareBookModalProps) {
    const { publishBook, unpublishBook } = useBookActions();
    const [copied, setCopied] = useState(false);

    const shareUrl = book.published?.shareId 
        ? `${window.location.origin}/read/${book.published.shareId}`
        : "";

    const handleCopy = () => {
        if (!shareUrl) return;
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePublish = async () => {
        try {
            await publishBook.mutateAsync(book.id);
            toast.success("Book successfully published!");
        } catch (error) {
            toast.error("Failed to generate share link.");
        }
    };

    const handleUnpublish = async () => {
        try {
            await unpublishBook.mutateAsync(book.id);
            toast.success("Book is now private.");
        } catch (error) {
            toast.error("Failed to unpublish book.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b px-6 py-4 bg-stone-50/50">
                    <div>
                        <h2 className="text-xl font-serif font-medium text-foreground">Share Book</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">Generate a public web reader</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 hover:bg-foreground/5">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="p-6">
                    {book.isPublic && shareUrl ? (
                        <div className="space-y-6 flex flex-col items-center animate-in fade-in">
                            <div className="flex flex-col items-center text-center space-y-2 mb-4">
                                <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-2">
                                    <Globe className="h-6 w-6" />
                                </div>
                                <h3 className="font-medium text-lg text-foreground">Your book is live!</h3>
                                <p className="text-sm text-muted-foreground px-4">
                                    Anyone with this link can read the frozen snapshot of your book. To update the contents, click Unpublish and generate a new snapshot.
                                </p>
                            </div>

                            {/* QR Code Container */}
                            <div className="p-4 bg-white rounded-xl shadow-sm border border-stone-100 ring-4 ring-stone-50">
                                <QRCodeSVG 
                                    value={shareUrl} 
                                    size={180} 
                                    level="H"
                                    includeMargin={false}
                                />
                            </div>

                            <div className="w-full space-y-2 mt-2">
                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Share Link</div>
                                <div className="flex w-full items-center gap-2">
                                    <div className="flex-1 overflow-hidden rounded-lg border bg-stone-50 px-3 py-2.5 text-sm text-stone-600 font-mono truncate cursor-pointer" onClick={handleCopy}>
                                        {shareUrl}
                                    </div>
                                    <Button size="icon" variant="outline" className="shrink-0 h-10 w-10 hover:bg-stone-50" onClick={handleCopy}>
                                        {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-foreground/70" />}
                                    </Button>
                                    <Button size="icon" variant="outline" className="shrink-0 h-10 w-10 hover:bg-stone-50" onClick={() => window.open(shareUrl, "_blank")}>
                                        <ExternalLink className="h-4 w-4 text-foreground/70" />
                                    </Button>
                                </div>
                            </div>

                            <Button 
                                variant="destructive" 
                                className="w-full mt-4 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-0" 
                                onClick={handleUnpublish}
                                disabled={unpublishBook.isPending}
                            >
                                {unpublishBook.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                                Turn off sharing (Unpublish)
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center space-y-6 py-6 animate-in zoom-in-95">
                            <div className="h-16 w-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                                <Lock className="h-8 w-8" />
                            </div>
                            <div className="space-y-2 px-4">
                                <h3 className="text-lg font-serif font-medium text-foreground">This book is private</h3>
                                <p className="text-sm text-muted-foreground">
                                    Generate a public web reader link and QR code. This will lock a snapshot of your current draft for readers.
                                </p>
                            </div>
                            
                            <Button 
                                className="w-full h-12 text-base shadow-lg bg-foreground hover:bg-foreground/90 transition-all font-medium mt-4" 
                                onClick={handlePublish}
                                disabled={publishBook.isPending}
                            >
                                {publishBook.isPending ? (
                                    <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Generating Snapshot...</>
                                ) : (
                                    <><QrCode className="w-5 h-5 mr-3" /> Publish & Generate Link</>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
