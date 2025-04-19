import { LevelConfig } from '../models/LevelConfig';
import { Note } from '../models/Note';
import { NoteUtils } from '../utils/NoteUtils';
import { NoteRepository } from '../models/NoteRepository';

// Get all notes from NoteRepository
const noteRepo = NoteRepository.getInstance();
const allNotes = noteRepo.getAllNotes();

// Extract treble and bass clef notes
const trebleClefNotes = noteRepo.getWhiteNotesByClef('treble');
const bassClefNotes = noteRepo.getWhiteNotesByClef('bass');

// Get treble clef space notes (F, A, C, E)
const trebleClefSpaceNotes = trebleClefNotes.filter(note => note.isSpace && note.position > 0 && note.position < 5);

// Define the learning order for subsequent levels after the first level
// Starting with Treble Clef lines (E, G, B, D, F), then bass clef notes
const noteProgressionOrder: Note[] = [
    // First the treble clef lines (EGBDF)
    ...trebleClefNotes.filter(note => !note.isSpace && !NoteUtils.isLedgerLineNote(note)),
        
    // add G5
    ...trebleClefNotes.filter(note => (note.name === 'G' && note.octave === 5)),
                                          
    // Then the ledger line notes below treble clef
    ...trebleClefNotes.filter(note => NoteUtils.isBelowStaff(note)),
    
    // Then regular bass clef notes
    ...bassClefNotes.filter(note => !NoteUtils.isLedgerLineNote(note)),
    
    // Then ledger line notes above the treble clef
    ...trebleClefNotes.filter(note => NoteUtils.isAboveStaff(note)),

    
    ...trebleClefNotes.filter(note => NoteUtils.isLedgerLineNote(note)),
    
    ...bassClefNotes.filter(note => NoteUtils.isLedgerLineNote(note)),
    
    ...noteRepo.getBlackNotesByClef('treble'),
    
    ...noteRepo.getBlackNotesByClef('bass')

    
];

// Function to calculate level criteria based on level number
const calculateLevelCriteria = (levelNumber: number) => {
    const MAX_LEVEL = 50;
    
    // Starting values
    const START_SUCCESS_COUNT = 15;
    const START_MAX_TIME = 6.0;
    
    // Ending values
    const END_SUCCESS_COUNT = 35;
    const END_MAX_TIME = 1.0;
    
    // Calculate progression rate
    const normalizedLevel = Math.min(levelNumber, MAX_LEVEL) / MAX_LEVEL;
    
    // Calculate current values with linear progression
    const requiredSuccessCount = Math.round(
        START_SUCCESS_COUNT + (END_SUCCESS_COUNT - START_SUCCESS_COUNT) * normalizedLevel
    );
    
    const maxTimePerProblem = 
        START_MAX_TIME - (START_MAX_TIME - END_MAX_TIME) * normalizedLevel;
    
    return {
        requiredSuccessCount,
        maxTimePerProblem: Number(maxTimePerProblem.toFixed(1)) // Round to 1 decimal place
    };
};

export class LevelData {
    // Standard ratio for how often the new note should appear
    public static readonly NEW_NOTE_FREQUENCY = 0.2; // 20%
    
    // Expose all notes
    public static readonly allNotes: Note[] = allNotes;
    
    // Add the standard level criteria for backward compatibility with tests
    public static readonly LEVEL_CRITERIA = {
        requiredSuccessCount: 15,
        maxTimePerProblem: 3.0
    };
    
    // Generate levels progressively
    public static generateLevels(): LevelConfig[] {
        const levels: LevelConfig[] = [];
        
        // First level starts with all four space notes in the treble clef (F, A, C, E)
        levels.push({
            id: 1,
            name: 'Treble Clef Spaces',
            description: 'Learn the notes in the spaces of the treble clef (F, A, C, E)',
            clef: 'treble',
            notes: trebleClefSpaceNotes,
            ...calculateLevelCriteria(1)
        });
        
        // Starting with the second level, begin introducing one new note at a time
        let learnedNotes = [...trebleClefSpaceNotes]; // Start with the space notes we've already learned
        
        // Generate subsequent levels, each adding one new note
        for (let i = 0; i < noteProgressionOrder.length; i++) {
            const newNote = noteProgressionOrder[i];
            const levelNumber = i + 2; // +2 because we already have level 1
            
            levels.push({
                id: levelNumber,
                name: `Learning ${NoteUtils.getNoteLabel(newNote)}`,
                description: `Learn the note ${newNote.name} on the ${newNote.clef} clef`,
                clef: newNote.clef,
                notes: [...learnedNotes, newNote],
                newNote: newNote,  // Keep track of which note is new in this level
                learnedNotes: learnedNotes,  // Keep track of all previously learned notes
                ...calculateLevelCriteria(levelNumber)
            });
            
            // Add the new note to the learned notes for next level
            learnedNotes = [...learnedNotes, newNote];
        }
    

        // Add a master level with all notes
        const masterLevelId = noteProgressionOrder.length + 2;
        levels.push({
            id: masterLevelId,
            name: 'Master Level',
            description: 'Practice all notes on both the treble and bass clefs',
            clef: 'treble', // Default clef, but will show both
            notes: allNotes,
            ...calculateLevelCriteria(masterLevelId),
            maxTimePerProblem: 1.0 // Override to ensure master level is challenging
        });
         
             
        return levels;
    }
    
    // Get levels using the generator
    public static get levels(): LevelConfig[] {
        return this.generateLevels();
    }
} 