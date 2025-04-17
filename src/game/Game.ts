import { Level } from './Level';
import { Note } from '../models/Note';
import { GameState } from '../models/GameState';
import { LevelData } from '../data/LevelData';
import { SheetMusicRenderer } from '../renderers/SheetMusicRenderer';
import { StorageManager } from '../utils/StorageManager';

export class Game {
    private state: GameState;
    private currentLevel: Level | null = null;
    private sheetRenderer: SheetMusicRenderer;
    private storageManager: StorageManager;
    private noteOptionsContainer: HTMLElement;
    private feedbackElement: HTMLElement;
    private streakElement: HTMLElement;
    private speedElement: HTMLElement;
    private streakRequiredElement: HTMLElement;
    private speedRequiredElement: HTMLElement;
    
    constructor() {
        this.state = {
            currentLevelIndex: 0,
            isGameRunning: false,
            noteHistory: {},
            recentAttempts: []
        };
        
        this.sheetRenderer = new SheetMusicRenderer('sheet-music');
        this.storageManager = new StorageManager('music-reading-game');
        this.noteOptionsContainer = document.getElementById('note-options') as HTMLElement;
        this.feedbackElement = document.getElementById('feedback') as HTMLElement;
        this.streakElement = document.getElementById('streak-value') as HTMLElement;
        this.speedElement = document.getElementById('speed-value') as HTMLElement;
        this.streakRequiredElement = document.getElementById('streak-required') as HTMLElement;
        this.speedRequiredElement = document.getElementById('speed-required') as HTMLElement;
        
        // Try to load saved state
        const savedState = this.storageManager.loadState();
        if (savedState) {
            this.state = savedState;
            // Initialize recentAttempts if it doesn't exist in saved state
            if (!this.state.recentAttempts) {
                this.state.recentAttempts = [];
            }
        }
        
        this.updateStats();
    }
    
    public start(): void {
        if (!this.state.isGameRunning) {
            this.state.isGameRunning = true;
            this.loadLevel(this.state.currentLevelIndex);
        }
    }
    
    public reset(): void {
        this.state = {
            currentLevelIndex: 0,
            isGameRunning: false,
            noteHistory: {},
            recentAttempts: []
        };
        
        this.updateStats();
        this.clearFeedback();
        this.clearNoteOptions();
        this.sheetRenderer.clear();
        this.storageManager.saveState(this.state);
    }
    
    private loadLevel(levelIndex: number): void {
        const levelData = LevelData.levels[levelIndex];
        if (!levelData) {
            console.error(`Level ${levelIndex} does not exist.`);
            return;
        }
        
        this.currentLevel = new Level(levelData);
        this.displayCurrentNote();
    }
    
    private displayCurrentNote(): void {
        if (!this.currentLevel) return;
        
        const currentNote = this.currentLevel.getCurrentNote();
        this.sheetRenderer.renderNote(currentNote);
        this.renderNoteOptions();
    }
    
    private renderNoteOptions(): void {
        this.clearNoteOptions();
        
        if (!this.currentLevel) return;
        
        const availableNotes = this.currentLevel.getAvailableNotes();
        
        availableNotes.forEach((note: Note) => {
            const button = document.createElement('button');
            button.className = 'note-button';
            button.textContent = note.name;
            
            button.addEventListener('click', () => {
                this.checkAnswer(note);
            });
            
            this.noteOptionsContainer.appendChild(button);
        });
    }
    
    private checkAnswer(selectedNote: Note): void {
        if (!this.currentLevel) return;
        
        const currentNote = this.currentLevel.getCurrentNote();
        const isCorrect = currentNote.name === selectedNote.name;
        
        // Update note history for adaptive difficulty
        if (!this.state.noteHistory[currentNote.name]) {
            this.state.noteHistory[currentNote.name] = { 
                correct: 0, 
                incorrect: 0 
            };
        }
        
        if (isCorrect) {
            this.state.noteHistory[currentNote.name].correct += 1;
            this.showFeedback(true, `Correct! That's ${currentNote.name}`);
        } else {
            this.state.noteHistory[currentNote.name].incorrect += 1;
            this.showFeedback(false, `Incorrect. That was ${currentNote.name}, not ${selectedNote.name}`);
        }
        
        this.updateStats();
        this.storageManager.saveState(this.state);
        
        // Move to next note
        setTimeout(() => {
            this.moveToNextNote();
        }, 1500);
    }
    
    private moveToNextNote(): void {
        if (!this.currentLevel) return;
        
        // Check if current level is complete with the new criteria
        if (this.state.recentAttempts && this.currentLevel.isComplete(this.state.recentAttempts)) {
            this.levelUp();
        } else {
            this.currentLevel.nextNote();
            this.displayCurrentNote();
        }
    }
    
