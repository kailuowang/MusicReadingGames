import { Game } from './Game';
import { Level } from './Level';
import { SheetMusicRenderer } from '../renderers/SheetMusicRenderer';
import { StorageManager } from '../utils/StorageManager';
import { LevelData } from '../data/LevelData';
import { Note } from '../models/Note';
import { GameState } from '../models/GameState';
import { LevelConfig } from '../models/LevelConfig';
import { AudioPlayer } from '../utils/AudioPlayer';

// --- Mocks ---

// Mock the dependent classes
jest.mock('./Level');
jest.mock('../renderers/SheetMusicRenderer');
jest.mock('../utils/StorageManager');
jest.mock('../utils/AudioPlayer');
jest.mock('../data/LevelData', () => {
    return {
        LevelData: {
            NEW_NOTE_FREQUENCY: 0.2,
            LEVEL_CRITERIA: {
                requiredSuccessCount: 10,
                maxTimePerProblem: 5
            },
            levels: []  // Will be set in each test as needed
        }
    };
});

// Type casting for mocks
const MockLevel = Level as jest.MockedClass<typeof Level>;
const MockSheetMusicRenderer = SheetMusicRenderer as jest.MockedClass<typeof SheetMusicRenderer>;
const MockStorageManager = StorageManager as jest.MockedClass<typeof StorageManager>;

// Mock AudioPlayer singleton
jest.mock('../utils/AudioPlayer', () => {
    const mockPlayNote = jest.fn();
    const mockPlayErrorSound = jest.fn();
    const mockInitialize = jest.fn();
    const mockInstance = {
        playNote: mockPlayNote,
        playErrorSound: mockPlayErrorSound,
        initialize: mockInitialize
    };
    
    return {
        AudioPlayer: {
            getInstance: jest.fn(() => mockInstance)
        }
    };
});

// Sample data
const noteF: Note = { name: 'F', position: 1, isSpace: true, clef: 'treble', octave: 4 };
const noteA: Note = { name: 'A', position: 2, isSpace: true, clef: 'treble', octave: 4 };
const noteC: Note = { name: 'C', position: 3, isSpace: true, clef: 'treble', octave: 5 };

// Mock level configuration for progressive learning
const testLevelConfig1: LevelConfig = {
    id: 1, 
    name: 'Level 1', 
    description: 'First note F', 
    clef: 'treble', 
    notes: [noteF],
    requiredSuccessCount: 10,
    maxTimePerProblem: 5
};

const testLevelConfig2: LevelConfig = {
    id: 2, 
    name: 'Level 2', 
    description: 'Introducing note A', 
    clef: 'treble', 
    notes: [noteF, noteA],
    newNote: noteA,
    learnedNotes: [noteF],
    requiredSuccessCount: 10,
    maxTimePerProblem: 5
};

const testLevelConfig3: LevelConfig = {
    id: 3, 
    name: 'Level 3', 
    description: 'Introducing note C', 
    clef: 'treble', 
    notes: [noteF, noteA, noteC],
    newNote: noteC,
    learnedNotes: [noteF, noteA],
    requiredSuccessCount: 10,
    maxTimePerProblem: 5
};

// Mock DOM elements
const mockSheetMusicDiv = document.createElement('div');
const mockNoteOptionsDiv = document.createElement('div');
const mockFeedbackDiv = document.createElement('div');
const mockStreakElement = document.createElement('span');
const mockSpeedElement = document.createElement('span');
const mockStreakRequiredElement = document.createElement('span');
const mockSpeedRequiredElement = document.createElement('span');

// Ensure DOM elements have initial text content
mockStreakElement.textContent = '0';
mockSpeedElement.textContent = '0';
mockStreakRequiredElement.textContent = '0';
mockSpeedRequiredElement.textContent = '0';

