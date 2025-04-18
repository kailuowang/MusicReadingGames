// Add a type declaration for webkitAudioContext
declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext;
    }
}

/**
 * Utility class for playing audio in the game
 */
export class AudioPlayer {
    private static instance: AudioPlayer;
    private audioContext: AudioContext | null = null;
    private isInitialized: boolean = false;
    private isTestEnvironment: boolean = false;
    
    // Prevent direct instantiation
    private constructor() {
        // Check if we're in a test environment (no window.AudioContext)
        this.isTestEnvironment = typeof window === 'undefined' || 
                                 typeof (window.AudioContext || window.webkitAudioContext) === 'undefined';
    }
    
    /**
     * Get the singleton instance
     */
    public static getInstance(): AudioPlayer {
        if (!AudioPlayer.instance) {
            AudioPlayer.instance = new AudioPlayer();
        }
        return AudioPlayer.instance;
    }
    
    /**
     * Initialize the audio context (must be called from a user interaction)
     */
    public initialize(): void {
        if (this.isInitialized || this.isTestEnvironment) return;
        
        try {
            // Use proper browser prefixes for AudioContext
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContextClass();
            this.isInitialized = true;
            
            // Resume if suspended
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
        } catch (error) {
            console.error('Failed to initialize AudioContext:', error);
        }
    }
    
    /**
     * Play a simple test sound to verify audio is working
     */
    public testSound(): void {
        if (this.isTestEnvironment) return;
        
        if (!this.audioContext) {
            this.initialize();
        }
        
        if (!this.audioContext) return;
        
        // If context is suspended, try to resume it
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        try {
            // Create a simple beep sound
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime); // A4 note
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.5, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.5);
        } catch (error) {
            console.error('Error playing test sound:', error);
        }
    }
    
    /**
     * Play a piano note based on note name and octave
     */
    public playNote(noteName: string, octave: number): void {
        if (this.isTestEnvironment) return;
        
        if (!this.audioContext) {
            this.initialize();
        }
        
        if (!this.audioContext) return;
        
        // If context is suspended, try to resume it
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        try {
            // Create an oscillator for the note frequency
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            // Set the frequency based on note name and octave
            const frequency = this.getNoteFrequency(noteName, octave);
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            
            // Set envelope for piano-like sound
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.5, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1.5);
            
            // Connect and start
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 1.5);
        } catch (error) {
            console.error('Error playing note:', error);
        }
    }
    
    /**
     * Play a synthesized error/thud sound
     */
    public playErrorSound(): void {
        if (this.isTestEnvironment) return;
        
        if (!this.audioContext) {
            this.initialize();
        }
        
        if (!this.audioContext) return;
        
        // If context is suspended, try to resume it
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        try {
            // Generate a low thud sound
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(80, this.audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.6, this.audioContext.currentTime + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.5);
        } catch (error) {
            console.error('Error playing error sound:', error);
        }
    }
    
    /**
     * Get frequency for a note
     * Uses A4 = 440Hz as reference
     */
    private getNoteFrequency(noteName: string, octave: number): number {
        const noteIndex: Record<string, number> = {
            'C': 0, 'C#': 1, 'Db': 1, 
            'D': 2, 'D#': 3, 'Eb': 3,
            'E': 4, 
            'F': 5, 'F#': 6, 'Gb': 6,
            'G': 7, 'G#': 8, 'Ab': 8,
            'A': 9, 'A#': 10, 'Bb': 10,
            'B': 11
        };
        
        // Calculate semitones from A4 (A4 = 440Hz is the reference)
        const A4 = 440;
        const A4Octave = 4;
        const A4NoteIndex = 9; // A is the 9th note (0-indexed) in an octave
        
        const noteIdx = noteIndex[noteName] || 0;
        const semitoneDistance = (octave - A4Octave) * 12 + (noteIdx - A4NoteIndex);
        
        // Calculate frequency: f = 440 * 2^(n/12) where n is semitones from A4
        return A4 * Math.pow(2, semitoneDistance / 12);
    }
} 