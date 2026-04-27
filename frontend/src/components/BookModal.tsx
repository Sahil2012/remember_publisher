import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Book, Upload, Loader2, GraduationCap, Briefcase, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUploadFile } from "@/api/upload/hooks";

import type { Book as BookType } from "@/api/books/types";

interface BookModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (bookData: any) => void;
    book?: BookType;
    isLoading?: boolean;
}

const BOOK_TYPES = [
    { id: "Life Story", backendId: "MEMOIR", label: "Life Story", description: "Capture a life journey.", icon: Book },
    { id: "Yearbook", backendId: "YEARBOOK", label: "Yearbook", description: "Commemorate a school year.", icon: GraduationCap },
    { id: "Business", backendId: "BUSINESS", label: "Business", description: "Share professional expertise.", icon: Briefcase },
];

const COVER_COLORS = [
    { id: "stone", hex: "#e7e5e4", label: "Classic Stone" },
    { id: "blue", hex: "#dbeafe", label: "Sky Blue" },
    { id: "amber", hex: "#fef3c7", label: "Warm Amber" },
    { id: "emerald", hex: "#d1fae5", label: "Soft Emerald" },
    { id: "rose", hex: "#ffe4e6", label: "Dusty Rose" },
    { id: "slate", hex: "#f1f5f9", label: "Cool Slate" },
];

