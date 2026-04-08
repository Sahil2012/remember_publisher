import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { useSubscriptionModalStore } from "@/store/subscriptionModalStore";
import { useAPIClient } from "@/api/useAPIClient";
import { toast } from "sonner";
import { Button } from "./ui/button";

export function SubscriptionModal() {
    const { isOpen, close } = useSubscriptionModalStore();
    const apiClient = useAPIClient();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubscribe = async () => {
        setIsLoading(true);
        try {
            const { data } = await apiClient.post('/stripe/create-checkout-session');
            if (data.url) {
                window.location.href = data.url;
            } else {
                toast.error("Invalid response from billing server.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to initiate checkout. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={close}
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full max-w-2xl overflow-y-auto max-h-[90vh] bg-[#faf9f8] p-6 md:p-8 text-stone-800 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-stone-200"
                    >
                        {/* Close button */}
                        <button
                            onClick={close}
                            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-900 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="mx-auto max-w-lg text-center">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-4 font-sans">
                                Editions
                            </h4>
                            <h2 className="text-3xl md:text-4xl font-serif text-[#1e2326] mb-4 tracking-tight">
                                Create Your Legacy
                            </h2>
                            <p className="text-sm md:text-base text-[#787878] font-light max-w-[90%] mx-auto leading-relaxed mb-8">
                                <span className="text-[#a88a4b] font-medium">$49 per month</span> or save and get <span className="text-[#a88a4b] font-medium">12 months' subscription for just $294</span>. Get 6 months free access and enjoy the process without pressure.
                            </p>

                            <div className="w-full h-px bg-[#e8e6e1] mb-8" />

                            <div className="text-left">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-xl font-serif text-[#1e2326] font-medium">The Legacy Collection</h3>
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#a88a4b] border border-[#a88a4b]/30 px-2 py-0.5 rounded-full bg-[#a88a4b]/5">
                                        Recommended
                                    </span>
                                </div>
                                
                                <div className="text-3xl lg:text-4xl font-serif text-[#1e2326] mb-4">
                                    $49 <span className="text-lg font-serif">per month</span>
                                </div>
                                
                                <p className="text-[#686868] text-sm leading-relaxed mb-6 max-w-xl">
                                    Perfect for creating a timeless digital archive to share your story with friends, family, and future generations.
                                </p>

                                <ul className="space-y-4 mb-8">
                                    {[
                                        "Bi-weekly newsletters with tips, tricks and great wisdom on how to shape your story",
                                        "Access to our incredible system of story recording, building, and shaping into a beautiful document",
                                        "Digital E-Book (PDF)",
                                        "Shareable Online Link",
                                        "3-Month Backup Retention"
                                    ].map((feature, i) => (
                                        <li key={i} className="flex text-sm items-start">
                                            <span className="w-5 shrink-0 flex items-center justify-center mt-2 mr-2">
                                                <div className="w-3 h-[1px] bg-[#d2be8c]"></div>
                                            </span>
                                            <span className="leading-relaxed text-[#404040]">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    onClick={handleSubscribe}
                                    disabled={isLoading}
                                    className="w-full bg-[#1e2326] hover:bg-black text-white text-base font-medium h-12 rounded-full shadow-lg transition-all active:scale-[0.98]"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                                    ) : (
                                        "Start Your Story"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
