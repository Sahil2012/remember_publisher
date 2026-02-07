import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Chapter } from "@/api/books/types";

interface ChapterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (chapterData: { title: string; description: string }) => void;
    chapter?: Chapter;
    isLoading?: boolean;
}

export function ChapterModal({ isOpen, onClose, onSubmit, chapter, isLoading = false }: ChapterModalProps) {
    const [title, setTitle] = useState(chapter?.title || "");
    const [description, setDescription] = useState(chapter?.description || "");

    useEffect(() => {
        if (isOpen) {
            if (chapter) {
                setTitle(chapter.title);
                setDescription(chapter.description || "");
            } else {
                setTitle("");
                setDescription("");
            }
        }
    }, [isOpen, chapter]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;
        onSubmit({
            title,
            description,
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={!isLoading ? onClose : undefined}
                        className={cn("fixed inset-0 z-50 bg-background/60 backdrop-blur-sm", isLoading && "pointer-events-none")}
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="w-full max-w-lg pointer-events-auto"
                        >
                            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl border border-foreground/5 overflow-hidden flex flex-col min-h-[300px]">
                                <div className="p-6 flex flex-col bg-white">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-xl font-serif font-medium text-foreground">
                                                {chapter ? "Edit Chapter" : "New Chapter"}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {chapter ? "Update chapter details." : "Add a new chapter to your book."}
                                            </p>
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" onClick={onClose} disabled={isLoading} className="rounded-full -mr-2 -mt-2">
                                            <X className="w-5 h-5" />
                                        </Button>
                                    </div>

                                    <div className="space-y-6 flex-1">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Chapter Title</label>
                                            <input
                                                autoFocus
                                                type="text"
                                                value={title}
                                                disabled={isLoading}
                                                onChange={(e) => setTitle(e.target.value)}
                                                placeholder="e.g. The Beginning"
                                                className="w-full border-b-2 border-foreground/10 py-2 text-xl font-serif bg-transparent focus:outline-none focus:border-luxury-gold/50 transition-colors placeholder:text-muted-foreground/30 disabled:opacity-50"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description (Optional)</label>
                                            <textarea
                                                value={description}
                                                disabled={isLoading}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder="Briefly describe what happens..."
                                                rows={4}
                                                className="w-full rounded-lg bg-foreground/[0.02] border border-foreground/10 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold/30 resize-none transition-all disabled:opacity-50"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-foreground/5">
                                        <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={!title.trim() || isLoading}
                                            className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-6 shadow-md hover:shadow-lg transition-all"
                                        >
                                            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                            {chapter ? "Save Changes" : "Create Chapter"}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
