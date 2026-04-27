import { AnimatePresence, motion } from "framer-motion";
import { Gift, ArrowRight, Sparkles, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface WelcomeGiftModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeGiftModal({ isOpen, onClose }: WelcomeGiftModalProps) {
  const navigate = useNavigate();

  const handleViewAllGuides = () => {
    onClose();
    navigate("/guides");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          {/* Backdrop — plain semi-transparent overlay (no blur = no lag) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
            style={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(45 40% 50% / 0.3)",
              willChange: "transform, opacity",
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ background: "hsl(40 10% 94%)" }}
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Gold shimmer header band */}
            <div
              className="h-1.5 w-full"
              style={{
                background:
                  "linear-gradient(90deg, hsl(45 40% 50% / 0.3), hsl(45 40% 55%), hsl(45 40% 65%), hsl(45 40% 55%), hsl(45 40% 50% / 0.3))",
              }}
            />

            {/* Hero area */}
            <div
              className="px-8 pt-8 pb-6 flex flex-col items-center text-center gap-5"
              style={{
                background:
                  "radial-gradient(ellipse at top, hsl(45 40% 50% / 0.08) 0%, transparent 70%)",
              }}
            >
              {/* Icon */}
              <motion.div
                initial={{ rotate: -12, scale: 0.7 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", damping: 14, stiffness: 200, delay: 0.1 }}
                className="relative"
              >
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(45 40% 50% / 0.25), hsl(45 40% 50% / 0.08))",
                    border: "1px solid hsl(45 40% 50% / 0.35)",
                    boxShadow: "0 4px 24px hsl(45 40% 50% / 0.2)",
                  }}
                >
                  <Gift className="w-9 h-9" style={{ color: "hsl(45 40% 45%)" }} />
                </div>
                {/* Sparkle — CSS spin instead of framer infinite loop */}
                <span
                  className="absolute -top-1 -right-1"
                  style={{ animation: "spin 8s linear infinite" }}
                >
                  <Sparkles className="w-4 h-4" style={{ color: "hsl(45 40% 55%)" }} />
                </span>
              </motion.div>

              {/* Headline */}
              <div className="space-y-2">
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "hsl(45 40% 45%)" }}
                >
                  Welcome to Remember Press
                </motion.p>
                <motion.h2
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-serif font-semibold text-foreground leading-snug"
                >
                  Thank you for subscribing! Here's a free gift 🎁
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-sm text-muted-foreground leading-relaxed"
                >
                  We've put together an exclusive bundle of 4 Writing Guides covering
                  our publishing markets — yours to keep, completely free.
                </motion.p>
              </div>
            </div>

            {/* Guide preview card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mx-8 mb-6 rounded-2xl p-4 flex items-center gap-4"
              style={{
                background: "hsl(40 10% 96%)",
                border: "1px solid hsl(45 40% 50% / 0.2)",
              }}
            >
              {/* PDF icon */}
              <div
                className="w-12 h-14 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
                style={{
                  background:
                    "linear-gradient(160deg, hsl(45 40% 50% / 0.2), hsl(45 40% 50% / 0.05))",
                  border: "1px solid hsl(45 40% 50% / 0.3)",
                  color: "hsl(45 40% 40%)",
                }}
              >
                PDF
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">
                  Bundle of 4 Writing Guides
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Remember Press · April 2026
                </p>
              </div>
            </motion.div>

            {/* Action button — single primary CTA */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="px-8 pb-8"
            >
              <button
                onClick={handleViewAllGuides}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-all duration-200"
                style={{
                  background: "hsl(45 40% 50%)",
                  color: "hsl(220 10% 12%)",
                  boxShadow: "0 4px 16px hsl(45 40% 50% / 0.35)",
                }}
              >
                View all guides in my account
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
