import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAPIClient } from "@/api/useAPIClient";

export function Billing() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const success = searchParams.get("success");
    const apiClient = useAPIClient();
    const [isSyncing, setIsSyncing] = useState(success === "true");

    useEffect(() => {
        const syncSubscription = async () => {
            if (success === "true") {
                try {
                    await apiClient.get('/stripe/sync-subscription');
                    toast.success("Payment successful! Your subscription is now active.");
                } catch (error) {
                    console.error("Failed to sync subscription status:", error);
                    toast.error("Payment successful, but we had trouble updating your account. Please contact support.");
                } finally {
                    setIsSyncing(false);
                    setTimeout(() => {
                        navigate("/library", { replace: true });
                    }, 2000);
                }
            } else {
                toast.error("Payment was cancelled or failed.");
                navigate("/library", { replace: true });
            }
        };

        syncSubscription();
    }, [success, navigate, apiClient]);

    if (success === "true") {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-8 border border-green-100 shadow-sm"
                >
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                </motion.div>
                <motion.h1 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="text-3xl md:text-4xl font-serif font-medium text-[#1e2326] mb-4 tracking-tight"
                >
                    Payment Successful
                </motion.h1>
                <motion.p 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="text-[#686868] text-base mb-10 max-w-md leading-relaxed"
                >
                    Thank you for your purchase. We're setting up your account and getting everything ready for your story.
                </motion.p>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <Loader2 className="w-6 h-6 animate-spin text-stone-300" />
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-[70vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-stone-300" />
        </div>
    );
}
