import { Level } from './Level';
import { Note } from '../models/Note';
import { GameState } from '../models/GameState';
import { LevelData } from '../data/LevelData';
import { SheetMusicRenderer } from '../renderers/SheetMusicRenderer';
import { StorageManager } from '../utils/StorageManager';
import { PianoKeyboardRenderer } from '../renderers/PianoKeyboardRenderer';
import { NoteRepository } from '../models/NoteRepository';
import { ProfileManager } from '../utils/ProfileManager';
import { AudioPlayer } from '../utils/AudioPlayer';
import { NoteUtils } from '../utils/NoteUtils';

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
        avatar: './imgs/mickeymouse.jpg'
    },
    {
        name: 'SpongeBob',
        messages: [
            'I\'m ready! You\'re ready! For more notes!',
            'Sweet victory! Keep it up!',
            'That\'s the spirit! You\'re doing great!'
        ],
        avatar: './imgs/spongebob.png'
    },
    {
        name: 'Bugs Bunny',
        messages: [
            'Eh, what\'s up, Doc? Nice streak you got there!',
            'That\'s all folks... Just kidding, keep going!',
            'You\'re doing swell, Doc!'
        ],
        avatar: './imgs/bugsbunny.jpg'
    },
    {
        name: 'Pikachu',
        messages: [
            'Pika Pika! You\'re electrifying!',
            'Pikachu is impressed by your skills!',
            'Pika Pi! You\'re on fire!'
        ],
        avatar: './imgs/pikachu.jpg'
    },
    {
        name: 'Homer Simpson',
        messages: [
            'Woo hoo! Four correct notes!',
            'Mmm... musical notes...',
            'D\'oh! I mean... Bravo!'
        ],
        avatar: './imgs/homersimpson.jpg'
    }
];

export class Game {
    private state: GameState;
    private currentLevel: Level | null = null;
    private sheetRenderer: SheetMusicRenderer;
    private keyboardRenderer: PianoKeyboardRenderer;
    private storageManager: StorageManager;
    private profileManager: ProfileManager;
    private noteRepository: NoteRepository;
    private audioPlayer: AudioPlayer;
    private noteOptionsContainer: HTMLElement;
    private feedbackElement: HTMLElement;
    private streakElement: HTMLElement;
    private speedElement: HTMLElement;
    private streakRequiredElement: HTMLElement;
    private speedRequiredElement: HTMLElement;
    private profileNameElement: HTMLElement | null = null;
    private levelNameElement: HTMLElement | null = null;
    private noteDisplayTime: number = 0; // Store when the current note was displayed
    private lastStreakAnimation: number = 0; // Track when we last showed a streak animation
    private characterElement: HTMLElement | null = null;
    
    constructor() {
        // Default state (will be overridden by profile if available)
        this.state = {
            currentLevelIndex: 0,
            isGameRunning: false,
            noteHistory: {},
            recentAttempts: []
        };
        
        // Initialize the NoteRepository first (singleton)
        this.noteRepository = NoteRepository.getInstance();
        
        // Initialize AudioPlayer
        this.audioPlayer = AudioPlayer.getInstance();
        
        this.sheetRenderer = new SheetMusicRenderer('sheet-music');
        this.keyboardRenderer = new PianoKeyboardRenderer('note-options');
        this.storageManager = new StorageManager('music-reading-game');
        this.profileManager = new ProfileManager('music-reading-game');
        this.noteOptionsContainer = document.getElementById('note-options') as HTMLElement;
        this.feedbackElement = document.getElementById('feedback') as HTMLElement;
        this.streakElement = document.getElementById('streak-value') as HTMLElement;
        this.speedElement = document.getElementById('speed-value') as HTMLElement;
        this.streakRequiredElement = document.getElementById('streak-required') as HTMLElement;
        this.speedRequiredElement = document.getElementById('speed-required') as HTMLElement;
        
        // Get profile display elements
        this.profileNameElement = document.getElementById('profile-name') as HTMLElement;
        this.levelNameElement = document.getElementById('level-name') as HTMLElement;
        
        // Try to load state from active profile
        const activeProfile = this.profileManager.getActiveProfile();
        if (activeProfile) {
            this.state = activeProfile.gameState;
            
            // Apply saved display preferences
            this.applyDisplayPreferences();
            
            // If there was a game in progress, wait for clef images to load before auto-starting
            if (this.state.isGameRunning) {
                // Use a function to check if images are loaded and then start the game
                this.waitForImagesAndStartGame();
            }
        } else {
            // Create default profile if none exists
            this.createDefaultProfile();
        }
        
        this.updateStats();
        this.updateProfileDisplay();
        
        // Initialize audio on page click
        document.addEventListener('click', () => {
            // Initialize audio on any user interaction with the page
            if (this.audioPlayer) {
                this.audioPlayer.initialize();
            }
        }, { once: true }); // Only need to do this once
    }
    
