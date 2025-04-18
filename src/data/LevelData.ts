import { LevelConfig } from '../models/LevelConfig';
import { Note } from '../models/Note';
import { NoteUtils } from '../utils/NoteUtils';
import { NoteRepository } from '../models/NoteRepository';

// Get all notes from NoteRepository
const noteRepo = NoteRepository.getInstance();
const allNotes = noteRepo.getAllNotes();

// Extract treble and bass clef notes
const trebleClefNotes = noteRepo.getNotesByClef('treble');
const bassClefNotes = noteRepo.getNotesByClef('bass');

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

    
    // Finally, bass clef ledger notes
    ...bassClefNotes.filter(note => NoteUtils.isLedgerLineNote(note)),
];

// Standard level progression criteria for all levels
const standardLevelCriteria = {
    requiredSuccessCount: 12,    // 10 correct in a row to level up
    maxTimePerProblem: 3        // 5 seconds per problem maximum
};

export class LevelData {
    // Standard ratio for how often the new note should appear
    public static readonly NEW_NOTE_FREQUENCY = 0.2; // 20%
    
    // Standard level completion criteria
    public static readonly LEVEL_CRITERIA = standardLevelCriteria;
    
    // Expose all notes
    public static readonly allNotes: Note[] = allNotes;
    
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
            ...standardLevelCriteria
        });
        
        // Starting with the second level, begin introducing one new note at a time
        let learnedNotes = [...trebleClefSpaceNotes]; // Start with the space notes we've already learned
        
        // Generate subsequent levels, each adding one new note
        for (let i = 0; i < noteProgressionOrder.length; i++) {
            const newNote = noteProgressionOrder[i];
            
            
            levels.push({
                id: i + 2, // +2 because we already have level 1
                name: `Learning ${newNote.name}${newNote.octave}`,
                description: `Learn the note ${newNote.name} on the ${newNote.clef} clef`,
                clef: newNote.clef,
                notes: [...learnedNotes, newNote],
                newNote: newNote,  // Keep track of which note is new in this level
                learnedNotes: learnedNotes,  // Keep track of all previously learned notes
                ...standardLevelCriteria
            });
            
            // Add the new note to the learned notes for next level
            learnedNotes = [...learnedNotes, newNote];
        }
            // Add a special test level for ledger line notes
        const ledgerLineTrebleNotes = trebleClefNotes.filter(note => NoteUtils.isLedgerLineNote(note));
        const bassClefBelowStaffNotes = bassClefNotes.filter(note => NoteUtils.isBelowStaff(note));
        
        // Special level for testing ledger line rendering
        levels.push({
            id: noteProgressionOrder.length + 3,
            name: 'Ledger Line Test',
            description: 'Special level for testing ledger line notes rendering',
            clef: 'treble',
            notes: [...ledgerLineTrebleNotes, ...bassClefBelowStaffNotes],
            ...standardLevelCriteria,
            requiredSuccessCount: 5,  // Make it easier for testing
            maxTimePerProblem: 10     // More time to observe the rendering
        });

        // Add a master level with all notes
        levels.push({
            id: noteProgressionOrder.length + 2, // +2 because we already have level 1
            name: 'Master Level',
            description: 'Practice all notes on both the treble and bass clefs',
            clef: 'treble', // Default clef, but will show both
            notes: allNotes,
            ...standardLevelCriteria,
            requiredSuccessCount: 15,  // Make master level slightly more challenging
            maxTimePerProblem: 4
        });
         
             
        return levels;
    }
    
    // Get levels using the generator
    public static get levels(): LevelConfig[] {
        return this.generateLevels();
    }
} 