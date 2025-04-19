import { Note } from './Note';

export class NoteRepository {
    private static instance: NoteRepository;
    private notes: Map<string, Note> = new Map();
    
    // Singleton pattern
    public static getInstance(): NoteRepository {
        if (!NoteRepository.instance) {
            NoteRepository.instance = new NoteRepository();
        }
        return NoteRepository.instance;
    }
    
    private constructor() {
        this.initializeNotes();
    }
    
    private initializeNotes(): void {
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
            { name: 'C', position: 0, isSpace: false, clef: 'treble', octave: 4 },
            
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
        
        // Add black keys (sharp notes) for treble clef
        const trebleClefSharps: Note[] = [
            // Add black keys for octave 4
            { name: 'C', position: 0, isSpace: false, clef: 'treble', octave: 4, accidental: 'sharp' },
            { name: 'D', position: 0, isSpace: true, clef: 'treble', octave: 4, accidental: 'sharp' },
            { name: 'F', position: 1, isSpace: true, clef: 'treble', octave: 4, accidental: 'sharp' },
            { name: 'G', position: 2, isSpace: false, clef: 'treble', octave: 4, accidental: 'sharp' },
            { name: 'A', position: 2, isSpace: true, clef: 'treble', octave: 4, accidental: 'sharp' },
            
            // Add black keys for octave 5
            { name: 'C', position: 3, isSpace: true, clef: 'treble', octave: 5, accidental: 'sharp' },
            { name: 'D', position: 4, isSpace: false, clef: 'treble', octave: 5, accidental: 'sharp' },
            { name: 'F', position: 5, isSpace: false, clef: 'treble', octave: 5, accidental: 'sharp' },
            { name: 'G', position: 5, isSpace: true, clef: 'treble', octave: 5, accidental: 'sharp' },
            { name: 'A', position: 6, isSpace: false, clef: 'treble', octave: 5, accidental: 'sharp' }
        ];
        
        // Add black keys (sharp notes) for bass clef
        const bassClefSharps: Note[] = [
            // Add black keys for octave 2
            { name: 'C', position: -1, isSpace: false, clef: 'bass', octave: 2, accidental: 'sharp' },
            { name: 'D', position: -1, isSpace: true, clef: 'bass', octave: 2, accidental: 'sharp' },
            { name: 'F', position: 0, isSpace: true, clef: 'bass', octave: 2, accidental: 'sharp' },
            { name: 'G', position: 1, isSpace: false, clef: 'bass', octave: 2, accidental: 'sharp' },
            { name: 'A', position: 1, isSpace: true, clef: 'bass', octave: 2, accidental: 'sharp' },
            
            // Add black keys for octave 3
            { name: 'C', position: 2, isSpace: true, clef: 'bass', octave: 3, accidental: 'sharp' },
            { name: 'D', position: 3, isSpace: false, clef: 'bass', octave: 3, accidental: 'sharp' },
            { name: 'F', position: 4, isSpace: false, clef: 'bass', octave: 3, accidental: 'sharp' },
            { name: 'G', position: 4, isSpace: true, clef: 'bass', octave: 3, accidental: 'sharp' },
            { name: 'A', position: 5, isSpace: false, clef: 'bass', octave: 3, accidental: 'sharp' }
        ];
        
        // Combine all notes
        const allNotes = [...trebleClefNotes, ...bassClefNotes, ...trebleClefSharps, ...bassClefSharps];
        
        // Add each note to the map for easy lookup
        allNotes.forEach(note => {
            this.notes.set(this.getNoteKey(note.name, note.accidental, note.octave), note);
        });
    }
    
    private getNoteKey(name: string, accidental: 'sharp' | 'flat' | 'natural' | undefined, octave: number): string {
        return `${name}${accidental ? accidental : ''}${octave}`;
    }
    
    public getNote(name: string, accidental: 'sharp' | 'flat' | 'natural' | undefined, octave: number): Note | undefined {
        return this.notes.get(this.getNoteKey(name, accidental, octave));
    }
    
    public getAllNotes(): Note[] {
        return Array.from(this.notes.values());
    }
    
    public getNotesByClef(clef: 'treble' | 'bass'): Note[] {
        return Array.from(this.notes.values()).filter(note => note.clef === clef);
    }
    

    public getWhiteNotesByClef(clef: 'treble' | 'bass'): Note[] {
        return Array.from(this.notes.values()).filter(note => note.clef === clef && !note.accidental);
    }

    public getBlackNotesByClef(clef: 'treble' | 'bass'): Note[] {
        return Array.from(this.notes.values()).filter(note => note.clef === clef && note.accidental);
    }  


    public getNotesInRange(startOctave: number, endOctave: number): Note[] {
        return Array.from(this.notes.values()).filter(note => 
            note.octave >= startOctave && note.octave <= endOctave
        );
    }
} 