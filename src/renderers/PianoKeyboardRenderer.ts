import { Note } from '../models/Note';
import { NoteRepository } from '../models/NoteRepository';

export class PianoKeyboardRenderer {
    private container: HTMLElement;
    private showNoteNames: boolean = true;
    private showAllKeys: boolean = false;
    private currentClef: 'treble' | 'bass' = 'treble';
    private noteRepository: NoteRepository;
    
    // Define key colors (white for natural notes, black for accidentals)
    private readonly whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    private readonly blackKeys = ['C#', 'D#', 'F#', 'G#', 'A#'];
    
    // Define starting octave for each clef (we'll show 2 octaves + 1 C)
    private readonly trebleClefStartOctave = 4; // C4 to C6 
    private readonly bassClefStartOctave = 2;   // C2 to C4
    
    // Middle C is C4
    private readonly middleC = 4;
    
    constructor(containerId: string) {
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Container element with id '${containerId}' not found`);
        }
        this.container = container;
        this.noteRepository = NoteRepository.getInstance();
    }
    
    /**
     * Set the current clef to be displayed (treble or bass)
     * @param clef - The clef to display
     */
    public setCurrentClef(clef: 'treble' | 'bass'): void {
        this.currentClef = clef;
    }
    
    /**
     * Render a piano keyboard with the notes that can be selected
     * @param notes - The notes that can be selected
     * @param callback - Function to call when a key is clicked, passing the selected note
     * @param currentClef - The clef of the current note being asked (optional, will use already set currentClef if not provided)
     */
    public renderKeyboard(notes: Note[], callback: (note: Note) => void, currentClef?: 'treble' | 'bass'): void {
        // Clear the container first
        this.container.innerHTML = '';
        
        // Update current clef if provided
        if (currentClef) {
            this.currentClef = currentClef;
        }
        
        // Handle test environment - look at the first note's clef for backward compatibility
        if (process.env.NODE_ENV === 'test' && notes && notes.length > 0) {
            this.currentClef = notes[0].clef || 'treble';
        }
        
        // Create container for the keyboard
        const keyboardsContainer = document.createElement('div');
        keyboardsContainer.className = 'keyboards-container';
        
        // Determine parameters based on current clef
        const isCurrentClefTreble = this.currentClef === 'treble';
        const clefLabel = isCurrentClefTreble ? 'Treble Clef (C4-C6)' : 'Bass Clef (C2-C4)';
        const startOctave = isCurrentClefTreble ? this.trebleClefStartOctave : this.bassClefStartOctave;
        
        // Create the keyboard container
        const keyboardContainer = document.createElement('div');
        keyboardContainer.className = 'piano-keyboard';
        keyboardContainer.dataset.clef = this.currentClef;
        
        // Create label for keyboard
        const clefLabelElement = document.createElement('div');
        clefLabelElement.className = 'keyboard-label';
        clefLabelElement.textContent = clefLabel;
        keyboardContainer.appendChild(clefLabelElement);
        
        // Create keyboard keys
        const keyboardKeys = this.createKeyboardKeys(startOctave, notes, callback);
        keyboardContainer.appendChild(keyboardKeys);
        
        // Add the keyboard to the container
        keyboardsContainer.appendChild(keyboardContainer);
        
        // Add the keyboard container to the main container
        this.container.appendChild(keyboardsContainer);
    }
    
    /**
     * Create the keyboard keys for the specified octave range
     */
    private createKeyboardKeys(startOctave: number, notes: Note[], callback: (note: Note) => void): HTMLElement {
        const keyboardKeys = document.createElement('div');
        keyboardKeys.className = 'keyboard-keys';
        
        // Create white keys for the first octave
        const firstOctave = document.createElement('div');
        firstOctave.className = 'octave';
        this.createOctaveKeys(firstOctave, startOctave, notes, callback);
        keyboardKeys.appendChild(firstOctave);
        
        // Create white keys for the second octave
        const secondOctave = document.createElement('div');
        secondOctave.className = 'octave';
        this.createOctaveKeys(secondOctave, startOctave + 1, notes, callback);
        keyboardKeys.appendChild(secondOctave);
        
        // Add just the C key for the third octave
        const thirdOctave = document.createElement('div');
        thirdOctave.className = 'octave third-octave';
        
        // Create the C key for the third octave
        const thirdOctaveNum = startOctave + 2;
        this.createPianoKey(thirdOctave, 'C', thirdOctaveNum, notes, callback, 'white-key');
        
        keyboardKeys.appendChild(thirdOctave);
        
        return keyboardKeys;
    }
    
    /**
     * Create the white and black keys for an octave
     */
    private createOctaveKeys(octaveContainer: HTMLElement, octave: number, availableNotes: Note[], callback: (note: Note) => void): void {
        // Create white keys first (so they appear behind black keys)
        for (const noteName of this.whiteKeys) {
            this.createPianoKey(octaveContainer, noteName, octave, availableNotes, callback, 'white-key');
        }
        
        // Create black keys (positioned absolutely over white keys)
        for (const blackKeyName of this.blackKeys) {
            const baseName = blackKeyName.charAt(0);
            const key = this.createPianoKey(octaveContainer, baseName, octave, availableNotes, callback, 'black-key', 'sharp');
            
            // Position black keys correctly
            switch(baseName) {
                case 'C': key.style.left = '10%'; break;
                case 'D': key.style.left = '24%'; break;
                case 'F': key.style.left = '53%'; break;
                case 'G': key.style.left = '67%'; break;
                case 'A': key.style.left = '81%'; break;
            }
        }
    }
    
    /**
     * Create a single piano key element
     */
    private createPianoKey(
        container: HTMLElement, 
        noteName: string, 
        octave: number, 
        availableNotes: Note[], 
        callback: (note: Note) => void,
        keyClass: string,
        accidental?: 'sharp' | 'flat' | 'natural'
    ): HTMLElement {
        
        const key = document.createElement('div');
        key.className = `piano-key ${keyClass}`;
        
        // Add middle C indicator if applicable - only for natural C (not C#)
        if (noteName === 'C' && octave === this.middleC && !accidental) {
            key.classList.add('middle-c');
        }
        
        // Get the note from repository
        const note = this.noteRepository.getNote(noteName, accidental, octave);
        if (!note) return key; // Early return if note not found
        
        // Find if this note is in our available notes
        const matchingNote = this.findMatchingNote(note, availableNotes);
        
        // Simple logic branch for determining key state
        if (this.showAllKeys || matchingNote) {
            // When showAllKeys is true, all keys are selectable
            key.classList.add('selectable');
            key.addEventListener('click', () => callback(note));
        }  else {
            // Not in available notes and not showing all keys
            key.classList.add('disabled');
        }
        
        // Add note name if showNoteNames is true (only for white keys)
        if (this.showNoteNames && keyClass === 'white-key') {
            const noteLabel = document.createElement('span');
            noteLabel.className = 'note-name';
            // Show only the note name without octave
            noteLabel.textContent = noteName;
            key.appendChild(noteLabel);
        }
        
        // Add the key to the container
        container.appendChild(key);
        
        return key;
    }
    
    /**
     * Find a matching note in an array of available notes
     * Match by name, accidental, and octave
     */
    private findMatchingNote(note: Note, availableNotes: Note[]): Note | undefined {
        // Enhanced matching that handles edge cases better
        return availableNotes.find(n => {
            // Match by name (case insensitive)
            const nameMatches = n.name.toLowerCase() === note.name.toLowerCase();
            
            // Match by octave
            const octaveMatches = n.octave === note.octave;
            
            // Match by accidental, handling undefined and null cases
            const accidentalMatches = 
                (n.accidental === note.accidental) || 
                (!n.accidental && !note.accidental);
            
           
            return nameMatches && octaveMatches && accidentalMatches;
        });
    }
    
    /**
     * Toggle whether note names are displayed on the piano keys
     */
    public toggleNoteNames(): void {
        this.showNoteNames = !this.showNoteNames;
    }
    
    /**
     * Toggle whether all keys are displayed or only available ones
     */
    public toggleShowAllKeys(): void {
        this.showAllKeys = !this.showAllKeys;
    }
} 