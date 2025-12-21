
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Book, Briefcase } from "lucide-react";

export type Category = "Memoir" | "Business";

interface CategorySelectorProps {
    selectedCategory: Category;
    onSelect: (category: Category) => void;
    disabled?: boolean;
}

export function CategorySelector({ selectedCategory, onSelect, disabled }: CategorySelectorProps) {

    const categories: { id: Category; label: string; icon: any }[] = [
        { id: "Memoir", label: "Memoir / Personal Story", icon: Book },
        { id: "Business", label: "Business / Wisdom", icon: Briefcase },
    ];

    return (
        <div className="flex p-1 bg-muted/40 rounded-xl w-full sm:w-auto self-start">
            {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;

                return (
                    <button
                        key={cat.id}
                        onClick={() => onSelect(cat.id)}
                        disabled={disabled}
                        className={cn(
                            "relative flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-all flex-1 sm:flex-initial",
                            isSelected ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                            disabled && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {isSelected && (
                            <motion.div
                                layoutId="category-bg" // Share layoutId for smooth sliding background
                                className="absolute inset-0 bg-white dark:bg-card shadow-sm rounded-lg border border-border/50"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            <Icon className={cn("w-4 h-4", isSelected ? "text-[#D97736]" : "opacity-70")} />
                            {cat.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
