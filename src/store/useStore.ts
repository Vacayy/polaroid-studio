import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PolaroidPhoto {
    id: string;
    dataUrl: string;
    x: number;
    y: number;
    rotation: number;
    caption: string;
    createdAt: string;
    bgColor: string;
    zIndex: number;
}

export interface Settings {
    polaroidBgColor: string;
}

interface StoreState {
    photos: PolaroidPhoto[];
    settings: Settings;
    maxZIndex: number;

    addPhoto: (photo: PolaroidPhoto) => void;
    updatePhoto: (id: string, updates: Partial<PolaroidPhoto>) => void;
    removePhoto: (id: string) => void;
    clearAllPhotos: () => void;
    updateSettings: (updates: Partial<Settings>) => void;
    bringToFront: (id: string) => void;
}

export const useStore = create<StoreState>()(
    persist(
        (set) => ({
            photos: [],
            settings: {
                polaroidBgColor: '#ffffff',
            },
            maxZIndex: 1,

            addPhoto: (photo) =>
                set((state) => ({
                    photos: [...state.photos, { ...photo, zIndex: state.maxZIndex + 1 }],
                    maxZIndex: state.maxZIndex + 1,
                })),

            updatePhoto: (id, updates) =>
                set((state) => ({
                    photos: state.photos.map((p) =>
                        p.id === id ? { ...p, ...updates } : p
                    ),
                })),

            removePhoto: (id) =>
                set((state) => ({
                    photos: state.photos.filter((p) => p.id !== id),
                })),

            clearAllPhotos: () =>
                set(() => ({
                    photos: [],
                    maxZIndex: 1,
                })),

            updateSettings: (updates) =>
                set((state) => ({
                    settings: { ...state.settings, ...updates },
                })),

            bringToFront: (id) =>
                set((state) => {
                    const newZIndex = state.maxZIndex + 1;
                    return {
                        photos: state.photos.map((p) =>
                            p.id === id ? { ...p, zIndex: newZIndex } : p
                        ),
                        maxZIndex: newZIndex,
                    };
                }),
        }),
        {
            name: 'polaroid-storage',
        }
    )
);
