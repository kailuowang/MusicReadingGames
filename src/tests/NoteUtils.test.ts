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
}); 