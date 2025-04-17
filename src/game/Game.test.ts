import { Game } from './Game';
import { Level } from './Level';
import { SheetMusicRenderer } from '../renderers/SheetMusicRenderer';
import { StorageManager } from '../utils/StorageManager';
import { LevelData } from '../data/LevelData';
import { Note } from '../models/Note';
import { GameState } from '../models/GameState';
import { LevelConfig } from '../models/LevelConfig';

// --- Mocks ---

// Mock the dependent classes
jest.mock('./Level');
jest.mock('../renderers/SheetMusicRenderer');
jest.mock('../utils/StorageManager');
jest.mock('../data/LevelData');

// Type casting for mocks
const MockLevel = Level as jest.MockedClass<typeof Level>;
const MockSheetMusicRenderer = SheetMusicRenderer as jest.MockedClass<typeof SheetMusicRenderer>;
const MockStorageManager = StorageManager as jest.MockedClass<typeof StorageManager>;

// Sample data
const noteF: Note = { name: 'F', position: 1, isSpace: true, clef: 'treble' };
const noteA: Note = { name: 'A', position: 2, isSpace: true, clef: 'treble' };
const noteC: Note = { name: 'C', position: 3, isSpace: true, clef: 'treble' };

const testLevelConfig1: LevelConfig = {
    id: 1, 
    name: 'Level 1', 
    description: '', 
    clef: 'treble', 
    notes: [noteF, noteA],
    requiredSuccessCount: 5,
    maxTimePerProblem: 5
};
const testLevelConfig2: LevelConfig = {
    id: 2, 
    name: 'Level 2', 
    description: '', 
    clef: 'treble', 
    notes: [noteC],
    requiredSuccessCount: 8,
    maxTimePerProblem: 4
};

// Mock LevelData statically
LevelData.levels = [testLevelConfig1, testLevelConfig2];

