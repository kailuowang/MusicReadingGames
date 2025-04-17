import { Level } from './Level';
import { Note } from '../models/Note';
import { LevelConfig } from '../models/LevelConfig';
import { LevelData } from '../data/LevelData';

// Mock LevelData
jest.mock('../data/LevelData', () => ({
    LevelData: {
        NEW_NOTE_FREQUENCY: 0.2,
        LEVEL_CRITERIA: {
            requiredSuccessCount: 10,
            maxTimePerProblem: 5
        }
    }
}));

// Sample notes for testing
const noteF: Note = { name: 'F', position: 1, isSpace: true, clef: 'treble' };
const noteA: Note = { name: 'A', position: 2, isSpace: true, clef: 'treble' };
const noteC: Note = { name: 'C', position: 3, isSpace: true, clef: 'treble' };
const noteE: Note = { name: 'E', position: 4, isSpace: true, clef: 'treble' };

// Sample level configurations
const firstLevelConfig: LevelConfig = {
    id: 1,
    name: 'First Note',
    description: 'A test level with just the first note',
    clef: 'treble',
    notes: [noteF],
    requiredSuccessCount: 10,
    maxTimePerProblem: 5
};

const progressiveLevelConfig: LevelConfig = {
    id: 2,
    name: 'Learning A',
    description: 'A test level introducing note A',
    clef: 'treble',
    notes: [noteF, noteA],
    newNote: noteA,
    learnedNotes: [noteF],
    requiredSuccessCount: 10,
    maxTimePerProblem: 5
};

const advancedLevelConfig: LevelConfig = {
    id: 3,
    name: 'Learning C',
    description: 'A test level introducing note C',
    clef: 'treble',
    notes: [noteF, noteA, noteC],
    newNote: noteC,
    learnedNotes: [noteF, noteA],
    requiredSuccessCount: 10,
    maxTimePerProblem: 5
};

describe('Level', () => {
    describe('Basic functionality', () => {
        let level: Level;

        beforeEach(() => {
            // Create a new level instance before each test
            level = new Level(firstLevelConfig);
        });

        test('should initialize with the correct configuration', () => {
            expect(level.getAvailableNotes()).toEqual([noteF]);
        });

        test('should return the current note', () => {
            const currentNote = level.getCurrentNote();
            expect(currentNote.name).toBe('F');
        });

        test('should advance to the next note correctly', () => {
            const initialNote = level.getCurrentNote();
            level.nextNote();
            const nextNote = level.getCurrentNote();
            
            // Since there's only one note, it should cycle back to the same note
            expect(nextNote.name).toBe(initialNote.name);
        });

        test('should correctly report when the level is complete', () => {
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
            
            // All correct but too slow
            const tooSlowAttempts = Array(10).fill({
                isCorrect: true,
                timeSpent: 6.0 // Over the 5s limit
            });
            expect(level.isComplete(tooSlowAttempts)).toBe(false);
            
            // All correct and fast enough
            const perfectAttempts = Array(10).fill({
                isCorrect: true,
                timeSpent: 2.0
            });
            expect(level.isComplete(perfectAttempts)).toBe(true);
        });
    });

    describe('Progressive Learning', () => {
        let level: Level;

        test('should correctly setup a note pool with the new note frequency at approximately 20%', () => {
            level = new Level(progressiveLevelConfig);
            const pool = (level as any).notePool; // Access private property for testing
            
            // Count the occurrences of each note
            const fCount = pool.filter((note: Note) => note.name === 'F').length;
            const aCount = pool.filter((note: Note) => note.name === 'A').length;
            
            // Verify that A (the new note) appears about 20% of the time
            expect(aCount).toBeGreaterThan(0);
            const aPercentage = aCount / pool.length;
            expect(aPercentage).toBeCloseTo(0.2, 1); // Within 10% tolerance
            
            // Verify that F (the learned note) appears about 80% of the time
            expect(fCount).toBeGreaterThan(0);
            const fPercentage = fCount / pool.length;
            expect(fPercentage).toBeCloseTo(0.8, 1); // Within 10% tolerance
        });

        test('should correctly distribute multiple learned notes when introducing a new note', () => {
            level = new Level(advancedLevelConfig);
            const pool = (level as any).notePool; // Access private property for testing
            
            // Count the occurrences of each note
            const fCount = pool.filter((note: Note) => note.name === 'F').length;
            const aCount = pool.filter((note: Note) => note.name === 'A').length;
            const cCount = pool.filter((note: Note) => note.name === 'C').length;
            
            // Verify that C (the new note) appears about 20% of the time
            expect(cCount).toBeGreaterThan(0);
            const cPercentage = cCount / pool.length;
            expect(cPercentage).toBeCloseTo(0.2, 1); // Within 10% tolerance
            
            // Verify that F and A (the learned notes) each appear about 40% of the time (80% / 2)
            expect(fCount).toBeGreaterThan(0);
            expect(aCount).toBeGreaterThan(0);
            
            // Check total learned notes percentage
            const learnedNotesPercentage = (fCount + aCount) / pool.length;
            expect(learnedNotesPercentage).toBeCloseTo(0.8, 1); // Within 10% tolerance
            
            // Check that learned notes are distributed roughly evenly
            const fToACountRatio = fCount / aCount;
            expect(fToACountRatio).toBeCloseTo(1, 1); // Within 10% tolerance of 1:1 ratio
        });

        test('should update note pool based on note history and maintain the new note frequency', () => {
            level = new Level(progressiveLevelConfig);
            
            // Create a note history where F has more mistakes
            const noteHistory = {
                'F': { correct: 2, incorrect: 4 }, // High error rate
                'A': { correct: 5, incorrect: 1 }  // Low error rate
            };
            
            // Update the note pool
            level.updateNotePool(noteHistory);
            const updatedPool = (level as any).notePool;
            
            // Count occurrences after update
            const fCount = updatedPool.filter((note: Note) => note.name === 'F').length;
            const aCount = updatedPool.filter((note: Note) => note.name === 'A').length;
            
            // Verify that note A (the new note) still appears, but F has more repetitions due to errors
            expect(aCount).toBeGreaterThan(0);
            expect(fCount).toBeGreaterThan(0);
            
            // F should have more occurrences than normal due to mistakes
            // Calculate error rate for F: 4/(2+4) = 0.67, repetition factor = ceil(0.67*10) = 7
            // This is added to the base distribution
            expect(fCount).toBeGreaterThan(aCount);
        });
        
        test('should handle a level with no new note (first level or master level)', () => {
            const masterLevelConfig: LevelConfig = {
                id: 10,
                name: 'Master Level',
                description: 'All notes test',
                clef: 'treble',
                notes: [noteF, noteA, noteC, noteE],
                requiredSuccessCount: 15,
                maxTimePerProblem: 4
            };
            
            level = new Level(masterLevelConfig);
            const pool = (level as any).notePool;
            
            // All notes should be represented without special frequency
            const uniqueNotes = new Set(pool.map((note: Note) => note.name));
            expect(uniqueNotes.size).toBe(4);
            
            // Count occurrences
            const fCount = pool.filter((note: Note) => note.name === 'F').length;
            const aCount = pool.filter((note: Note) => note.name === 'A').length;
            const cCount = pool.filter((note: Note) => note.name === 'C').length;
            const eCount = pool.filter((note: Note) => note.name === 'E').length;
            
            // All notes should have roughly the same occurrence
            expect(fCount).toBeCloseTo(aCount, -1); // Within an order of magnitude
            expect(aCount).toBeCloseTo(cCount, -1);
            expect(cCount).toBeCloseTo(eCount, -1);
        });
    });
}); 