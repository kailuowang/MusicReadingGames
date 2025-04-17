import { Game } from './game/Game';
import '../styles.css';

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    
    // Set up button listeners
    const startButton = document.getElementById('start-button') as HTMLButtonElement;
    const resetButton = document.getElementById('reset-button') as HTMLButtonElement;
    
    startButton.addEventListener('click', () => {
        game.start();
    });
    
    resetButton.addEventListener('click', () => {
        game.reset();
    });
}); 