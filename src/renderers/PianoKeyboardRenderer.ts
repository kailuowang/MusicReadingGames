import { Note } from '../models/Note';

export class PianoKeyboardRenderer {
    private container: HTMLElement;
    private showNoteNames: boolean = true;
    private currentClef: 'treble' | 'bass' = 'treble';
    
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
    }
    
    /**
     * Render a piano keyboard with the notes that can be selected
     * @param notes - The notes that can be selected
     * @param callback - Function to call when a key is clicked, passing the selected note
     */
    public renderKeyboard(notes: Note[], callback: (note: Note) => void): void {
        // Clear the container first
        this.container.innerHTML = '';
        this.currentClef = notes[0]?.clef || 'treble';
        
        // Create keyboard container
        const keyboardContainer = document.createElement('div');
        keyboardContainer.className = 'piano-keyboard';
        keyboardContainer.dataset.clef = this.currentClef;
        
        // Create toggle button for note names
        const toggleButton = document.createElement('button');
        toggleButton.className = 'toggle-note-names';
        toggleButton.textContent = this.showNoteNames ? 'Hide Note Names' : 'Show Note Names';
        toggleButton.addEventListener('click', () => {
            this.showNoteNames = !this.showNoteNames;
            toggleButton.textContent = this.showNoteNames ? 'Hide Note Names' : 'Show Note Names';
            // Update keyboard display
            this.renderKeyboard(notes, callback);
        });
        
        // Add toggle button to container
        this.container.appendChild(toggleButton);
        
        // Determine starting octave based on current clef
        const startOctave = this.currentClef === 'treble' 
            ? this.trebleClefStartOctave 
            : this.bassClefStartOctave;
        
        // Create fixed keyboard with 2 octaves + the third C
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
        
        const cKey = document.createElement('div');
        cKey.className = 'piano-key white-key';
        
        const thirdOctaveNum = startOctave + 2;
        
        // Add middle C indicator if applicable
        if (thirdOctaveNum === this.middleC && this.currentClef === 'bass') {
            cKey.classList.add('middle-c');
        }
        
        // Find if this note is in our available notes - match by name AND octave
        const matchingCNote = notes.find(n => {
            return n.name === 'C' && (n.octave === thirdOctaveNum || n.octave === undefined);
        });
        
        if (matchingCNote) {
            cKey.classList.add('selectable');
            
            // Create a copy of the note with octave information
            const noteWithOctave: Note = {
                ...matchingCNote,
                octave: thirdOctaveNum
            };
            
            cKey.addEventListener('click', () => callback(noteWithOctave));
        } else {
            cKey.classList.add('disabled');
        }
        
        // Add note name if showNoteNames is true (only for white keys)
        if (this.showNoteNames) {
            const noteLabel = document.createElement('span');
            noteLabel.className = 'note-name';
            // Show octave in superscript
            noteLabel.innerHTML = `C<sup>${thirdOctaveNum}</sup>`;
            cKey.appendChild(noteLabel);
        }
        
        thirdOctave.appendChild(cKey);
        keyboardKeys.appendChild(thirdOctave);
        
        // Add the keyboard to the container
        keyboardContainer.appendChild(keyboardKeys);
        this.container.appendChild(keyboardContainer);
    }
    
    /**
     * Create the white and black keys for an octave
     */
    private createOctaveKeys(octaveContainer: HTMLElement, octave: number, availableNotes: Note[], callback: (note: Note) => void): void {
        // Create white keys first (so they appear behind black keys)
        for (const noteName of this.whiteKeys) {
            const fullNoteName = `${noteName}${octave}`;
            const key = document.createElement('div');
            key.className = 'piano-key white-key';
            
            // Add middle C indicator
            if (noteName === 'C' && octave === this.middleC) {
                key.classList.add('middle-c');
            }
            
            // Find if this note is in our available notes - match by name AND octave 
            const matchingNote = availableNotes.find(n => {
                return n.name === noteName && (n.octave === octave || n.octave === undefined);
            });
            
            if (matchingNote) {
                key.classList.add('selectable');
                
                // Create a copy of the note with octave information
                const noteWithOctave: Note = {
                    ...matchingNote,
                    octave: octave
                };
                
                key.addEventListener('click', () => callback(noteWithOctave));
            } else {
                key.classList.add('disabled');
            }
            
            // Add note name if showNoteNames is true (only for white keys)
            if (this.showNoteNames) {
                const noteLabel = document.createElement('span');
                noteLabel.className = 'note-name';
                // Show octave in superscript
                noteLabel.innerHTML = `${noteName}<sup>${octave}</sup>`;
                key.appendChild(noteLabel);
            }
            
            // Add the key to the octave container
            octaveContainer.appendChild(key);
        }
        
        // Create black keys (positioned absolutely over white keys)
        for (const noteName of this.blackKeys) {
            const baseName = noteName.charAt(0);
            const fullNoteName = `${noteName}${octave}`;
            const key = document.createElement('div');
            key.className = 'piano-key black-key';
            
            // Position black keys correctly
            switch(baseName) {
                case 'C': key.style.left = '10%'; break;
                case 'D': key.style.left = '24%'; break;
                case 'F': key.style.left = '53%'; break;
                case 'G': key.style.left = '67%'; break;
                case 'A': key.style.left = '81%'; break;
            }
            
            // Find if this note (with sharp/flat) is in our available notes
            const matchingNote = availableNotes.find(n => {
                return n.name === baseName && n.accidental === 'sharp' && 
                       (n.octave === octave || n.octave === undefined);
            });
            
            if (matchingNote) {
                key.classList.add('selectable');
                
                // Create a copy of the note with octave information
                const noteWithOctave: Note = {
                    ...matchingNote,
                    octave: octave
                };
                
                key.addEventListener('click', () => callback(noteWithOctave));
            } else {
                key.classList.add('disabled');
            }
            
            // No note names for black keys as requested
            
            // Add the key to the octave container
            octaveContainer.appendChild(key);
        }
    }
    
    /**
     * Toggle whether note names are displayed on the piano keys
     */
    public toggleNoteNames(): void {
        this.showNoteNames = !this.showNoteNames;
    }
} 