    private levelUp(): void {
        this.state.currentLevelIndex++;
        this.storageManager.saveState(this.state);
        
        // Check if there are more levels
        if (this.state.currentLevelIndex < LevelData.levels.length) {
            this.showFeedback(true, `Level Up! Moving to level ${this.state.currentLevelIndex + 1}`);
            setTimeout(() => {
                this.loadLevel(this.state.currentLevelIndex);
            }, 2000);
        } else {
            this.showFeedback(true, "Congratulations! You've completed all levels!");
            this.state.isGameRunning = false;
        }
    }
    
    private showFeedback(isCorrect: boolean, message: string): void {
        this.feedbackElement.textContent = message;
        this.feedbackElement.className = isCorrect ? 'correct' : 'incorrect';
    }
    
    private clearFeedback(): void {
        this.feedbackElement.textContent = '';
        this.feedbackElement.className = '';
    }
    
    private calculateCurrentStreak(): number {
        if (!this.state.recentAttempts || this.state.recentAttempts.length === 0) {
            return 0;
        }

        let streak = 0;
        // Count consecutive correct answers from the most recent attempt
        for (let i = this.state.recentAttempts.length - 1; i >= 0; i--) {
            if (this.state.recentAttempts[i].isCorrect) {
                streak++;
            } else {
                break; // Stop counting when we hit an incorrect answer
            }
        }
        return streak;
    }
    
    private calculateAverageSpeed(): number {
        if (!this.state.recentAttempts || this.state.recentAttempts.length === 0) {
            return 0;
        }
        
        // Get the current level's config
        const currentLevelConfig = LevelData.levels[this.state.currentLevelIndex];
        const requiredSuccessCount = currentLevelConfig?.requiredSuccessCount || 10;
        
        // Take only up to N most recent attempts where N = requiredSuccessCount
        const recentAttempts = this.state.recentAttempts.slice(-requiredSuccessCount);
        
        // Calculate average speed
        const totalTime = recentAttempts.reduce((sum: number, attempt: { timeSpent: number }) => sum + attempt.timeSpent, 0);
        return totalTime / recentAttempts.length;
    }
    
    private updateStats(): void {
        // Update current streak
        const currentStreak = this.calculateCurrentStreak();
        if (this.streakElement) {
            this.streakElement.textContent = currentStreak.toString();
        }
        
        // Update average speed (with 1 decimal place)
        const avgSpeed = this.calculateAverageSpeed();
        if (this.speedElement) {
            this.speedElement.textContent = avgSpeed.toFixed(1);
        }
        
        // Update visual feedback
        this.updateVisualFeedback();
    }
    
    private updateLevelRequirements(): void {
        if (!this.currentLevel) return;
        
        // Get the current level's requirements
        const currentLevelConfig = LevelData.levels[this.state.currentLevelIndex];
        const requiredSuccessCount = currentLevelConfig?.requiredSuccessCount || 10;
        const maxTimePerProblem = currentLevelConfig?.maxTimePerProblem || 5;
        
        // Update the displayed requirements
        if (this.streakRequiredElement) {
            this.streakRequiredElement.textContent = requiredSuccessCount.toString();
        }
        if (this.speedRequiredElement) {
            this.speedRequiredElement.textContent = maxTimePerProblem.toString();
        }
    }
    
    private updateVisualFeedback(): void {
        if (!this.streakElement || !this.speedElement) return;
        
        // Add visual feedback by changing the color of stats based on progress
        const currentStreak = this.calculateCurrentStreak();
        const avgSpeed = this.calculateAverageSpeed();
        
        // Get the current level's requirements
        const currentLevelConfig = LevelData.levels[this.state.currentLevelIndex];
        const requiredSuccessCount = currentLevelConfig?.requiredSuccessCount || 10;
        const maxTimePerProblem = currentLevelConfig?.maxTimePerProblem || 5;
        
        // Update streak styling
        if (currentStreak >= requiredSuccessCount) {
            this.streakElement.className = 'goal-met';
        } else if (currentStreak >= requiredSuccessCount / 2) {
            this.streakElement.className = 'progress';
        } else {
            this.streakElement.className = '';
        }
        
        // Update speed styling
        if (avgSpeed > 0 && avgSpeed < maxTimePerProblem) {
            this.speedElement.className = 'goal-met';
        } else if (avgSpeed > 0 && avgSpeed < maxTimePerProblem * 1.5) {
            this.speedElement.className = 'progress';
        } else {
            this.speedElement.className = '';
        }
    }
    
    private clearNoteOptions(): void {
        this.noteOptionsContainer.innerHTML = '';
    }
} 