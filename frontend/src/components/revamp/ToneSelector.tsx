import { motion } from "framer-motion";
import { Check, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToneOption {
    id: string;
    label: string;
    icon: LucideIcon;
    description: string;
}

interface ToneSelectorProps {
    selectedTone: string;
    onSelect: (tone: string) => void;
    tones: ToneOption[];
    disabled?: boolean;
}

export function ToneSelector({ selectedTone, onSelect, tones, disabled }: ToneSelectorProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {tones.map((tone) => {
                const isSelected = selectedTone === tone.id;
                const Icon = tone.icon;

                return (
                    <button
                        key={tone.id}
                        onClick={() => onSelect(tone.id)}
                        disabled={disabled}
                        className={`
                            group relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all
                            ${isSelected
                                ? "bg-luxury-gold text-white shadow-md hover:bg-luxury-gold/90 ring-2 ring-luxury-gold/20"
                                : "bg-white dark:bg-card border border-border/50 text-muted-foreground hover:border-luxury-gold/50 hover:text-foreground"
                            }
                            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                        `}
                    >
                        <Icon className={cn("h-4 w-4", isSelected ? "text-luxury-gold" : "opacity-70 group-hover:text-luxury-gold group-hover:opacity-100")} />
                        {tone.label}
                        {isSelected && (
                            <motion.div
                                layoutId="tone-check"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="ml-1"
                            >
                                <Check className="h-3 w-3" />
                            </motion.div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