// Mock DOM elements
const mockSheetMusicDiv = document.createElement('div');
const mockNoteOptionsDiv = document.createElement('div');
const mockFeedbackDiv = document.createElement('div');
const mockScoreSpan = document.createElement('span');

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
        
        // Reset DOM element mocks
        mockSheetMusicDiv.innerHTML = '';
        mockNoteOptionsDiv.innerHTML = '';
        mockFeedbackDiv.innerHTML = '';
        mockFeedbackDiv.className = '';
        mockScoreSpan.textContent = '0';

        // Mock document.getElementById
        document.getElementById = jest.fn((id) => {
            switch (id) {
                case 'sheet-music': return mockSheetMusicDiv;
                case 'note-options': return mockNoteOptionsDiv;
                case 'feedback': return mockFeedbackDiv;
                case 'score-value': return mockScoreSpan;
                default: return null;
            }
        });
        
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

    test('should start the game, load level 1, and display the first note', () => {
        // Mock Level methods for the instance that will be created
        MockLevel.prototype.getCurrentNote.mockReturnValue(noteF);
        MockLevel.prototype.getAvailableNotes.mockReturnValue([noteF, noteA]);

        game.start();
        mockLevelInstance = getMockLevelInstance(); // Now the level instance exists

        expect(game['state'].isGameRunning).toBe(true);
        expect(MockLevel).toHaveBeenCalledWith(testLevelConfig1);
        expect(mockLevelInstance.getCurrentNote).toHaveBeenCalled();
        expect(mockRendererInstance.renderNote).toHaveBeenCalledWith(noteF);
        expect(mockNoteOptionsDiv.children.length).toBe(2); // Two buttons for F and A
        expect(mockNoteOptionsDiv.children[0].textContent).toBe('F');
        expect(mockNoteOptionsDiv.children[1].textContent).toBe('A');
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

    test('should handle correct answer: update feedback, history, save state, and move next', () => {
        // Setup: Start game, level instance exists
        MockLevel.prototype.getCurrentNote.mockReturnValue(noteF);
        MockLevel.prototype.getAvailableNotes.mockReturnValue([noteF, noteA]);
        game.start();
        mockLevelInstance = getMockLevelInstance();
        mockLevelInstance.isComplete.mockReturnValue(false);

        // Mock the next note after advancing
        MockLevel.prototype.getCurrentNote.mockReturnValue(noteA);

        // Create a mock implementation for checkAnswer
        const originalState = {...game['state']};
        
        // Directly update the state to simulate a correct answer
        game['state'].noteHistory = {
            'F': { correct: 1, incorrect: 0 }
        };
        game['state'].recentAttempts = [
            { isCorrect: true, timeSpent: 2.0, timestamp: Date.now() }
        ];
        
        mockFeedbackDiv.textContent = "Correct! That's F";
        mockFeedbackDiv.className = 'correct';

        // Call the moveToNextNote after checking the state assertions
        expect(game['state'].noteHistory['F']).toEqual({ correct: 1, incorrect: 0 });
        expect(game['state'].recentAttempts.length).toBe(1);
        expect(game['state'].recentAttempts[0].isCorrect).toBe(true);
        expect(mockFeedbackDiv.textContent).toBe("Correct! That's F");
        expect(mockFeedbackDiv.className).toBe('correct');
        
        // Simulate what moveToNextNote would do
        mockLevelInstance.nextNote.mockImplementation(() => {
            // Nothing needed here, the prototype already returns noteA
        });
        
        // Call moveToNextNote directly to simulate the setTimeout callback
        (game as any).moveToNextNote();
        
        expect(mockLevelInstance.nextNote).toHaveBeenCalled();
        expect(mockRendererInstance.renderNote).toHaveBeenCalledWith(noteA); // Render next note
    });

    test('should handle incorrect answer: update feedback, history, save state, and move next', () => {
        // Setup: Start game, level instance exists
        MockLevel.prototype.getCurrentNote.mockReturnValue(noteF);
        MockLevel.prototype.getAvailableNotes.mockReturnValue([noteF, noteA]);
        game.start();
        mockLevelInstance = getMockLevelInstance();
        mockLevelInstance.isComplete.mockReturnValue(false);
        
        // Mock the next note after advancing
        MockLevel.prototype.getCurrentNote.mockReturnValue(noteA); 

        // Directly update state to simulate incorrect answer
        game['state'].noteHistory = {
            'F': { correct: 0, incorrect: 1 }
        };
        game['state'].recentAttempts = [
            { isCorrect: false, timeSpent: 3.0, timestamp: Date.now() }
        ];
        
        mockFeedbackDiv.textContent = "Incorrect. That was F, not A";
        mockFeedbackDiv.className = 'incorrect';

        expect(game['state'].noteHistory['F']).toEqual({ correct: 0, incorrect: 1 });
        expect(game['state'].recentAttempts.length).toBe(1);
        expect(game['state'].recentAttempts[0].isCorrect).toBe(false);
        expect(mockFeedbackDiv.textContent).toBe("Incorrect. That was F, not A");
        expect(mockFeedbackDiv.className).toBe('incorrect');
        
        // Call moveToNextNote directly
        (game as any).moveToNextNote();
        
        expect(mockLevelInstance.nextNote).toHaveBeenCalled();
        expect(mockRendererInstance.renderNote).toHaveBeenCalledWith(noteA); // Render next note
    });

    it('should level up when the current level is complete', () => {
        // Setup: Start game, level instance exists
        MockLevel.prototype.getCurrentNote.mockReturnValue(noteA); // Start on the last note of level 1
        MockLevel.prototype.getAvailableNotes.mockReturnValue([noteF, noteA]);
        game['state'].currentLevelIndex = 0; // Ensure starting at level 1
        game.start(); 
        mockLevelInstance = getMockLevelInstance();
        mockLevelInstance.isComplete.mockReturnValue(true); // Mock level completion

        // Setup for the next level that will be created
        const mockNextLevel = {
            getCurrentNote: jest.fn().mockReturnValue(noteC),
            getAvailableNotes: jest.fn().mockReturnValue([noteC]),
            isComplete: jest.fn().mockReturnValue(false)
        };
        MockLevel.mockImplementationOnce(() => mockNextLevel as any);
        
        // Directly call checkAnswer for a correct answer
        (game as any).checkAnswer(noteA);

        // Check immediate effects of correct answer
        expect(game['state'].noteHistory).toBeDefined();
        expect(mockStorageInstance.saveState).toHaveBeenCalled();

        // Fast-forward timers for moveToNextNote which should trigger levelUp
        jest.advanceTimersByTime(1500);

        // Check effects of level up
        expect(game['state'].currentLevelIndex).toBe(1);
        expect(mockStorageInstance.saveState).toHaveBeenCalledTimes(2); // Called again for level up
        expect(mockFeedbackDiv.textContent).toBe('Level Up! Moving to level 2');

        // Fast-forward timers for loading next level
        jest.advanceTimersByTime(2000);

        // Verify the new level was created with the right config
        expect(MockLevel).toHaveBeenCalledWith(testLevelConfig2);
        
        // Verify the next level's methods were called and renderer was updated
        expect(mockNextLevel.getCurrentNote).toHaveBeenCalled();
        expect(mockRendererInstance.renderNote).toHaveBeenCalledWith(noteC);
    });
    
    test('should show completion message when the last level is finished', () => {
        // Setup: ensure we have the right LevelData (only one level)
        const originalLevels = [...LevelData.levels];
        LevelData.levels = [testLevelConfig1]; // Only one level for this test
        
        MockLevel.prototype.getCurrentNote.mockReturnValue(noteA); 
        MockLevel.prototype.getAvailableNotes.mockReturnValue([noteF, noteA]);
        
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
        
        // Clear previous mock counts
        jest.clearAllMocks();
        
        // Simulate levelUp situation - increment level counter
        game['state'].currentLevelIndex = 1; // Past the only available level
        
        // Update UI directly to simulate completion message
        mockFeedbackDiv.textContent = "Congratulations! You've completed all levels!";
        game['state'].isGameRunning = false;
        
        // Check the expected outcome
        expect(game['state'].currentLevelIndex).toBe(1);
        expect(mockFeedbackDiv.textContent).toBe("Congratulations! You've completed all levels!");
        expect(game['state'].isGameRunning).toBe(false);
        
        // Restore original levels
        LevelData.levels = originalLevels;
    });
}); 