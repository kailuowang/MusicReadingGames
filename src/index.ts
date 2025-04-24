import { Game } from './game/Game';
import '../styles.css';
import { StorageManager } from './utils/StorageManager';
import { LevelData } from './data/LevelData';
import { LevelConfig } from './models/LevelConfig';
import { Note } from './models/Note';
import { AudioPlayer } from './utils/AudioPlayer';
import { NoteUtils } from './utils/NoteUtils';

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    const storageManager = new StorageManager('music-reading-game');
    const audioPlayer = AudioPlayer.getInstance();
    
    // Set up button listeners
    const startButton = document.getElementById('start-button') as HTMLButtonElement;
    const resetButton = document.getElementById('reset-button') as HTMLButtonElement;
    const clearStorageButton = document.getElementById('clear-storage-button') as HTMLButtonElement;
    const statsButton = document.getElementById('stats-button') as HTMLButtonElement;
    const toggleNamesButton = document.getElementById('toggle-names-button') as HTMLButtonElement;
    const toggleAllKeysButton = document.getElementById('toggle-all-keys-button') as HTMLButtonElement;
    
    // Set up profile-related elements
    const profilesList = document.getElementById('profiles-list') as HTMLDivElement;
    const newProfileNameInput = document.getElementById('new-profile-name') as HTMLInputElement;
    const addProfileButton = document.getElementById('add-profile-button') as HTMLButtonElement;
    
    // Current profile being edited
    let currentEditingProfileId: string | null = null;
    
    // Set up popup elements
    const statsPopup = document.getElementById('stats-popup') as HTMLDivElement;
    const closeButton = document.querySelector('.close-button') as HTMLSpanElement;
    const learnedNotesList = document.getElementById('learned-notes-list') as HTMLDivElement;
    const levelSelection = document.getElementById('level-selection') as HTMLDivElement;
    
    // Function to update UI based on game running state
    function updateGameRunningUI() {
        if (game.isGameRunning()) {
            startButton.style.display = 'none';
        } else {
            startButton.style.display = 'block';
        }
    }
    
    // Initialize UI state immediately - this will hide the Start button 
    // if the game was automatically started from the saved state
    updateGameRunningUI();
    
    // Listen for game state changes
    document.addEventListener('gameStateChanged', (event: Event) => {
        // Update UI based on the new game state
        updateGameRunningUI();
    });
    
    startButton.addEventListener('click', () => {
        // Initialize and force resume audio explicitly on user interaction
        audioPlayer.initialize();
        audioPlayer.forceResumeContext(); // Force resume within user gesture
        
        game.start();
        updateGameRunningUI();
    });
    
    resetButton.addEventListener('click', () => {
        if (confirm('This will reset your current profile progress. Are you sure?')) {
            game.reset();
            updateGameRunningUI();
            statsPopup.classList.remove('active');
        }
    });
    
    clearStorageButton.addEventListener('click', () => {
        if (confirm('This will reset all profiles and game progress. Are you sure?')) {
            game.resetAllProfiles();
            alert('All profiles and game progress have been reset!');
            statsPopup.classList.remove('active');
        }
    });
    
    // Toggle buttons for piano keyboard
    toggleNamesButton.addEventListener('click', () => {
        const keyboard = game['keyboardRenderer'];
        if (keyboard) {
            keyboard.toggleNoteNames();
            
            // Get updated state
            const showingNames = keyboard['showNoteNames'];
            
            // Update button text
            toggleNamesButton.textContent = showingNames ? 'Hide Note Names' : 'Show Note Names';
            
            // Save preference to profile
            game.updateDisplayPreferences({ showNoteNames: showingNames });
            
            // Re-render keyboard if game is running
            if (game.isGameRunning()) {
                const currentLevel = game['currentLevel'];
                if (currentLevel) {
                    const availableNotes = currentLevel.getAvailableNotes();
                    keyboard.renderKeyboard(availableNotes, (note: Note) => {
                        game['checkAnswer'](note);
                    }, currentLevel.getCurrentNote().clef);
                }
            }
        }
    });
    
    toggleAllKeysButton.addEventListener('click', () => {
        const keyboard = game['keyboardRenderer'];
        if (keyboard) {
            keyboard.toggleShowAllKeys();
            
            // Get updated state
            const showingAll = keyboard['showAllKeys'];
            
            // Update button text
            toggleAllKeysButton.textContent = showingAll ? 'Hide Unavailable Notes' : 'Show All Notes';
            
            // Save preference to profile
            game.updateDisplayPreferences({ showAllNotes: showingAll });
            
            // Re-render keyboard if game is running
            if (game.isGameRunning()) {
                const currentLevel = game['currentLevel'];
                if (currentLevel) {
                    const availableNotes = currentLevel.getAvailableNotes();
                    keyboard.renderKeyboard(availableNotes, (note: Note) => {
                        game['checkAnswer'](note);
                    }, currentLevel.getCurrentNote().clef);
                }
            }
        }
    });
    
    // Stats button and popup functionality
    statsButton.addEventListener('click', () => {
        updateStatsPopup();
        statsPopup.classList.add('active');
    });
    
    closeButton.addEventListener('click', () => {
        statsPopup.classList.remove('active');
    });
    
    // Profile management
    addProfileButton.addEventListener('click', () => {
        const profileName = newProfileNameInput.value.trim();
        if (profileName) {
            game.createProfile(profileName);
            newProfileNameInput.value = '';
            updateProfilesList();
        }
    });
    
    // Function to toggle inline edit form visibility
    function toggleEditForm(profileItem: HTMLElement, show: boolean) {
        // Close any currently open edit forms
        const allProfileItems = profilesList.querySelectorAll('.profile-item');
        allProfileItems.forEach(item => {
            if (item !== profileItem) {
                item.classList.remove('editing');
            }
        });
        
        if (show) {
            profileItem.classList.add('editing');
        } else {
            profileItem.classList.remove('editing');
            currentEditingProfileId = null;
        }
    }
    
    // Function to handle profile name save
    function saveProfileName(profileId: string, nameInput: HTMLInputElement) {
        const newName = nameInput.value.trim();
        if (newName) {
            game.updateProfileName(profileId, newName);
            updateProfilesList();
        }
    }
    
    // Function to handle profile deletion
    function deleteProfile(profileId: string) {
        if (confirm('Are you sure you want to delete this profile? All progress will be lost.')) {
            game.removeProfile(profileId);
            updateProfilesList();
        }
    }
    
    // Function to render the profiles list
    function updateProfilesList() {
        profilesList.innerHTML = '';
        
        const profiles = game.getAllProfiles();
        
        if (profiles.length === 0) {
            profilesList.innerHTML = '<p class="no-profiles">No profiles available</p>';
            return;
        }
        
        // Sort profiles by last used (most recent first)
        profiles.sort((a, b) => b.lastUsed - a.lastUsed);
        
        profiles.forEach(profile => {
            const profileItem = document.createElement('div');
            profileItem.className = `profile-item ${profile.isActive ? 'active' : ''}`;
            
            const profileNameSpan = document.createElement('span');
            profileNameSpan.className = 'profile-name';
            profileNameSpan.textContent = profile.name;
            
            const editButton = document.createElement('button');
            editButton.className = 'profile-edit-button';
            editButton.textContent = 'Edit';
            
            // Create edit form (initially hidden)
            const editForm = document.createElement('div');
            editForm.className = 'profile-edit-form-inline';
            
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.className = 'edit-profile-input';
            nameInput.value = profile.name;
            nameInput.placeholder = 'Profile name';
            
            const actionButtons = document.createElement('div');
            actionButtons.className = 'profile-edit-actions';
            
            const saveButton = document.createElement('button');
            saveButton.className = 'save-profile-button';
            saveButton.textContent = 'Save';
            
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-profile-button danger';
            deleteButton.textContent = 'Delete';
            
            const cancelButton = document.createElement('button');
            cancelButton.className = 'cancel-edit-button';
            cancelButton.textContent = 'Cancel';
            
            // Add event listeners
            editButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent the profile selection when clicking edit
                currentEditingProfileId = profile.id;
                toggleEditForm(profileItem, true);
            });
            
            saveButton.addEventListener('click', (e) => {
                e.stopPropagation();
                saveProfileName(profile.id, nameInput);
                toggleEditForm(profileItem, false);
            });
            
            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteProfile(profile.id);
            });
            
            cancelButton.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleEditForm(profileItem, false);
            });
            
            // Also save when pressing Enter on the input
            nameInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    saveProfileName(profile.id, nameInput);
                    toggleEditForm(profileItem, false);
                }
            });
            
            // Assemble the edit form
            actionButtons.appendChild(saveButton);
            actionButtons.appendChild(cancelButton);
            actionButtons.appendChild(deleteButton);
            
            editForm.appendChild(nameInput);
            editForm.appendChild(actionButtons);
            
            // Add elements to profile item
            profileItem.appendChild(profileNameSpan);
            profileItem.appendChild(editButton);
            profileItem.appendChild(editForm);
            
            // Select this profile when clicking on it
            profileItem.addEventListener('click', (e) => {
                // Only select if not in edit mode and we're not clicking a button or input
                const target = e.target as HTMLElement;
                if (!profileItem.classList.contains('editing') && 
                    target.tagName !== 'BUTTON' && 
                    target.tagName !== 'INPUT') {
                    if (!profile.isActive) {
                        game.setActiveProfile(profile.id);
                        updateProfilesList();
                    }
                }
            });
            
            profilesList.appendChild(profileItem);
        });
    }
    
    function updateLevelSelection() {
        levelSelection.innerHTML = '';
        
        // Get the current game state
        const gameState = storageManager.loadState();
        const currentLevelIndex = gameState ? gameState.currentLevelIndex : 0;
        
        // Create a button for each level
        LevelData.levels.forEach((level, index) => {
            const levelButton = document.createElement('button');
            levelButton.className = 'level-button';
            if (index === currentLevelIndex) {
                levelButton.classList.add('current');
            }
            levelButton.textContent = `Level ${index + 1}: ${level.name}`;
            
            // Add click event to change to this level
            levelButton.addEventListener('click', () => {
                game.setLevel(index);
                
                // Close the popup
                statsPopup.classList.remove('active');
                
                // If game isn't running, start it
                if (!game.isGameRunning()) {
                    game.start();
                    updateGameRunningUI();
                }
            });
            
            levelSelection.appendChild(levelButton);
        });
    }
    
    function updateLearnedNotes() {
        learnedNotesList.innerHTML = '';
        
        // Get the current game state
        const gameState = storageManager.loadState();
        
        // If no game state yet, show a message
        if (!gameState) {
            learnedNotesList.innerHTML = '<p>Start the game to see learned notes!</p>';
            return;
        }
        
        const currentLevelIndex = gameState.currentLevelIndex;
        const levels = LevelData.levels;
        
        // If game hasn't started or we don't have a valid level index
        if (currentLevelIndex < 0 || currentLevelIndex >= levels.length) {
            learnedNotesList.innerHTML = '<p>No notes learned yet.</p>';
            return;
        }
        
        // Get all notes learned up to the current level
        const currentLevel = levels[currentLevelIndex];
        let learnedNotes: Note[] = [];
        
        // For the first level with all treble clef spaces
        if (currentLevelIndex === 0) {
            learnedNotes = currentLevel.notes;
        } 
        // For levels with progressive learning
        else if (currentLevel.learnedNotes) {
            learnedNotes = [...currentLevel.learnedNotes];
            if (currentLevel.newNote) {
                learnedNotes.push(currentLevel.newNote);
            }
        } 
        // Fallback for other levels
        else {
            learnedNotes = currentLevel.notes;
        }
        
        // Group notes by clef
        const trebleNotes = learnedNotes.filter(note => note.clef === 'treble');
        const bassNotes = learnedNotes.filter(note => note.clef === 'bass');
        
        // Display treble clef notes
        if (trebleNotes.length > 0) {
            const trebleGroup = document.createElement('div');
            trebleGroup.className = 'note-group';
            trebleGroup.innerHTML = `
                <h4>Treble Clef Notes</h4>
                <div class="level-notes">
                    ${trebleNotes.map(note => 
                        `<span class="note-tag">${NoteUtils.getNoteLabel(note)}</span>`
                    ).join('')}
                </div>
            `;
            learnedNotesList.appendChild(trebleGroup);
        }
        
        // Display bass clef notes
        if (bassNotes.length > 0) {
            const bassGroup = document.createElement('div');
            bassGroup.className = 'note-group';
            bassGroup.innerHTML = `
                <h4>Bass Clef Notes</h4>
                <div class="level-notes">
                    ${bassNotes.map(note => 
                        `<span class="note-tag">${NoteUtils.getNoteLabel(note)}</span>`
                    ).join('')}
                </div>
            `;
            learnedNotesList.appendChild(bassGroup);
        }
        
        // If still no notes
        if (trebleNotes.length === 0 && bassNotes.length === 0) {
            learnedNotesList.innerHTML = '<p>No notes learned yet.</p>';
        }
    }
    
    function updateStatsPopup() {
        updateProfilesList();
        updateLearnedNotes();
        updateLevelSelection();
        updateToggleButtonsText();
    }
    
    /**
     * Update the toggle buttons text based on current display preferences
     */
    function updateToggleButtonsText() {
        const activeProfile = game.getActiveProfile();
        if (activeProfile && activeProfile.displayPreferences) {
            const { showNoteNames, showAllNotes } = activeProfile.displayPreferences;
            toggleNamesButton.textContent = showNoteNames ? 'Hide Note Names' : 'Show Note Names';
            toggleAllKeysButton.textContent = showAllNotes ? 'Hide Unavailable Notes' : 'Show All Notes';
        }
    }
    
    // Initial update of profiles list
    updateProfilesList();
}); 