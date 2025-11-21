// Generate a simple camera shutter sound using Web Audio API
export function playShutterSound() {
    try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

        // Create two short "click" sounds to mimic a shutter
        const playClick = (time: number, frequency: number) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, time);
            gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

            oscillator.start(time);
            oscillator.stop(time + 0.05);
        };

        const now = audioContext.currentTime;
        playClick(now, 1000); // First click
        playClick(now + 0.05, 800); // Second click (slightly lower pitch)

    } catch (error) {
        console.log('Audio playback not supported:', error);
    }
}
