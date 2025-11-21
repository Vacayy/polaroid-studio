"use client";

import React, { useState } from 'react';
import { Settings, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const PRESET_COLORS = [
    { name: 'White', value: '#ffffff' },
    { name: 'Ivory', value: '#fffff0' },
    { name: 'Pink', value: '#ffd1dc' },
    { name: 'Mint', value: '#d4f1f4' },
    { name: 'Sky', value: '#e0f4ff' },
    { name: 'Lavender', value: '#e6e6fa' },
];

export default function SettingsPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [showClearDialog, setShowClearDialog] = useState(false);
    const { settings, updateSettings, clearAllPhotos, photos } = useStore();

    const handleColorChange = (color: string) => {
        updateSettings({ polaroidBgColor: color });
    };

    const handleClearAll = () => {
        if (photos.length === 0) {
            return;
        }
        setShowClearDialog(true);
    };

    const confirmClearAll = () => {
        clearAllPhotos();
        setShowClearDialog(false);
    };

    return (
        <>
            {/* Settings Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed top-4 right-4 z-40 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors group"
                aria-label="Open settings"
            >
                <Settings className="w-5 h-5 text-zinc-700 group-hover:rotate-45 transition-transform duration-300" />
            </button>

            {/* Settings Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ x: 400, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 400, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 p-6 flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-zinc-800">Settings</h2>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 hover:bg-zinc-100 rounded transition-colors"
                                    aria-label="Close settings"
                                >
                                    <X className="w-5 h-5 text-zinc-600" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto">
                                <div className="space-y-6">
                                    {/* Color Picker Section */}
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-3">
                                            Polaroid Background Color
                                        </label>

                                        {/* HTML Color Picker */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <input
                                                type="color"
                                                value={settings.polaroidBgColor}
                                                onChange={(e) => handleColorChange(e.target.value)}
                                                className="w-12 h-12 rounded border-2 border-zinc-200 cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={settings.polaroidBgColor}
                                                onChange={(e) => handleColorChange(e.target.value)}
                                                className="flex-1 px-3 py-2 border border-zinc-300 rounded text-sm font-mono"
                                                placeholder="#ffffff"
                                            />
                                        </div>

                                        {/* Preset Colors */}
                                        <div>
                                            <p className="text-xs text-zinc-500 mb-2">Presets</p>
                                            <div className="grid grid-cols-3 gap-2">
                                                {PRESET_COLORS.map((preset) => (
                                                    <button
                                                        key={preset.value}
                                                        onClick={() => handleColorChange(preset.value)}
                                                        className={cn(
                                                            "flex flex-col items-center gap-1 p-2 rounded hover:bg-zinc-50 transition-colors",
                                                            settings.polaroidBgColor === preset.value && "ring-2 ring-blue-500"
                                                        )}
                                                    >
                                                        <div
                                                            className="w-10 h-10 rounded border-2 border-zinc-200"
                                                            style={{ backgroundColor: preset.value }}
                                                        />
                                                        <span className="text-xs text-zinc-600">{preset.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Clear All Photos Section */}
                                    <div className="pt-4 border-t border-zinc-200">
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">
                                            Danger Zone
                                        </label>
                                        <button
                                            onClick={handleClearAll}
                                            disabled={photos.length === 0}
                                            className={cn(
                                                "w-full px-4 py-2 rounded font-medium text-sm transition-colors",
                                                photos.length === 0
                                                    ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                                                    : "bg-red-50 text-red-600 hover:bg-red-100"
                                            )}
                                        >
                                            Clear All Photos ({photos.length})
                                        </button>
                                        <p className="text-xs text-zinc-500 mt-2">
                                            This will delete all photos from localStorage.
                                        </p>
                                    </div>

                                    {/* Info */}
                                    <div className="pt-4 border-t border-zinc-200">
                                        <p className="text-xs text-zinc-500">
                                            💡 This color will apply to all new photos you take.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Clear All Confirmation Dialog */}
            <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete all photos?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete all {photos.length} photo{photos.length > 1 ? 's' : ''}?
                            This action cannot be undone and will permanently remove all photos from localStorage.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmClearAll}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete All
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
