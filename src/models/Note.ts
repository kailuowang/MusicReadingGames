export interface Note {
    name: string;
    position: number; // Position on the staff (1-5 lines, 0-4 spaces)
    isSpace: boolean; // Whether the note is on a space or a line
    clef: 'treble' | 'bass';
    accidental?: 'sharp' | 'flat' | 'natural';
    octave: number; // Octave is now required
}