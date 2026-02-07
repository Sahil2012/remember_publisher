import { motion } from "framer-motion";
import { Book as BookIcon, Calendar, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface Book {
    id: string;
    title: string;
    lastEdited: string;
    wordCount: number;
    coverColor?: string;
    coverImage?: string | null;
}

interface BookCardProps {
    book: Book;
    onClick: (id: string) => void;
    onEdit: (e: React.MouseEvent) => void;
    onDelete: (e: React.MouseEvent) => void;
}

export function BookCard({ book, onClick, onEdit, onDelete }: BookCardProps) {
    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="group relative flex flex-col bg-white rounded-r-2xl rounded-l-md border border-foreground/10 shadow-sm hover:shadow-md transition-all cursor-pointer h-64 overflow-hidden"
            onClick={() => onClick(book.id)}
        >
            {/* Book Spine visual */}
            <div className="absolute left-0 top-0 bottom-0 w-3 bg-foreground/5 border-r border-white/20 z-10" />

            {/* Cover Area */}
            <div
                className={cn(
                    "h-40 p-6 flex flex-col justify-between relative overflow-hidden bg-cover bg-center transition-all",
                    !book.coverImage && "bg-white" // Default fallback if no color/image
                )}
                style={{
                    ...(book.coverImage ? { backgroundImage: `url(${book.coverImage})` } : {}),
                    ...(book.coverColor && !book.coverImage ? { backgroundColor: book.coverColor } : {})
                }}
            >
                {/* Overlay for text readability on images */}
                <div className={cn("absolute inset-0 pointer-events-none transition-opacity",
                    book.coverImage ? "bg-black/30 group-hover:bg-black/20" : "hidden"
                )} />

                <div className="absolute top-4 right-4 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-20 flex gap-1">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-8 w-8 bg-white/50 backdrop-blur hover:bg-white text-foreground"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(e);
                        }}
                    >
                        <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-8 w-8 bg-white/50 backdrop-blur hover:bg-red-50 text-foreground hover:text-red-600"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(e);
                        }}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>

                <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center relative z-10 border border-white/20">
                    <BookIcon className={cn("h-5 w-5", book.coverImage ? "text-white" : "text-foreground/70")} />
                </div>

                {/* Decorative Pattern - Only show if no image */}
                {!book.coverImage && (
                    <div className="absolute -right-4 -bottom-8 text-foreground/5 rotate-12">
                        <BookIcon className="w-32 h-32" />
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 p-4 flex flex-col justify-between bg-white pl-6">
                <div>
                    <h3 className="font-serif font-medium text-lg leading-tight text-foreground line-clamp-2">
                        {book.title}
                    </h3>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground mt-4">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        <span>{book.lastEdited}</span>
                    </div>
                    <span className="font-medium bg-foreground/5 px-2 py-0.5 rounded-full">
                        {book.wordCount} words
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
