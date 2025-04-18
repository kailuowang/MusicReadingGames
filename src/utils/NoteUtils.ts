import { Note } from '../models/Note';

/**
 * Utility functions for working with Note objects
 */
export class NoteUtils {
  /**
   * Checks if a note requires ledger lines (is above or below the standard staff)
   * @param note The note to check
   * @returns True if the note requires ledger lines, false otherwise
   */
  public static isLedgerLineNote(note: Note): boolean {
    // Notes with position <= 0 are below the staff
    // Notes with position > 5 are above the staff
    return note.position <= 0 || note.position > 5;
  }
  
  /**
   * Checks if a note is below the standard staff
   * @param note The note to check
   * @returns True if the note is below the staff, false otherwise
   */
  public static isBelowStaff(note: Note): boolean {
    return note.position <= 0;
  }
  
  /**
   * Checks if a note is above the standard staff
   * @param note The note to check
   * @returns True if the note is above the staff, false otherwise
   */
  public static isAboveStaff(note: Note): boolean {
    return note.position > 5;
  }
} 