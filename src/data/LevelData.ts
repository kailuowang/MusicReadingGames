import { LevelConfig } from '../models/LevelConfig';
import { Note } from '../models/Note';

// Define the notes for the treble clef
const trebleClefNotes: Note[] = [
    // F, A, C, E (the spaces in treble clef, "FACE")
    { name: 'F', position: 1, isSpace: true, clef: 'treble', octave: 4 },
    { name: 'A', position: 2, isSpace: true, clef: 'treble', octave: 4 },
    { name: 'C', position: 3, isSpace: true, clef: 'treble', octave: 5 },
    { name: 'E', position: 4, isSpace: true, clef: 'treble', octave: 5 },
    
    // E, G, B, D, F (the lines in treble clef, "Every Good Boy Does Fine")
    { name: 'E', position: 1, isSpace: false, clef: 'treble', octave: 4 },
    { name: 'G', position: 2, isSpace: false, clef: 'treble', octave: 4 },
    { name: 'B', position: 3, isSpace: false, clef: 'treble', octave: 4 },
    { name: 'D', position: 4, isSpace: false, clef: 'treble', octave: 5 },
    { name: 'F', position: 5, isSpace: false, clef: 'treble', octave: 5 },
    
    // Ledger line notes below the staff
    { name: 'D', position: 0, isSpace: true, clef: 'treble', octave: 4 },
    
    // Ledger line notes above the staff
    { name: 'G', position: 5, isSpace: true, clef: 'treble', octave: 5 },  // Space above top line F
    { name: 'A', position: 6, isSpace: false, clef: 'treble', octave: 5 }, // First ledger line above staff
    { name: 'B', position: 6, isSpace: true, clef: 'treble', octave: 5 },  // Space above first ledger line
    { name: 'C', position: 7, isSpace: false, clef: 'treble', octave: 6 }  // Second ledger line above staff
];

// Define the notes for the bass clef
const bassClefNotes: Note[] = [
    // A, C, E, G (the spaces in bass clef, "All Cows Eat Grass")
    { name: 'A', position: 1, isSpace: true, clef: 'bass', octave: 2 },
    { name: 'C', position: 2, isSpace: true, clef: 'bass', octave: 3 },
    { name: 'E', position: 3, isSpace: true, clef: 'bass', octave: 3 },
    { name: 'G', position: 4, isSpace: true, clef: 'bass', octave: 3 },
    
    // G, B, D, F, A (the lines in bass clef, "Good Boys Do Fine Always")
    { name: 'G', position: 1, isSpace: false, clef: 'bass', octave: 2 },
    { name: 'B', position: 2, isSpace: false, clef: 'bass', octave: 2 },
    { name: 'D', position: 3, isSpace: false, clef: 'bass', octave: 3 },
    { name: 'F', position: 4, isSpace: false, clef: 'bass', octave: 3 },
    { name: 'A', position: 5, isSpace: false, clef: 'bass', octave: 3 },
    
    // Space above the top line
    { name: 'B', position: 5, isSpace: true, clef: 'bass', octave: 3 },
    
    // Ledger line notes below the bass clef
    { name: 'F', position: 0, isSpace: true, clef: 'bass', octave: 2 },  // Space below lowest line
    { name: 'E', position: 0, isSpace: false, clef: 'bass', octave: 2 }, // First ledger line below staff
    { name: 'D', position: -1, isSpace: true, clef: 'bass', octave: 2 }, // Space below first ledger line
    { name: 'C', position: -1, isSpace: false, clef: 'bass', octave: 2 }  // Second ledger line below staff
];

// Get treble clef space notes (F, A, C, E)
const trebleClefSpaceNotes = trebleClefNotes.filter(note => note.isSpace && note.clef === 'treble');

// Define the learning order for subsequent levels after the first level
// Starting with Treble Clef lines (E, G, B, D, F), then bass clef notes
const noteProgressionOrder: Note[] = [
    // First the treble clef lines (EGBDF)
    ...trebleClefNotes.filter(note => !note.isSpace && note.position > 0 && note.position <= 5),
    
    // Then the ledger line note below treble clef
    ...trebleClefNotes.filter(note => note.position === 0),
    
    // Then bass clef spaces (ACEG)
    ...bassClefNotes.filter(note => note.isSpace && note.position > 0),
    
    // Then bass clef lines (GBDFA)
    ...bassClefNotes.filter(note => !note.isSpace && note.position > 0),
    
    // Then bass clef ledger notes below staff (F, E, D, C)
    ...bassClefNotes.filter(note => note.position <= 0),
    
    // Finally, ledger line notes above the treble clef
    ...trebleClefNotes.filter(note => note.position > 5)
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
            
            // Determine if we're switching clefs
            const prevClef = i > 0 ? noteProgressionOrder[i-1].clef : 'treble';
            const clefChange = prevClef !== newNote.clef;
            
            levels.push({
                id: i + 2, // +2 because we already have level 1
                name: clefChange 
                    ? `Introduction to ${newNote.clef.charAt(0).toUpperCase() + newNote.clef.slice(1)} Clef: ${newNote.name}`
                    : `Learning ${newNote.name}`,
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
        const ledgerLineTrebleNotes = trebleClefNotes.filter(note => 
            (note.position <= 0) || (note.position > 5));
        const bassClefBelowStaffNotes = bassClefNotes.filter(note => note.position <= 0);
        
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
            notes: [...trebleClefNotes, ...bassClefNotes],
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