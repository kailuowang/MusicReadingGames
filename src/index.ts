import { Game } from './game/Game';
import '../styles.css';
import { StorageManager } from './utils/StorageManager';
import { LevelData } from './data/LevelData';
import { LevelConfig } from './models/LevelConfig';
import { Note } from './models/Note';

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    const storageManager = new StorageManager('music-reading-game');
    
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
    const profileEditModal = document.getElementById('profile-edit-modal') as HTMLDivElement;
    const editProfileNameInput = document.getElementById('edit-profile-name') as HTMLInputElement;
    const saveProfileButton = document.getElementById('save-profile-button') as HTMLButtonElement;
    const deleteProfileButton = document.getElementById('delete-profile-button') as HTMLButtonElement;
    const modalCloseButton = document.querySelector('.modal-close-button') as HTMLSpanElement;
    
    // Current profile being edited
    let currentEditingProfileId: string | null = null;
    
    // Set up popup elements
    const statsPopup = document.getElementById('stats-popup') as HTMLDivElement;
    const closeButton = document.querySelector('.close-button') as HTMLSpanElement;
    const learnedNotesList = document.getElementById('learned-notes-list') as HTMLDivElement;
    const levelsList = document.getElementById('levels-list') as HTMLDivElement;
    const levelSelection = document.getElementById('level-selection') as HTMLDivElement;
    
    // Function to update UI based on game running state
    function updateGameRunningUI() {
        if (game.isGameRunning()) {
            startButton.style.display = 'none';
        } else {
            startButton.style.display = 'block';
        }
    }
    
    // Initialize UI state
    updateGameRunningUI();
    
    startButton.addEventListener('click', () => {
        console.log('Start button clicked');
        game.start();
        updateGameRunningUI();
    });
    
    resetButton.addEventListener('click', () => {
        console.log('Reset button clicked');
        game.reset();
        updateGameRunningUI();
    });
    
    clearStorageButton.addEventListener('click', () => {
        console.log('Clear Storage button clicked');
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
            
            // Update button text
            const showingNames = keyboard['showNoteNames'];
            toggleNamesButton.textContent = showingNames ? 'Hide Note Names' : 'Show Note Names';
            
            // Re-render keyboard if game is running
            if (game.isGameRunning()) {
                const currentLevel = game['currentLevel'];
                if (currentLevel) {
                    const availableNotes = currentLevel.getAvailableNotes();
                    keyboard.renderKeyboard(availableNotes, (note: Note) => {
                        game['checkAnswer'](note);
                    });
                }
            }
        }
    });
    
    toggleAllKeysButton.addEventListener('click', () => {
        const keyboard = game['keyboardRenderer'];
        if (keyboard) {
            keyboard.toggleShowAllKeys();
            
            // Update button text
            const showingAll = keyboard['showAllKeys'];
            toggleAllKeysButton.textContent = showingAll ? 'Hide Unavailable Notes' : 'Show All Notes';
            
            // Re-render keyboard if game is running
            if (game.isGameRunning()) {
                const currentLevel = game['currentLevel'];
                if (currentLevel) {
                    const availableNotes = currentLevel.getAvailableNotes();
                    keyboard.renderKeyboard(availableNotes, (note: Note) => {
                        game['checkAnswer'](note);
                    });
                }
            }
        }
    });
    
    // Stats button and popup functionality
    statsButton.addEventListener('click', () => {
        console.log('Stats button clicked');
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
    
    saveProfileButton.addEventListener('click', () => {
        if (currentEditingProfileId) {
            const newName = editProfileNameInput.value.trim();
            if (newName) {
                game.updateProfileName(currentEditingProfileId, newName);
                profileEditModal.classList.remove('active');
                updateProfilesList();
            }
        }
    });
    
    deleteProfileButton.addEventListener('click', () => {
        if (currentEditingProfileId && confirm('Are you sure you want to delete this profile? All progress will be lost.')) {
            game.removeProfile(currentEditingProfileId);
            profileEditModal.classList.remove('active');
            updateProfilesList();
        }
    });
    
    modalCloseButton.addEventListener('click', () => {
        profileEditModal.classList.remove('active');
    });
    
    // Close the modal when clicking outside the content
    window.addEventListener('click', (event) => {
        if (event.target === profileEditModal) {
            profileEditModal.classList.remove('active');
        }
    });
    
    // Function to open the profile edit modal
    function openProfileEditModal(profileId: string, profileName: string) {
        currentEditingProfileId = profileId;
        editProfileNameInput.value = profileName;
        profileEditModal.classList.add('active');
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
            editButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent the profile selection when clicking edit
                openProfileEditModal(profile.id, profile.name);
            });
            
            profileItem.appendChild(profileNameSpan);
            profileItem.appendChild(editButton);
            
            // Select this profile when clicking on it
            profileItem.addEventListener('click', () => {
                if (!profile.isActive) {
                    game.setActiveProfile(profile.id);
                    updateProfilesList();
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
                        `<span class="note-tag">${note.name}${note.octave}</span>`
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
                        `<span class="note-tag">${note.name}${note.octave}</span>`
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
    
    function updateLevelsInfo() {
        levelsList.innerHTML = '';
        
        // Get all levels from LevelData
        const levels = LevelData.levels;
        
        // Get current game state for highlighting current level
        const gameState = storageManager.loadState();
        const currentLevelIndex = gameState ? gameState.currentLevelIndex : -1;
        
        levels.forEach((level, index) => {
            const levelItem = document.createElement('div');
            levelItem.className = 'level-item';
            if (index === currentLevelIndex) {
                levelItem.style.borderLeftColor = '#e74c3c'; // Highlight current level
            }
            
            const notesHtml = level.notes.map(note => {
                // If this is the new note in this level, highlight it
                const isNewNote = level.newNote && note.name === level.newNote.name && 
                                 note.clef === level.newNote.clef && 
                                 note.position === level.newNote.position &&
                                 note.octave === level.newNote.octave;
                                 
                return `<span class="note-tag ${isNewNote ? 'new' : ''}">${note.name}${note.octave} (${note.clef})</span>`;
            }).join('');
            
            levelItem.innerHTML = `
                <div class="level-title">Level ${level.id}: ${level.name} ${index === currentLevelIndex ? '(Current)' : ''}</div>
                <div class="level-description">${level.description}</div>
                <div class="level-notes">
                    ${notesHtml}
                </div>
            `;
            
            levelsList.appendChild(levelItem);
        });
    }
    
    function updateStatsPopup() {
        updateProfilesList();
        updateLearnedNotes();
        updateLevelsInfo();
        updateLevelSelection();
    }
}); 