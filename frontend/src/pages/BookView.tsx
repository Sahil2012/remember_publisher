import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, FileText, Calendar, MoreVertical, Edit2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useBook } from "@/api/books/hooks/useBookData";
import type { Book } from "@/api/books/types";

// Mock Data for Pages/Chapters
const MOCK_PAGES = [
    { id: "1", title: "Chapter 1: The Beginning", wordCount: 1200, lastEdited: "2 hours ago" },
    { id: "2", title: "Chapter 2: Scaling Up", wordCount: 3500, lastEdited: "Yesterday" },
    { id: "3", title: "Chapter 3: The Pivot", wordCount: 2100, lastEdited: "3 days ago" },
];

export function BookView() {
    const { bookId } = useParams();
    const navigate = useNavigate();
    const [pages] = useState(MOCK_PAGES);

    const { data: book, isLoading } = useBook(bookId || "");

    const handleCreatePage = () => {
        const newPageId = Math.random().toString(36).substr(2, 9);
        navigate(`/book/${bookId}/page/${newPageId}`);
    };

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading book...</div>;
    }

    if (!book) {
        return <div className="p-8 text-center text-muted-foreground">Book not found or error loading.</div>;
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* Header / Navigation */}
            <div className="space-y-6">
                <Link to="/" className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group">
                    <ArrowLeft className="mr-1 h-3 w-3 group-hover:-translate-x-1 transition-transform" />
                    Back to Library
                </Link>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-foreground/10 pb-8">
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight text-foreground">
                            {book.title}
                        </h1>
                        <p className="text-muted-foreground font-light">
                            Table of Contents • {pages.length} Pages
                        </p>
                    </div>

                    <Button
                        size="lg"
                        onClick={handleCreatePage}
                        className="rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-lg hover:shadow-xl transition-all font-medium px-6 h-12 gap-2"
                    >
                        <div className="w-5 h-5 rounded-full bg-luxury-gold/20 flex items-center justify-center border border-luxury-gold/30">
                            <Plus className="w-3.5 h-3.5 text-luxury-gold" />
                        </div>
                        Add New Page
                    </Button>
                </div>
            </div>

            {/* Pages List (Table of Contents Style) */}
            <div className="space-y-3">
                {pages.map((page, index) => (
                    <motion.div
                        key={page.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Link
                            to={`/book/${bookId}/page/${page.id}`}
                            className="group flex items-center justify-between p-4 bg-white rounded-xl border border-foreground/5 shadow-sm hover:shadow-md hover:border-foreground/10 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center group-hover:bg-foreground/10 transition-colors">
                                    <span className="font-serif font-medium text-foreground/60">{index + 1}</span>
                                </div>
                                <div>
                                    <h3 className="font-medium text-lg text-foreground group-hover:text-luxury-gold transition-colors font-serif">
                                        {page.title}
                                    </h3>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> {page.lastEdited}
                                        </span>
                                        <span>•</span>
                                        <span>{page.wordCount} words</span>
                                    </div>
                                </div>
                            </div>

                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                                <Edit2 className="w-4 h-4" />
                            </Button>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Empty State if no pages */}
            {pages.length === 0 && (
                <div className="text-center py-20 bg-foreground/[0.02] rounded-2xl border-2 border-dashed border-foreground/5">
                    <FileText className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground">No pages yet</h3>
                    <p className="text-muted-foreground mb-6">Start writing your first chapter.</p>
                    <Button onClick={handleCreatePage} variant="outline">
                        Create Page 1
                    </Button>
                </div>
            )}
        </div>
    );
}
