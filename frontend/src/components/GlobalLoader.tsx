import { useIsMutating } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

export function GlobalLoader() {
    // Only show loader for mutations (creates, updates, deletes) to avoid conflict
    // with page-level loading skeletons/spinners during initial data fetches.
    const isMutating = useIsMutating();

    const isLoading = isMutating > 0;

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed top-0 left-0 right-0 z-[9999] h-1.5 bg-background/50 backdrop-blur-[1px]"
                >
                    <motion.div
                        className="h-full bg-gradient-to-r from-transparent via-luxury-gold to-transparent w-full origin-left shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                        animate={{
                            x: ["-100%", "100%"],
                        }}
                        transition={{
                            duration: 1.5,
                            ease: "easeInOut",
                            repeat: Infinity,
                        }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
