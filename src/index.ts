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
    
    // Set up popup elements
    const statsPopup = document.getElementById('stats-popup') as HTMLDivElement;
    const closeButton = document.querySelector('.close-button') as HTMLSpanElement;
    const learnedNotesList = document.getElementById('learned-notes-list') as HTMLDivElement;
    const levelsList = document.getElementById('levels-list') as HTMLDivElement;
    
    startButton.addEventListener('click', () => {
        console.log('Start button clicked');
        game.start();
    });
    
    resetButton.addEventListener('click', () => {
        console.log('Reset button clicked');
        game.reset();
    });
    
    clearStorageButton.addEventListener('click', () => {
        console.log('Clear Storage button clicked');
        storageManager.clearState();
        alert('Storage cleared! Refresh the page to start with fresh state.');
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
    
    // Close the popup when clicking outside the content
    window.addEventListener('click', (event) => {
        if (event.target === statsPopup) {
            statsPopup.classList.remove('active');
        }
    });
    
    function updateStatsPopup() {
        updateLearnedNotes();
        updateLevelsInfo();
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
                        `<span class="note-tag">${note.name}</span>`
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
                        `<span class="note-tag">${note.name}</span>`
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
                                 note.position === level.newNote.position;
                                 
                return `<span class="note-tag ${isNewNote ? 'new' : ''}">${note.name} (${note.clef})</span>`;
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
}); 