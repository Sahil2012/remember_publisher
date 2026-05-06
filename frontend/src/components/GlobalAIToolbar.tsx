import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Pause, Play, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Editor } from '@tiptap/react';
import { toast } from "sonner";
import { ToneSelector } from "./ToneSelector";
import { BUSINESS_TONES, LIFE_STORY_TONES, YEARBOOK_TONES, type ToneOption } from "@/config/tones";
import { useEffect, useRef } from "react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { subscriptionModal } from "@/store/subscriptionModalStore";

interface GlobalAIToolbarProps {
  editor: Editor;
  isRecording: boolean;
  isPaused: boolean;
  errorState: string | null;
  interimText: string;
  showToneSelector: boolean;
  setShowToneSelector: (show: boolean) => void;
  onStartDictation: () => void;
  onPauseDictation: () => void;
  onResumeDictation: () => void;
  onStopDictation: () => void;
  onRewriteSelect: (tone: string) => void;
  category: "Life Story" | "Yearbook" | "Business";
}

export function GlobalAIToolbar({
  editor,
  isRecording,
  isPaused,
  errorState,
  interimText,
  showToneSelector,
  setShowToneSelector,
  onStartDictation,
  onPauseDictation,
  onResumeDictation,
  onStopDictation,
  onRewriteSelect,
  category,
}: GlobalAIToolbarProps) {
  
  const toolbarRef = useRef<HTMLDivElement>(null);
  const { data: user } = useAuthUser();
  const isSubscribed = user?.isSubscribed;
  const usedDictationSeconds = user?.dailyDictationSeconds || 0;

  const getActiveTones = (cat: typeof category): ToneOption[] => {
    console.log(`[GlobalAIToolbar] Getting tones for category: "${cat}"`);
    switch (cat) {
      case "Life Story": return LIFE_STORY_TONES;
      case "Yearbook": return YEARBOOK_TONES;
      case "Business": return BUSINESS_TONES;
      default: 
        console.warn(`[GlobalAIToolbar] Unknown category: "${cat}", falling back to Life Story`);
        return LIFE_STORY_TONES;
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setShowToneSelector(false);
      }
    }
    if (showToneSelector) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showToneSelector, setShowToneSelector]);

  return (
    <div className="relative z-50 bg-white/85 backdrop-blur-2xl border border-white/60 py-2.5 px-3 md:py-3 md:px-6 mb-4 md:mb-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-stone-900/5 flex flex-wrap items-center justify-between gap-3 transition-all">
      
      {/* Left side: AI Tools */}
      <div className="flex items-center gap-2 md:gap-4 relative" ref={toolbarRef}>
        <Button
            onClick={(e) => {
              e.preventDefault();
              if (showToneSelector) {
                  setShowToneSelector(false);
                  return;
              }
              if (editor.state.selection.empty) {
                  toast.info("Please highlight some text first to use RP Rewrite!");
                  return;
              }
              setShowToneSelector(true);
            }}
            size="sm"
            className="bg-stone-900 hover:bg-black text-white border-none shadow-md font-medium h-9 md:h-10 px-3 md:px-4"
        >
            <Wand2 className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2 text-luxury-gold" />
            <span className="text-xs md:text-sm">RP Rewrite</span>
        </Button>
 
        <AnimatePresence>
            {showToneSelector && (
                <motion.div 
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute top-full mt-2 left-0 bg-white border border-stone-200 p-3 rounded-xl shadow-2xl z-[9999] w-[280px] sm:w-[340px] origin-top-left cursor-default text-stone-900 flex flex-col gap-2"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-[10px] text-stone-500 mb-2 font-bold uppercase tracking-wider flex justify-between items-center border-b border-stone-100 pb-2">
                            <span>Rewriting for {category}</span>
                        </div>
                        <ToneSelector
                            selectedTone=""
                            onSelect={(tone) => {
                                setShowToneSelector(false);
                                onRewriteSelect(tone);
                            }}
                            tones={getActiveTones(category)}
                        />
                    </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* Center: Interim Text (if dictating) */}
      <div className="flex-1 min-w-[120px] px-2 md:px-8 overflow-hidden pointer-events-none flex justify-center order-3 md:order-2 w-full md:w-auto">
        <AnimatePresence>
          {isRecording && interimText && (
            <motion.div 
                initial={{ opacity: 0, y: 5 }} 
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-stone-600 font-serif italic line-clamp-1 truncate text-sm md:text-lg text-center"
            >
                "{interimText}"{!isPaused && <span className="animate-pulse ml-1 text-luxury-gold font-sans">...</span>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right side: Dictation Controls */}
      <div className="flex flex-col items-end gap-1 relative order-2 md:order-3">
        {errorState && (
            <div className="text-red-500 text-[11px] font-medium absolute -bottom-5 right-0 whitespace-nowrap bg-red-50 px-2 py-0.5 rounded">
                {errorState}
            </div>
        )}

        <div className="flex items-center gap-2">
            {!isRecording ? (
                <Button
                    variant="outline"
                    onClick={(e) => { 
                        e.preventDefault(); 
                        const canUseDictation = isSubscribed || usedDictationSeconds < 300;
                        if (!canUseDictation) {
                            subscriptionModal.open();
                            return;
                        }
                        onStartDictation(); 
                    }}
                    className="border-stone-200 bg-white text-stone-600 hover:text-luxury-gold hover:border-luxury-gold min-w-[140px] shadow-sm font-medium relative"
                >
                    <Mic className="w-4 h-4 mr-2" />
                    Start Dictation
                    {!isSubscribed && usedDictationSeconds < 300 && (
                        <div className="text-[9px] text-luxury-gold font-bold uppercase tracking-tighter absolute -bottom-5 right-0 bg-white/50 px-1 rounded backdrop-blur-sm">
                            {Math.max(0, Math.floor((300 - usedDictationSeconds) / 60))}m {Math.max(0, Math.ceil(300 - usedDictationSeconds) % 60)}s trial
                        </div>
                    )}
                </Button>
            ) : (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-stone-200 shadow-sm"
                >
                  {/* Audio Visualization Waves */}
                  <div className="flex items-center gap-1 px-3 h-6 w-16 justify-center overflow-hidden">
                     {!isPaused ? (
                         <>
                           {[1, 2, 3, 4, 5].map((i) => (
                               <motion.div
                                   key={i}
                                   className="w-1 bg-luxury-gold rounded-full"
                                   animate={{ height: ["20%", "100%", "20%"] }}
                                   transition={{ 
                                       duration: 0.5 + Math.random() * 0.5, 
                                       repeat: Infinity, 
                                       ease: "easeInOut",
                                       delay: i * 0.1 
                                   }}
                               />
                           ))}
                         </>
                     ) : (
                        <div className="text-[10px] font-bold text-stone-400 tracking-wider">PAUSED</div>
                     )}
                  </div>

                  <div className="w-px h-5 bg-stone-200"></div>

                  <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.preventDefault(); isPaused ? onResumeDictation() : onPauseDictation(); }}
                      className={cn("h-7 px-2 hover:bg-stone-100", isPaused ? "text-luxury-gold" : "text-stone-600")}
                      title={isPaused ? "Resume" : "Pause"}
                  >
                      {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
                  </Button>

                  <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.preventDefault(); onStopDictation(); }}
                      className="h-7 px-2 text-red-500 hover:bg-red-50 hover:text-red-600"
                      title="Stop Dictation"
                  >
                      <Square className="w-4 h-4 fill-current" />
                  </Button>
                </motion.div>
            )}
        </div>
      </div>

    </div>
  );
}
