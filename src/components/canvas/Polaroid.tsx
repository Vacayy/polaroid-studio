"use client";

import React, { useState, useRef } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { PolaroidPhoto, useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { Copy, Download, Link2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';

interface PolaroidProps {
    photo: PolaroidPhoto;
}

export default function Polaroid({ photo }: PolaroidProps) {
    const { updatePhoto, bringToFront, removePhoto } = useStore();
    const [isEditing, setIsEditing] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [caption, setCaption] = useState(photo.caption);
    const polaroidRef = useRef<HTMLDivElement>(null);

    // Update store only when drag ends (for better performance)
    const handleDragStop = (_e: DraggableEvent, data: DraggableData) => {
        updatePhoto(photo.id, { x: data.x, y: data.y });
    };

    const handleMouseDown = () => {
        bringToFront(photo.id);
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const handleDoubleClick = () => {
        setIsEditing(true);
    };

    const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCaption(e.target.value);
    };

    const handleCaptionBlur = () => {
        updatePhoto(photo.id, { caption });
        setIsEditing(false);
    };

    const handleCaptionKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            updatePhoto(photo.id, { caption });
            setIsEditing(false);
        } else if (e.key === 'Escape') {
            setCaption(photo.caption);
            setIsEditing(false);
        }
    };

    // Menu actions
    const handleCopyImage = async () => {
        if (!polaroidRef.current) return;

        try {
            const canvas = await html2canvas(polaroidRef.current, {
                backgroundColor: null,
                scale: 2,
            });

            canvas.toBlob(async (blob) => {
                if (blob) {
                    await navigator.clipboard.write([
                        new ClipboardItem({ 'image/png': blob }),
                    ]);
                    console.log('Image copied to clipboard');
                }
            });
        } catch (error) {
            console.error('Failed to copy image:', error);
        }
    };

    const handleDownload = async () => {
        if (!polaroidRef.current) return;

        try {
            const canvas = await html2canvas(polaroidRef.current, {
                backgroundColor: null,
                scale: 2,
            });

            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `polaroid-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Failed to download image:', error);
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            console.log('Link copied to clipboard');
        } catch (error) {
            console.error('Failed to copy link:', error);
        }
    };

    const handleDelete = () => {
        removePhoto(photo.id);
    };

    return (
        <Draggable
            defaultPosition={{ x: photo.x, y: photo.y }}
            onStop={handleDragStop}
            onMouseDown={handleMouseDown}
            disabled={isEditing}
            nodeRef={polaroidRef}
        >
            <div
                ref={polaroidRef}
                tabIndex={0}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className={cn(
                    "absolute cursor-move shadow-2xl transition-all hover:shadow-3xl",
                    "p-4 pb-12 flex flex-col items-center gap-3",
                    "outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                )}
                style={{
                    backgroundColor: photo.bgColor,
                    transform: `rotate(${photo.rotation}deg)`,
                    zIndex: photo.zIndex,
                    width: '240px'
                }}
                onDoubleClick={handleDoubleClick}
            >
                {/* Photo Area */}
                <div className="w-full aspect-square bg-zinc-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={photo.dataUrl}
                        alt="Polaroid"
                        className="w-full h-full object-cover pointer-events-none select-none"
                        draggable={false}
                    />
                </div>

                {/* Caption Area */}
                <div className="w-full text-center font-hand min-h-[24px]">
                    {isEditing ? (
                        <input
                            type="text"
                            value={caption}
                            onChange={handleCaptionChange}
                            onBlur={handleCaptionBlur}
                            onKeyDown={handleCaptionKeyDown}
                            autoFocus
                            maxLength={40}
                            className="w-full bg-transparent text-center text-lg outline-none border-b border-zinc-300 font-hand"
                            placeholder="Add caption..."
                        />
                    ) : (
                        <p className="text-lg text-zinc-700">
                            {photo.caption || ''}
                        </p>
                    )}
                </div>

                {/* Bottom Menu Dock */}
                <AnimatePresence>
                    {isFocused && !isEditing && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute -bottom-14 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-lg border border-zinc-200 px-2 py-1.5 flex items-center gap-1"
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={handleCopyImage}
                                className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                                title="Copy image"
                            >
                                <Copy className="w-4 h-4 text-zinc-600" />
                            </button>
                            <button
                                onClick={handleDownload}
                                className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                                title="Download"
                            >
                                <Download className="w-4 h-4 text-zinc-600" />
                            </button>
                            <button
                                onClick={handleCopyLink}
                                className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                                title="Copy link"
                            >
                                <Link2 className="w-4 h-4 text-zinc-600" />
                            </button>
                            <div className="w-px h-4 bg-zinc-300 mx-1" />
                            <button
                                onClick={handleDelete}
                                className="p-2 hover:bg-red-50 rounded-full transition-colors"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Draggable>
    );
}
