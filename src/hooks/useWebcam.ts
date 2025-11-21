import { useState, useEffect, useCallback } from 'react';

interface UseWebcamReturn {
    stream: MediaStream | null;
    error: string | null;
    permissionDenied: boolean;
    requestCamera: () => Promise<void>;
}

export function useWebcam(): UseWebcamReturn {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [permissionDenied, setPermissionDenied] = useState(false);

    const requestCamera = useCallback(async () => {
        try {
            setError(null);
            setPermissionDenied(false);

            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: "user"
                },
                audio: false
            });

            setStream(mediaStream);
        } catch (err: any) {
            console.error("Error accessing camera:", err);
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setPermissionDenied(true);
                setError("Camera permission denied. Please allow access to use the camera.");
            } else {
                setError("Unable to access camera. Please check your device settings.");
            }
        }
    }, []);

    useEffect(() => {
        requestCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []); // Run once on mount

    return { stream, error, permissionDenied, requestCamera };
}
