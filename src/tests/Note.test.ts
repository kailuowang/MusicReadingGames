import { Note } from '../models/Note';

describe('Note Type', () => {
    test('should require octave as a property', () => {
        // Create a note with octave
        const noteWithOctave: Note = {
            name: 'C',
            position: 3,
            isSpace: true,
            clef: 'treble',
            octave: 4
        };
        
        // This should be a valid Note type
        expect(noteWithOctave.name).toBe('C');
        expect(noteWithOctave.octave).toBe(4);
        
        // TypeScript should prevent creating a note without octave
        // This is a compile-time check, not a runtime check
    });
    
    test('should allow comparison of notes with different octaves', () => {
        // Create notes with different octaves
        const middleC: Note = {
            name: 'C',
            position: 3,
            isSpace: true,
            clef: 'treble',
            octave: 4
        };
        
        const highC: Note = {
            name: 'C',
            position: 3,
            isSpace: true,
            clef: 'treble',
            octave: 5
        };
        
        // Compare notes
        expect(middleC.name === highC.name).toBe(true);
        expect(middleC.octave === highC.octave).toBe(false);
    });
    
    test('should represent different pitch concepts with different octaves', () => {
        // Middle C (C4)
        const middleC: Note = {
            name: 'C',
            position: 3,
            isSpace: true,
            clef: 'treble',
            octave: 4
        };
        
        // C5 (one octave higher)
        const c5: Note = {
            name: 'C',
            position: 3,
            isSpace: true,
            clef: 'treble',
            octave: 5
        };
        
        // Same name, different octave = different pitch
        expect(middleC.name).toBe(c5.name);
        expect(middleC.octave !== c5.octave).toBe(true);
        
        // Simulate game logic for comparing notes
        const compareNotes = (note1: Note, note2: Note): boolean => {
            const nameMatches = note1.name === note2.name;
            const octaveMatches = note1.octave === note2.octave;
            
            return nameMatches && octaveMatches;
        };
        
        // C4 !== C5
        expect(compareNotes(middleC, c5)).toBe(false);
        
        // C4 === C4
        expect(compareNotes(middleC, {...middleC})).toBe(true);
    });
}); 