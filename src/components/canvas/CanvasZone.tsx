"use client";

import React from 'react';
import { useStore } from '@/store/useStore';
import Polaroid from './Polaroid';

export default function CanvasZone() {
    const photos = useStore((state) => state.photos);

    return (
        <div className="h-full w-full relative bg-dot-pattern overflow-hidden">
            {/* Render all polaroid photos */}
            {photos.map((photo) => (
                <Polaroid key={photo.id} photo={photo} />
            ))}

            {/* Empty state hint */}
            {photos.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-gray-400 font-hand text-3xl opacity-50">
                        Your photos will appear here
                    </p>
                </div>
            )}
        </div>
    );
}
