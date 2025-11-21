// Maximum dimensions for polaroid photos (to reduce storage)
const MAX_WIDTH = 800;
const MAX_HEIGHT = 800;

export function captureVideoFrame(video: HTMLVideoElement): string | null {
    const canvas = document.createElement('canvas');

    // Calculate dimensions while maintaining aspect ratio
    let width = video.videoWidth;
    let height = video.videoHeight;

    if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
        width = width * ratio;
        height = height * ratio;
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Mirror the context to match the mirrored video feed
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Use JPEG with compression (0.8 quality) instead of PNG to reduce size significantly
    return canvas.toDataURL('image/jpeg', 0.8);
}
