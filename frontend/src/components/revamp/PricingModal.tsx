import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAPIClient } from "@/api/useAPIClient";

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const pricingTiers = [
    {
        name: "The Legacy Collection",
        price: "$49",
        period: "/ month",
        description: "Perfect for creating a timeless digital archive to share your story.",
        features: [
            "Unlimited AI Tone Revamping",
            "Unlimited Voice-to-Text Dictation",
            "Digital E-Book (PDF) Generation",
            "Shareable Online Link for your story",
            "Full library access to all your books",
            "Bi-weekly storytelling guides",
        ],
        cta: "Start Your Story",
    }
];

export function PricingModal({ isOpen, onClose }: PricingModalProps) {
    const apiClient = useAPIClient();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubscribe = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.post("/stripe/create-checkout-session");
            if (response.data?.url) {
                window.location.href = response.data.url;
            }
        } catch (error) {
            console.error("Failed to create checkout session:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-border/50 max-h-[90vh] flex flex-col my-8"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted/50 transition-colors z-20"
                        >
                            <X className="h-5 w-5 text-muted-foreground" />
                        </button>

                        <div className="p-8 sm:p-12 overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-luxury-gold/40">
                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-serif font-semibold tracking-tight text-foreground mb-3">
                                    Unlock Your Legacy
                                </h2>
                                <p className="text-muted-foreground">
                                    Choose the plan that's right for your journey.
                                </p>
                            </div>

                            <div className="space-y-8">
                                {pricingTiers.map((tier) => (
                                    <div 
                                        key={tier.name}
                                        className="relative p-8 rounded-2xl border-2 border-luxury-gold/30 bg-luxury-gold/5"
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h3 className="text-xl font-semibold text-foreground mb-1">
                                                    {tier.name}
                                                </h3>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-4xl font-serif font-bold text-foreground">
                                                        {tier.price}
                                                    </span>
                                                    <span className="text-muted-foreground text-sm font-medium">
                                                        {tier.period}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="bg-luxury-gold text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                                                Recommended
                                            </div>
                                        </div>

                                        <p className="text-sm text-muted-foreground mb-8">
                                            {tier.description}
                                        </p>

                                        <ul className="space-y-4 mb-10">
                                            {tier.features.map((feature) => (
                                                <li key={feature} className="flex items-center gap-3 text-sm text-foreground/80">
                                                    <div className="h-5 w-5 rounded-full bg-luxury-gold/10 flex items-center justify-center shrink-0">
                                                        <Check className="h-3 w-3 text-luxury-gold" />
                                                    </div>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>

                                        <Button
                                            onClick={handleSubscribe}
                                            disabled={isLoading}
                                            className="w-full h-14 rounded-full bg-luxury-gold hover:bg-luxury-gold/90 text-white text-base font-semibold shadow-lg shadow-luxury-gold/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                tier.cta
                                            )}
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <p className="text-center text-xs text-muted-foreground mt-8">
                                Secure payment via Stripe. Cancel anytime.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
