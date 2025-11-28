import { ViolinFingerboardRenderer } from '../renderers/ViolinFingerboardRenderer';
import { Note } from '../models/Note';
import { NoteRepository } from '../models/NoteRepository';

// Mock NoteRepository
jest.mock('../models/NoteRepository', () => {
    return {
        NoteRepository: {
            getInstance: jest.fn().mockReturnValue({
                getNote: jest.fn((name, accidental, octave) => {
                    return {
                        name,
                        accidental,
                        octave,
                        clef: 'treble',
                        position: 0,
                        isSpace: false
                    };
                })
            })
        }
    };
});

describe('ViolinFingerboardRenderer', () => {
    let container: HTMLElement;
    let renderer: ViolinFingerboardRenderer;
    let mockCallback: jest.Mock;

    beforeEach(() => {
        // Set up DOM
        container = document.createElement('div');
        container.id = 'test-container';
        document.body.appendChild(container);

        mockCallback = jest.fn();
        renderer = new ViolinFingerboardRenderer('test-container');
    });

    afterEach(() => {
        document.body.removeChild(container);
        jest.clearAllMocks();
    });

    test('should render 4 strings', () => {
        renderer.renderFingerboard([], mockCallback);

        const strings = container.querySelectorAll('.violin-string');
        expect(strings.length).toBe(4);

        expect(strings[0].classList.contains('string-G')).toBe(true);
        expect(strings[1].classList.contains('string-D')).toBe(true);
        expect(strings[2].classList.contains('string-A')).toBe(true);
        expect(strings[3].classList.contains('string-E')).toBe(true);
    });

    test('should render semitone zones', () => {
        renderer.renderFingerboard([], mockCallback);

        const zones = container.querySelectorAll('.fingerboard-zone');
        // 4 strings * 8 semitones (0-7) = 32 zones
        expect(zones.length).toBe(32);
    });

    test('should mark open strings', () => {
        renderer.renderFingerboard([], mockCallback);

        const openStrings = container.querySelectorAll('.open-string');
        expect(openStrings.length).toBe(4);
    });

    test('should make available notes clickable', () => {
        const availableNotes: Note[] = [
            { name: 'A', octave: 4, clef: 'treble', position: 0, isSpace: false } // Open A string
        ];

        renderer.renderFingerboard(availableNotes, mockCallback);

        // Find the zone for A4 (Open A string)
        // A string is index 2. Open string is first child.
        const aString = container.querySelectorAll('.violin-string')[2];
        const openA = aString.querySelector('.fingerboard-zone');

        expect(openA?.classList.contains('active-zone')).toBe(true);

        // Click it
        (openA as HTMLElement).click();
        expect(mockCallback).toHaveBeenCalled();
        const clickedNote = mockCallback.mock.calls[0][0];
        expect(clickedNote.name).toBe('A');
        expect(clickedNote.octave).toBe(4);
    });

    test('should not make unavailable notes clickable', () => {
        const availableNotes: Note[] = [
            { name: 'A', octave: 4, clef: 'treble', position: 0, isSpace: false }
        ];

        renderer.renderFingerboard(availableNotes, mockCallback);

        // Find the zone for E5 (Open E string) - NOT available
        const eString = container.querySelectorAll('.violin-string')[3];
        const openE = eString.querySelector('.fingerboard-zone');

        expect(openE?.classList.contains('active-zone')).toBe(false);

        // Click it
        (openE as HTMLElement).click();
        expect(mockCallback).not.toHaveBeenCalled();
    });
});
