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
    private fallbackAudio: HTMLAudioElement | null = null;
    private useAudioElementFallback: boolean = false;
    
    // Prevent direct instantiation
    private constructor() {
        // Check if we're in a test environment (no window.AudioContext)
        this.isTestEnvironment = typeof window === 'undefined' || 
                                 typeof (window.AudioContext || window.webkitAudioContext) === 'undefined';
        
        // Create fallback audio element
        if (!this.isTestEnvironment) {
            this.createFallbackAudio();
        }
    }
    
    /**
     * Create a fallback audio element for platforms where WebAudio might not work
     */
    private createFallbackAudio(): void {
        try {
            this.fallbackAudio = document.createElement('audio');
            // Set up sine wave beep sound as a base64 WAV
            const sineWaveBase64 = 'UklGRjQrAABXQVZFZm10IBAAAAABAAEARKwAAESsAAABAAgAZGF0YRAr';
            this.fallbackAudio.src = `data:audio/wav;base64,${sineWaveBase64}`;
            this.fallbackAudio.volume = 0.5;
            
            // Add to body but hide it
            this.fallbackAudio.style.display = 'none';
            document.body.appendChild(this.fallbackAudio);
            
            // iOS requires user interaction to enable audio playback
            document.addEventListener('touchstart', () => {
                if (this.fallbackAudio) {
                    // Just load it, don't play yet
                    this.fallbackAudio.load();
                }
            }, { once: true });
        } catch (error) {
            console.error('Failed to create fallback audio:', error);
        }
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
     * Get the current AudioContext state
     */
    public getAudioContextState(): string {
        if (!this.audioContext) return 'not initialized';
        return this.audioContext.state;
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
            
            // Resume immediately - this is critical for iOS
            this.forceResumeContext();
            
            console.log(`AudioContext initialized with state: ${this.audioContext.state}`);
        } catch (error) {
            console.error('Failed to initialize AudioContext:', error);
        }
    }
    
    /**
     * Force resume the audio context - should be called directly from a user gesture
     */
    public forceResumeContext(): void {
        if (!this.audioContext) {
            // Create the context in the same gesture if it doesn't exist
            this.initialize();
            return;
        }
        
        if (this.audioContext.state === 'suspended') {
            console.log('Attempting to resume suspended AudioContext...');
            
            // For iOS, we need a special approach to ensure it resumes
            this.audioContext.resume().then(() => {
                console.log(`AudioContext resumed: ${this.audioContext?.state}`);
                // Play a silent sound to ensure audio is fully unlocked on iOS
                this.playSilentSound();
            }).catch(err => {
                console.error('Failed to resume AudioContext:', err);
            });
        }
    }
    
    /**
     * Play a silent sound to unlock audio on iOS
     */
    private playSilentSound(): void {
        if (!this.audioContext) return;
        
        try {
            // Create a silent oscillator
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            // Make it silent
            gainNode.gain.value = 0.001;
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Play for a very short time
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.001);
            
            console.log('Silent sound played to unlock audio');
        } catch (error) {
            console.error('Error playing silent sound:', error);
        }
    }
    
    /**
     * Play a simple test sound to verify audio is working
     */
    public testSound(): void {
        if (this.isTestEnvironment) return;
        
        // Try to create or resume audio context first
        this.forceResumeContext();
        
        if (!this.audioContext) {
            console.error('Cannot play test sound - AudioContext not available');
            return;
        }
        
        try {
            console.log('Playing test sound...');
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
            
            console.log('Test sound triggered, AudioContext state:', this.audioContext.state);
        } catch (error) {
            console.error('Error playing test sound:', error);
            
            // Try a direct audio element as ultimate fallback
            this.playFallbackBeep();
        }
    }
    
    /**
     * Play a piano note based on note name and octave
     */
    public playNote(noteName: string, octave: number): void {
        if (this.isTestEnvironment) return;
        
        // Try to create or resume audio context first
        this.forceResumeContext();
        
        if (!this.audioContext) {
            console.error('Cannot play note - AudioContext not available');
            return;
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
            
            // Try a direct fallback beep as last resort
            this.playFallbackBeep();
        }
    }
    
    /**
     * Play a synthesized error/thud sound
     */
    public playErrorSound(): void {
        if (this.isTestEnvironment) return;
        
        // Try to create or resume audio context first
        this.forceResumeContext();
        
        if (!this.audioContext) {
            console.error('Cannot play error sound - AudioContext not available');
            return;
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
            
            // Try a direct fallback beep as last resort
            this.playFallbackBeep();
        }
    }
    
    /**
     * Play a triumphant sound for level up achievements
     */
    public playSuccessSound(): void {
        if (this.isTestEnvironment) return;
        
        // Try to create or resume audio context first
        this.forceResumeContext();
        
        if (!this.audioContext) {
            console.error('Cannot play success sound - AudioContext not available');
            return;
        }
        
        try {
            // Play a short triumph melody
            this.playSuccessNote(261.63, 0, 0.15); // C4
            this.playSuccessNote(329.63, 0.15, 0.15); // E4
            this.playSuccessNote(392.00, 0.3, 0.15); // G4
            this.playSuccessNote(523.25, 0.45, 0.3); // C5 (hold longer)
        } catch (error) {
            console.error('Error playing success sound:', error);
            
            // Try a direct fallback beep as last resort
            this.playFallbackBeep();
        }
    }
    
    /**
     * Helper method to play a single note in the success sequence
     */
    private playSuccessNote(frequency: number, startDelay: number, duration: number): void {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'triangle'; // More musical tone for success sound
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime + startDelay);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + startDelay);
        gainNode.gain.linearRampToValueAtTime(0.7, this.audioContext.currentTime + startDelay + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + startDelay + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start(this.audioContext.currentTime + startDelay);
        oscillator.stop(this.audioContext.currentTime + startDelay + duration);
    }
    
    /**
     * Fallback method to play a beep using HTML Audio element
     * This is used as a last resort when WebAudio fails
     */
    private playFallbackBeep(): void {
        try {
            const audio = new Audio();
            // Very short base64 encoded audio file
            audio.src = 'data:audio/wav;base64,UklGRjQrAABXQVZFZm10IBAAAAABAAEARKwAAESsAAABAAgAZGF0YRAr';
            audio.volume = 1.0;
            
            // We need to call play() synchronously within a user gesture,
            // and handle the promise separately
            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('Fallback audio played successfully');
                }).catch(err => {
                    console.error('Fallback audio failed:', err);
                });
            }
        } catch (e) {
            console.error('All audio methods failed:', e);
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