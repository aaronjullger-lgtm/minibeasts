// A simple service to play programmatic sounds without assets.
import { settingsService } from './settingsService';

const audioContext = typeof window !== 'undefined' 
  ? new (window.AudioContext || (window as any).webkitAudioContext)()
  : null;

const playSound = (freq: number, type: OscillatorType, duration: number, volume = 0.5) => {
    // Check if sound is enabled in settings
    if (!settingsService.shouldPlaySound()) return;
    
    if (!audioContext) return;
    
    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(err => console.warn('Failed to resume audio context:', err));
    }
    
    try {
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
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
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
    playGritGain: () => playSound(1318.51, 'triangle', 0.15, 0.4), // E6
    playGritLoss: () => playSound(220, 'square', 0.2, 0.3), // A3
    playAchievement: () => playNoteSequence([
        { freq: 1046.50, duration: 0.08, delay: 0 },   // C6
        { freq: 1318.51, duration: 0.08, delay: 80 },  // E6
        { freq: 1567.98, duration: 0.08, delay: 160 }, // G6
        { freq: 2093.00, duration: 0.3, delay: 240 }   // C7
    ]),
    playClick: () => playSound(1760, 'triangle', 0.05, 0.2), // A6
    playError: () => playSound(200, 'sawtooth', 0.2, 0.3),
    playSuccess: () => playNoteSequence([
        { freq: 1046.50, duration: 0.1, delay: 0 },  // C6
        { freq: 1318.51, duration: 0.15, delay: 100 } // E6
    ]),
    playWeekComplete: () => playNoteSequence([
        { freq: 659.25, duration: 0.1, delay: 0 },   // E5
        { freq: 783.99, duration: 0.1, delay: 100 }, // G5
        { freq: 1046.50, duration: 0.1, delay: 200 }, // C6
        { freq: 1318.51, duration: 0.25, delay: 300 } // E6
    ]),
    playRivalryCreated: () => playNoteSequence([
        { freq: 440, duration: 0.1, delay: 0 },   // A4
        { freq: 523.25, duration: 0.1, delay: 100 }, // C5
        { freq: 440, duration: 0.15, delay: 200 }  // A4
    ]),
};
