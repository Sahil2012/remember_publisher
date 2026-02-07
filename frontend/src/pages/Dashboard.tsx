import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookCard, type Book as BookCardType } from "@/components/BookCard";
import { NewBookModal } from "@/components/NewBookModal";
import { useBooks } from "@/api/books/hooks/useBookData";
import { useBookActions } from "@/api/books/hooks/useBookActions";
import type { Book } from "@/api/books/types";

export function Dashboard() {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // API Hooks
    const { data: booksData, isLoading, error } = useBooks();
    const { createBook } = useBookActions();

    const handleCreateBook = async (bookData: any) => {
        try {
            const newBook = await createBook.mutateAsync({
                title: bookData.title,
                description: bookData.description || "",
                authorName: "My Author Name",
                coverImage: bookData.coverImage || null,
                coverColor: bookData.coverColor || "",
                status: "DRAFT"
            });

            setIsModalOpen(false);
            navigate(`/book/${newBook.id}`);
        } catch (err) {
            console.error("Failed to create book:", err);
            // TODO: Show toast notification
        }
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
            <NewBookModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={handleCreateBook}
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
                    onClick={() => setIsModalOpen(true)}
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