// Mock document.getElementById
document.getElementById = jest.fn((id: string): HTMLElement | null => {
    switch (id) {
        case 'sheet-music': return mockSheetMusicDiv;
        case 'note-options': return mockNoteOptionsDiv;
        case 'feedback': return mockFeedbackDiv;
        case 'streak-value': return mockStreakElement;
        case 'speed-value': return mockSpeedElement;
        case 'streak-required': return mockStreakRequiredElement;
        case 'speed-required': return mockSpeedRequiredElement;
        default: return null;
    }
});

// --- Test Suite ---

describe('Game', () => {
    let game: Game;
    let mockRendererInstance: jest.Mocked<SheetMusicRenderer>;
    let mockStorageInstance: jest.Mocked<StorageManager>;
    let mockLevelInstance: jest.Mocked<Level>;

    // Helper to get mock Level instance (created inside Game constructor)
    const getMockLevelInstance = (): jest.Mocked<Level> => { 
        // Cast the instance to the mocked type
        return MockLevel.mock.instances[MockLevel.mock.instances.length - 1] as jest.Mocked<Level>;
    }

    beforeEach(() => {
        // Reset mocks and instances before each test
        jest.clearAllMocks();
        MockLevel.mockClear();
        MockSheetMusicRenderer.mockClear();
        MockStorageManager.mockClear();
        
        // Update LevelData.levels for each test
        (LevelData.levels as LevelConfig[]) = [testLevelConfig1, testLevelConfig2, testLevelConfig3];
        
        // Reset DOM element mocks
        mockSheetMusicDiv.innerHTML = '';
        mockNoteOptionsDiv.innerHTML = '';
        mockFeedbackDiv.innerHTML = '';
        mockFeedbackDiv.className = '';
        mockStreakElement.textContent = '0';
        mockSpeedElement.textContent = '0';
        mockStreakRequiredElement.textContent = '0';
        mockSpeedRequiredElement.textContent = '0';

        // Configure mock StorageManager loadState for default behavior (no saved state)
        // We need to set up the mock return value before the Game class instantiates
        MockStorageManager.prototype.loadState = jest.fn().mockReturnValue(null) as jest.MockedFunction<() => GameState | null>;
        
        // Use fake timers for setTimeout
        jest.useFakeTimers();
        
        // Instantiate the Game class
        game = new Game();
        
        // Now get the actual instances after Game is instantiated
        mockRendererInstance = MockSheetMusicRenderer.mock.instances[0] as jest.Mocked<SheetMusicRenderer>;
        mockStorageInstance = MockStorageManager.mock.instances[0] as jest.Mocked<StorageManager>;
    });

    afterEach(() => {
        jest.useRealTimers(); // Restore real timers
    });

    test('should initialize with default state if no saved state exists', () => {
        expect(MockStorageManager).toHaveBeenCalledWith('music-reading-game');
        expect(mockStorageInstance.loadState).toHaveBeenCalled();
        expect(game['state'].currentLevelIndex).toBe(0);
        expect(game['state'].isGameRunning).toBe(false);
        expect(game['state'].recentAttempts).toEqual([]);
    });

    test('should load saved state if it exists', () => {
        const savedState: GameState = {
            currentLevelIndex: 1,
            isGameRunning: false, // Should remain false until start()
            noteHistory: { 'F': { correct: 2, incorrect: 1 } },
            recentAttempts: [
                { isCorrect: true, timeSpent: 2.5, timestamp: Date.now() }
            ]
        };
        
        // Need to reset the mock and set up a new return value for this specific test
        MockStorageManager.mockClear();
        MockStorageManager.prototype.loadState = jest.fn().mockReturnValue(savedState) as jest.MockedFunction<() => GameState | null>;

        // Re-instantiate with the mocked loadState returning data
        game = new Game(); 

        expect(game['state']).toEqual(savedState);
        expect(game['state'].currentLevelIndex).toBe(1);
        expect(game['state'].noteHistory).toEqual({ 'F': { correct: 2, incorrect: 1 } });
    });

    test('should start the game and load first level', () => {
        // Mock Level methods for the instance that will be created
        MockLevel.prototype.getCurrentNote.mockReturnValue(noteF);
        MockLevel.prototype.getAvailableNotes.mockReturnValue([noteF]);
        
        // Mock updateNotePool method
        MockLevel.prototype.updateNotePool = jest.fn();

        game.start();
        mockLevelInstance = getMockLevelInstance(); // Now the level instance exists

        expect(game['state'].isGameRunning).toBe(true);
        expect(MockLevel).toHaveBeenCalledWith(testLevelConfig1);
        expect(mockLevelInstance.updateNotePool).toHaveBeenCalled(); // Should update note pool based on history
        expect(mockLevelInstance.getCurrentNote).toHaveBeenCalled();
        expect(mockRendererInstance.renderNote).toHaveBeenCalledWith(noteF);
        // The keyboard renderer now creates a more complex structure with many child elements
        expect(mockNoteOptionsDiv.children.length).toBeGreaterThanOrEqual(1); // At least one child
    });
    
    test('should not start the game if already running', () => {
        game.start(); // Start once
        MockLevel.mockClear(); // Clear calls from first start
        mockRendererInstance.renderNote.mockClear();

        game.start(); // Try starting again
        expect(MockLevel).not.toHaveBeenCalled();
        expect(mockRendererInstance.renderNote).not.toHaveBeenCalled();
    });

    test('should reset the game state and UI', () => {
        // Start and modify state first
        game.start();
        
        // Modify state properties
        game['state'].currentLevelIndex = 2;
        game['state'].recentAttempts = [
            { isCorrect: true, timeSpent: 2.0, timestamp: Date.now() }
        ];
        
        game.reset();

        expect(game['state'].currentLevelIndex).toBe(0);
        expect(game['state'].isGameRunning).toBe(false);
        expect(game['state'].noteHistory).toEqual({});
        expect(game['state'].recentAttempts).toEqual([]);
        
        expect(mockFeedbackDiv.textContent).toBe('');
        expect(mockFeedbackDiv.className).toBe('');
        expect(mockNoteOptionsDiv.innerHTML).toBe('');
        expect(mockRendererInstance.clear).toHaveBeenCalled();
        expect(mockStorageInstance.saveState).toHaveBeenCalledWith(game['state']);
    });

    test('should add new note to history when loading a level with a new note', () => {
        // Setup: Load level 2 which has a new note (A)
        game['state'].currentLevelIndex = 1; // Second level (index 1)
        
        // Mock getCurrentNote and getAvailableNotes
        MockLevel.prototype.getCurrentNote.mockReturnValue(noteA);
        MockLevel.prototype.getAvailableNotes.mockReturnValue([noteF, noteA]);
        
        // Call loadLevel directly
        (game as any).loadLevel(1);
        
        // Check that the new note A has been added to history
        expect(game['state'].noteHistory).toHaveProperty('A');
        expect(game['state'].noteHistory['A']).toEqual({ correct: 0, incorrect: 0 });
    });

    test('should handle correct answer: update feedback, history, save state, and move next', () => {
        // Setup: Start game, level instance exists
        MockLevel.prototype.getCurrentNote.mockReturnValue(noteF);
        MockLevel.prototype.getAvailableNotes.mockReturnValue([noteF]);
        game.start();
        mockLevelInstance = getMockLevelInstance();
        mockLevelInstance.isComplete.mockReturnValue(false);

        // Clear previous mocks
        jest.clearAllMocks();
        
        // Mock the next note after advancing
        MockLevel.prototype.getCurrentNote.mockReturnValue(noteF); // Still F since there's only one note

        // Directly call checkAnswer for a correct answer
        (game as any).checkAnswer(noteF);

        // Check immediate effects of correct answer
        expect(game['state'].noteHistory['F']).toEqual({ correct: 1, incorrect: 0 });
        expect(game['state'].recentAttempts!.length).toBe(1);
        expect(game['state'].recentAttempts![0].isCorrect).toBe(true);
        expect(mockFeedbackDiv.textContent).toBe("Correct! That's F4");
        expect(mockFeedbackDiv.className).toBe('correct');
        expect(mockStorageInstance.saveState).toHaveBeenCalled();
        
        // Fast-forward timers for moveToNextNote
        jest.advanceTimersByTime(1500);
        
        expect(mockLevelInstance.nextNote).toHaveBeenCalled();
        expect(mockRendererInstance.renderNote).toHaveBeenCalledWith(noteF); // Render next note
    });

    test('should handle incorrect answer: update feedback, history, save state, and move next', () => {
        // Setup: Start game, level instance exists
        MockLevel.prototype.getCurrentNote.mockReturnValue(noteF);
        MockLevel.prototype.getAvailableNotes.mockReturnValue([noteF, noteA]);
        game.start();
        mockLevelInstance = getMockLevelInstance();
        mockLevelInstance.isComplete.mockReturnValue(false);
        
        // Clear previous mocks
        jest.clearAllMocks();
        
        // Mock the next note after advancing
        MockLevel.prototype.getCurrentNote.mockReturnValue(noteF);

        // Directly call checkAnswer for an incorrect answer
        (game as any).checkAnswer(noteA);

        // Check immediate effects of incorrect answer
        expect(game['state'].noteHistory['F']).toEqual({ correct: 0, incorrect: 1 });
        expect(game['state'].recentAttempts!.length).toBe(1);
        expect(game['state'].recentAttempts![0].isCorrect).toBe(false);
        expect(mockFeedbackDiv.textContent).toBe("Incorrect. That was F4, not A4");
        expect(mockFeedbackDiv.className).toBe('incorrect');
        expect(mockStorageInstance.saveState).toHaveBeenCalled();
        
        // Fast-forward timers for moveToNextNote
        jest.advanceTimersByTime(1500);
        
        expect(mockLevelInstance.nextNote).toHaveBeenCalled();
        expect(mockRendererInstance.renderNote).toHaveBeenCalledWith(noteF); // Render next note
    });

    test('should level up when the current level is complete', () => {
        // Setup: Start game at level 1
        MockLevel.prototype.getCurrentNote.mockReturnValue(noteF);
        MockLevel.prototype.getAvailableNotes.mockReturnValue([noteF]);
        game['state'].currentLevelIndex = 0; // First level
        game.start(); 
        mockLevelInstance = getMockLevelInstance();
        
        // Mock level completion
        mockLevelInstance.isComplete.mockReturnValue(true);

        // Setup for the next level that will be created
        const mockNextLevelInstance = {
            getCurrentNote: jest.fn().mockReturnValue(noteA),
            getAvailableNotes: jest.fn().mockReturnValue([noteF, noteA]),
            updateNotePool: jest.fn(),
            isComplete: jest.fn().mockReturnValue(false)
        };
        
        // Clear the mock and set up next level instance
        MockLevel.mockClear();
        MockLevel.mockImplementationOnce(() => mockNextLevelInstance as any);
        
        // Trigger level up by calling moveToNextNote
        (game as any).moveToNextNote();

        // Check effects of level up
        expect(game['state'].currentLevelIndex).toBe(1);
        expect(game['state'].recentAttempts).toEqual([]); // Recent attempts should be cleared
        expect(mockStorageInstance.saveState).toHaveBeenCalled();
        expect(mockFeedbackDiv.textContent).toBe('Level Up! Moving to level 2: Level 2');
        
        // Fast-forward timers for loading next level
        jest.advanceTimersByTime(2000);
        
        // Verify the new level was created with the right config
        expect(MockLevel).toHaveBeenCalledWith(testLevelConfig2);
        
        // Verify the next level's methods were called
        expect(mockNextLevelInstance.updateNotePool).toHaveBeenCalled(); // Should update note pool based on history
        expect(mockNextLevelInstance.getCurrentNote).toHaveBeenCalled();
        expect(mockRendererInstance.renderNote).toHaveBeenCalledWith(noteA);
    });
    
    test('should show completion message when the last level is finished', () => {
        // Setup: ensure we have the right LevelData
        (LevelData.levels as LevelConfig[]) = [testLevelConfig1]; // Only one level for this test
        
        MockLevel.prototype.getCurrentNote.mockReturnValue(noteF); 
        MockLevel.prototype.getAvailableNotes.mockReturnValue([noteF]);
        
        // Create a clean game instance for this test
        jest.clearAllMocks();
        game = new Game();
        
        // Get the mock instances
        mockRendererInstance = MockSheetMusicRenderer.mock.instances[0] as jest.Mocked<SheetMusicRenderer>;
        mockStorageInstance = MockStorageManager.mock.instances[0] as jest.Mocked<StorageManager>;
        
        // Start the game to create the level
        game.start();
        mockLevelInstance = getMockLevelInstance();
        
        // Simulate level completion
        mockLevelInstance.isComplete.mockReturnValue(true);
        
        // Trigger level up when there are no more levels
        game['state'].currentLevelIndex = 0; // Start at level 1
        (game as any).levelUp(); // Should increment to 1, but there's only one level (at index 0)
        
        // Check the expected outcome
        expect(game['state'].currentLevelIndex).toBe(1); // Should increment
        expect(mockFeedbackDiv.textContent).toBe("Congratulations! You've completed all levels!");
        expect(game['state'].isGameRunning).toBe(false);
    });
    
    test('should update level requirements display based on current level', () => {
        // Setup: Start game
        game.start();
        
        // Verify streak and speed requirements are displayed with non-null assertion
        expect(mockStreakRequiredElement.textContent!).toBe('10'); // From testLevelConfig1
        expect(mockSpeedRequiredElement.textContent!).toBe('5');   // From testLevelConfig1
        
        // Update to a different level with different requirements
        game['state'].currentLevelIndex = 2; // Level 3 (has same requirements but could be different)
        
        // Call updateLevelRequirements directly
        (game as any).updateLevelRequirements();
        
        // Verify updated requirements with non-null assertion
        expect(mockStreakRequiredElement.textContent!).toBe('10'); // From testLevelConfig3
        expect(mockSpeedRequiredElement.textContent!).toBe('5');   // From testLevelConfig3
    });

    test('should play correct note sound for correct answer', () => {
        // Setup: Start game, level instance exists
        MockLevel.prototype.getCurrentNote.mockReturnValue(noteF);
        MockLevel.prototype.getAvailableNotes.mockReturnValue([noteF]);
        game.start();
        mockLevelInstance = getMockLevelInstance();
        mockLevelInstance.isComplete.mockReturnValue(false);

        // Clear previous mocks
        jest.clearAllMocks();
        
        // Get AudioPlayer mock instance
        const audioPlayer = AudioPlayer.getInstance() as jest.Mocked<AudioPlayer>;
        
        // Directly call checkAnswer for a correct answer
        (game as any).checkAnswer(noteF);

        // Check that the correct sound was played
        expect(audioPlayer.playNote).toHaveBeenCalledWith('F', 4);
        expect(audioPlayer.playErrorSound).not.toHaveBeenCalled();
    });

    test('should play error sound for incorrect answer', () => {
        // Setup: Start game, level instance exists
        MockLevel.prototype.getCurrentNote.mockReturnValue(noteF);
        MockLevel.prototype.getAvailableNotes.mockReturnValue([noteF, noteA]);
        game.start();
        mockLevelInstance = getMockLevelInstance();
        mockLevelInstance.isComplete.mockReturnValue(false);
        
        // Clear previous mocks
        jest.clearAllMocks();
        
        // Get AudioPlayer mock instance
        const audioPlayer = AudioPlayer.getInstance() as jest.Mocked<AudioPlayer>;
        
        // Directly call checkAnswer for an incorrect answer
        (game as any).checkAnswer(noteA);

        // Check that the error sound was played
        expect(audioPlayer.playErrorSound).toHaveBeenCalled();
        expect(audioPlayer.playNote).not.toHaveBeenCalled();
    });
}); 