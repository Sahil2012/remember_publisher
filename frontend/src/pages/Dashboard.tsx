import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookCard, type Book as BookCardType } from "@/components/BookCard";
import { BookModal } from "@/components/BookModal";
import { DeleteBookModal } from "@/components/DeleteBookModal";
import { useBooks } from "@/api/books/hooks/useBookData";
import { useBookActions } from "@/api/books/hooks/useBookActions";
import type { Book } from "@/api/books/types";

export function Dashboard() {
    const navigate = useNavigate();
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [editingBook, setEditingBook] = useState<Book | null>(null);
    const [deletingBook, setDeletingBook] = useState<Book | null>(null);

    // API Hooks
    const { data: booksData, isLoading, error } = useBooks();
    const { createBook, updateBook, deleteBook } = useBookActions();

    const handleSaveBook = async (bookData: any) => {
        try {
            if (editingBook) {
                await updateBook.mutateAsync({
                    id: editingBook.id,
                    payload: {
                        title: bookData.title,
                        description: bookData.description,
                        coverImage: bookData.coverImage,
                        coverColor: bookData.coverColor,
                        // Preserve existing status or other fields if needed
                        status: editingBook.status
                    }
                });
            } else {
                const newBook = await createBook.mutateAsync({
                    title: bookData.title,
                    description: bookData.description || "",
                    authorName: "My Author Name",
                    coverImage: bookData.coverImage || "",
                    coverColor: bookData.coverColor || "",
                    status: "DRAFT"
                });
                // Only navigate on create, stay on dashboard for edit
                if (!editingBook) {
                    navigate(`/book/${newBook.id}`);
                }
            }

            closeModals();
        } catch (err) {
            console.error("Failed to save book:", err);
            // TODO: Show toast notification
        }
    };

    const handleDeleteBook = async () => {
        if (!deletingBook) return;

        try {
            await deleteBook.mutateAsync(deletingBook.id);
            setDeletingBook(null);
        } catch (err) {
            console.error("Failed to delete book:", err);
            // TODO: Show toast notification
        }
    };

    const closeModals = () => {
        setCreateModalOpen(false);
        setEditingBook(null);
        setDeletingBook(null);
    };

    // Map API data to UI format
    const mapBookToCard = (book: Book): BookCardType => {
        return {
            id: book.id,
            title: book.title,
            lastEdited: new Date(book.updatedAt).toLocaleDateString(), // Simple formatting
            wordCount: 0, // Not supported by API yet
            coverColor: book.coverColor || "#e7e5e4", // Default or random
            coverImage: book.coverImage
        };
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-red-500">
                <p>Error loading books.</p>
                <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
                    Retry
                </Button>
            </div>
        );
    }

    const books = booksData || [];

    return (
        <div className="space-y-8">
            <BookModal
                isOpen={isCreateModalOpen || !!editingBook}
                onClose={closeModals}
                onSubmit={handleSaveBook}
                book={editingBook || undefined}
            />

            <DeleteBookModal
                isOpen={!!deletingBook}
                onClose={() => setDeletingBook(null)}
                onConfirm={handleDeleteBook}
                bookTitle={deletingBook?.title || ""}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-serif font-semibold tracking-tight text-foreground">
                        My Library
                    </h1>
                    <p className="text-muted-foreground">
                        Select a book to continue writing or start a new journey.
                    </p>
                </div>

                <Button
                    size="lg"
                    onClick={() => setCreateModalOpen(true)}
                    className="rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-lg hover:shadow-xl transition-all font-medium px-6 h-12 gap-2"
                >
                    <div className="w-5 h-5 rounded-full bg-luxury-gold/20 flex items-center justify-center border border-luxury-gold/30">
                        <Plus className="w-3.5 h-3.5 text-luxury-gold" />
                    </div>
                    Start New Book
                </Button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {books.map((book) => (
                    <BookCard
                        key={book.id}
                        book={mapBookToCard(book)}
                        onClick={(id) => navigate(`/book/${id}`)}
                        onEdit={(e) => {
                            e.stopPropagation();
                            setEditingBook(book);
                        }}
                        onDelete={(e) => {
                            e.stopPropagation();
                            setDeletingBook(book);
                        }}
                    />
                ))}

                {books.length === 0 && (
                    <div className="col-span-full text-center py-20 text-muted-foreground">
                        No books yet. Create one to get started!
                    </div>
                )}
            </div>
        </div>
    );
}
