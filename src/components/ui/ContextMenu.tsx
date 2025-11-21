"use client";

import React, { useRef, useEffect } from 'react';
import { Copy, Download, Link2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';

interface ContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    onDelete: () => void;
    photoElement: HTMLElement | null;
}

export default function ContextMenu({ x, y, onClose, onDelete, photoElement }: ContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on outside click or ESC
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

    const handleCopyImage = async () => {
        if (!photoElement) return;

        try {
            const canvas = await html2canvas(photoElement, {
                backgroundColor: null,
                scale: 2,
            });

            canvas.toBlob(async (blob) => {
                if (blob) {
                    await navigator.clipboard.write([
                        new ClipboardItem({ 'image/png': blob }),
                    ]);
                    // TODO: Show toast notification
                    console.log('Image copied to clipboard');
                }
            });
        } catch (error) {
            console.error('Failed to copy image:', error);
        }

        onClose();
    };

    const handleDownload = async () => {
        if (!photoElement) return;

        try {
            const canvas = await html2canvas(photoElement, {
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

        onClose();
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            // TODO: Show toast notification
            console.log('Link copied to clipboard');
        } catch (error) {
            console.error('Failed to copy link:', error);
        }

        onClose();
    };

    const handleDelete = () => {
        onDelete();
        onClose();
    };

    return (
        <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="fixed bg-white rounded-lg shadow-xl border border-zinc-200 py-1 min-w-[200px] z-50"
            style={{ left: x, top: y }}
        >
            <button
                onClick={handleCopyImage}
                className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-100 transition-colors flex items-center gap-3"
            >
                <Copy className="w-4 h-4 text-zinc-500" />
                <span>Copy image to clipboard</span>
            </button>

            <button
                onClick={handleDownload}
                className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-100 transition-colors flex items-center gap-3"
            >
                <Download className="w-4 h-4 text-zinc-500" />
                <span>Download as image...</span>
            </button>

            <div className="border-t border-zinc-200 my-1" />

            <button
                onClick={handleCopyLink}
                className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-100 transition-colors flex items-center gap-3"
            >
                <Link2 className="w-4 h-4 text-zinc-500" />
                <span>Copy site link</span>
            </button>

            <div className="border-t border-zinc-200 my-1" />

            <button
                onClick={handleDelete}
                className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 transition-colors flex items-center gap-3 text-red-600"
            >
                <Trash2 className="w-4 h-4" />
                <span>Delete photo</span>
            </button>
        </motion.div>
    );
}
