import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Check, Star } from "lucide-react";
import { useAPIClient } from "@/api/useAPIClient";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PricingModal({ isOpen, onClose }: PricingModalProps) {
    const apiClient = useAPIClient();
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
        setIsLoading(plan);
        try {
            const { data } = await apiClient.post('/stripe/create-checkout-session', { plan });
            if (data.url) {
                window.location.href = data.url;
            } else {
                toast.error("Invalid response from billing server.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to initiate checkout. Please try again later.");
        } finally {
            setIsLoading(null);
        }
    };

    const features = [
        "Bi-weekly newsletters with tips & tricks",
        "Full system access for story building",
        "Digital E-Book (PDF) included",
        "Shareable Online Link & Private Archive",
        "Secure cloud backups of your story"
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-black/60"
                        onClick={onClose}
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: 10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        style={{ transform: "translateZ(0)" }}
                        className="relative w-full max-w-4xl overflow-y-auto max-h-[95vh] bg-[#faf9f8] p-6 md:p-10 text-stone-800 rounded-2xl shadow-xl border border-stone-200 will-change-transform"
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-900 transition-colors z-10"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="text-center mb-10">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a88a4b] mb-4 font-sans">
                                Select Your Plan
                            </h4>
                            <h2 className="text-3xl md:text-4xl font-serif text-[#1e2326] mb-4 tracking-tight">
                                Create Your Legacy
                            </h2>
                            <p className="text-sm md:text-base text-[#787878] font-light max-w-md mx-auto leading-relaxed">
                                Choose the billing cycle that works best for you. Save 50% with our yearly special membership.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Monthly Plan */}
                            <div className="bg-white p-8 rounded-2xl border border-stone-100 flex flex-col shadow-sm">
                                <div className="mb-6">
                                    <h3 className="text-lg font-serif text-[#1e2326] font-medium mb-2">Monthly Membership</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-serif text-[#1e2326] font-semibold">$49</span>
                                        <span className="text-stone-400 italic">/month</span>
                                    </div>
                                    <p className="text-stone-500 text-xs mt-3">Simple monthly billing. Cancel anytime.</p>
                                </div>

                                <div className="space-y-4 mb-8 flex-1">
                                    {features.map((feature, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="mt-1 w-4 h-4 rounded-full bg-stone-50 flex items-center justify-center shrink-0">
                                                <Check className="w-2.5 h-2.5 text-stone-400" />
                                            </div>
                                            <span className="text-sm text-[#555] leading-snug">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    onClick={() => handleSubscribe('monthly')}
                                    disabled={!!isLoading}
                                    variant="outline"
                                    className="w-full h-12 rounded-full border-stone-200 text-stone-700 hover:bg-stone-50 font-medium transition-all"
                                >
                                    {isLoading === 'monthly' ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        "Start Monthly Plan"
                                    )}
                                </Button>
                            </div>

                            {/* Yearly Plan (Featured) */}
                            <div className="bg-white p-8 rounded-2xl border-2 border-[#a88a4b]/30 relative flex flex-col shadow-[0_10px_30px_-10px_rgba(168,138,75,0.15)]">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#a88a4b] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                                    <Star className="w-3 h-3 fill-current" />
                                    Yearly Special • Best Value
                                </div>

                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-lg font-serif text-[#1e2326] font-medium">Yearly Membership</h3>
                                        <span className="text-[10px] font-bold text-[#a88a4b] bg-[#a88a4b]/10 px-2 py-0.5 rounded uppercase">Save 50%</span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-serif text-[#1e2326] font-semibold">$294</span>
                                        <span className="text-stone-400 italic">/year</span>
                                    </div>
                                    <p className="text-[#a88a4b] text-xs font-medium mt-3">Equivalent to $24.50/month</p>
                                </div>

                                <div className="space-y-4 mb-8 flex-1">
                                    {features.map((feature, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="mt-1 w-4 h-4 rounded-full bg-[#a88a4b]/10 flex items-center justify-center shrink-0">
                                                <Check className="w-2.5 h-2.5 text-[#a88a4b]" />
                                            </div>
                                            <span className="text-sm text-[#555] leading-snug">{feature}</span>
                                        </div>
                                    ))}
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 w-4 h-4 rounded-full bg-[#a88a4b]/10 flex items-center justify-center shrink-0">
                                            <Check className="w-2.5 h-2.5 text-[#a88a4b]" />
                                        </div>
                                        <span className="text-sm text-[#1e2326] font-medium leading-snug">Priority Support included</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => handleSubscribe('yearly')}
                                    disabled={!!isLoading}
                                    className="w-full h-12 rounded-full bg-[#1e2326] hover:bg-black text-white font-medium shadow-lg transition-all active:scale-[0.98]"
                                >
                                    {isLoading === 'yearly' ? (
                                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                                    ) : (
                                        "Claim Yearly Special"
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="mt-10 pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-xs text-stone-400">All payments are encrypted and processed securely via Stripe.</p>
                            <div className="flex gap-4">
                                <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">Visa</span>
                                <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">Mastercard</span>
                                <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">American Express</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
