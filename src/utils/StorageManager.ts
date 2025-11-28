import { GameState } from '../models/GameState';

export class StorageManager {
    private storageKey: string;

    constructor(storageKey: string) {
        this.storageKey = storageKey;
    }

    public saveState(state: GameState): void {
        try {
            const serializedState = JSON.stringify(state);
            localStorage.setItem(this.storageKey, serializedState);
        } catch (error) {
            console.error('Failed to save game state:', error);
        }
    }

    public loadState(): GameState | null {
        try {
            const serializedState = localStorage.getItem(this.storageKey);
            if (serializedState === null) {
                return null;
            }

            const parsedState = JSON.parse(serializedState);

            // Validate state to ensure it has the required structure
            if (!this.isValidGameState(parsedState)) {
                console.warn('Invalid game state found in storage, clearing...');
                this.clearState();
                return null;
            }

            return parsedState as GameState;
        } catch (error) {
            console.error('Failed to load game state, clearing corrupt data:', error);
            this.clearState();
            return null;
        }
    }

    private isValidGameState(state: any): boolean {
        // Basic structure validation
        if (!state || typeof state !== 'object') return false;
        if (typeof state.currentLevelIndex !== 'number') return false;
        if (typeof state.isGameRunning !== 'boolean') return false;

        // Check noteHistory and recentAttempts structure
        if (!state.noteHistory || typeof state.noteHistory !== 'object') return false;

        // Initialize recentAttempts if missing
        if (!state.recentAttempts) {
            state.recentAttempts = [];
        }

        // If recentAttempts exists, ensure it's an array
        if (!Array.isArray(state.recentAttempts)) {
            state.recentAttempts = [];
        }

        return true;
    }

    public clearState(): void {
        try {
            localStorage.removeItem(this.storageKey);
        } catch (error) {
            console.error('Failed to clear game state:', error);
        }
    }

    public saveInstrumentMode(mode: 'piano' | 'violin'): void {
        try {
            localStorage.setItem(this.storageKey + '-instrument', mode);
        } catch (error) {
            console.error('Failed to save instrument mode:', error);
        }
    }

    public loadInstrumentMode(): 'piano' | 'violin' {
        try {
            const mode = localStorage.getItem(this.storageKey + '-instrument');
            if (mode === 'piano' || mode === 'violin') {
                return mode;
            }
            return 'piano'; // Default
        } catch (error) {
            console.error('Failed to load instrument mode:', error);
            return 'piano';
        }
    }
} 