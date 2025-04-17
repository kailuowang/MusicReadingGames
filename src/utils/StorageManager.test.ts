import { describe, it, beforeEach, expect, jest } from '@jest/globals'; // Explicitly import Jest globals
import { StorageManager } from './StorageManager';
import { GameState } from '../models/GameState';

// Mock localStorage for testing environment (like Node.js)
const localStorageMock = (() => {
    let store: { [key: string]: string } = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString();
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
        get length() {
            return Object.keys(store).length;
        },
        key: (index: number) => {
            const keys = Object.keys(store);
            return keys[index] || null;
        }
    };
})();

// Replace window.localStorage with the mock
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});


describe('StorageManager', () => {
    const testStorageKey = 'test-game-state';
    let storageManager: StorageManager;
    const mockGameState: GameState = {
        currentLevelIndex: 2,
        isGameRunning: true,
        noteHistory: {
            'C': { correct: 5, incorrect: 1 }
        },
        recentAttempts: [
            { isCorrect: true, timeSpent: 2.5, timestamp: Date.now() }
        ]
    };

    beforeEach(() => {
        // Clear the mock localStorage before each test
        window.localStorage.clear();
        storageManager = new StorageManager(testStorageKey);
    });

    test('should save the game state to localStorage', () => {
        storageManager.saveState(mockGameState);
        const savedData = window.localStorage.getItem(testStorageKey);
        expect(savedData).not.toBeNull();
        expect(JSON.parse(savedData!)).toEqual(mockGameState);
    });

    test('should load the game state from localStorage', () => {
        // First, save some state
        window.localStorage.setItem(testStorageKey, JSON.stringify(mockGameState));
        
        const loadedState = storageManager.loadState();
        expect(loadedState).not.toBeNull();
        expect(loadedState).toEqual(mockGameState);
    });

    test('should return null if no state is found in localStorage', () => {
        const loadedState = storageManager.loadState();
        expect(loadedState).toBeNull();
    });

    test('should clear the game state from localStorage', () => {
        // Save state, then clear it
        storageManager.saveState(mockGameState);
        storageManager.clearState();
        
        const savedData = window.localStorage.getItem(testStorageKey);
        expect(savedData).toBeNull();
    });

    test('should handle JSON parsing errors gracefully when loading', () => {
        // Save invalid JSON data
        window.localStorage.setItem(testStorageKey, 'invalid-json');
        
        // Mock console.error to check if it was called
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        const loadedState = storageManager.loadState();
        expect(loadedState).toBeNull();
        expect(consoleSpy).toHaveBeenCalled();
        
        consoleSpy.mockRestore(); // Clean up the spy
    });
    
    // Optional: Test handling potential errors during saving (e.g., localStorage full)
    // This is harder to reliably simulate, but could involve mocking setItem to throw errors.
}); 