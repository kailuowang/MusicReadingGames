import { PianoKeyboardRenderer } from '../renderers/PianoKeyboardRenderer';
import { Note } from '../models/Note';
import { NoteRepository } from '../models/NoteRepository';

// Mock NoteRepository
jest.mock('../models/NoteRepository', () => {
    return {
        NoteRepository: {
            getInstance: jest.fn(() => ({
                getNote: jest.fn((name, accidental, octave) => {
                    return {
                        name,
                        position: 1, // Mock position
                        isSpace: true, // Mock isSpace
                        clef: 'treble', // Default clef
                        octave,
                        accidental
                    };
                })
            }))
        }
    };
});

describe('PianoKeyboardRenderer', () => {
    let renderer: PianoKeyboardRenderer;
    let container: HTMLElement;
    
    // Sample notes for testing
    const noteC4: Note = { name: 'C', position: 1, isSpace: true, clef: 'treble', octave: 4 };
    const noteD4: Note = { name: 'D', position: 2, isSpace: false, clef: 'treble', octave: 4 };
    const noteF4: Note = { name: 'F', position: 3, isSpace: true, clef: 'treble', octave: 4 };
    const noteC5: Note = { name: 'C', position: 1, isSpace: true, clef: 'treble', octave: 5 };
    
    const trebleNotes = [noteC4, noteD4, noteF4, noteC5];
    const bassNote: Note = { name: 'F', position: 2, isSpace: false, clef: 'bass', octave: 3 };
    
    beforeEach(() => {
        // Set up DOM container
        container = document.createElement('div');
        container.id = 'test-container';
        document.body.appendChild(container);
        
        // Mock getElementById
        document.getElementById = jest.fn().mockImplementation((id) => {
            if (id === 'test-container') return container;
            return null;
        });
        
        // Initialize renderer
        renderer = new PianoKeyboardRenderer('test-container');
    });
    
    afterEach(() => {
        // Clean up
        document.body.removeChild(container);
        jest.clearAllMocks();
    });
    
    describe('Constructor', () => {
        test('should initialize correctly with a valid container ID', () => {
            expect(renderer).toBeDefined();
        });
        
        test('should throw an error if container is not found', () => {
            document.getElementById = jest.fn().mockReturnValue(null);
            expect(() => new PianoKeyboardRenderer('non-existent')).toThrow();
        });
    });
    
    describe('renderKeyboard', () => {
        test('should render an empty keyboard if no notes are provided', () => {
            renderer.renderKeyboard([], jest.fn());
            expect(container.innerHTML).not.toBe('');
            expect(container.querySelector('.piano-keyboard')).toBeTruthy();
        });
        
        test('should render a treble clef keyboard by default', () => {
            renderer.renderKeyboard(trebleNotes, jest.fn());
            const keyboard = container.querySelector('.piano-keyboard');
            expect(keyboard?.getAttribute('data-clef')).toBe('treble');
        });
        
        test('should render a bass clef keyboard when bass notes are provided', () => {
            renderer.renderKeyboard([bassNote], jest.fn());
            const keyboard = container.querySelector('.piano-keyboard');
            expect(keyboard?.getAttribute('data-clef')).toBe('bass');
        });
        
        test('should create white and black keys', () => {
            renderer.renderKeyboard(trebleNotes, jest.fn());
            const whiteKeys = container.querySelectorAll('.white-key');
            const blackKeys = container.querySelectorAll('.black-key');
            expect(whiteKeys.length).toBeGreaterThan(0);
            expect(blackKeys.length).toBeGreaterThan(0);
        });
        
        test('should mark middle C with special class', () => {
            renderer.renderKeyboard(trebleNotes, jest.fn());
            const middleC = container.querySelector('.middle-c');
            expect(middleC).toBeTruthy();
        });
        
        test('should render multiple octaves', () => {
            renderer.renderKeyboard(trebleNotes, jest.fn());
            const octaves = container.querySelectorAll('.octave');
            expect(octaves.length).toBeGreaterThan(1);
        });
    });
    
    describe('Note display and interaction', () => {
        let callbackSpy: jest.Mock;
        
        beforeEach(() => {
            callbackSpy = jest.fn();
        });
        
        test('should display note names when showNoteNames is true', () => {
            // Make sure showNoteNames is true initially
            (renderer as any).showNoteNames = true;
            renderer.renderKeyboard(trebleNotes, callbackSpy);
            const noteLabels = container.querySelectorAll('.note-name');
            expect(noteLabels.length).toBeGreaterThan(0);
        });
        
        test('should hide note names when showNoteNames is false', () => {
            // Set showNoteNames to false
            (renderer as any).showNoteNames = false;
            renderer.renderKeyboard(trebleNotes, callbackSpy);
            const noteLabels = container.querySelectorAll('.note-name');
            // White keys should have no note labels
            const whiteKeys = container.querySelectorAll('.white-key');
            expect(noteLabels.length).toBe(0);
            expect(whiteKeys.length).toBeGreaterThan(0);
        });
        
        test('should mark selectable notes', () => {
            renderer.renderKeyboard([noteC4], callbackSpy);
            // Should find at least one selectable key (the C4 note)
            const selectableKeys = container.querySelectorAll('.selectable');
            expect(selectableKeys.length).toBeGreaterThan(0);
        });
        
        test('should call the callback when a selectable key is clicked', () => {
            renderer.renderKeyboard([noteC4], callbackSpy);
            const selectableKey = container.querySelector('.selectable');
            selectableKey?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            expect(callbackSpy).toHaveBeenCalled();
        });
    });
    
    describe('Toggle methods', () => {
        test('toggleNoteNames should toggle the showNoteNames property', () => {
            const initialValue = (renderer as any).showNoteNames;
            renderer.toggleNoteNames();
            expect((renderer as any).showNoteNames).toBe(!initialValue);
        });
        
        test('toggleShowAllKeys should toggle the showAllKeys property', () => {
            const initialValue = (renderer as any).showAllKeys;
            renderer.toggleShowAllKeys();
            expect((renderer as any).showAllKeys).toBe(!initialValue);
        });
        
        test('showAllKeys=true should show all keys as selectable', () => {
            // First render with only a specific note
            renderer.renderKeyboard([noteC4], jest.fn());
            const initialSelectableCount = container.querySelectorAll('.selectable').length;
            
            // Now set showAllKeys to true and re-render
            (renderer as any).showAllKeys = true;
            renderer.renderKeyboard([noteC4], jest.fn());
            const newSelectableCount = container.querySelectorAll('.selectable').length;
            
            // Should have more selectable keys when showing all
            expect(newSelectableCount).toBeGreaterThan(initialSelectableCount);
        });
    });
    
    describe('Note matching', () => {
        test('findMatchingNote should match notes by name, octave, and accidental', () => {
            const testNote: Note = { 
                name: 'C', 
                position: 1, 
                isSpace: true, 
                clef: 'treble', 
                octave: 4, 
                accidental: 'sharp' 
            };
            
            // Case 1: Exact match
            const matchingNote: Note = { 
                name: 'C', 
                position: 2, // Different position shouldn't matter
                isSpace: false, // Different isSpace shouldn't matter
                clef: 'treble', 
                octave: 4, 
                accidental: 'sharp' 
            };
            
            // Case 2: Different accidental
            const differentAccidentalNote: Note = { 
                name: 'C', 
                position: 1, 
                isSpace: true, 
                clef: 'treble', 
                octave: 4, 
                accidental: 'flat' 
            };
            
            // Case 3: Different octave
            const differentOctaveNote: Note = { 
                name: 'C', 
                position: 1, 
                isSpace: true, 
                clef: 'treble', 
                octave: 5, 
                accidental: 'sharp' 
            };
            
            // Call the private method
            const findMatchingNote = (renderer as any).findMatchingNote;
            
            // Test exact match
            expect(findMatchingNote(testNote, [matchingNote])).toBeTruthy();
            
            // Test no match with different accidental
            expect(findMatchingNote(testNote, [differentAccidentalNote])).toBeFalsy();
            
            // Test no match with different octave
            expect(findMatchingNote(testNote, [differentOctaveNote])).toBeFalsy();
        });
    });
}); 