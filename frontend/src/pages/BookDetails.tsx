import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBook } from "@/api/books/hooks/useBookData";
import { ArrowLeft, BookOpen, Clock, FileText, Plus, Edit2, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChapterModal } from "@/components/ChapterModal";
import { DeleteChapterModal } from "@/components/DeleteChapterModal";
import { useChapterActions } from "@/api/chapters/hooks/useChapterActions";
import type { Chapter } from "@/api/books/types";
import { toast } from "sonner";
import { useIsMutating } from "@tanstack/react-query";

export function BookDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: book, isLoading, error } = useBook(id || "");
    const { createChapter, updateChapter, deleteChapter } = useChapterActions();
    const isMutating = useIsMutating();
    const isGlobalLoading = isMutating > 0;

    const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
    const [isDeleteChapterModalOpen, setIsDeleteChapterModalOpen] = useState(false);
    const [selectedChapter, setSelectedChapter] = useState<Chapter | undefined>(undefined);

    const handleAddChapter = () => {
        setSelectedChapter(undefined);
        setIsChapterModalOpen(true);
    };

    const handleEditChapter = (chapter: Chapter) => {
        setSelectedChapter(chapter);
        setIsChapterModalOpen(true);
    };

    const handleDeleteChapter = (chapter: Chapter) => {
        setSelectedChapter(chapter);
        setIsDeleteChapterModalOpen(true);
    };

    const handleSaveChapter = async (chapterData: { title: string; description: string }) => {
        if (!id) return;

        try {
            if (selectedChapter) {
                await updateChapter.mutateAsync({
                    bookId: id,
                    id: selectedChapter.id,
                    payload: chapterData
                });
                toast.success("Chapter updated successfully");
            } else {
                await createChapter.mutateAsync({
                    bookId: id,
                    payload: { ...chapterData, order: (book?.chapters?.length || 0) + 1 }
                });
                toast.success("Chapter created successfully");
            }
            setIsChapterModalOpen(false);
        } catch (error) {
            console.error("Failed to save chapter:", error);
            toast.error("Failed to save chapter");
        }
    };

    const handleConfirmDeleteChapter = async () => {
        if (!id || !selectedChapter) return;

        try {
            await deleteChapter.mutateAsync({
                bookId: id,
                id: selectedChapter.id
            });
            toast.success("Chapter deleted successfully");
            setIsDeleteChapterModalOpen(false);
        } catch (error) {
            console.error("Failed to delete chapter:", error);
            toast.error("Failed to delete chapter");
        }
    };


    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader size="lg" className="animate-spin text-luxury-gold" />
            </div>
        );
    }

    if (error || !book) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
                <div className="text-xl font-serif text-destructive">Book not found</div>
                <Button onClick={() => navigate("/library")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Library
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground animate-in fade-in duration-500">
            <main className="container mx-auto max-w-7xl px-4 pt-4 pb-8">
                {/* Book Header Section */}
                <div className="mb-16 grid gap-12 md:grid-cols-[280px_1fr] items-start pt-10">
                    {/* Cover Image/Color */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="aspect-[2/3] w-full overflow-hidden rounded-lg shadow-2xl ring-1 ring-foreground/5 sticky top-24"
                    >
                        {book.coverImage ? (
                            <img src={book.coverImage} alt={book.title} className="h-full w-full object-cover" />
                        ) : (
                            <div
                                className="flex h-full w-full items-center justify-center"
                                style={{ backgroundColor: book.coverColor || "#e7e5e4" }}
                            >
                                <BookOpen className="h-16 w-16 text-foreground/20" />
                            </div>
                        )}
                    </motion.div>

                    {/* Book Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex flex-col justify-center h-full"
                    >
                        <div className="mb-6">
                            <span className={cn(
                                "rounded-full px-3 py-1 text-xs font-semibold tracking-wider uppercase border",
                                book.status === "DRAFT"
                                    ? "bg-amber-50 text-amber-900 border-amber-200"
                                    : "bg-emerald-50 text-emerald-900 border-emerald-200"
                            )}>
                                {book.status === "DRAFT" ? "Draft" : "Published"}
                            </span>
                        </div>
                        <h1 className="mb-6 font-serif text-5xl md:text-7xl font-medium leading-tight text-foreground tracking-tight">
                            {book.title}
                        </h1>
                        <p className="mb-8 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
                            {book.description || "No description provided."}
                        </p>

                        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                <span>{book.chapters?.length || 0} Chapters</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>Updated {new Date(book.updatedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Chapters Section */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="font-serif text-3xl font-medium">Chapters</h2>
                        <Button
                            onClick={handleAddChapter}
                            className="rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-lg hover:shadow-xl transition-all"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            New Chapter
                        </Button>
                    </div>

                    <div className="grid gap-4">
                        {(!book.chapters || book.chapters.length === 0) ? (
                            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-foreground/10 bg-foreground/[0.02] py-16 text-center">
                                <div className="mb-4 rounded-full bg-foreground/5 p-4">
                                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="mb-2 font-serif text-xl font-medium">No chapters yet</h3>
                                <p className="mb-6 max-w-sm text-muted-foreground">
                                    Start writing your book by adding your first chapter.
                                </p>
                                <Button variant="outline" onClick={handleAddChapter} className="border-foreground/20 hover:bg-foreground/5">
                                    Add Chapter
                                </Button>
                            </div>
                        ) : (
                            book.chapters.map((chapter: Chapter, index: number) => (
                                <motion.div
                                    key={chapter.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group relative flex items-center gap-6 overflow-hidden rounded-xl border border-foreground/5 bg-card p-6 shadow-sm transition-all hover:border-luxury-gold/30 hover:shadow-md"
                                >
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-foreground/5 font-serif text-xl font-medium text-foreground/60 group-hover:bg-luxury-gold/10 group-hover:text-luxury-gold transition-colors">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0" onClick={() => {/* Navigate to chapter content - TODO */ }}>
                                        <h3 className="mb-1 font-serif text-xl font-medium text-foreground group-hover:text-luxury-gold transition-colors truncate cursor-pointer">
                                            {chapter.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground line-clamp-1">
                                            {chapter.description || "No description"}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-xs text-muted-foreground/60 hidden sm:block">
                                            {chapter.pages?.length || 0} Pages
                                        </div>

                                        {/* Actions - visible on hover or persistent on touch */}
                                        <div className="flex items-center gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:text-foreground hover:bg-foreground/5"
                                                onClick={(e) => { e.stopPropagation(); handleEditChapter(chapter); }}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:text-destructive hover:bg-destructive/10 text-muted-foreground"
                                                onClick={(e) => { e.stopPropagation(); handleDeleteChapter(chapter); }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </main>

            <ChapterModal
                isOpen={isChapterModalOpen}
                onClose={() => setIsChapterModalOpen(false)}
                onSubmit={handleSaveChapter}
                chapter={selectedChapter}
                isLoading={isGlobalLoading}
            />

            <DeleteChapterModal
                isOpen={isDeleteChapterModalOpen}
                onClose={() => setIsDeleteChapterModalOpen(false)}
                onConfirm={handleConfirmDeleteChapter}
                chapter={selectedChapter}
                isLoading={isGlobalLoading}
            />
        </div>
    );
}