    /**
     * Creates a default profile if none exists
     */
    private createDefaultProfile(): void {
        const defaultProfile = this.profileManager.createProfile('Player 1');
        this.state = defaultProfile.gameState;
    }
    
    /**
     * Gets all profiles
     */
    public getAllProfiles(): { id: string; name: string; isActive: boolean; lastUsed: number }[] {
        const profiles = this.profileManager.getAllProfiles();
        const activeProfile = this.profileManager.getActiveProfile();
        
        return profiles.map(profile => ({
            id: profile.id,
            name: profile.name,
            isActive: activeProfile ? profile.id === activeProfile.id : false,
            lastUsed: profile.lastUsed
        }));
    }
    
    /**
     * Gets the active profile
     */
    public getActiveProfile(): { id: string; name: string; displayPreferences?: { showNoteNames: boolean; showAllNotes: boolean } } | null {
        const profile = this.profileManager.getActiveProfile();
        return profile ? { 
            id: profile.id, 
            name: profile.name,
            displayPreferences: profile.displayPreferences
        } : null;
    }
    
    /**
     * Creates a new profile
     */
    public createProfile(name: string): void {
        this.profileManager.createProfile(name);
        this.updateProfileDisplay();
    }
    
    /**
     * Removes a profile
     */
    public removeProfile(id: string): void {
        this.profileManager.removeProfile(id);
        
        // If the active profile was removed, load the new active profile's state
        const activeProfile = this.profileManager.getActiveProfile();
        if (activeProfile) {
            this.state = activeProfile.gameState;
            this.updateStats();
        }
        
        this.updateProfileDisplay();
    }
    
    /**
     * Updates a profile name
     */
    public updateProfileName(id: string, name: string): void {
        this.profileManager.updateProfileName(id, name);
        this.updateProfileDisplay();
    }
    
    /**
     * Sets the active profile
     */
    public setActiveProfile(id: string): void {
        if (this.profileManager.setActiveProfile(id)) {
            const profile = this.profileManager.getActiveProfile();
            if (profile) {
                // Load the profile's game state
                this.state = profile.gameState;
                
                // Apply saved display preferences
                this.applyDisplayPreferences();
                
                // If game is running, wait for images to load before starting
                if (this.state.isGameRunning) {
                    this.waitForImagesAndStartGame();
                } else {
                    // Just clear the display
                    this.clearFeedback();
                    this.clearNoteOptions();
                    this.sheetRenderer.clear();
                    
                    // Notify the UI that the game is not running
                    document.dispatchEvent(new CustomEvent('gameStateChanged', { detail: { isRunning: false } }));
                }
                
                this.updateStats();
                this.updateProfileDisplay();
            }
        }
    }
    
