import { useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BookCard, type Book } from "@/components/BookCard";

// Mock Data
const MOCK_BOOKS: Book[] = [
    { id: "1", title: "The Art of Leaving", lastEdited: "2 hours ago", wordCount: 12450, coverColor: "bg-stone-200" },
    { id: "2", title: "Business Strategy 2025", lastEdited: "Yesterday", wordCount: 8900, coverColor: "bg-blue-100" },
    { id: "3", title: "Memoirs of a Developer", lastEdited: "3 days ago", wordCount: 45000, coverColor: "bg-amber-100" },
];

export function Dashboard() {
    const navigate = useNavigate();
    const [books] = useState<Book[]>(MOCK_BOOKS);

    const handleCreateNew = () => {
        // In a real app, this would create a ID and then navigate
        const newId = Math.random().toString(36).substr(2, 9);
        navigate(`/book/${newId}`);
    };

    return (
        <div className="space-y-8">
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
                    onClick={handleCreateNew}
                    className="rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-lg hover:shadow-xl transition-all font-medium px-6 h-12 gap-2"
                >
                    <div className="w-5 h-5 rounded-full bg-education-gold/20 flex items-center justify-center border border-education-gold/30">
                        <Plus className="w-3.5 h-3.5 text-education-gold" />
                    </div>
                    Start New Book
                </Button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {books.map((book) => (
                    <BookCard
                        key={book.id}
                        book={book}
                        onClick={(id) => navigate(`/book/${id}`)}
                    />
                ))}
            </div>
        </div>
    );
}
