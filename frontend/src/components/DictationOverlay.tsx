import { motion } from "framer-motion";
import { Mic, Square, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DictationOverlayProps {
  isRecording: boolean;
  isPaused: boolean;
  errorState: string | null;
  interimText: string;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export function DictationOverlay({
  isRecording,
  isPaused,
  errorState,
  interimText,
  onStart,
  onPause,
  onResume,
  onStop,
}: DictationOverlayProps) {
  
  if (!isRecording && !errorState) {
    // Floating default microphone button
    return (
      <div className="absolute bottom-4 right-4 z-50">
        <Button
            variant="outline"
            size="icon"
            onClick={(e) => { e.preventDefault(); onStart(); }}
            className="h-14 w-14 rounded-full shadow-lg border-2 bg-white border-stone-200 text-stone-600 hover:text-luxury-gold hover:border-luxury-gold transition-all duration-300 pointer-events-auto"
            title="Start Dictation"
        >
            <Mic className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="absolute bottom-4 left-4 right-4 z-50 flex items-end justify-between pointer-events-none">
      
      {/* Left Side: Interim Text Feedback */}
      <div className="flex-1 mr-12 pointer-events-none">
        {isRecording && interimText && (
          <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-stone-900/90 text-white p-4 rounded-xl backdrop-blur-md shadow-2xl max-w-2xl border border-stone-800 pointer-events-none"
          >
              <span className="text-lg leading-relaxed text-stone-300 font-serif italic">"{interimText}"</span>
              {!isPaused && <span className="animate-pulse ml-2 w-2 h-2 rounded-full bg-luxury-gold inline-block mb-1"></span>}
          </motion.div>
        )}
      </div>

      {/* Right Side: Controls & Waves */}
      <div className="flex flex-col items-end gap-3 pointer-events-auto">
        {errorState && (
            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="bg-red-500/95 text-white px-4 py-2 rounded-lg text-sm shadow-xl max-w-[250px] text-right font-medium">
                {errorState}
            </motion.div>
        )}

        <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 bg-white p-2 rounded-full shadow-2xl border-2 border-stone-200"
        >
          {/* Audio Visualization Waves */}
          <div className="flex items-center gap-1 px-4 h-10 w-24 justify-center overflow-hidden">
             {isRecording && !isPaused ? (
                 <>
                   {[1, 2, 3, 4, 5].map((i) => (
                       <motion.div
                           key={i}
                           className="w-1.5 bg-luxury-gold rounded-full"
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
                <div className="text-xs font-semibold text-stone-400 tracking-wider">PAUSED</div>
             )}
          </div>

          <div className="w-px h-6 bg-stone-200"></div>

          {/* Pause / Resume Button */}
          <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.preventDefault(); isPaused ? onResume() : onPause(); }}
              className={cn("h-10 w-10 rounded-full hover:bg-stone-100", isPaused ? "text-luxury-gold" : "text-stone-600")}
              title={isPaused ? "Resume" : "Pause"}
          >
              {isPaused ? <Play className="w-5 h-5 fill-current" /> : <Pause className="w-5 h-5 fill-current" />}
          </Button>

          {/* Stop Button */}
          <Button
              variant="destructive"
              size="icon"
              onClick={(e) => { e.preventDefault(); onStop(); }}
              className="h-10 w-10 rounded-full bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 shadow-none border-none"
              title="Stop Dictation"
          >
              <Square className="w-4 h-4 fill-current" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
