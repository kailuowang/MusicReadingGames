import { Profile, ProfilesState } from '../models/Profile';
import { GameState } from '../models/GameState';

export class ProfileManager {
    private storageKey: string;
    private profilesState: ProfilesState;
    
    constructor(storageKey: string) {
        this.storageKey = storageKey + '-profiles';
        this.profilesState = this.loadProfilesState() || {
            activeProfileId: null,
            profiles: []
        };
    }
    
    /**
     * Loads all profiles from localStorage
     */
    private loadProfilesState(): ProfilesState | null {
        try {
            const serializedState = localStorage.getItem(this.storageKey);
            if (!serializedState) {
                return null;
            }
            
            const parsedState = JSON.parse(serializedState);
            
            // Validate state structure
            if (!this.isValidProfilesState(parsedState)) {
                console.warn('Invalid profiles state found in storage, resetting...');
                return null;
            }
            
            return parsedState as ProfilesState;
        } catch (error) {
            console.error('Failed to load profiles state:', error);
            return null;
        }
    }
    
    /**
     * Validates the structure of the profiles state
     */
    private isValidProfilesState(state: any): boolean {
        if (!state || typeof state !== 'object') return false;
        if (!Array.isArray(state.profiles)) return false;
        
        // Validate each profile
        for (const profile of state.profiles) {
            if (!profile.id || !profile.name || !profile.gameState) {
                return false;
            }
            
            // Validate timestamps
            if (typeof profile.createdAt !== 'number' || typeof profile.lastUsed !== 'number') {
                return false;
            }
            
            // Initialize displayPreferences if missing for backward compatibility
            if (!profile.displayPreferences) {
                profile.displayPreferences = {
                    showNoteNames: true,
                    showAllNotes: false
               };
           }

           // Initialize levelRecords if missing for backward compatibility
           if (!profile.levelRecords) {
               profile.levelRecords = {};
           }
       }
        
        return true;
    }
    
    /**
     * Saves the current profiles state to localStorage
     */
    private saveProfilesState(): void {
        try {
            const serializedState = JSON.stringify(this.profilesState);
            localStorage.setItem(this.storageKey, serializedState);
        } catch (error) {
            console.error('Failed to save profiles state:', error);
        }
    }
    
    /**
     * Creates a new profile with the given name
     */
    public createProfile(name: string): Profile {
        const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
        const timestamp = Date.now();
        
        // Create a new profile with default game state
        const newProfile: Profile = {
            id,
            name,
            gameState: {
                currentLevelIndex: 0,
                isGameRunning: false,
                noteHistory: {},
                recentAttempts: []
            },
            createdAt: timestamp,
            lastUsed: timestamp,
            displayPreferences: {
               showNoteNames: true,
               showAllNotes: false
           },
           levelRecords: {} // Initialize level records
       };
        
        // Add to profiles array
        this.profilesState.profiles.push(newProfile);
        
        // Set as active profile if none is active
        if (!this.profilesState.activeProfileId) {
            this.profilesState.activeProfileId = id;
        }
        
        this.saveProfilesState();
        return newProfile;
    }
    
    /**
     * Removes a profile by ID
     */
    public removeProfile(id: string): boolean {
        const initialLength = this.profilesState.profiles.length;
        this.profilesState.profiles = this.profilesState.profiles.filter(profile => profile.id !== id);
        
        // If the active profile was removed, set active to null or first available profile
        if (this.profilesState.activeProfileId === id) {
            this.profilesState.activeProfileId = this.profilesState.profiles.length > 0 
                ? this.profilesState.profiles[0].id 
                : null;
        }
        
        this.saveProfilesState();
        return initialLength !== this.profilesState.profiles.length;
    }
    
    /**
     * Updates a profile name
     */
    public updateProfileName(id: string, name: string): boolean {
        const profile = this.profilesState.profiles.find(p => p.id === id);
        
        if (!profile) {
            return false;
        }
        
        profile.name = name;
        this.saveProfilesState();
        return true;
    }
    
    /**
     * Sets the active profile
     */
    public setActiveProfile(id: string): boolean {
        const profile = this.profilesState.profiles.find(p => p.id === id);
        
        if (!profile) {
            return false;
        }
        
        this.profilesState.activeProfileId = id;
        profile.lastUsed = Date.now();
        this.saveProfilesState();
        return true;
    }
    
    /**
     * Gets the active profile
     */
    public getActiveProfile(): Profile | null {
        if (!this.profilesState.activeProfileId) {
            return null;
        }
        
        return this.profilesState.profiles.find(
            p => p.id === this.profilesState.activeProfileId
        ) || null;
    }
    
    /**
     * Updates the game state for the active profile
     */
    public updateActiveProfileGameState(gameState: GameState): boolean {
        const activeProfile = this.getActiveProfile();
        
        if (!activeProfile) {
            return false;
        }
        
        activeProfile.gameState = gameState;
        activeProfile.lastUsed = Date.now();
        this.saveProfilesState();
        return true;
    }
    
    /**
     * Gets all profiles
     */
    public getAllProfiles(): Profile[] {
        return [...this.profilesState.profiles];
    }
    
    /**
     * Clears all profiles data
     */
    public clearAllProfiles(): void {
        this.profilesState = {
            activeProfileId: null,
            profiles: []
        };
        
        this.saveProfilesState();
    }
    
    /**
     * Updates the display preferences for the active profile
     */
    public updateActiveProfileDisplayPreferences(preferences: { showNoteNames: boolean; showAllNotes: boolean }): boolean {
        const activeProfile = this.getActiveProfile();
        
        if (!activeProfile) {
            return false;
        }
        
        // Ensure displayPreferences exists
        if (!activeProfile.displayPreferences) {
            activeProfile.displayPreferences = {
                showNoteNames: true,
                showAllNotes: false
            };
        }
        
        // Update preferences
        activeProfile.displayPreferences = {
            ...activeProfile.displayPreferences,
            ...preferences
        };
        
        activeProfile.lastUsed = Date.now();
        this.saveProfilesState();
        return true;
    }
    
    /**
     * Gets the display preferences for the active profile
     */
    public getActiveProfileDisplayPreferences(): { showNoteNames: boolean; showAllNotes: boolean } | null {
        const activeProfile = this.getActiveProfile();
        
        if (!activeProfile) {
            return null;
        }
        
        // Ensure displayPreferences exists
        if (!activeProfile.displayPreferences) {
            activeProfile.displayPreferences = {
                showNoteNames: true,
                showAllNotes: false
            };
            this.saveProfilesState();
        }
        
        return activeProfile.displayPreferences;
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
} 