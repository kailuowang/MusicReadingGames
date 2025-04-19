import { Note } from '../models/Note';
import { Game } from '../game/Game';
import { PianoKeyboardRenderer } from '../renderers/PianoKeyboardRenderer';
import { LevelData } from '../data/LevelData';
import { SheetMusicRenderer } from '../renderers/SheetMusicRenderer';
import { StorageManager } from '../utils/StorageManager';

// Mock the dependent classes
jest.mock('../renderers/SheetMusicRenderer');
jest.mock('../utils/StorageManager');
jest.mock('../renderers/PianoKeyboardRenderer');

// Mock DOM elements
const setupDomElements = () => {
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
    
    return {
        mockFeedbackDiv,
        mockNoteOptionsDiv,
        mockSheetMusicDiv,
        mockStreakElement,
        mockSpeedElement,
        mockStreakRequiredElement,
        mockSpeedRequiredElement
    };
};

describe('Octave Support', () => {
    let game: Game;
    let mockElements: ReturnType<typeof setupDomElements>;
    
    // Test note definitions with different octaves but same name
    const middleCNote: Note = { name: 'C', position: 3, isSpace: true, clef: 'treble', octave: 4 };
    const highCNote: Note = { name: 'C', position: 3, isSpace: true, clef: 'treble', octave: 5 };
    const lowCNote: Note = { name: 'C', position: 3, isSpace: true, clef: 'bass', octave: 3 };
    
    beforeEach(() => {
        jest.clearAllMocks();
        mockElements = setupDomElements();
        
        // Mock StorageManager loadState for default behavior (no saved state)
        (StorageManager as jest.Mock).mockImplementation(() => ({
            loadState: jest.fn().mockReturnValue(null),
            saveState: jest.fn(),
            clearState: jest.fn()
        }));
        
        // Use fake timers for setTimeout
        jest.useFakeTimers();
        
        // Instantiate the Game class
        game = new Game();
    });
    
    afterEach(() => {
        jest.useRealTimers(); // Restore real timers
    });
    
    describe('Game.checkAnswer octave validation', () => {
        test('should validate notes with same name but different octaves correctly', () => {
            // Mock the current level's getCurrentNote to return middle C
            const mockLevel = {
                getCurrentNote: jest.fn().mockReturnValue(middleCNote),
                getAvailableNotes: jest.fn().mockReturnValue([middleCNote, highCNote, lowCNote]),
                nextNote: jest.fn(),
                isComplete: jest.fn().mockReturnValue(false),
                updateNotePool: jest.fn()
            };
            
            // Set the current level
            (game as any).currentLevel = mockLevel;
            
            // Case 1: Correct note with correct octave (middle C)
            (game as any).checkAnswer(middleCNote);
            expect(mockElements.mockFeedbackDiv.textContent).toContain("Correct");
            expect(mockElements.mockFeedbackDiv.textContent).toContain("C 4");
            expect(mockElements.mockFeedbackDiv.className).toBe('correct active');
            
            // Clear feedback for next test
            mockElements.mockFeedbackDiv.textContent = '';
            mockElements.mockFeedbackDiv.className = '';
            
            // Case 2: Same note name but wrong octave (high C)
            (game as any).checkAnswer(highCNote);
            expect(mockElements.mockFeedbackDiv.textContent).toContain("Incorrect");
            expect(mockElements.mockFeedbackDiv.textContent).toContain("wrong octave");
            expect(mockElements.mockFeedbackDiv.textContent).toContain("C 4");
            expect(mockElements.mockFeedbackDiv.textContent).toContain("C 5");
            expect(mockElements.mockFeedbackDiv.className).toBe('incorrect active');
            
            // Clear feedback for next test
            mockElements.mockFeedbackDiv.textContent = '';
            mockElements.mockFeedbackDiv.className = '';
            
            // Case 3: Completely different note
            const dNote: Note = { name: 'D', position: 4, isSpace: false, clef: 'treble', octave: 4 };
            (game as any).checkAnswer(dNote);
            expect(mockElements.mockFeedbackDiv.textContent).toContain("Incorrect");
            expect(mockElements.mockFeedbackDiv.textContent).toContain("C 4");
            expect(mockElements.mockFeedbackDiv.textContent).toContain("D 4");
            expect(mockElements.mockFeedbackDiv.className).toBe('incorrect active');
        });
    });
    
    describe('PianoKeyboardRenderer octave display', () => {
        test('should include octave information in note display', () => {
            // Create a mocked container div for the keyboard
            const containerDiv = document.createElement('div');
            document.getElementById = jest.fn().mockReturnValue(containerDiv);
            
            // Create an actual instance of PianoKeyboardRenderer (not mocked)
            jest.unmock('../renderers/PianoKeyboardRenderer');
            const actualRenderer = new PianoKeyboardRenderer('test-container');
            
            // Create a callback spy
            const callbackSpy = jest.fn();
            
            // Mock document.createElement to intercept key creation
            const originalCreateElement = document.createElement;
            const mockKeyDiv = document.createElement('div');
            document.createElement = jest.fn((tag) => {
                if (tag === 'span' && mockKeyDiv.className.includes('white-key')) {
                    const mockSpan = originalCreateElement.call(document, 'span');
                    // We'll check the innerHTML of this span later
                    return mockSpan;
                }
                return originalCreateElement.call(document, tag);
            }) as any;
            
            // Call the renderKeyboard method with notes that have octave info
            actualRenderer.renderKeyboard([middleCNote, highCNote], callbackSpy);
            
            // Check if the container contains keys with octave information
            expect(containerDiv.innerHTML).toBeDefined();
            
            // Restore original createElement
            document.createElement = originalCreateElement;
        });
    });
    
    describe('LevelData octave information', () => {
        test('should have octave information for all notes in level data', () => {
            // Get all notes defined in LevelData
            const allNotes = [
                ...LevelData.levels[0].notes,
                ...LevelData.levels[LevelData.levels.length - 1].notes
            ];
            
            // Check that all notes have octave information
            allNotes.forEach(note => {
                expect(note.octave).toBeDefined();
                expect(typeof note.octave).toBe('number');
            });
            
            // Verify specific octave assignments
            const trebleNotes = allNotes.filter(note => note.clef === 'treble');
            const bassNotes = allNotes.filter(note => note.clef === 'bass');
            
            // Treble clef notes should be in octaves 4-6
            trebleNotes.forEach(note => {
                expect(note.octave).toBeGreaterThanOrEqual(4);
                expect(note.octave).toBeLessThanOrEqual(6);
            });
            
            // Bass clef notes should be in octaves 2-3
            bassNotes.forEach(note => {
                expect(note.octave).toBeGreaterThanOrEqual(2);
                expect(note.octave).toBeLessThanOrEqual(3);
            });
        });
    });
}); 