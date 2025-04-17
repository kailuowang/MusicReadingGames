import { LevelConfig } from '../models/LevelConfig';
import { Note } from '../models/Note';

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
        this.currentNoteIndex = (this.currentNoteIndex + 1) % this.notePool.length;
    }
    
    public isComplete(recentAttempts: { isCorrect: boolean; timeSpent: number }[], 
                      requiredSuccessCount: number = 10, 
                      maxTimePerProblem: number = 5): boolean {
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
        // Create a note pool with some repetition based on difficulty
        // This helps implement the adaptive difficulty feature
        this.notePool = [...this.notes];
        
        // We'll add more notes later as we implement adaptive difficulty
    }
    
    public updateNotePool(noteHistory: { [noteName: string]: { correct: number; incorrect: number } }): void {
        // Reset the pool
        this.notePool = [...this.notes];
        
        // Add repetitions for notes that have been problematic
        for (const note of this.notes) {
            const history = noteHistory[note.name];
            if (history && history.incorrect > 0) {
                const repetitionFactor = Math.min(5, Math.ceil(history.incorrect / Math.max(1, history.correct)));
                
                // Add repetitions based on the difficulty
                for (let i = 0; i < repetitionFactor; i++) {
                    this.notePool.push(note);
                }
            }
        }
        
        // Shuffle the note pool
        this.shuffleNotePool();
    }
    
    private shuffleNotePool(): void {
        for (let i = this.notePool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.notePool[i], this.notePool[j]] = [this.notePool[j], this.notePool[i]];
        }
    }
} 