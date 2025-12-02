// A simple service to play programmatic sounds without assets.
const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

const playSound = (freq: number, type: OscillatorType, duration: number, volume = 0.5) => {
    if (!audioContext || audioContext.state === 'suspended') {
      audioContext.resume();
    }
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
};

const playNoteSequence = (notes: {freq: number, duration: number, delay: number}[]) => {
    notes.forEach(note => {
        setTimeout(() => playSound(note.freq, 'sine', note.duration), note.delay);
    });
};

export const soundService = {
    playMessageSent: () => playSound(880, 'triangle', 0.1, 0.3),
    playMessageReceived: () => playSound(660, 'sine', 0.15, 0.4),
    playGoalComplete: () => playNoteSequence([
        { freq: 523.25, duration: 0.1, delay: 0 },   // C5
        { freq: 659.25, duration: 0.1, delay: 100 }, // E5
        { freq: 783.99, duration: 0.1, delay: 200 }, // G5
        { freq: 1046.50, duration: 0.2, delay: 300 } // C6
    ]),
    playMinigameWin: () => playNoteSequence([
        { freq: 783.99, duration: 0.1, delay: 0 }, // G5
        { freq: 1046.50, duration: 0.3, delay: 100 } // C6
    ]),
    playMinigameLoss: () => playNoteSequence([
        { freq: 440, duration: 0.2, delay: 0 },   // A4
        { freq: 330, duration: 0.3, delay: 200 } // E4
    ]),
    playPurchase: () => playNoteSequence([
        { freq: 1046.50, duration: 0.05, delay: 0 }, // C6
        { freq: 1318.51, duration: 0.1, delay: 70 } // E6
    ]),
};
