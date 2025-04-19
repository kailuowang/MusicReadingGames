import { LevelData } from '../data/LevelData';
import { Note } from '../models/Note';

/**
 * Compares two notes for equality based on their name, accidental, octave, and clef
 */
function areNotesEqual(note1: Note, note2: Note): boolean {
  return (
    note1.name === note2.name &&
    note1.clef === note2.clef &&
    note1.octave === note2.octave &&
    note1.accidental === note2.accidental
  );
}

/**
 * Checks if a note is included in an array of notes
 */
function isNoteInArray(noteToFind: Note, noteArray: Note[]): boolean {
  return noteArray.some(note => areNotesEqual(noteToFind, note));
}

describe('LevelData Notes Coverage', () => {
  // Test that all notes are included in at least one level
  it('should include all defined notes in at least one level', () => {
    // Get all levels
    const levels = LevelData.levels;
    
    // Get all notes defined in LevelData
    const allDefinedNotes = LevelData.allNotes;
    
    // Create an array to track which notes aren't covered
    const missingNotes: Note[] = [];
    
    // For each defined note, check if it's included in at least one level
    allDefinedNotes.forEach(definedNote => {
      // Check if the note is in any level
      const isIncluded = levels.some(level => 
        level.notes.some(levelNote => areNotesEqual(definedNote, levelNote))
      );
      
      if (!isIncluded) {
        missingNotes.push(definedNote);
      }
    });
    
    // All notes should be covered
    expect(missingNotes.length).toBe(0);
  });
  
  it('should include all remaining notes in the progression levels', () => {
    // Get all levels
    const levels = LevelData.levels;
    
    // Get all notes from LevelData
    const allNotes = LevelData.allNotes;
    
    // Get first level notes (treble clef space notes)
    const firstLevelNotes = levels[0].notes;
    
    // Create a set of all notes that should be in the progression
    // (all notes EXCEPT those in the first level)
    const notesForProgression = allNotes.filter(note => 
      !firstLevelNotes.some(firstLevelNote => 
        areNotesEqual(note, firstLevelNote)
      )
    );
    
    // Get all notes from the progression levels (levels 2 to N-2)
    // We'll collect all notes added in each progression level by looking at the newNote property
    const progressionNotes: Note[] = [];
    
    // Get all newNotes from the progression levels (from level 2 to the level before the special test levels)
    for (let i = 1; i < levels.length - 2; i++) {
      const level = levels[i];
      if (level.newNote) {
        progressionNotes.push(level.newNote);
      }
    }
    
    // Check which notes from notesForProgression are not in progressionNotes
    const notCoveredNotes = notesForProgression.filter(note => 
      !progressionNotes.some(progNote => areNotesEqual(note, progNote))
    );
    
    // We should expect that all notes not in the first level are included in the progression
    // But we know there's one exception - G5 on treble clef - so we'll allow it
    expect(notCoveredNotes).toEqual([]);
  });
}); 