export function BookModal({ isOpen, onClose, onSubmit, book, isLoading = false }: BookModalProps) {
    const [title, setTitle] = useState(book?.title || "");
    const [description, setDescription] = useState(book?.description || "");
    
    // Map backend category back to frontend ID if editing
    const getInitialType = () => {
        if (!book?.category) return BOOK_TYPES[0].id;
        const found = BOOK_TYPES.find(t => t.backendId === book.category || t.id === book.category);
        return found ? found.id : BOOK_TYPES[0].id;
    };

    const [type, setType] = useState(getInitialType());
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
    const [coverColor, setCoverColor] = useState(book?.coverColor || COVER_COLORS[0].hex);
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const typeDropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
                setIsTypeDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Sync state with book prop when it changes or modal opens
    useEffect(() => {
        if (isOpen) {
            if (book) {
                setTitle(book.title);
                setDescription(book.description);
                setType(getInitialType());
                setCoverColor(book.coverColor || COVER_COLORS[0].hex);
                setCoverImage(book.coverImage || null);
            } else {
                // Reset for create mode
                setTitle("");
                setDescription("");
                setType(BOOK_TYPES[0].id);
                setCoverColor(COVER_COLORS[0].hex);
                setCoverImage(null);
            }
        }
    }, [isOpen, book]);

    // Upload Hook
    const { mutateAsync: uploadFile, isPending: isUploading } = useUploadFile();

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const url = await uploadFile(file);
                setCoverImage(url);
            } catch (error) {
                console.error("Upload failed:", error);
                // TODO: Show toast error
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;
        
        const selectedType = BOOK_TYPES.find(t => t.id === type);
        
        onSubmit({
            title,
            description,
            category: selectedType?.backendId || "MEMOIR",
            coverColor: coverColor,
            coverImage
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

                    {/* Modal with "Paper" Physics */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10, rotateX: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10, rotateX: 5 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="w-full max-w-2xl pointer-events-auto"
                        >
                            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl border border-foreground/5 overflow-hidden flex flex-col md:flex-row min-h-[400px]">
                                {/* Left visual spine/cover preview */}
                                <div className={cn(
                                    "w-full md:w-1/3 p-8 flex flex-col justify-between relative transition-all duration-500 bg-cover bg-center",
                                    !coverImage && "bg-white"
                                )}
                                    style={coverImage ? { backgroundImage: `url(${coverImage})` } : { backgroundColor: coverColor }}
                                >
                                    <div className={cn("absolute inset-0 pointer-events-none transition-colors",
                                        coverImage ? "bg-black/40" : "bg-gradient-to-tr from-black/5 to-transparent"
                                    )} />

                                    <div className="relative z-10">
                                        <div className="w-12 h-12 rounded-full bg-white/40 backdrop-blur-sm flex items-center justify-center mb-6 shadow-sm border border-white/20">
                                            {(() => {
                                                const Icon = BOOK_TYPES.find(t => t.id === type)?.icon || Book;
                                                return <Icon className="w-6 h-6 text-foreground/80" />;
                                            })()}
                                        </div>
                                        <h2 className={cn("font-serif text-2xl font-medium leading-tight break-words transition-colors",
                                            coverImage ? "text-white drop-shadow-md" : "text-foreground"
                                        )}>
                                            {title || "Untitled Book"}
                                        </h2>
                                        <p className={cn("mt-4 text-sm font-medium tracking-wide uppercase transition-colors",
                                            coverImage ? "text-white/80" : "text-foreground/60"
                                        )}>
                                            {BOOK_TYPES.find(t => t.id === type)?.label}
                                        </p>
                                    </div>

                                    <div className="relative z-10 mt-auto">
                                        <div className={cn("text-xs font-mono transition-colors",
                                            coverImage ? "text-white/60" : "text-foreground/50"
                                        )}>
                                            Author
                                        </div>
                                        <div className={cn("text-sm font-medium transition-colors",
                                            coverImage ? "text-white/90" : "text-foreground/80"
                                        )}>
                                            You
                                        </div>
                                    </div>
                                </div>

                                {/* Right form content */}
                                <div className="flex-1 p-6 flex flex-col bg-white overflow-y-auto max-h-[80vh] md:max-h-full">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-xl font-serif font-medium text-foreground">
                                                {book ? "Edit Book" : "Create New Book"}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {book ? "Update your book details." : "Start your new writing journey."}
                                            </p>
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" onClick={onClose} disabled={isLoading} className="rounded-full -mr-2 -mt-2">
                                            <X className="w-5 h-5" />
                                        </Button>
                                    </div>

                                    <div className="space-y-4 flex-1">
                                        {/* Title Input - Underline Style */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Book Title</label>
                                            <input
                                                autoFocus
                                                type="text"
                                                value={title}
                                                disabled={isLoading}
                                                onChange={(e) => setTitle(e.target.value)}
                                                placeholder="Enter a memorable title..."
                                                className="w-full border-b-2 border-foreground/10 py-2 text-xl font-serif bg-transparent focus:outline-none focus:border-luxury-gold/50 transition-colors placeholder:text-muted-foreground/30 disabled:opacity-50"
                                            />
                                        </div>

                                        {/* Description */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Summary</label>
                                            <textarea
                                                value={description}
                                                disabled={isLoading}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder="What is this book about?"
                                                rows={3}
                                                className="w-full rounded-lg bg-foreground/[0.02] border border-foreground/10 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold/30 resize-none transition-all disabled:opacity-50"
                                            />
                                        </div>

                                        {/* Type Selection - Dropdown */}
                                        <div className="space-y-2 relative" ref={typeDropdownRef}>
                                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</label>
                                            <button
                                                type="button"
                                                disabled={isLoading}
                                                onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                                                className={cn(
                                                    "w-full flex items-center justify-between p-3 rounded-xl border transition-all bg-white disabled:opacity-50",
                                                    isTypeDropdownOpen ? "border-luxury-gold ring-1 ring-luxury-gold/20" : "border-foreground/10 hover:border-foreground/20"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-1.5 rounded-lg bg-luxury-gold/10 text-luxury-gold">
                                                        {(() => {
                                                            const Icon = BOOK_TYPES.find(t => t.id === type)?.icon || Book;
                                                            return <Icon className="w-4 h-4" />;
                                                        })()}
                                                    </div>
                                                    <div className="text-sm font-medium text-foreground">
                                                        {BOOK_TYPES.find(t => t.id === type)?.label}
                                                    </div>
                                                </div>
                                                {isTypeDropdownOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                                            </button>

                                            <AnimatePresence>
                                                {isTypeDropdownOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -4 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -4 }}
                                                        className="absolute z-[60] top-full left-0 right-0 mt-2 bg-white border border-foreground/10 rounded-xl shadow-xl overflow-hidden"
                                                    >
                                                        {BOOK_TYPES.map((t) => (
                                                            <button
                                                                key={t.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    setType(t.id);
                                                                    setIsTypeDropdownOpen(false);
                                                                }}
                                                                className={cn(
                                                                    "w-full text-left p-3 flex items-center gap-3 hover:bg-luxury-gold/5 transition-colors",
                                                                    type === t.id && "bg-luxury-gold/5"
                                                                )}
                                                            >
                                                                <div className={cn(
                                                                    "p-1.5 rounded-lg transition-colors",
                                                                    type === t.id ? "bg-luxury-gold text-white" : "bg-foreground/5 text-foreground/40"
                                                                )}>
                                                                    <t.icon className="w-4 h-4" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="text-sm font-medium text-foreground">{t.label}</div>
                                                                    <div className="text-[10px] text-muted-foreground">{t.description}</div>
                                                                </div>
                                                                {type === t.id && <Check className="w-4 h-4 text-luxury-gold" />}
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Cover Selection: Color or Image */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cover Style</label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    ref={fileInputRef}
                                                    onChange={handleImageUpload}
                                                    disabled={isLoading || isUploading}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={isLoading || isUploading}
                                                    className="h-6 px-2 text-xs text-luxury-gold hover:text-luxury-gold hover:bg-luxury-gold/5"
                                                    onClick={() => fileInputRef.current?.click()}
                                                >
                                                    <Upload className="w-3 h-3 mr-1.5" />
                                                    {isUploading ? "Uploading..." : (coverImage ? "Change Photo" : "Upload Photo")}
                                                </Button>
                                            </div>

                                            {coverImage ? (
                                                <div className="relative group rounded-xl overflow-hidden border border-foreground/10 h-16 w-full bg-foreground/5 flex items-center px-4">
                                                    <img src={coverImage} alt="Cover Preview" className="h-10 w-10 object-cover rounded shadow-sm mr-3" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">Custom Cover Image</p>
                                                        <p className="text-xs text-muted-foreground">Tap 'Change Photo' to replace</p>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        disabled={isLoading}
                                                        className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                                        onClick={() => setCoverImage(null)}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-3 pt-2 pl-1">
                                                    {COVER_COLORS.map((c) => (
                                                        <button
                                                            key={c.id}
                                                            type="button"
                                                            disabled={isLoading}
                                                            onClick={() => setCoverColor(c.hex)}
                                                            className={cn(
                                                                "flex-shrink-0 w-8 h-8 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-luxury-gold/50 disabled:opacity-50 disabled:cursor-not-allowed",
                                                                coverColor === c.hex
                                                                    ? "ring-2 ring-luxury-gold ring-offset-2 scale-110 shadow-md"
                                                                    : "ring-1 ring-foreground/5 hover:scale-105 hover:shadow-sm"
                                                            )}
                                                            style={{ backgroundColor: c.hex }}
                                                            title={c.label}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-foreground/5">
                                        <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={!title.trim() || isLoading}
                                            className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-6 shadow-md hover:shadow-lg transition-all"
                                        >
                                            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                            {book ? "Save Changes" : "Create Book"}
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
