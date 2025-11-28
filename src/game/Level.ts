import { LevelConfig } from '../models/LevelConfig';
import { Note } from '../models/Note';
import { LevelData } from '../data/LevelData';
import { NoteUtils } from '../utils/NoteUtils';

export class Level {
    private config: LevelConfig;
    private notes: Note[];
    private currentNote: Note | null = null;
    private lastNoteAsked: Note | null = null;
    private mistakenNotesPool: Map<string, { note: Note; consecutiveCorrect: number }> = new Map();
    private levelIndex: number;

    private noteFilter: ((note: Note) => boolean) | null = null;

    constructor(config: LevelConfig, levelIndex: number) {
        this.config = config;
        this.notes = [...config.notes];
        this.levelIndex = levelIndex;
        this.selectAndSetNextNote();
    }

    public setNoteFilter(filter: ((note: Note) => boolean) | null): void {
        this.noteFilter = filter;
        // If the current note is invalid under the new filter, select a new one
        if (this.currentNote && this.noteFilter && !this.noteFilter(this.currentNote)) {
            console.log("Current note invalid under new filter, selecting new note...");
            this.selectAndSetNextNote();
        }
    }

    public getCurrentNote(): Note {
        if (!this.currentNote) {
            console.error("Current note is null, selecting a new one.");
            this.selectAndSetNextNote();
        }
        return this.currentNote!;
    }

    public getAvailableNotes(): Note[] {
        if (this.noteFilter) {
            return this.notes.filter(this.noteFilter);
        }
        return this.notes;
    }

    public nextNote(): void {
        this.selectAndSetNextNote();
    }

    private selectAndSetNextNote(): void {
        let potentialNote: Note | null = null;
        let attempts = 0;
        let sourceDescription: string = "";

        // Filter the base notes if a filter is set
        let availableNotes = this.config.notes;
        if (this.noteFilter) {
            availableNotes = availableNotes.filter(this.noteFilter);
        }

        if (availableNotes.length === 0) {
            console.warn(`Level ${this.levelIndex} has no available notes after filtering.`);
            // Fallback to all notes if filter removes everything, to avoid broken game
            if (this.config.notes.length > 0) {
                availableNotes = this.config.notes;
                console.warn("Falling back to unfiltered notes.");
            } else {
                return;
            }
        }

        do {
            attempts++;
            const p = Math.random();
            let sourcePool: Note[] = [];

            const recentlyLearnedNotes = this.getRecentlyLearnedNotes();
            // Filter recently learned notes too
            const filteredRecent = this.noteFilter ? recentlyLearnedNotes.filter(this.noteFilter) : recentlyLearnedNotes;

            const mistakenNotes = Array.from(this.mistakenNotesPool.values()).map(entry => entry.note);
            // Filter mistaken notes
            const filteredMistaken = this.noteFilter ? mistakenNotes.filter(this.noteFilter) : mistakenNotes;

            const recentProb = (this.levelIndex >= 5 && filteredRecent.length > 0) ? 0.40 : 0;
            const mistakenProb = (filteredMistaken.length > 0) ? 0.30 : 0;

            // Check if new note is valid
            const newNoteValid = this.config.newNote && (!this.noteFilter || this.noteFilter(this.config.newNote));
            const newNoteProb = newNoteValid ? 0.20 : 0;

            let totalProb = recentProb + mistakenProb + newNoteProb;
            let thresholdRecent = recentProb;
            let thresholdMistaken = thresholdRecent + mistakenProb;
            let thresholdNewNote = thresholdMistaken + newNoteProb;

            if (p < thresholdRecent && filteredRecent.length > 0) {
                sourcePool = filteredRecent;
                sourceDescription = "Recently Learned";
            } else if (p < thresholdMistaken && filteredMistaken.length > 0) {
                sourcePool = filteredMistaken;
                sourceDescription = "Mistaken";
            } else if (p < thresholdNewNote && newNoteValid && this.config.newNote) {
                sourcePool = [this.config.newNote];
                sourceDescription = "New Note";
            } else {
                sourcePool = availableNotes;
                sourceDescription = "Learned (All Level Notes)";
            }

            if (sourcePool.length > 0) {
                const randomIndex = Math.floor(Math.random() * sourcePool.length);
                potentialNote = sourcePool[randomIndex];
            } else {
                console.warn(`Selected pool '${sourceDescription}' was empty. Falling back to all available level notes.`);
                sourcePool = availableNotes;
                if (sourcePool.length > 0) {
                    const fallbackIndex = Math.floor(Math.random() * sourcePool.length);
                    potentialNote = sourcePool[fallbackIndex];
                    sourceDescription = "Learned (Fallback)";
                } else {
                    console.error("Absolute fallback failed: Level has no notes at all.");
                    break;
                }
            }

            if (attempts > 10 && availableNotes.length > 1) {
                console.warn("Could not find a different note after 10 attempts. Allowing potential repeat.");
                break;
            }
            if (availableNotes.length <= 1) {
                break;
            }

        } while (this.lastNoteAsked && potentialNote && this.isSameNote(potentialNote, this.lastNoteAsked));

        if (potentialNote) {
            this.currentNote = potentialNote;
            this.lastNoteAsked = this.currentNote;
        } else if (!this.currentNote && availableNotes.length > 0) {
            this.currentNote = availableNotes[0];
            this.lastNoteAsked = this.currentNote;
            console.error("Failed to select any note initially, assigned the first available note.");
        } else if (!potentialNote) {
            console.warn(`Selection failed or resulted in same note. Keeping current note: ${this.currentNote ? NoteUtils.getNoteLabel(this.currentNote) : 'null'}`);
        }
    }