    /**
     * Updates the profile display in the UI
     */
    private updateProfileDisplay(): void {
        // Update profile name display
        if (this.profileNameElement) {
            const profile = this.profileManager.getActiveProfile();
            this.profileNameElement.textContent = profile ? profile.name : 'No Profile';
        }
        
        // Update level name display
        if (this.levelNameElement) {
            const currentLevelConfig = LevelData.levels[this.state.currentLevelIndex];
            this.levelNameElement.textContent = currentLevelConfig ? 
                `Level ${this.state.currentLevelIndex + 1}: ${currentLevelConfig.name}` : 
                'No Level';
        }
    }
    
    public start(): void {
        if (!this.state.isGameRunning) {
            // Initialize audio on user interaction
            this.audioPlayer.initialize();
            
            this.state.isGameRunning = true;
            this.saveState();
            
            // Wait for images to load before starting the game
            this.waitForImagesAndStartGame();
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
        this.saveState();
        this.updateProfileDisplay();
        
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
    
    /**
     * Save the current game state to the active profile
     */
    private saveState(): void {
        // Save to active profile
        this.profileManager.updateActiveProfileGameState(this.state);
        
        // Also save to legacy storage for backward compatibility
        this.storageManager.saveState(this.state);
    }
    
    public reset(): void {
        // Reset state
        this.state = {
            currentLevelIndex: 0,
            isGameRunning: false,
            noteHistory: {},
            recentAttempts: []
        };
        
        // Save the empty state to profile
        this.saveState();
        
        this.updateStats();
        this.updateProfileDisplay();
        this.clearFeedback();
        this.clearNoteOptions();
        this.sheetRenderer.clear();
        
        // Notify the UI that the game is not running
        document.dispatchEvent(new CustomEvent('gameStateChanged', { detail: { isRunning: false } }));
    }
    
    /**
     * Resets all profiles and returns to default state
     */
    public resetAllProfiles(): void {
        this.profileManager.clearAllProfiles();
        this.createDefaultProfile();
        this.reset();
    }
    
    private loadLevel(levelIndex: number): void {
        const levels = LevelData.levels;
        if (levelIndex < 0 || levelIndex >= levels.length) {
            console.error(`Level ${levelIndex} does not exist.`);
            return;
        }
        
        const levelData = levels[levelIndex];
        this.currentLevel = new Level(levelData, levelIndex);
        
        // If the level has a new note, update the note history with an initial entry (still useful for overall stats)
        if (levelData.newNote) { // Check if newNote exists
            const noteId = NoteUtils.getNoteId(levelData.newNote);
            if (!this.state.noteHistory[noteId]) { // Initialize only if not present
                 this.state.noteHistory[noteId] = { // Use noteId as the key
                     correct: 0,
                     incorrect: 0
                 };
             }
        }
        
        this.displayCurrentNote();
        this.updateLevelRequirements();
        
        // Update profile display with level info
        this.updateProfileDisplay();
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
        const currentNote = this.currentLevel.getCurrentNote();
        
        // Use the piano keyboard renderer to display the notes
        this.keyboardRenderer.renderKeyboard(availableNotes, (selectedNote: Note) => {
            this.checkAnswer(selectedNote);
        }, currentNote.clef);
    }
    
    private checkAnswer(selectedNote: Note): void {
        if (!this.currentLevel) return;

        const currentNote = this.currentLevel.getCurrentNote();
        if (!currentNote) {
            console.error("checkAnswer received null currentNote from Level.");
            return;
        }
        const currentNoteId = NoteUtils.getNoteId(currentNote);
        const isCorrect = this.currentLevel.isSameNote(currentNote, selectedNote);

        // Play appropriate sound based on the answer
        if (isCorrect) {
            this.audioPlayer.playNote(currentNote.name, currentNote.octave);
        } else {
            this.audioPlayer.playErrorSound();
        }

        // Update note history for general stats tracking (using noteId)
        if (!this.state.noteHistory[currentNoteId]) {
            this.state.noteHistory[currentNoteId] = {
                correct: 0,
                incorrect: 0
            };
        }
        if (isCorrect) {
            this.state.noteHistory[currentNoteId].correct += 1;
        } else {
            this.state.noteHistory[currentNoteId].incorrect += 1;
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
            timestamp: answerTime,
        });
        
        // Limit the array to only keep the required number of attempts
        const currentLevelConfig = LevelData.levels[this.state.currentLevelIndex];
        const requiredSuccessCount = currentLevelConfig?.requiredSuccessCount || LevelData.LEVEL_CRITERIA.requiredSuccessCount;
        
        // Keep just enough attempts (required + 1) to verify streak status
        const keepCount = requiredSuccessCount + 1;
        if (this.state.recentAttempts.length > keepCount) {
            this.state.recentAttempts = this.state.recentAttempts.slice(-keepCount);
        }

        // *** NEW: Update mistaken notes pool in Level ***
        this.currentLevel.updateMistakenNotes(currentNote, isCorrect);

        // Show feedback
        if (isCorrect) {
            this.showFeedback(true, `Correct! That's ${NoteUtils.getNoteLabel(currentNote)}`);
        } else {
            // Check if it's the same note name but different octave
            if (currentNote.name === selectedNote.name && currentNote.octave !== selectedNote.octave) {
                this.showFeedback(false, `Incorrect. That was ${NoteUtils.getNoteLabel(currentNote)}, not ${NoteUtils.getNoteLabel(selectedNote)} (wrong octave)`);
            } else {
                this.showFeedback(false, `Incorrect. That was ${NoteUtils.getNoteLabel(currentNote)}, not ${NoteUtils.getNoteLabel(selectedNote)}`);
            }
        }

        this.updateStats();
        this.saveState();

        // Move to next note
        setTimeout(() => {
            this.moveToNextNote();
        }, 150); // Slightly increased delay might feel smoother
    }
    
    private moveToNextNote(): void {
        if (!this.currentLevel) return;
        
        // Check if current level is complete using the existing recentAttempts array
        // The Level class still provides the isComplete logic based on its config.
        if (this.state.recentAttempts && this.currentLevel.isComplete(this.state.recentAttempts)) {
            this.levelUp();
        } else {
            // Tell the level to select the *next* note internally
            this.currentLevel.nextNote();
            // Display the newly selected note
            this.displayCurrentNote();
        }
    }
    
    private levelUp(): void {
        this.state.currentLevelIndex++;
        
        // Clear recent attempts for the new level
        this.state.recentAttempts = [];
        
        this.saveState();
        this.updateProfileDisplay(); // Update to show new level name
        
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
        
        // Reset animation by removing active class
        this.feedbackElement.classList.remove('active');
        
        // Force a reflow to restart animation
        void this.feedbackElement.offsetWidth;
        
        // Add active class to trigger animation
        this.feedbackElement.classList.add('active');
        
        // Create celebration effects for correct answers
        if (isCorrect) {
            this.showCelebration();
        }
    }
    
    /**
     * Creates a celebration effect with confetti and stars
     */
    private showCelebration(): void {
        const celebrationContainer = document.querySelector('.celebration-container');
        if (!celebrationContainer) return;
        
        // Clear any existing celebration elements
        celebrationContainer.innerHTML = '';
        
        // Create confetti pieces
        for (let i = 0; i < 20; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.width = `${5 + Math.random() * 10}px`;
            confetti.style.height = `${10 + Math.random() * 15}px`;
            confetti.style.backgroundColor = this.getRandomColor();
            confetti.style.animationDelay = `${Math.random() * 0.5}s`;
            confetti.style.animationDuration = `${1 + Math.random() * 2}s`;
            
            celebrationContainer.appendChild(confetti);
        }
        
        // Create stars
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.animationDelay = `${Math.random() * 0.5}s`;
            
            celebrationContainer.appendChild(star);
        }
        
        // Remove celebration elements after animation
        setTimeout(() => {
            celebrationContainer.innerHTML = '';
        }, 3000);
    }
    
