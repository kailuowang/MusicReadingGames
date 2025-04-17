import { Level } from './Level';
import { Note } from '../models/Note';
import { LevelConfig } from '../models/LevelConfig';

// Sample notes for testing
const noteF: Note = { name: 'F', position: 1, isSpace: true, clef: 'treble' };
const noteA: Note = { name: 'A', position: 2, isSpace: true, clef: 'treble' };
const noteC: Note = { name: 'C', position: 3, isSpace: true, clef: 'treble' };

// Sample level configuration
const testLevelConfig: LevelConfig = {
    id: 1,
    name: 'Test Level',
    description: 'A test level',
    clef: 'treble',
    notes: [noteF, noteA, noteC],
    requiredSuccessCount: 10,
    maxTimePerProblem: 5
};

describe('Level', () => {
    let level: Level;

    beforeEach(() => {
        // Create a new level instance before each test
        level = new Level(testLevelConfig);
    });

    test('should initialize with the correct configuration', () => {
        expect(level.getCurrentNote()).toBe(noteF); // First note in the initial pool
        expect(level.getAvailableNotes()).toEqual([noteF, noteA, noteC]);
    });

    test('should return the current note', () => {
        expect(level.getCurrentNote()).toBe(noteF);
    });

    test('should advance to the next note correctly', () => {
        level.nextNote();
        expect(level.getCurrentNote()).toBe(noteA);
        level.nextNote();
        expect(level.getCurrentNote()).toBe(noteC);
    });
    
    test('should cycle back to the first note after the last note', () => {
        level.nextNote(); // Move to A
        level.nextNote(); // Move to C
        level.nextNote(); // Cycle back to F
        expect(level.getCurrentNote()).toBe(noteF);
    });

    test('should correctly report when the level is complete (last note reached)', () => {
        // Creating mock data for the required recent attempts
        const notEnoughAttempts = Array(9).fill({
            isCorrect: true,
            timeSpent: 2.0
        });
        expect(level.isComplete(notEnoughAttempts)).toBe(false);
        
        // Enough attempts but not all correct
        const someIncorrectAttempts = Array(10).fill({
            isCorrect: true,
            timeSpent: 2.0
        });
        someIncorrectAttempts[5] = { isCorrect: false, timeSpent: 2.0 };
        expect(level.isComplete(someIncorrectAttempts)).toBe(false);
        
        // All correct and fast enough
        const perfectAttempts = Array(10).fill({
            isCorrect: true,
            timeSpent: 2.0
        });
        expect(level.isComplete(perfectAttempts)).toBe(true);
    });

    test('should update the note pool based on history and shuffle it', () => {
        const noteHistory = {
            'F': { correct: 1, incorrect: 3 }, // F is problematic
            'A': { correct: 5, incorrect: 1 },
            'C': { correct: 4, incorrect: 0 }
        };
        
        const initialPool = [noteF, noteA, noteC];
        
        // Run update multiple times to test shuffling randomness (somewhat)
        let differentOrderObserved = false;
        let previousPoolString = JSON.stringify(level['notePool']);

        for (let i = 0; i < 5; i++) {
            level.updateNotePool(noteHistory);
            const currentPool = level['notePool'];
            
            // Check if F has repetitions (should have 3 incorrect / 1 correct -> ceil(3) = 3 repetitions)
            const fCount = currentPool.filter(note => note.name === 'F').length;
            expect(fCount).toBeGreaterThanOrEqual(1 + 3); // Original + repetitions
            
            // Check if A has repetitions (1 incorrect / 5 correct -> ceil(0.2) = 1 repetition)
            const aCount = currentPool.filter(note => note.name === 'A').length;
            expect(aCount).toBeGreaterThanOrEqual(1 + 1); // Original + repetition
            
            // Check if C has repetitions (0 incorrect -> 0 repetitions)
            const cCount = currentPool.filter(note => note.name === 'C').length;
            expect(cCount).toBe(1); // Just the original

            // Check total size
            expect(currentPool.length).toBeGreaterThanOrEqual(initialPool.length + 3 + 1);
            
            // Check if order is different from previous (indicates shuffling)
            const currentPoolString = JSON.stringify(currentPool);
            if (i > 0 && currentPoolString !== previousPoolString) {
                differentOrderObserved = true;
            }
            previousPoolString = currentPoolString;
        }
        
        expect(differentOrderObserved).toBe(true); // It's highly likely the order changed at least once
    });
    
    test('should return the original available notes regardless of the current pool', () => {
         const noteHistory = { 'F': { correct: 1, incorrect: 3 } };
         level.updateNotePool(noteHistory);
         expect(level.getAvailableNotes()).toEqual([noteF, noteA, noteC]); // Should still be the original notes
    });
}); 