    public updateMistakenNotes(note: Note, isCorrect: boolean): void {
        const noteId = NoteUtils.getNoteId(note);

        if (isCorrect) {
            if (this.mistakenNotesPool.has(noteId)) {
                const entry = this.mistakenNotesPool.get(noteId)!;
                entry.consecutiveCorrect++;
                if (entry.consecutiveCorrect >= 3) {
                    this.mistakenNotesPool.delete(noteId);
                } else {
                    this.mistakenNotesPool.set(noteId, entry);
                }
            }
        } else {
            this.mistakenNotesPool.set(noteId, { note: note, consecutiveCorrect: 0 });
        }
    }

    private getRecentlyLearnedNotes(): Note[] {
        const recentNewNotes: Note[] = [];
        const allLevels = LevelData.levels;

        const startIndex = this.levelIndex - 1;
        const endIndex = Math.max(0, this.levelIndex - 5);

        for (let i = startIndex; i >= endIndex; i--) {
            if (i >= 0 && i < allLevels.length) {
                const levelConfig = allLevels[i];
                if (levelConfig?.newNote) {
                    if (!recentNewNotes.some(note => this.isSameNote(note, levelConfig.newNote!))) {
                        recentNewNotes.push(levelConfig.newNote);
                    }
                }
            }
        }
        return recentNewNotes;
    }

    public isSameNote(note1: Note, note2: Note | null): boolean {
        if (!note1 || !note2) return false;
        return NoteUtils.getNoteId(note1) === NoteUtils.getNoteId(note2);
    }

    public isComplete(recentAttempts: { isCorrect: boolean; timeSpent: number }[]): boolean {
        const requiredSuccessCount = this.config.requiredSuccessCount || LevelData.LEVEL_CRITERIA.requiredSuccessCount;
        const maxTimePerProblem = this.config.maxTimePerProblem || LevelData.LEVEL_CRITERIA.maxTimePerProblem;

        // Count current streak
        let streak = 0;
        for (let i = recentAttempts.length - 1; i >= 0; i--) {
            if (recentAttempts[i].isCorrect) {
                streak++;
            } else {
                break; // Stop counting when we hit an incorrect answer
            }
        }

        // If streak is less than required, level is not complete
        if (streak < requiredSuccessCount) {
            return false;
        }

        // Get only the attempts in the current streak
        const streakAttempts = recentAttempts.slice(-streak);

        // Calculate average time for streak attempts
        const averageTime = streakAttempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0) / streakAttempts.length;
        const isFastEnough = averageTime < maxTimePerProblem;

        return isFastEnough;
    }
} 