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
                        className={cn(
                            "group relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
                            isSelected
                                ? "bg-foreground text-background shadow-md hover:opacity-90 active:scale-95"
                                : "bg-white border border-foreground/10 text-muted-foreground hover:border-foreground/30 hover:text-foreground hover:bg-white/80",
                            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                        )}
                    >
                        <Icon className={cn("h-4 w-4", isSelected ? "text-background" : "opacity-70 group-hover:opacity-100")} />
                        {tone.label}
                    </button>
                );
            })}
        </div>
    );
}
