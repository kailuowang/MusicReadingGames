import { GameState } from './GameState';

export interface Profile {
    id: string;        // Unique identifier
    name: string;      // Display name
    gameState: GameState;
    createdAt: number; // Timestamp when created
    lastUsed: number;  // Timestamp when last used
    displayPreferences: {
        showNoteNames: boolean;
        showAllNotes: boolean;
    };
}

export interface ProfilesState {
    activeProfileId: string | null;
    profiles: Profile[];
} 