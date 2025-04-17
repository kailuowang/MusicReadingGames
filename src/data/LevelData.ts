import { LevelConfig } from '../models/LevelConfig';
import { Note } from '../models/Note';

// Define the notes for the treble clef
const trebleClefNotes: Note[] = [
    // F, A, C, E (the spaces in treble clef, "FACE")
    { name: 'F', position: 1, isSpace: true, clef: 'treble' },
    { name: 'A', position: 2, isSpace: true, clef: 'treble' },
    { name: 'C', position: 3, isSpace: true, clef: 'treble' },
    { name: 'E', position: 4, isSpace: true, clef: 'treble' },
    
    // E, G, B, D, F (the lines in treble clef, "Every Good Boy Does Fine")
    { name: 'E', position: 1, isSpace: false, clef: 'treble' },
    { name: 'G', position: 2, isSpace: false, clef: 'treble' },
    { name: 'B', position: 3, isSpace: false, clef: 'treble' },
    { name: 'D', position: 4, isSpace: false, clef: 'treble' },
    { name: 'F', position: 5, isSpace: false, clef: 'treble' }
];

// Define the notes for the bass clef
const bassClefNotes: Note[] = [
    // A, C, E, G (the spaces in bass clef, "All Cows Eat Grass")
    { name: 'A', position: 1, isSpace: true, clef: 'bass' },
    { name: 'C', position: 2, isSpace: true, clef: 'bass' },
    { name: 'E', position: 3, isSpace: true, clef: 'bass' },
    { name: 'G', position: 4, isSpace: true, clef: 'bass' },
    
    // G, B, D, F, A (the lines in bass clef, "Good Boys Do Fine Always")
    { name: 'G', position: 1, isSpace: false, clef: 'bass' },
    { name: 'B', position: 2, isSpace: false, clef: 'bass' },
    { name: 'D', position: 3, isSpace: false, clef: 'bass' },
    { name: 'F', position: 4, isSpace: false, clef: 'bass' },
    { name: 'A', position: 5, isSpace: false, clef: 'bass' }
];

export class LevelData {
    // Define the levels
    public static levels: LevelConfig[] = [
        {
            id: 1,
            name: 'Treble Clef Spaces',
            description: 'Learn the notes in the spaces of the treble clef (F, A, C, E)',
            clef: 'treble',
            notes: trebleClefNotes.filter(note => note.isSpace && note.clef === 'treble'),
            requiredSuccessCount: 8,    // Start with 8 correct in a row
            maxTimePerProblem: 6        // Allow 6 seconds per problem initially
        },
        {
            id: 2,
            name: 'Treble Clef Lines',
            description: 'Learn the notes on the lines of the treble clef (E, G, B, D, F)',
            clef: 'treble',
            notes: trebleClefNotes.filter(note => !note.isSpace && note.clef === 'treble'),
            requiredSuccessCount: 10,   // Increase to 10 correct in a row
            maxTimePerProblem: 5        // Require faster responses
        },
        {
            id: 3,
            name: 'All Treble Clef Notes',
            description: 'Practice all notes on the treble clef',
            clef: 'treble',
            notes: trebleClefNotes.filter(note => note.clef === 'treble'),
            requiredSuccessCount: 12,   // Increase to 12 correct in a row
            maxTimePerProblem: 4        // Require even faster responses
        },
        {
            id: 4,
            name: 'Bass Clef Spaces',
            description: 'Learn the notes in the spaces of the bass clef (A, C, E, G)',
            clef: 'bass',
            notes: bassClefNotes.filter(note => note.isSpace && note.clef === 'bass'),
            requiredSuccessCount: 8,    // Back to 8 correct in a row for new clef
            maxTimePerProblem: 6        // Allow 6 seconds initially for new clef
        },
        {
            id: 5,
            name: 'Bass Clef Lines',
            description: 'Learn the notes on the lines of the bass clef (G, B, D, F, A)',
            clef: 'bass',
            notes: bassClefNotes.filter(note => !note.isSpace && note.clef === 'bass'),
            requiredSuccessCount: 10,   // Increase to 10 correct in a row
            maxTimePerProblem: 5        // Require faster responses
        },
        {
            id: 6,
            name: 'All Bass Clef Notes',
            description: 'Practice all notes on the bass clef',
            clef: 'bass',
            notes: bassClefNotes.filter(note => note.clef === 'bass'),
            requiredSuccessCount: 12,   // Increase to 12 correct in a row
            maxTimePerProblem: 4        // Require even faster responses
        },
        {
            id: 7,
            name: 'Master Level',
            description: 'Practice all notes on both the treble and bass clefs',
            clef: 'treble', // Default clef, but will show both
            notes: [...trebleClefNotes, ...bassClefNotes],
            requiredSuccessCount: 15,   // Require 15 correct in a row for master level
            maxTimePerProblem: 3        // Require very fast responses (3 seconds per problem)
        }
    ];
} 