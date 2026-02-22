import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Chapter } from "@/api/books/types";

interface MovePageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (chapterId: string) => void;
    chapters: Chapter[];
    currentChapterId: string;
    isLoading?: boolean;
}

export function MovePageModal({ isOpen, onClose, onSubmit, chapters, currentChapterId, isLoading = false }: MovePageModalProps) {
    const [selectedChapterId, setSelectedChapterId] = useState("");

    useEffect(() => {
        if (isOpen) {
            setSelectedChapterId("");
        }
    }, [isOpen]);

    const availableChapters = chapters.filter(c => c.id !== currentChapterId).sort((a, b) => a.order - b.order);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading || !selectedChapterId) return;
        onSubmit(selectedChapterId);
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
                            className="w-full max-w-sm pointer-events-auto"
                        >
                            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl border border-stone-200/50 overflow-hidden flex flex-col">
                                <div className="p-6 flex flex-col bg-white">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-stone-100 rounded-lg text-stone-600">
                                                <ArrowRightLeft className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-serif font-medium text-foreground">
                                                    Move Page
                                                </h3>
                                            </div>
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" onClick={onClose} disabled={isLoading} className="rounded-full -mr-2 -mt-2 text-stone-400">
                                            <X className="w-5 h-5" />
                                        </Button>
                                    </div>

                                    <div className="space-y-4 flex-1">
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium uppercase tracking-wider text-stone-500">Destination Chapter</label>
                                            <select
                                                value={selectedChapterId}
                                                disabled={isLoading}
                                                onChange={(e) => setSelectedChapterId(e.target.value)}
                                                className="w-full rounded-lg bg-stone-50 border border-stone-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 transition-all font-serif"
                                            >
                                                <option value="" disabled>Select a chapter...</option>
                                                {availableChapters.map(c => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.order === -1 ? "ScratchPad" : `${c.title}`}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-stone-100">
                                        <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading} className="text-stone-500 hover:text-stone-900 hover:bg-stone-100">
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={!selectedChapterId || isLoading}
                                            className="bg-stone-900 text-white hover:bg-stone-800 rounded-lg px-6 shadow-sm hover:shadow transition-all"
                                        >
                                            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                            Move
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
