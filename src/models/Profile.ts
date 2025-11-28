import { GameState } from './GameState';

// Add this interface
interface LevelRecord {
    highestStreak: number;
}

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
    levelRecords?: { [levelIndex: number]: LevelRecord }; // New field (optional for backward compatibility)
    instrumentMode?: 'piano' | 'violin'; // New field (optional for backward compatibility)
}

export interface ProfilesState {
    activeProfileId: string | null;
    profiles: Profile[];
}