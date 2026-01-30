import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Book, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NewBookModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (bookData: any) => void;
}

const BOOK_TYPES = [
    { id: "memoir", label: "Memoir", description: "Capture your life story." },
    { id: "business", label: "Business", description: "Share your professional expertise." },
    { id: "fiction", label: "Fiction", description: "Craft a new world." },
    { id: "non-fiction", label: "Non-Fiction", description: "Explore real-world topics." },
];

const COVER_COLORS = [
    { id: "stone", class: "bg-stone-200", label: "Classic Stone" },
    { id: "blue", class: "bg-blue-100", label: "Sky Blue" },
    { id: "amber", class: "bg-amber-100", label: "Warm Amber" },
    { id: "emerald", class: "bg-emerald-100", label: "Soft Emerald" },
    { id: "rose", class: "bg-rose-100", label: "Dusty Rose" },
    { id: "slate", class: "bg-slate-200", label: "Cool Slate" },
];

export function NewBookModal({ isOpen, onClose, onCreate }: NewBookModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState(BOOK_TYPES[0].id);
    const [coverColor, setCoverColor] = useState(COVER_COLORS[0].id);
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreate({
            title,
            description,
            type,
            coverColor: COVER_COLORS.find(c => c.id === coverColor)?.class || "bg-stone-200",
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
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm"
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
                            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl border border-foreground/5 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
                                {/* Left visual spine/cover preview */}
                                <div className={cn(
                                    "w-full md:w-1/3 p-8 flex flex-col justify-between relative transition-all duration-500 bg-cover bg-center",
                                    !coverImage && COVER_COLORS.find(c => c.id === coverColor)?.class
                                )}
                                    style={coverImage ? { backgroundImage: `url(${coverImage})` } : undefined}
                                >
                                    <div className={cn("absolute inset-0 pointer-events-none transition-colors",
                                        coverImage ? "bg-black/40" : "bg-gradient-to-tr from-black/5 to-transparent"
                                    )} />

                                    <div className="relative z-10">
                                        <div className="w-12 h-12 rounded-full bg-white/40 backdrop-blur-sm flex items-center justify-center mb-6 shadow-sm border border-white/20">
                                            <Book className="w-6 h-6 text-foreground/80" />
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
                                <div className="flex-1 p-8 flex flex-col bg-white overflow-y-auto max-h-[80vh] md:max-h-full">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-xl font-serif font-medium text-foreground">Create New Book</h3>
                                            <p className="text-sm text-muted-foreground">Start your new writing journey.</p>
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" onClick={onClose} className="rounded-full -mr-2 -mt-2">
                                            <X className="w-5 h-5" />
                                        </Button>
                                    </div>

                                    <div className="space-y-6 flex-1">
                                        {/* Title Input - Underline Style */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Book Title</label>
                                            <input
                                                autoFocus
                                                type="text"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                placeholder="Enter a memorable title..."
                                                className="w-full border-b-2 border-foreground/10 py-2 text-xl font-serif bg-transparent focus:outline-none focus:border-luxury-gold/50 transition-colors placeholder:text-muted-foreground/30"
                                            />
                                        </div>

                                        {/* Description */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Summary</label>
                                            <textarea
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder="What is this book about?"
                                                rows={3}
                                                className="w-full rounded-lg bg-foreground/[0.02] border border-foreground/10 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold/30 resize-none transition-all"
                                            />
                                        </div>

                                        {/* Type Selection */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {BOOK_TYPES.map((t) => (
                                                    <button
                                                        key={t.id}
                                                        type="button"
                                                        onClick={() => setType(t.id)}
                                                        className={cn(
                                                            "text-left p-3 rounded-xl border transition-all relative overflow-hidden group",
                                                            type === t.id
                                                                ? "border-luxury-gold bg-luxury-gold/5"
                                                                : "border-foreground/10 hover:border-foreground/20 bg-white"
                                                        )}
                                                    >
                                                        <div className="text-sm font-medium text-foreground">{t.label}</div>
                                                        <div className="text-xs text-muted-foreground line-clamp-1">{t.description}</div>

                                                        {type === t.id && (
                                                            <div className="absolute top-2 right-2 text-luxury-gold">
                                                                <Check className="w-3.5 h-3.5" />
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
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
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 px-2 text-xs text-luxury-gold hover:text-luxury-gold hover:bg-luxury-gold/5"
                                                    onClick={() => fileInputRef.current?.click()}
                                                >
                                                    <Upload className="w-3 h-3 mr-1.5" />
                                                    {coverImage ? "Change Photo" : "Upload Photo"}
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
                                                            onClick={() => setCoverColor(c.id)}
                                                            className={cn(
                                                                "flex-shrink-0 w-8 h-8 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-luxury-gold/50",
                                                                c.class,
                                                                coverColor === c.id
                                                                    ? "ring-2 ring-luxury-gold ring-offset-2 scale-110 shadow-md"
                                                                    : "ring-1 ring-foreground/5 hover:scale-105 hover:shadow-sm"
                                                            )}
                                                            title={c.label}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-foreground/5">
                                        <Button type="button" variant="ghost" onClick={onClose}>
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={!title.trim()}
                                            className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-6 shadow-md hover:shadow-lg transition-all"
                                        >
                                            Create Book
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
