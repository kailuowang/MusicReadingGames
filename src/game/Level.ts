import { LevelConfig } from '../models/LevelConfig';
import { Note } from '../models/Note';
import { LevelData } from '../data/LevelData';

export class Level {
    private config: LevelConfig;
    private notes: Note[];
    private currentNoteIndex: number = 0;
    private notePool: Note[] = [];
    
    constructor(config: LevelConfig) {
        this.config = config;
        this.notes = [...config.notes];
        this.initializeNotePool();
    }
    
    public getCurrentNote(): Note {
        return this.notePool[this.currentNoteIndex];
    }
    
    public getAvailableNotes(): Note[] {
        return this.notes;
    }
    
    public nextNote(): void {
        // Get the current note before we change the index
        const currentNote = this.getCurrentNote();
        
        // Find the next note that's different from the current one
        let nextIndex = (this.currentNoteIndex + 1) % this.notePool.length;
        
        // If we have more than one note in the pool, ensure we don't repeat the same note
        if (this.notePool.length > 1) {
            // Keep incrementing the index until we find a different note
            while (this.isSameNote(currentNote, this.notePool[nextIndex])) {
                nextIndex = (nextIndex + 1) % this.notePool.length;
            }
        }
        
        this.currentNoteIndex = nextIndex;
    }
    
    /**
     * Check if two notes are the same (same name, octave, and accidental)
     */
    private isSameNote(note1: Note, note2: Note): boolean {
        return note1.name === note2.name && 
               note1.octave === note2.octave && 
               note1.accidental === note2.accidental;
    }
    
    public isComplete(recentAttempts: { isCorrect: boolean; timeSpent: number }[]): boolean {
        // Get the current level criteria
        const requiredSuccessCount = this.config.requiredSuccessCount;
        const maxTimePerProblem = this.config.maxTimePerProblem;
        
        // Need at least N recent attempts to evaluate
        if (recentAttempts.length < requiredSuccessCount) {
            return false;
        }
        
        // Get the last N attempts
        const lastN = recentAttempts.slice(-requiredSuccessCount);
        
        // Check for 100% accuracy in recent attempts
        const allCorrect = lastN.every(attempt => attempt.isCorrect);
        
        // Check for speed requirement
        const averageTime = lastN.reduce((sum, attempt) => sum + attempt.timeSpent, 0) / lastN.length;
        const isFastEnough = averageTime < maxTimePerProblem;
        
        return allCorrect && isFastEnough;
    }
    
    private initializeNotePool(): void {
        // Reset the pool
        this.notePool = [];
        
        // If this is a level with a new note (not first level or master level)
        if (this.config.newNote && this.config.learnedNotes) {
            const newNote = this.config.newNote;
            const learnedNotes = this.config.learnedNotes;
            
            // Calculate how many instances of the new note to include (approximately 20%)
            const totalPoolSize = 100; // A reasonable size for the pool
            const newNoteInstances = Math.round(totalPoolSize * LevelData.NEW_NOTE_FREQUENCY);
            const learnedNoteInstances = totalPoolSize - newNoteInstances;
            
            // Add the new note instances
            for (let i = 0; i < newNoteInstances; i++) {
                this.notePool.push(newNote);
            }
            
            // Add previously learned notes, distributing evenly
            if (learnedNotes.length > 0) {
                const instancesPerLearnedNote = Math.floor(learnedNoteInstances / learnedNotes.length);
                
                for (const note of learnedNotes) {
                    for (let i = 0; i < instancesPerLearnedNote; i++) {
                        this.notePool.push(note);
                    }
                }
                
                // If there are remaining instances due to rounding, distribute them
                const remainingInstances = learnedNoteInstances - (instancesPerLearnedNote * learnedNotes.length);
                for (let i = 0; i < remainingInstances; i++) {
                    this.notePool.push(learnedNotes[i % learnedNotes.length]);
                }
            }
        } else {
            // For first level or master level, just use all the notes
            this.notePool = [...this.notes];
        }
        
        // Shuffle the pool
        this.shuffleNotePool();
    }
    
    public updateNotePool(noteHistory: { [noteName: string]: { correct: number; incorrect: number } }): void {
        // Store the current note to ensure we don't change it mid-game
        const currentNote = this.getCurrentNote();
        
        // Reset the pool based on the level configuration
        this.initializeNotePool();
        
        // Add repetitions for notes that have been problematic
        const additionalNotes: Note[] = [];
        
        for (const note of this.notes) {
            const history = noteHistory[note.name];
            if (history && history.incorrect > 0) {
                // Calculate a repetition factor based on error rate
                const errorRate = history.incorrect / (history.correct + history.incorrect);
                const repetitionFactor = Math.min(5, Math.ceil(errorRate * 10));
                
                // Add repetitions based on the difficulty
                for (let i = 0; i < repetitionFactor; i++) {
                    additionalNotes.push(note);
                }
            }
        }
        
        // Add the additional problematic notes to the pool
        this.notePool = [...this.notePool, ...additionalNotes];
        
        // Shuffle the note pool
        this.shuffleNotePool();
        
        // Try to find the previously current note to avoid jarring changes
        const previousIndex = this.notePool.findIndex(note => 
            note.name === currentNote.name && 
            note.clef === currentNote.clef &&
            note.position === currentNote.position
        );
        
        // Set the current note index to the found note, or keep it at 0 if not found
        this.currentNoteIndex = previousIndex >= 0 ? previousIndex : 0;
    }
    
    private shuffleNotePool(): void {
        for (let i = this.notePool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.notePool[i], this.notePool[j]] = [this.notePool[j], this.notePool[i]];
        }
    }
} 