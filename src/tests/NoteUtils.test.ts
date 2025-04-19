import { NoteUtils } from '../utils/NoteUtils';
import { Note } from '../models/Note';

describe('NoteUtils', () => {
  describe('isLedgerLineNote', () => {
    it('should identify notes below the staff as ledger line notes', () => {
      const belowStaffNote: Note = {
        name: 'C',
        position: 0,
        isSpace: false,
        clef: 'treble',
        octave: 4
      };
      
      expect(NoteUtils.isLedgerLineNote(belowStaffNote)).toBe(true);
      expect(NoteUtils.isBelowStaff(belowStaffNote)).toBe(true);
      expect(NoteUtils.isAboveStaff(belowStaffNote)).toBe(false);
    });
    
    it('should identify notes above the staff as ledger line notes', () => {
      const aboveStaffNote: Note = {
        name: 'A',
        position: 6,
        isSpace: false,
        clef: 'treble',
        octave: 5
      };
      
      expect(NoteUtils.isLedgerLineNote(aboveStaffNote)).toBe(true);
      expect(NoteUtils.isBelowStaff(aboveStaffNote)).toBe(false);
      expect(NoteUtils.isAboveStaff(aboveStaffNote)).toBe(true);
    });
    
    it('should identify notes within the staff as regular notes', () => {
      const regularNote: Note = {
        name: 'B',
        position: 3,
        isSpace: false,
        clef: 'treble',
        octave: 4
      };
      
      expect(NoteUtils.isLedgerLineNote(regularNote)).toBe(false);
      expect(NoteUtils.isBelowStaff(regularNote)).toBe(false);
      expect(NoteUtils.isAboveStaff(regularNote)).toBe(false);
    });
  });
  
  describe('getNoteLabel', () => {
    it('should format natural notes correctly with space', () => {
      const cNote: Note = {
        name: 'C',
        position: 0,
        isSpace: false,
        clef: 'treble',
        octave: 4
      };
      
      expect(NoteUtils.getNoteLabel(cNote)).toBe('C 4');
    });
    
    it('should format sharp notes correctly with space', () => {
      const dSharpNote: Note = {
        name: 'D',
        position: 4,
        isSpace: false,
        clef: 'treble',
        octave: 5,
        accidental: 'sharp'
      };
      
      expect(NoteUtils.getNoteLabel(dSharpNote)).toBe('D# 5');
    });
    
    it('should format flat notes correctly with space', () => {
      const bFlatNote: Note = {
        name: 'B',
        position: 3,
        isSpace: false,
        clef: 'bass',
        octave: 3,
        accidental: 'flat'
      };
      
      expect(NoteUtils.getNoteLabel(bFlatNote)).toBe('B♭ 3');
    });
    
    it('should format natural accidentals correctly with space', () => {
      const fNaturalNote: Note = {
        name: 'F',
        position: 4,
        isSpace: false,
        clef: 'treble',
        octave: 5,
        accidental: 'natural'
      };
      
      expect(NoteUtils.getNoteLabel(fNaturalNote)).toBe('F♮ 5');
    });
  });
}); 