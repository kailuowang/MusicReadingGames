import { Note } from '../models/Note';
import { NoteRepository } from '../models/NoteRepository';

export class ViolinFingerboardRenderer {
    private container: HTMLElement;
    private noteRepository: NoteRepository;

    // Violin strings: E5, A4, D4, G3 (Top to Bottom)
    private readonly strings = [
        { name: 'E', octave: 5, baseNote: 'E' },
        { name: 'A', octave: 4, baseNote: 'A' },
        { name: 'D', octave: 4, baseNote: 'D' },
        { name: 'G', octave: 3, baseNote: 'G' }
    ];

    // Semitones per string to display (0 = open string, up to 7 semitones for 1st position reach)
    private readonly semitones = 8;

    // Markers for 1st, 2nd, 3rd fingers (approximate semitone positions)
    // 2 semitones = 1st finger (whole tone)
    // 4 semitones = 2nd finger (major third)
    // 5 semitones = 3rd finger (perfect fourth)
    // 7 semitones = 4th finger (perfect fifth)
    private readonly markers = [2, 4, 5, 7];

    constructor(containerId: string) {
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Container element with id '${containerId}' not found`);
        }
        this.container = container;
        this.noteRepository = NoteRepository.getInstance();
    }

    public renderFingerboard(notes: Note[], callback: (note: Note) => void): void {
        this.container.innerHTML = '';

        const fingerboardContainer = document.createElement('div');
        fingerboardContainer.className = 'violin-fingerboard-container';

        const fingerboard = document.createElement('div');
        fingerboard.className = 'violin-fingerboard';

        // Create strings
        this.strings.forEach((stringInfo, stringIndex) => {
            const stringElement = document.createElement('div');
            stringElement.className = `violin-string string-${stringInfo.name}`;

            // Add string label
            const stringLabel = document.createElement('div');
            stringLabel.className = 'string-label';
            stringLabel.textContent = stringInfo.name;
            stringElement.appendChild(stringLabel);

            // Create clickable zones for each semitone
            for (let i = 0; i < this.semitones; i++) {
                const zone = document.createElement('div');
                zone.className = 'fingerboard-zone';
                if (i === 0) zone.classList.add('open-string');

                // Calculate the note for this position
                const note = this.getNoteForPosition(stringInfo.baseNote, stringInfo.octave, i);

                if (note) {
                    // Make all zones clickable
                    zone.classList.add('active-zone'); // Always active for interaction
                    zone.addEventListener('click', () => callback(note));

                    // Check if this note is in the available notes for visual hint (optional)
                    // For now, we won't distinguish visually to encourage reading, 
                    // but we could add a class if we wanted 'cheat mode'.
                    const isAvailable = this.isNoteInLesson(note, notes);
                    if (isAvailable) {
                        zone.dataset.available = 'true';

                        // Show note name for available notes
                        const noteLabel = document.createElement('span');
                        noteLabel.className = 'note-on-fingerboard';
                        noteLabel.textContent = note.name;
                        zone.appendChild(noteLabel);
                    }

                    // Add visual indicator for the note (hidden by default, shown on hover/active)
                    const indicator = document.createElement('div');
                    indicator.className = 'note-indicator';
                    zone.appendChild(indicator);
                }

                // Add markers
                if (this.markers.includes(i)) {
                    zone.classList.add('marker-zone');
                }

                stringElement.appendChild(zone);
            }

            fingerboard.appendChild(stringElement);
        });

        fingerboardContainer.appendChild(fingerboard);
        this.container.appendChild(fingerboardContainer);
    }

    private getNoteForPosition(baseNote: string, baseOctave: number, semitones: number): Note | null {
        // This is a simplified logic. In a real app, we'd use a more robust music theory library
        // or the NoteRepository to find the note X semitones above the base note.
        // For now, let's try to find it in the repository.

        const allNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const baseIndex = allNotes.indexOf(baseNote);

        let targetIndex = baseIndex + semitones;
        let targetOctave = baseOctave + Math.floor(targetIndex / 12);
        targetIndex = targetIndex % 12;

        const targetNoteName = allNotes[targetIndex];

        // Handle sharp/flat/natural. 
        // The repository might store 'C#' but not 'Db'. 
        // Our simple logic produces sharps.

        let name = targetNoteName;
        let accidental: 'sharp' | 'flat' | 'natural' | undefined;

        if (name.endsWith('#')) {
            name = name[0];
            accidental = 'sharp';
        } else {
            accidental = undefined; // Natural
        }

        return this.noteRepository.getNote(name, accidental, targetOctave) || null;
    }

    // Check if note is in the provided list of available notes (for visual labels)
    private isNoteInLesson(note: Note, availableNotes: Note[]): boolean {
        return availableNotes.some(n =>
            n.name === note.name &&
            n.octave === note.octave &&
            (n.accidental === note.accidental || (!n.accidental && !note.accidental))
        );
    }

    // Check if the note physically exists on the fingerboard (for Game filtering)
    public isNoteOnFingerboard(note: Note): boolean {
        for (const stringInfo of this.strings) {
            for (let i = 0; i < this.semitones; i++) {
                const fingerboardNote = this.getNoteForPosition(stringInfo.baseNote, stringInfo.octave, i);
                if (fingerboardNote &&
                    fingerboardNote.name === note.name &&
                    fingerboardNote.octave === note.octave &&
                    (fingerboardNote.accidental === note.accidental || (!fingerboardNote.accidental && !note.accidental))) {
                    return true;
                }
            }
        }
        return false;
    }
}
