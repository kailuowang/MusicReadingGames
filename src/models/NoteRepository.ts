import { Note } from './Note';

// Define a type for position info
interface PositionInfo {
    position: number;
    isSpace: boolean;
}

// Define type for the clef position maps
interface ClefPositionsMap {
    [key: string]: PositionInfo;
}

// Maps note names to staff positions (1-5 lines, 0-4 spaces) for both treble and bass clefs
const notePositionsMap: {
    treble: ClefPositionsMap;
    bass: ClefPositionsMap;
} = {
    treble: {
        'C6': { position: 8, isSpace: false },
        'B5': { position: 7, isSpace: true },
        'A5': { position: 7, isSpace: false },
        'G5': { position: 6, isSpace: true },
        'F5': { position: 5, isSpace: false },
        'E5': { position: 4, isSpace: true },
        'D5': { position: 4, isSpace: false },
        'C5': { position: 3, isSpace: true },
        'B4': { position: 3, isSpace: false },
        'A4': { position: 2, isSpace: true },
        'G4': { position: 2, isSpace: false },
        'F4': { position: 1, isSpace: true },
        'E4': { position: 1, isSpace: false },
        'D4': { position: 0, isSpace: true },
        'C4': { position: 0, isSpace: false },
    },
    bass: {
        'A3': { position: 5, isSpace: false },
        'G3': { position: 4, isSpace: true },
        'F3': { position: 4, isSpace: false },
        'E3': { position: 3, isSpace: true },
        'D3': { position: 3, isSpace: false },
        'C3': { position: 2, isSpace: true },
        'B2': { position: 2, isSpace: false },
        'A2': { position: 1, isSpace: true },
        'G2': { position: 1, isSpace: false },
        'F2': { position: 0, isSpace: true },
        'E2': { position: 0, isSpace: false },
        'D2': { position: -1, isSpace: true },
        'C2': { position: -1, isSpace: false },
    }
};

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
        // Create notes for C2 to C6 range
        const noteNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        
        for (let octave = 2; octave <= 6; octave++) {
            for (const name of noteNames) {
                // Skip notes above C6
                if (octave === 6 && name !== 'C') continue;
                
                const clef = octave < 4 ? 'bass' : 'treble';
                const noteKey = `${name}${octave}`;
                
                // Get staff position from the map
                const positionInfo = notePositionsMap[clef][noteKey];
                
                // Skip if the note isn't in our standard positions map
                if (!positionInfo) continue;
                
                // Create natural note
                const naturalNote: Note = {
                    name,
                    position: positionInfo.position,
                    isSpace: positionInfo.isSpace,
                    octave,
                    clef
                };
                this.notes.set(this.getNoteKey(name, undefined, octave), naturalNote);
                
                // Create sharp note (except E and B)
                if (name !== 'E' && name !== 'B') {
                    const sharpNote: Note = {
                        name,
                        position: positionInfo.position,
                        isSpace: positionInfo.isSpace,
                        octave,
                        clef,
                        accidental: 'sharp'
                    };
                    this.notes.set(this.getNoteKey(name, 'sharp', octave), sharpNote);
                }
            }
        }
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
    
    public getNotesInRange(startOctave: number, endOctave: number): Note[] {
        return Array.from(this.notes.values()).filter(note => 
            note.octave >= startOctave && note.octave <= endOctave
        );
    }
} 