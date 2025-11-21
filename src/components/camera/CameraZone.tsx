"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useWebcam } from '@/hooks/useWebcam';
import { Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { captureVideoFrame } from '@/utils/imageUtils';
import { playShutterSound } from '@/utils/audioUtils';
import { v4 as uuidv4 } from 'uuid';

export default function CameraZone() {
    const { stream, error, permissionDenied, requestCamera } = useWebcam();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isFlashing, setIsFlashing] = useState(false);
    const [printingPhoto, setPrintingPhoto] = useState<string | null>(null);

    const { addPhoto, settings } = useStore();

    // Initialize video stream
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    const handleCapture = useCallback(() => {
        if (!stream || isFlashing || !videoRef.current) return;

        setIsFlashing(true);

        // Play shutter sound
        playShutterSound();

        // Capture frame
        const dataUrl = captureVideoFrame(videoRef.current);

        if (dataUrl) {
            // Start printing animation
            setPrintingPhoto(dataUrl);

            // Add to store after a delay (simulating printing/drying or just animation timing)
            setTimeout(() => {
                addPhoto({
                    id: uuidv4(),
                    dataUrl,
                    x: Math.random() * 100 + 50, // Initial random position on canvas
                    y: Math.random() * 100 + 50,
                    rotation: (Math.random() - 0.5) * 10,
                    caption: '',
                    createdAt: new Date().toISOString(),
                    bgColor: settings.polaroidBgColor,
                    zIndex: 0 // Store handles this
                });
                setPrintingPhoto(null);
            }, 1200); // Match animation duration
        }

        // Reset flash
        setTimeout(() => setIsFlashing(false), 150);
    }, [stream, isFlashing, addPhoto, settings.polaroidBgColor]);

    // Handle keydown when camera zone is focused
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.code === 'Space' && !e.repeat) {
            e.preventDefault();
            handleCapture();
        }
    };

    return (
        <div
            className="h-full w-full flex items-center justify-center bg-[hsl(var(--camera-body))] border-r border-border relative overflow-hidden outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset transition-all"
            tabIndex={0}
            onKeyDown={handleKeyDown}
        >
            {/* Camera Body Illustration Container */}
            <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] flex flex-col items-center justify-center">

                {/* Printing Photo Animation Slot (Behind Camera) */}
                <AnimatePresence>
                    {printingPhoto && (
                        <motion.div
                            initial={{ y: 0, opacity: 0 }}
                            animate={{ y: -180, opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="absolute top-0 w-48 h-56 bg-white shadow-md z-10 p-3 pb-8 flex flex-col items-center"
                            style={{ backgroundColor: settings.polaroidBgColor }}
                        >
                            <div className="w-full h-40 bg-black/10 overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={printingPhoto} alt="Printing" className="w-full h-full object-cover" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Lens Area */}
                <div className="relative w-64 h-64 rounded-full bg-zinc-800 border-[12px] border-zinc-200 shadow-2xl overflow-hidden flex items-center justify-center z-20">
                    {stream ? (
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
                        />
                    ) : (
                        <div className="text-zinc-500 flex flex-col items-center gap-2 p-4 text-center">
                            <Camera size={48} />
                            <p className="text-sm font-medium">
                                {error || "Initializing..."}
                            </p>
                            {permissionDenied && (
                                <button
                                    onClick={requestCamera}
                                    className="mt-2 px-3 py-1 bg-zinc-700 text-white text-xs rounded hover:bg-zinc-600 transition-colors"
                                >
                                    Retry
                                </button>
                            )}
                        </div>
                    )}

                    {/* Lens Reflection/Gloss (Decorative) */}
                    <div className="absolute top-4 right-4 w-8 h-8 bg-white opacity-20 rounded-full blur-sm pointer-events-none" />

                    {/* Flash Overlay */}
                    <AnimatePresence>
                        {isFlashing && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.1 }}
                                className="absolute inset-0 bg-white z-50 pointer-events-none"
                            />
                        )}
                    </AnimatePresence>
                </div>

                {/* Shutter Button */}
                <button
                    onClick={handleCapture}
                    className={cn(
                        "absolute -top-4 right-4 w-16 h-16 rounded-full bg-[hsl(var(--camera-accent))] border-4 border-white shadow-lg transition-transform active:scale-95 z-30",
                        !stream && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={!stream}
                    aria-label="Take picture"
                />

                {/* Viewfinder (Decorative) */}
                <motion.div
                    className="absolute top-0 left-8 w-12 h-12 bg-zinc-800 rounded-lg pointer-events-none"
                    animate={{
                        opacity: isFlashing ? 0.4 : 0.8,
                        scale: isFlashing ? 0.95 : 1,
                    }}
                    transition={{ duration: 0.1 }}
                />
            </div>

            {/* Hint Text */}
            <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none">
                <p className="text-sm text-muted-foreground animate-pulse">
                    {stream ? "Click here, then press Space to capture" : "Waiting for camera..."}
                </p>
            </div>
        </div>
    );
}
