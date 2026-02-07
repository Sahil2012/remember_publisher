import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Chapter } from "@/api/books/types";

interface DeleteChapterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    chapter?: Chapter;
    isLoading?: boolean;
}

export function DeleteChapterModal({ isOpen, onClose, onConfirm, chapter, isLoading = false }: DeleteChapterModalProps) {
    const cancelRef = useRef<HTMLButtonElement>(null);

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
                        className={cn("fixed inset-0 z-50 bg-background/80 backdrop-blur-sm", isLoading && "pointer-events-none")}
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="w-full max-w-md pointer-events-auto bg-white rounded-2xl shadow-xl border border-destructive/10 overflow-hidden"
                        >
                            <div className="p-6 flex flex-col items-center text-center">
                                <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-4">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>

                                <h3 className="text-xl font-serif font-medium text-foreground mb-2">
                                    Delete Chapter?
                                </h3>

                                <p className="text-muted-foreground mb-6 text-sm">
                                    Are you sure you want to delete <span className="font-semibold text-foreground">"{chapter?.title}"</span>?
                                    This action cannot be undone and will delete all pages within this chapter.
                                </p>

                                <div className="flex w-full gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={onClose}
                                        disabled={isLoading}
                                        className="flex-1"
                                        ref={cancelRef}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={onConfirm}
                                        disabled={isLoading}
                                        className="flex-1"
                                    >
                                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                        {isLoading ? "Deleting..." : "Delete Chapter"}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
