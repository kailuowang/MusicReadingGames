import { Level } from './Level';
import { Note } from '../models/Note';
import { GameState } from '../models/GameState';
import { LevelData } from '../data/LevelData';
import { SheetMusicRenderer } from '../renderers/SheetMusicRenderer';
import { StorageManager } from '../utils/StorageManager';
import { PianoKeyboardRenderer } from '../renderers/PianoKeyboardRenderer';
import { NoteRepository } from '../models/NoteRepository';

// Cartoon characters and encouraging messages
interface CartoonCharacter {
    name: string;
    messages: string[];
    avatar: string;
}

const CARTOON_CHARACTERS: CartoonCharacter[] = [
    {
        name: 'Mickey Mouse',
        messages: [
            'Hot dog! You\'re on a roll!',
            'Oh boy! Keep up the great work!',
            'Gosh, you\'re getting good at this!'
        ],
        avatar: 'https://i.imgur.com/VgtMjFS.png'
    },
    {
        name: 'SpongeBob',
        messages: [
            'I\'m ready! You\'re ready! For more notes!',
            'Sweet victory! Keep it up!',
            'That\'s the spirit! You\'re doing great!'
        ],
        avatar: 'https://i.imgur.com/yUdT8BN.png'
    },
    {
        name: 'Bugs Bunny',
        messages: [
            'Eh, what\'s up, Doc? Nice streak you got there!',
            'That\'s all folks... Just kidding, keep going!',
            'You\'re doing swell, Doc!'
        ],
        avatar: 'https://i.imgur.com/TH3zGLz.png'
    },
    {
        name: 'Pikachu',
        messages: [
            'Pika Pika! You\'re electrifying!',
            'Pikachu is impressed by your skills!',
            'Pika Pi! You\'re on fire!'
        ],
        avatar: 'https://i.imgur.com/ziUD63N.png'
    },
    {
        name: 'Homer Simpson',
        messages: [
            'Woo hoo! Four correct notes!',
            'Mmm... musical notes...',
            'D\'oh! I mean... Bravo!'
        ],
        avatar: 'https://i.imgur.com/8QpzSlW.png'
    }
];

export class Game {
    private state: GameState;
    private currentLevel: Level | null = null;
    private sheetRenderer: SheetMusicRenderer;
    private keyboardRenderer: PianoKeyboardRenderer;
    private storageManager: StorageManager;
    private noteRepository: NoteRepository;
    private noteOptionsContainer: HTMLElement;
    private feedbackElement: HTMLElement;
    private streakElement: HTMLElement;
    private speedElement: HTMLElement;
    private streakRequiredElement: HTMLElement;
    private speedRequiredElement: HTMLElement;
    private noteDisplayTime: number = 0; // Store when the current note was displayed
    private lastStreakAnimation: number = 0; // Track when we last showed a streak animation
    private characterElement: HTMLElement | null = null;
    
    constructor() {
        this.state = {
            currentLevelIndex: 0,
            isGameRunning: false,
            noteHistory: {},
            recentAttempts: []
        };
        
        // Initialize the NoteRepository first (singleton)
        this.noteRepository = NoteRepository.getInstance();
        
        this.sheetRenderer = new SheetMusicRenderer('sheet-music');
        this.keyboardRenderer = new PianoKeyboardRenderer('note-options');
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
            console.log('Restored previous game state:', savedState);
            this.state = savedState;
        }
        
