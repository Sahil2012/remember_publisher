
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
        <div className="flex bg-foreground/5 p-1 rounded-full">
            {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;

                return (
                    <button
                        key={cat.id}
                        onClick={() => onSelect(cat.id)}
                        disabled={disabled}
                        className={cn(
                            "relative flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-full transition-all flex-1 md:flex-initial justify-center",
                            isSelected
                                ? "text-background bg-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground",
                            disabled && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {isSelected && (
                            <motion.div
                                layoutId="category-active"
                                className="absolute inset-0 rounded-full bg-foreground"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            <Icon className={cn("w-4 h-4", isSelected ? "text-background" : "text-foreground/50")} />
                            {cat.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
