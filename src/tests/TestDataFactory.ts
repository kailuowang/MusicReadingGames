import { Note } from '../models/Note';
import { LevelConfig } from '../models/LevelConfig';
import { GameState } from '../models/GameState';
import { NoteUtils } from '../utils/NoteUtils';

/**
 * Factory class to generate consistent test data
 * Centralizes test data creation to make tests more maintainable
 */
export class TestDataFactory {
  // Standard test notes with consistent properties
  static get noteF4(): Note {
    return { name: 'F', position: 1, isSpace: true, clef: 'treble', octave: 4 };
  }
  
  static get noteA4(): Note {
    return { name: 'A', position: 2, isSpace: true, clef: 'treble', octave: 4 };
  }
  
  static get noteC5(): Note {
    return { name: 'C', position: 3, isSpace: true, clef: 'treble', octave: 5 };
  }
  
  static get noteE5(): Note {
    return { name: 'E', position: 4, isSpace: true, clef: 'treble', octave: 5 };
  }
  
  static get noteG5(): Note {
    return { name: 'G', position: 5, isSpace: false, clef: 'treble', octave: 5 };
  }
  
  static get noteD4(): Note {
    return { name: 'D', position: 0, isSpace: false, clef: 'treble', octave: 4 };
  }
  
  static get noteB4(): Note {
    return { name: 'B', position: 3, isSpace: false, clef: 'treble', octave: 4 };
  }
  
  // Get notes
  static getNotes(): { [key: string]: Note } {
    return {
      F4: this.noteF4,
      A4: this.noteA4,
      C5: this.noteC5,
      E5: this.noteE5,
      G5: this.noteG5,
      D4: this.noteD4,
      B4: this.noteB4
    };
  }
  
  // Get note IDs
  static getNoteIds(): { [key: string]: string } {
    const notes = this.getNotes();
    const ids: { [key: string]: string } = {};
    
    for (const key in notes) {
      ids[key] = NoteUtils.getNoteId(notes[key]);
    }
    
    return ids;
  }
  
  // Create a single level config
  static createLevelConfig(options?: Partial<LevelConfig>): LevelConfig {
    return {
      id: 1, 
      name: 'Test Level 1', 
      description: 'Basic test level', 
      clef: 'treble',
      notes: [this.noteF4], 
      requiredSuccessCount: 3, 
      maxTimePerProblem: 5,
      ...options
    };
  }
  
  // Create progressively more complex level configs
  static createLevel1(): LevelConfig {
    return this.createLevelConfig({
      id: 1,
      name: 'Level 1',
      description: 'First note F',
      notes: [this.noteF4],
      requiredSuccessCount: 3,
      maxTimePerProblem: 5
    });
  }
  
  static createLevel2(): LevelConfig {
    return this.createLevelConfig({
      id: 2,
      name: 'Level 2',
      description: 'Introducing note A',
      notes: [this.noteF4, this.noteA4],
      newNote: this.noteA4,
      learnedNotes: [this.noteF4],
      requiredSuccessCount: 3,
      maxTimePerProblem: 5
    });
  }
  
  static createLevel3(): LevelConfig {
    return this.createLevelConfig({
      id: 3,
      name: 'Level 3',
      description: 'Introducing note C',
      notes: [this.noteF4, this.noteA4, this.noteC5],
      newNote: this.noteC5,
      learnedNotes: [this.noteF4, this.noteA4],
      requiredSuccessCount: 3,
      maxTimePerProblem: 5
    });
  }
  
  // Create a sequence of levels for testing progression
  static createLevelSequence(count: number = 3): LevelConfig[] {
    const levelCreators = [
      () => this.createLevel1(),
      () => this.createLevel2(),
      () => this.createLevel3(),
      () => this.createLevelConfig({
        id: 4,
        name: 'Level 4',
        description: 'Introducing note E',
        notes: [this.noteF4, this.noteA4, this.noteC5, this.noteE5],
        newNote: this.noteE5,
        learnedNotes: [this.noteF4, this.noteA4, this.noteC5],
        requiredSuccessCount: 3,
        maxTimePerProblem: 5
      }),
      () => this.createLevelConfig({
        id: 5,
        name: 'Level 5',
        description: 'Introducing note G',
        notes: [this.noteF4, this.noteA4, this.noteC5, this.noteE5, this.noteG5],
        newNote: this.noteG5,
        learnedNotes: [this.noteF4, this.noteA4, this.noteC5, this.noteE5],
        requiredSuccessCount: 3,
        maxTimePerProblem: 5
      })
    ];
    
    return levelCreators.slice(0, count).map(creator => creator());
  }
  
  // Create a default game state
  static createGameState(options?: Partial<GameState>): GameState {
    return {
      currentLevelIndex: 0,
      isGameRunning: false,
      noteHistory: {},
      recentAttempts: [],
      ...options
    };
  }
  
  // Create game state with attempt history
  static createGameStateWithAttempts(
    correctCount: number, 
    incorrectCount: number = 0, 
    timePerAttempt: number = 2.0
  ): GameState {
    const attempts = [];
    
    // Add incorrect attempts first (if any)
    for (let i = 0; i < incorrectCount; i++) {
      attempts.push({
        isCorrect: false,
        timeSpent: timePerAttempt,
        timestamp: Date.now() - (incorrectCount + correctCount - i) * 1000
      });
    }
    
    // Then add correct attempts to build a streak
    for (let i = 0; i < correctCount; i++) {
      attempts.push({
        isCorrect: true,
        timeSpent: timePerAttempt,
        timestamp: Date.now() - (correctCount - i) * 1000
      });
    }
    
    return this.createGameState({
      recentAttempts: attempts
    });
  }
  
  // Create note history with specific stats
  static createNoteHistory(notes: Note[], correctCounts: number[], incorrectCounts: number[]): Record<string, { correct: number; incorrect: number }> {
    const history: Record<string, { correct: number; incorrect: number }> = {};
    
    notes.forEach((note, index) => {
      const noteId = NoteUtils.getNoteId(note);
      history[noteId] = {
        correct: correctCounts[index] || 0,
        incorrect: incorrectCounts[index] || 0
      };
    });
    
    return history;
  }
} 