        this.updateStats();
    }
    
    public start(): void {
        if (!this.state.isGameRunning) {
            this.state.isGameRunning = true;
            this.loadLevel(this.state.currentLevelIndex);
            console.log('Game started!');
            this.updateLevelRequirements();
        }
    }
    
    /**
     * Sets the current level to the specified index and loads it
     * Can be used to jump to any available level
     */
    public setLevel(levelIndex: number): void {
        if (levelIndex < 0 || levelIndex >= LevelData.levels.length) {
            console.error(`Level ${levelIndex} does not exist.`);
            return;
        }
        
        this.state.currentLevelIndex = levelIndex;
        
        // Clear recent attempts for the new level
        this.state.recentAttempts = [];
        
        // Save the updated state
        this.storageManager.saveState(this.state);
        
        // If game is running, load the level immediately
        if (this.state.isGameRunning) {
            this.loadLevel(levelIndex);
        }
    }
    
    /**
     * Returns whether the game is currently running
     */
    public isGameRunning(): boolean {
        return this.state.isGameRunning;
    }
    
    public reset(): void {
        console.log('Resetting game and clearing storage...');
        
        // Clear storage first
        this.storageManager.clearState();
        
        // Reset state
        this.state = {
            currentLevelIndex: 0,
            isGameRunning: false,
            noteHistory: {},
            recentAttempts: []
        };
        
        // Save the empty state to storage
        this.storageManager.saveState(this.state);
        
        this.updateStats();
        this.clearFeedback();
        this.clearNoteOptions();
        this.sheetRenderer.clear();
        
        console.log('Game reset complete.');
    }
    
    private loadLevel(levelIndex: number): void {
        const levels = LevelData.levels;
        if (levelIndex < 0 || levelIndex >= levels.length) {
            console.error(`Level ${levelIndex} does not exist.`);
            return;
        }
        
        const levelData = levels[levelIndex];
        console.log(`Loading level ${levelIndex + 1}: ${levelData.name}`);
        this.currentLevel = new Level(levelData);
        
        // If the level has a new note, update the note history with an initial entry
        if (levelData.newNote && !this.state.noteHistory[levelData.newNote.name]) {
            this.state.noteHistory[levelData.newNote.name] = {
                correct: 0,
                incorrect: 0
            };
        }
        
        // Update the note pool based on history
        if (this.currentLevel) {
            this.currentLevel.updateNotePool(this.state.noteHistory);
        }
        
        this.displayCurrentNote();
        this.updateLevelRequirements();
    }
    
    private displayCurrentNote(): void {
        if (!this.currentLevel) return;
        
        const currentNote = this.currentLevel.getCurrentNote();
        this.sheetRenderer.renderNote(currentNote);
        this.renderNoteOptions();
        
        // Store the time when the note was displayed
        this.noteDisplayTime = Date.now();
    }
    
    private renderNoteOptions(): void {
        this.clearNoteOptions();
        
        if (!this.currentLevel) return;
        
        const availableNotes = this.currentLevel.getAvailableNotes();
        
        // Use the piano keyboard renderer to display the notes
        this.keyboardRenderer.renderKeyboard(availableNotes, (selectedNote: Note) => {
            this.checkAnswer(selectedNote);
        });
    }
    
    private checkAnswer(selectedNote: Note): void {
        if (!this.currentLevel) return;
        
        const currentNote = this.currentLevel.getCurrentNote();
        
        // Check both note name and octave match
        const nameMatches = currentNote.name === selectedNote.name;
        const octaveMatches = currentNote.octave === selectedNote.octave;
        
        const isCorrect = nameMatches && octaveMatches;
        
        // Update note history for adaptive difficulty
        if (!this.state.noteHistory[currentNote.name]) {
            this.state.noteHistory[currentNote.name] = { 
                correct: 0, 
                incorrect: 0 
            };
        }
        
        // Calculate actual time spent answering this question
        const answerTime = Date.now();
        const timeSpent = (answerTime - this.noteDisplayTime) / 1000; // Convert to seconds
        
        // Add to recent attempts array for level completion tracking
        if (!this.state.recentAttempts) {
            this.state.recentAttempts = [];
        }
        
        this.state.recentAttempts.push({
            isCorrect,
            timeSpent,
            timestamp: answerTime
        });
        
        if (isCorrect) {
            this.state.noteHistory[currentNote.name].correct += 1;
            this.showFeedback(true, `Correct! That's ${currentNote.name}${currentNote.octave}`);
        } else {
            this.state.noteHistory[currentNote.name].incorrect += 1;
            
            if (!nameMatches) {
                this.showFeedback(false, `Incorrect. That was ${currentNote.name}${currentNote.octave}, not ${selectedNote.name}${selectedNote.octave}`);
            } else if (!octaveMatches) {
                this.showFeedback(false, `Incorrect. Right note name (${currentNote.name}), but wrong octave. It was ${currentNote.name}${currentNote.octave}, you selected ${selectedNote.name}${selectedNote.octave}`);
            }
        }
        
        this.updateStats();
        this.storageManager.saveState(this.state);
        
        // Move to next note
        setTimeout(() => {
            this.moveToNextNote();
        }, 100);
    }
    
    private moveToNextNote(): void {
        if (!this.currentLevel) return;
        
        // Check if current level is complete
        if (this.state.recentAttempts && this.currentLevel.isComplete(this.state.recentAttempts)) {
            this.levelUp();
        } else {
            this.currentLevel.nextNote();
            this.displayCurrentNote();
        }
    }
    
    private levelUp(): void {
        this.state.currentLevelIndex++;
        
        // Clear recent attempts for the new level
        this.state.recentAttempts = [];
        
        this.storageManager.saveState(this.state);
        
        // Check if there are more levels
        if (this.state.currentLevelIndex < LevelData.levels.length) {
            const nextLevel = LevelData.levels[this.state.currentLevelIndex];
            this.showFeedback(true, `Level Up! Moving to level ${this.state.currentLevelIndex + 1}: ${nextLevel.name}`);
            
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
        
        // Get the current level's requirement
        const currentLevel = LevelData.levels[this.state.currentLevelIndex];
        const requiredSuccessCount = currentLevel?.requiredSuccessCount || LevelData.LEVEL_CRITERIA.requiredSuccessCount;
        
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
        
        // Show cartoon character at 4-streak
        if (currentStreak === 4) {
            // Check if we haven't shown an animation recently (avoid showing it multiple times)
            const now = Date.now();
            if (now - this.lastStreakAnimation > 5000) { // Only show if it's been 5+ seconds
                this.showCartoonCharacter();
                this.lastStreakAnimation = now;
            }
        }
    }
    
    private updateLevelRequirements(): void {
        if (!this.currentLevel) return;
        
        // Get the current level's requirements
        const currentLevelConfig = LevelData.levels[this.state.currentLevelIndex];
        const requiredSuccessCount = currentLevelConfig?.requiredSuccessCount || LevelData.LEVEL_CRITERIA.requiredSuccessCount;
        const maxTimePerProblem = currentLevelConfig?.maxTimePerProblem || LevelData.LEVEL_CRITERIA.maxTimePerProblem;
        
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
        const requiredSuccessCount = currentLevelConfig?.requiredSuccessCount || LevelData.LEVEL_CRITERIA.requiredSuccessCount;
        const maxTimePerProblem = currentLevelConfig?.maxTimePerProblem || LevelData.LEVEL_CRITERIA.maxTimePerProblem;
        
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
    
    /**
     * Displays a random cartoon character with an encouraging message
     */
    private showCartoonCharacter(): void {
        // Remove any existing character element
        this.removeCharacterElement();
        
        // Select a random character
        const randomCharacter = CARTOON_CHARACTERS[Math.floor(Math.random() * CARTOON_CHARACTERS.length)];
        
        // Select a random message from the character
        const randomMessage = randomCharacter.messages[Math.floor(Math.random() * randomCharacter.messages.length)];
        
        // Create the character element
        this.characterElement = document.createElement('div');
        this.characterElement.className = 'cartoon-character-popup';
        
        // Add character avatar, name and message
        const characterContent = `
            <div class="character-avatar">
                <img src="${randomCharacter.avatar}" alt="${randomCharacter.name}">
            </div>
            <div class="character-content">
                <h3>${randomCharacter.name}</h3>
                <p>${randomMessage}</p>
            </div>
        `;
        
        this.characterElement.innerHTML = characterContent;
        
        // Add to document body
        document.body.appendChild(this.characterElement);
        
        // Make sure the element is visible with animation
        setTimeout(() => {
            if (this.characterElement) {
                this.characterElement.classList.add('visible');
            }
        }, 10);
        
        // Remove after a few seconds
        setTimeout(() => {
            this.removeCharacterElement();
        }, 3000);
    }
    
    /**
     * Removes the character element if it exists
     */
    private removeCharacterElement(): void {
        if (this.characterElement && document.body.contains(this.characterElement)) {
            this.characterElement.classList.remove('visible');
            
            // Clean up after animation
            setTimeout(() => {
                if (this.characterElement && document.body.contains(this.characterElement)) {
                    document.body.removeChild(this.characterElement);
                    this.characterElement = null;
                }
            }, 500);
        }
    }
} 