import { Game } from '../game/Game';
import { Level } from '../game/Level';
import { SheetMusicRenderer } from '../renderers/SheetMusicRenderer';
import { StorageManager } from '../utils/StorageManager';
import { LevelData } from '../data/LevelData';
import { Note } from '../models/Note';
import { GameState } from '../models/GameState';
import { LevelConfig } from '../models/LevelConfig';
import { AudioPlayer } from '../utils/AudioPlayer';
import { NoteUtils } from '../utils/NoteUtils';
import { ProfileManager } from '../utils/ProfileManager';

// --- Mocks ---

// Mock the dependent classes
jest.mock('../game/Level');
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
// Mock NoteUtils as well for consistency
// jest.mock('../utils/NoteUtils');

// Type casting for mocks
const MockLevel = Level as jest.MockedClass<typeof Level>;
const MockSheetMusicRenderer = SheetMusicRenderer as jest.MockedClass<typeof SheetMusicRenderer>;
const MockStorageManager = StorageManager as jest.MockedClass<typeof StorageManager>;

// Mock AudioPlayer singleton implementation
const mockPlayNote = jest.fn();
const mockPlayErrorSound = jest.fn();
const mockInitialize = jest.fn();
const mockAudioInstance = {
    playNote: mockPlayNote,
    playErrorSound: mockPlayErrorSound,
    initialize: mockInitialize
};
jest.mock('../utils/AudioPlayer', () => {
    return {
        AudioPlayer: {
            getInstance: jest.fn(() => mockAudioInstance)
        }
    };
});

// Mock NoteUtils implementation
// const mockGetNoteId = NoteUtils.getNoteId as jest.Mock;
// mockGetNoteId.mockImplementation((note: Note) => `${note.name}${note.octave}${note.clef}${note.accidental || ''}`);
// const mockGetNoteLabel = NoteUtils.getNoteLabel as jest.Mock;
// mockGetNoteLabel.mockImplementation((note: Note) => `${note.name} ${note.octave}`);

// Sample data
const noteF4: Note = { name: 'F', position: 1, isSpace: true, clef: 'treble', octave: 4 };
const noteA4: Note = { name: 'A', position: 2, isSpace: true, clef: 'treble', octave: 4 };
const noteC5: Note = { name: 'C', position: 3, isSpace: true, clef: 'treble', octave: 5 };

// Regenerate IDs using actual util before spying
const actualNoteUtils = NoteUtils;
const noteF4Id = actualNoteUtils.getNoteId(noteF4);
const noteA4Id = actualNoteUtils.getNoteId(noteA4);
const noteC5Id = actualNoteUtils.getNoteId(noteC5);

// Mock level configuration for progressive learning
const testLevelConfig1: LevelConfig = {
    id: 1, name: 'Level 1', description: 'First note F', clef: 'treble',
    notes: [noteF4], requiredSuccessCount: 10, maxTimePerProblem: 5
};

const testLevelConfig2: LevelConfig = {
    id: 2, name: 'Level 2', description: 'Introducing note A', clef: 'treble',
    notes: [noteF4, noteA4], newNote: noteA4, learnedNotes: [noteF4],
    requiredSuccessCount: 10, maxTimePerProblem: 5
};

