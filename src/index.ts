import { Game } from './game/Game';
import '../styles.css';
import { StorageManager } from './utils/StorageManager';

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    const storageManager = new StorageManager('music-reading-game');
    
    // Set up button listeners
    const startButton = document.getElementById('start-button') as HTMLButtonElement;
    const resetButton = document.getElementById('reset-button') as HTMLButtonElement;
    const clearStorageButton = document.getElementById('clear-storage-button') as HTMLButtonElement;
    
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
}); 