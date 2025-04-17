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
            return JSON.parse(serializedState) as GameState;
        } catch (error) {
            console.error('Failed to load game state:', error);
            return null;
        }
    }
    
    public clearState(): void {
        try {
            localStorage.removeItem(this.storageKey);
        } catch (error) {
            console.error('Failed to clear game state:', error);
        }
    }
} 