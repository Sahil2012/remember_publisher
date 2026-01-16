"use client";

import { motion } from "framer-motion";
import { content } from "@/data/content";
import { useState, useRef } from "react";

const VideoCard = ({ video, index }: { video: any, index: number }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const handlePlay = () => {
        if (videoRef.current) {
            // Smart rewind if at thumbnail frame
            if (videoRef.current.currentTime < 4) {
                videoRef.current.currentTime = 0;
            }
            videoRef.current.play();
            setIsPlaying(true);
        }
    };

    const handleMetadata = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = 3; // Seek to 3s for thumbnail
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className="relative bg-black rounded-2xl md:rounded-3xl shadow-xl overflow-hidden border border-luxury-gold/10 group h-[400px] md:h-[500px]"
        >
            <video
                ref={videoRef}
                className="w-full h-full object-contain"
                src={video.src} // Use src directly for React to handle updates correcty
                controls={isPlaying} // only show controls when playing to avoid cluttering the overlay
                playsInline
                preload="metadata" // Ensure browser fetches metadata
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                onLoadedMetadata={handleMetadata}
            >
                Your browser does not support the video tag.
            </video>

            {/* Overlay Text - Fades out when playing */}
            <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-black/30 backdrop-blur-md cursor-pointer transition-colors hover:bg-black/40"
                animate={{ opacity: isPlaying ? 0 : 1 }}
                transition={{ duration: 0.5 }}
                onClick={handlePlay}
                style={{ pointerEvents: isPlaying ? "none" : "auto" }}
            >
                <div className="max-w-lg">
                    <span className="text-xs font-sans font-bold tracking-widest uppercase text-white/80 mb-3 block">
                        {video.subtitle}
                    </span>
                    <h3 className="text-3xl md:text-4xl font-serif font-medium text-white mb-6 drop-shadow-md">
                        {video.title}
                    </h3>
                    <p className="text-lg text-white/90 leading-relaxed font-sans font-light drop-shadow-sm">
                        {video.description}
                    </p>
                </div>

                {/* Bottom Left Play Button */}
                <div className="absolute bottom-8 left-8 flex items-center gap-3 text-luxury-gold group-hover:scale-105 transition-transform duration-300">
                    <div className="w-12 h-12 rounded-full border border-luxury-gold/50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                        <svg className="w-5 h-5 ml-1 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                    <span className="text-sm font-sans font-bold tracking-widest uppercase opacity-80">Watch Story</span>
                </div>
            </motion.div>
        </motion.div>
    );
};

export function Stories() {
    const { stories } = content;

    return (
        <section id="stories" className="py-24 bg-muted/30 relative overflow-hidden">
            <div className="container px-6 md:px-8 mx-auto max-w-7xl relative z-10">

                <div className="text-center mb-20">
                    <span className="text-sm font-sans font-semibold tracking-widest uppercase text-muted-foreground mb-4 block">
                        {stories.heading}
                    </span>
                    <h2 className="text-4xl md:text-5xl font-serif font-medium tracking-tight text-foreground">
                        {stories.subheading}
                    </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                    {stories.videos.map((video, index) => (
                        <VideoCard key={index} video={video} index={index} />
                    ))}
                </div>

            </div>
        </section>
    );
}
