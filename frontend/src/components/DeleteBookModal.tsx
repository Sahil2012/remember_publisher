import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DeleteBookModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    bookTitle: string;
    isLoading?: boolean;
}

export function DeleteBookModal({ isOpen, onClose, onConfirm, bookTitle, isLoading = false }: DeleteBookModalProps) {
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
                            className="w-full max-w-md pointer-events-auto bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                                        <AlertTriangle className="w-6 h-6 text-red-600" />
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" onClick={onClose} disabled={isLoading} className="rounded-full -mr-2 -mt-2 text-muted-foreground hover:text-foreground">
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>

                                <h3 className="text-xl font-serif font-medium text-foreground mb-2">Delete Book?</h3>
                                <p className="text-muted-foreground mb-6">
                                    Are you sure you want to delete <span className="font-semibold text-foreground">"{bookTitle}"</span>? This action cannot be undone and all chapters will be lost.
                                </p>

                                <div className="flex gap-3 justify-end">
                                    <Button variant="ghost" onClick={onClose} disabled={isLoading}>
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={onConfirm}
                                        disabled={isLoading}
                                        className="bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all"
                                    >
                                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                                        {isLoading ? "Deleting..." : "Delete Book"}
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