    /**
     * Returns a random bright color for confetti
     */
    private getRandomColor(): string {
        const colors = [
            '#3498db', // blue
            '#e74c3c', // red
            '#2ecc71', // green
            '#f39c12', // orange
            '#9b59b6', // purple
            '#1abc9c', // turquoise
        ];
        return colors[Math.floor(Math.random() * colors.length)];
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
        
        // Get the current streak
        const currentStreak = this.calculateCurrentStreak();
        if (currentStreak === 0) {
            return 0;
        }
        
        // Take only the attempts in the current streak
        const streakAttempts = this.state.recentAttempts.slice(-currentStreak);
        
        // Calculate average speed
        const totalTime = streakAttempts.reduce((sum: number, attempt: { timeSpent: number }) => sum + attempt.timeSpent, 0);
        return totalTime / streakAttempts.length;
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
            this.speedElement.textContent = currentStreak > 0 ? avgSpeed.toFixed(1) : "-";
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
            this.streakElement.className = 'stats-value goal-met';
        } else if (currentStreak >= requiredSuccessCount / 2) {
            this.streakElement.className = 'stats-value progress';
        } else {
            this.streakElement.className = 'stats-value';
        }
        
        // Update speed styling
        if (avgSpeed > 0 && avgSpeed < maxTimePerProblem) {
            this.speedElement.className = 'stats-value goal-met';
        } else if (avgSpeed > 0 && avgSpeed < maxTimePerProblem * 1.5) {
            this.speedElement.className = 'stats-value progress';
        } else {
            this.speedElement.className = 'stats-value';
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
        }, 9000);
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
    
    /**
     * Apply the display preferences from the active profile to the renderers
     */
    private applyDisplayPreferences(): void {
        const preferences = this.profileManager.getActiveProfileDisplayPreferences();
        if (preferences && this.keyboardRenderer) {
            // Set the keyboard renderer properties from saved preferences
            if (typeof preferences.showNoteNames === 'boolean') {
                this.keyboardRenderer['showNoteNames'] = preferences.showNoteNames;
            }
            
            if (typeof preferences.showAllNotes === 'boolean') {
                this.keyboardRenderer['showAllKeys'] = preferences.showAllNotes;
            }
        }
    }
    
    /**
     * Updates the display preferences in the active profile
     */
    public updateDisplayPreferences(preferences: { showNoteNames?: boolean; showAllNotes?: boolean }): void {
        // Get current preferences
        const currentPreferences = this.profileManager.getActiveProfileDisplayPreferences() || {
            showNoteNames: true,
            showAllNotes: false
        };
        
        // Update only the provided preferences
        const updatedPreferences = {
            showNoteNames: preferences.showNoteNames !== undefined ? preferences.showNoteNames : currentPreferences.showNoteNames,
            showAllNotes: preferences.showAllNotes !== undefined ? preferences.showAllNotes : currentPreferences.showAllNotes
        };
        
        // Save to active profile
        this.profileManager.updateActiveProfileDisplayPreferences(updatedPreferences);
    }
    
    /**
     * Gets the current display preferences from the active profile
     */
    public getDisplayPreferences(): { showNoteNames: boolean; showAllNotes: boolean } {
        return this.profileManager.getActiveProfileDisplayPreferences() || {
            showNoteNames: true,
            showAllNotes: false
        };
    }
    
    /**
     * Function to wait for clef images to load and then start the game
     */
    private waitForImagesAndStartGame(): void {
        if (this.sheetRenderer.areImagesLoaded()) {
            // Load the current level
            this.loadLevel(this.state.currentLevelIndex);
            
            // Notify the UI that the game is running
            document.dispatchEvent(new CustomEvent('gameStateChanged', { detail: { isRunning: true } }));
            
            // If we got here, we're ready to start
        } else {
            // Images aren't loaded yet, check again after a delay
            setTimeout(() => {
                this.waitForImagesAndStartGame();
            }, 100);
        }
    }
} 