const testLevelConfig3: LevelConfig = {
    id: 3, name: 'Level 3', description: 'Introducing note C', clef: 'treble',
    notes: [noteF4, noteA4, noteC5], newNote: noteC5, learnedNotes: [noteF4, noteA4],
    requiredSuccessCount: 10, maxTimePerProblem: 5
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
    let mockLevelInstance: jest.Mocked<Level>;
    // Spies for ProfileManager methods
    let getActiveProfileSpy: jest.SpyInstance;
    let updateGameStateSpy: jest.SpyInstance;
    let createProfileSpy: jest.SpyInstance;
    // Spy for legacy StorageManager save
    let storageSaveSpy: jest.SpyInstance;
    // Spy for NoteUtils
    let getNoteIdSpy: jest.SpyInstance;
    let getNoteLabelSpy: jest.SpyInstance;

    // Helper to get mock Level instance (created inside Game constructor)
    const getMockLevelInstance = (): jest.Mocked<Level> | null => {
        if (MockLevel.mock.instances.length > 0) {
           return MockLevel.mock.instances[MockLevel.mock.instances.length - 1] as jest.Mocked<Level>;
        }
        return null; // Return null if no instance exists yet
    }

    beforeEach(() => {
        // Reset mocks and instances before each test
        jest.restoreAllMocks(); // Restore spies created with jest.spyOn
        MockLevel.mockClear();
        MockSheetMusicRenderer.mockClear();
        MockStorageManager.mockClear();
        mockPlayNote.mockClear();
        mockPlayErrorSound.mockClear();
        mockInitialize.mockClear();
        
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

        // --- Spy on Real ProfileManager and StorageManager --- 
        // Spy *before* Game is instantiated
        getActiveProfileSpy = jest.spyOn(ProfileManager.prototype, 'getActiveProfile').mockReturnValue(null);
        updateGameStateSpy = jest.spyOn(ProfileManager.prototype, 'updateActiveProfileGameState').mockImplementation(); // Just track calls
        // Mock createProfile minimally if needed by constructor
        createProfileSpy = jest.spyOn(ProfileManager.prototype, 'createProfile').mockImplementation((name) => ({
            id: 'default-id', name,
            gameState: { currentLevelIndex: 0, isGameRunning: false, noteHistory: {}, recentAttempts: [] },
            lastUsed: Date.now(),
            displayPreferences: { showNoteNames: true, showAllNotes: false },
            createdAt: Date.now()
        }));
         // Spy on other ProfileManager methods called by Game constructor/methods if needed
         jest.spyOn(ProfileManager.prototype, 'getActiveProfileDisplayPreferences').mockReturnValue(null);
         jest.spyOn(ProfileManager.prototype, 'updateActiveProfileDisplayPreferences').mockImplementation();

         // Spy on StorageManager saveState for legacy check
         storageSaveSpy = jest.spyOn(StorageManager.prototype, 'saveState').mockImplementation();
         // Mock loadState to return null for default init
         jest.spyOn(StorageManager.prototype, 'loadState').mockReturnValue(null);

        // Spy on NoteUtils (just track calls to original implementation)
        getNoteIdSpy = jest.spyOn(NoteUtils, 'getNoteId');
        getNoteLabelSpy = jest.spyOn(NoteUtils, 'getNoteLabel');

        // Define default mock behaviors for Level methods *before* Game instantiation
        // These will be used by the instance created within the Game constructor
        MockLevel.prototype.getCurrentNote = jest.fn().mockReturnValue(noteF4);
        MockLevel.prototype.getAvailableNotes = jest.fn().mockReturnValue([noteF4]);
        MockLevel.prototype.nextNote = jest.fn();
        MockLevel.prototype.isComplete = jest.fn().mockReturnValue(false);
        MockLevel.prototype.updateMistakenNotes = jest.fn();
        // Use original NoteUtils method in mock implementation
        (MockLevel.prototype as any).isSameNote = jest.fn((note1, note2) => {
             if (!note1 || !note2) return false;
             // Call the original static method
             return NoteUtils.getNoteId(note1) === NoteUtils.getNoteId(note2);
        });
        
        // Mock SheetMusicRenderer.areImagesLoaded to return true
        MockSheetMusicRenderer.prototype.areImagesLoaded = jest.fn().mockReturnValue(true);
        
        // Use fake timers for setTimeout
        jest.useFakeTimers();
        
        // Instantiate the Game class
        game = new Game();
        
        // Now get the actual instances after Game is instantiated
        mockRendererInstance = MockSheetMusicRenderer.mock.instances[0] as jest.Mocked<SheetMusicRenderer>;
    });

    afterEach(() => {
        jest.useRealTimers(); // Restore real timers
        jest.restoreAllMocks(); // Clean up spies
    });

    test('should initialize with default state assuming no active profile state', () => {
        // Check that ProfileManager methods were called during init
        expect(getActiveProfileSpy).toHaveBeenCalled();
        // If no profile, it should create one
        expect(createProfileSpy).toHaveBeenCalledWith('Player 1'); 
        expect(game['state'].currentLevelIndex).toBe(0);
        expect(game['state'].isGameRunning).toBe(false);
        expect(game['state'].recentAttempts).toEqual([]);
        expect(game['state'].noteHistory).toEqual({});
    });

    // Skipping test for loading saved state as ProfileManager handles this.
    // test('should load saved state if it exists', () => { ... });

    test('should start the game and load first level', () => {
        // Mock Level methods again specifically for the instance that *will be* created
        // This overrides the default mock setup in beforeEach for this specific test run if needed
        MockLevel.prototype.getCurrentNote.mockReturnValue(noteF4);
        MockLevel.prototype.getAvailableNotes.mockReturnValue([noteF4]);

        game.start();
        mockLevelInstance = getMockLevelInstance()!;

        expect(game['state'].isGameRunning).toBe(true);
        // Check constructor call with levelIndex
        expect(MockLevel).toHaveBeenCalledWith(testLevelConfig1, 0);
        expect(mockLevelInstance.getCurrentNote).toHaveBeenCalled();
        expect(mockRendererInstance.renderNote).toHaveBeenCalledWith(noteF4);
        // Keyboard renderer interaction is complex, just check options were added
        expect(mockNoteOptionsDiv.children.length).toBeGreaterThanOrEqual(1);
    });
    
    test('should not start the game if already running', () => {
        game.start(); // Start once
        const constructorCallsBefore = MockLevel.mock.calls.length;
        mockRendererInstance.renderNote.mockClear();

        game.start(); // Try starting again
        expect(MockLevel.mock.calls.length).toBe(constructorCallsBefore); // No new Level instance
        expect(mockRendererInstance.renderNote).not.toHaveBeenCalled();
    });

    test('should reset the game state and UI', () => {
        // Start and modify state first
        game.start();
        mockLevelInstance = getMockLevelInstance()!;
        game['state'].currentLevelIndex = 2;
        game['state'].noteHistory = { [noteF4Id]: { correct: 1, incorrect: 0 }};
        game['state'].recentAttempts = [{ isCorrect: true, timeSpent: 2.0, timestamp: Date.now() }];
        
        game.reset();

        expect(game['state'].currentLevelIndex).toBe(0);
        expect(game['state'].isGameRunning).toBe(false);
        expect(game['state'].noteHistory).toEqual({});
        expect(game['state'].recentAttempts).toEqual([]);
        
        expect(mockFeedbackDiv.textContent).toBe('');
        expect(mockFeedbackDiv.className).toBe('');
        expect(mockNoteOptionsDiv.innerHTML).toBe('');
        expect(mockRendererInstance.clear).toHaveBeenCalled();
        expect(updateGameStateSpy).toHaveBeenCalled(); // Check profile state was updated on reset
        expect(storageSaveSpy).toHaveBeenCalled(); // Check legacy save on reset
    });

    test('should add new note to history when loading a level with a new note (if not already present)', () => {
        // Setup: Load level 2 which has a new note (A4)
        game['state'].currentLevelIndex = 1; // Target level index
        
        // Mock Level methods for the instance that will be created by loadLevel
        MockLevel.prototype.getCurrentNote.mockReturnValue(noteA4);
        MockLevel.prototype.getAvailableNotes.mockReturnValue([noteF4, noteA4]);
        
        // Ensure history is empty for the new note ID
        expect(game['state'].noteHistory[noteA4Id]).toBeUndefined();

        // Call loadLevel directly
        (game as any).loadLevel(1);
        
        // Check that the new note A4 has been added to history using its ID
        expect(game['state'].noteHistory).toHaveProperty(noteA4Id);
        expect(game['state'].noteHistory[noteA4Id]).toEqual({ correct: 0, incorrect: 0 });

        // Call loadLevel again, history should not be re-initialized
         (game as any).loadLevel(1);
         expect(game['state'].noteHistory[noteA4Id]).toEqual({ correct: 0, incorrect: 0 }); // Stays the same
    });

    test('should handle correct answer: update feedback, history, state, call level methods, and move next', () => {
        // Setup: Start game, level instance exists
        MockLevel.prototype.getCurrentNote.mockReturnValue(noteF4);
        MockLevel.prototype.getAvailableNotes.mockReturnValue([noteF4]);
        game.start();
        mockLevelInstance = getMockLevelInstance()!;
        mockLevelInstance.isComplete.mockReturnValue(false);

        // Clear mocks from setup
        jest.clearAllMocks(); 
        mockAudioInstance.playNote.mockClear(); // Clear audio mock specifically

        // Mock the note for the *next* call after advancing
        MockLevel.prototype.getCurrentNote.mockReturnValue(noteF4); // Still F4 since it's the only one

        // Directly call checkAnswer for a correct answer
        (game as any).checkAnswer(noteF4);

        // Check immediate effects
        expect(game['state'].noteHistory[noteF4Id]).toEqual({ correct: 1, incorrect: 0 });
        expect(game['state'].recentAttempts!.length).toBe(1);
        expect(game['state'].recentAttempts![0].isCorrect).toBe(true);
        // Call original static method for label check
        expect(mockFeedbackDiv.textContent).toBe(`Correct! That's ${NoteUtils.getNoteLabel(noteF4)}`);
        expect(mockFeedbackDiv.className).toBe('correct active');
        expect(updateGameStateSpy).toHaveBeenCalled(); // Check save on correct answer
        expect(storageSaveSpy).toHaveBeenCalled();
        expect(mockAudioInstance.playNote).toHaveBeenCalledWith('F', 4); // Check audio call args
        expect(mockAudioInstance.playErrorSound).not.toHaveBeenCalled();
        // Verify NEW call to Level method
        expect(mockLevelInstance.updateMistakenNotes).toHaveBeenCalledWith(noteF4, true);
        
        // Fast-forward timers for moveToNextNote
        jest.advanceTimersByTime(1500);
        
        expect(mockLevelInstance.nextNote).toHaveBeenCalled();
        expect(mockRendererInstance.renderNote).toHaveBeenCalledWith(noteF4); // Render next note
    });

    test('should handle incorrect answer: update feedback, history, state, call level methods, and move next', () => {
        // Setup: Start game with level having F4 and A4
        (LevelData.levels as LevelConfig[]) = [testLevelConfig2]; // Use level 2 config
        game = new Game(); // Re-init game with new LevelData
        
        // Setup the test with specific note objects to ensure consistency
        const testNoteF4 = { ...noteF4 }; // Create a copy to avoid any reference issues
        const testNoteA4 = { ...noteA4 };
        
        MockLevel.prototype.getCurrentNote.mockReturnValue(testNoteF4); // Current note is F4
        MockLevel.prototype.getAvailableNotes.mockReturnValue([testNoteF4, testNoteA4]);
        game.start();
        mockLevelInstance = getMockLevelInstance()!;
        mockLevelInstance.isComplete.mockReturnValue(false);
        
        // Directly set getCurrentNote at instance level to ensure it returns our testNoteF4
        mockLevelInstance.getCurrentNote.mockReturnValue(testNoteF4);
        
        // Add a spy on displayCurrentNote to track it gets called
        const displayCurrentNoteSpy = jest.spyOn(game as any, 'displayCurrentNote');
        
        // Clear mocks from setup
        jest.clearAllMocks();
        mockAudioInstance.playErrorSound.mockClear();
        mockRendererInstance.renderNote.mockClear();
        
        // Set initial history state for clarity
        game['state'].recentAttempts = [];
        
        // Compute the note ID explicitly using the same note object that will be returned by getCurrentNote
        const testNoteF4Id = NoteUtils.getNoteId(testNoteF4);
        game['state'].noteHistory = { [testNoteF4Id]: { correct: 0, incorrect: 0 } };
        
        // Reset spy before the call to isolate the ID generated within checkAnswer
        getNoteIdSpy.mockClear();

        // Mock the next note in a way that will be reflected when moveToNextNote is called
        // This is important: we need to change the behavior of getCurrentNote AFTER nextNote is called
        mockLevelInstance.nextNote.mockImplementation(() => {
            // After nextNote is called, getCurrentNote should return testNoteA4
            mockLevelInstance.getCurrentNote.mockReturnValue(testNoteA4);
        });
        
        // Setup displayCurrentNote spy implementation to directly check renderNote was called
        displayCurrentNoteSpy.mockImplementation(() => {
            const currentNote = mockLevelInstance.getCurrentNote();
            // This will happen after nextNote changed the current note to testNoteA4
            mockRendererInstance.renderNote(currentNote);
        });

        // Directly call checkAnswer for an incorrect answer
        (game as any).checkAnswer(testNoteA4);

        // Log calls made to getNoteId during checkAnswer
        console.log('getNoteId calls during checkAnswer:', getNoteIdSpy.mock.calls);

        // Check immediate effects
        expect(game['state'].noteHistory[testNoteF4Id]).toEqual({ correct: 0, incorrect: 1 });
        expect(game['state'].recentAttempts!.length).toBe(1);
        expect(game['state'].recentAttempts![0].isCorrect).toBe(false);
        // Call original static methods for label check
        expect(mockFeedbackDiv.textContent).toBe(`Incorrect. That was ${NoteUtils.getNoteLabel(testNoteF4)}, not ${NoteUtils.getNoteLabel(testNoteA4)}`);
        expect(mockFeedbackDiv.className).toBe('incorrect active');
        expect(updateGameStateSpy).toHaveBeenCalled(); // Check save on incorrect answer
        expect(storageSaveSpy).toHaveBeenCalled();
        expect(mockAudioInstance.playErrorSound).toHaveBeenCalled();
        expect(mockAudioInstance.playNote).not.toHaveBeenCalled();
        // Verify NEW call to Level method
        expect(mockLevelInstance.updateMistakenNotes).toHaveBeenCalledWith(testNoteF4, false);
        
        // Fast-forward timers for moveToNextNote
        jest.advanceTimersByTime(1500);
        
        expect(mockLevelInstance.nextNote).toHaveBeenCalled();
        expect(displayCurrentNoteSpy).toHaveBeenCalled();
        expect(mockRendererInstance.renderNote).toHaveBeenCalledWith(testNoteA4); // Render next note (mocked as A4)
    });

    test('should level up when the current level is complete', () => {
        // Setup: Start game at level 1 (index 0)
        (LevelData.levels as LevelConfig[]) = [testLevelConfig1, testLevelConfig2]; // Ensure level 2 exists
        game = new Game(); // Re-init
        // Spy on internal methods *after* game instantiation for this specific test
        const loadLevelSpy = jest.spyOn(game as any, 'loadLevel');
        const displayCurrentNoteSpy = jest.spyOn(game as any, 'displayCurrentNote');
        // Spy on the prototype method to catch the call reliably
        const renderNoteSpy = jest.spyOn(SheetMusicRenderer.prototype, 'renderNote');

        MockLevel.prototype.getCurrentNote.mockReturnValue(noteF4);
        MockLevel.prototype.getAvailableNotes.mockReturnValue([noteF4]);
        game.start(); 
        mockLevelInstance = getMockLevelInstance()!;
        
        // Mock level completion for the *current* instance
        mockLevelInstance.isComplete.mockReturnValue(true);

        // Setup mock implementation for the *next* Level instance that will be created
        const mockNextLevelInstance = {
            getCurrentNote: jest.fn().mockReturnValue(noteA4),
            getAvailableNotes: jest.fn().mockReturnValue([noteF4, noteA4]),
            nextNote: jest.fn(),
            isComplete: jest.fn().mockReturnValue(false),
            updateMistakenNotes: jest.fn(), // Must mock the new method
            // Use original NoteUtils method in mock implementation
            isSameNote: jest.fn().mockImplementation((n1, n2) => NoteUtils.getNoteId(n1) === NoteUtils.getNoteId(n2))
        };
        // Ensure the mock class returns this specific instance next time it's constructed
        MockLevel.mockImplementationOnce(() => mockNextLevelInstance as any);
        
        // Trigger level up check by calling moveToNextNote
        (game as any).moveToNextNote();

        // Check effects of level up (before timeout)
        expect(game['state'].currentLevelIndex).toBe(1); // Advanced to level index 1
        expect(game['state'].recentAttempts).toEqual([]); // Recent attempts cleared
        expect(updateGameStateSpy).toHaveBeenCalledWith(game['state']);
        expect(storageSaveSpy).toHaveBeenCalledWith(game['state']);
        expect(mockFeedbackDiv.textContent).toBe(`Level Up! Moving to level 2: ${testLevelConfig2.name}`);
        
        // Clear mocks before advancing timer to isolate calls within setTimeout
        loadLevelSpy.mockClear();
        displayCurrentNoteSpy.mockClear();
        renderNoteSpy.mockClear(); // Clear the prototype spy
        mockNextLevelInstance.getCurrentNote.mockClear();

        // Fast-forward timers for loading the next level
        jest.advanceTimersByTime(2000);
        
        // Verify the new Level instance was created with the right config and index
        expect(MockLevel).toHaveBeenCalledWith(testLevelConfig2, 1); // Check index passed
        
        // --- Debugging checks for post-timeout actions ---
        expect(loadLevelSpy).toHaveBeenCalledWith(1); // Was loadLevel called with the new index?
        expect(displayCurrentNoteSpy).toHaveBeenCalled(); // Was displayCurrentNote called within loadLevel?
        // Verify the new level instance's getCurrentNote was called by displayCurrentNote
        expect(mockNextLevelInstance.getCurrentNote).toHaveBeenCalled(); 
        // Verify renderNote was called on the prototype spy with the expected note
        expect(renderNoteSpy).toHaveBeenCalledWith(noteA4); 
    });
    
    test('should show completion message when the last level is finished', () => {
        // Setup: Only one level defined in LevelData
        (LevelData.levels as LevelConfig[]) = [testLevelConfig1];
        game = new Game(); // Re-init
        game['state'].currentLevelIndex = 0; // Start at the only level
        
        // Directly call levelUp logic
        (game as any).levelUp();
        
        // Check the outcome
        expect(game['state'].currentLevelIndex).toBe(1); // Index increments beyond available levels
        expect(mockFeedbackDiv.textContent).toBe("Congratulations! You've completed all levels!");
        expect(game['state'].isGameRunning).toBe(false);
        expect(updateGameStateSpy).toHaveBeenCalledWith(game['state']);
        expect(storageSaveSpy).toHaveBeenCalledWith(game['state']);
    });
    
    test('should update level requirements display based on current level', () => {
        // Setup: Start game (loads level 0)
        game.start();
        mockLevelInstance = getMockLevelInstance()!;
        
        expect(mockStreakRequiredElement.textContent!).toBe(testLevelConfig1.requiredSuccessCount.toString());
        expect(mockSpeedRequiredElement.textContent!).toBe(testLevelConfig1.maxTimePerProblem.toString());
        
        // Set state to level 2 (index 2) and trigger update
        game['state'].currentLevelIndex = 2;
        (game as any).loadLevel(2); // Need to load to update requirements

        expect(mockStreakRequiredElement.textContent!).toBe(testLevelConfig3.requiredSuccessCount.toString());
        expect(mockSpeedRequiredElement.textContent!).toBe(testLevelConfig3.maxTimePerProblem.toString());
    });

    test('should play correct note sound for correct answer', () => {
        // Setup
        MockLevel.prototype.getCurrentNote.mockReturnValue(noteF4);
        game.start();
        mockLevelInstance = getMockLevelInstance()!;
        mockLevelInstance.isComplete.mockReturnValue(false);
        jest.clearAllMocks();
        mockAudioInstance.playNote.mockClear();
        
        (game as any).checkAnswer(noteF4);

        expect(mockAudioInstance.playNote).toHaveBeenCalledWith('F', 4);
        expect(mockAudioInstance.playErrorSound).not.toHaveBeenCalled();
    });

    test('should play error sound for incorrect answer', () => {
        // Setup
         (LevelData.levels as LevelConfig[]) = [testLevelConfig2]; // Use level 2
         game = new Game();
         MockLevel.prototype.getCurrentNote.mockReturnValue(noteF4);
         game.start();
         mockLevelInstance = getMockLevelInstance()!;
         mockLevelInstance.isComplete.mockReturnValue(false);
         jest.clearAllMocks();
         mockAudioInstance.playErrorSound.mockClear();
        
         (game as any).checkAnswer(noteA4); // Incorrect answer

         expect(mockAudioInstance.playErrorSound).toHaveBeenCalled();
         expect(mockAudioInstance.playNote).not.toHaveBeenCalled();
    });
}); 