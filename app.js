// app.js - Main application initialization
import { Grid } from './grid.js';
import { GameLogic } from './game-logic.js';
import { UIController } from './ui-controller.js';

document.addEventListener('DOMContentLoaded', () => {
    // Game configuration
    const ROWS = 10;
    const COLS = 9;
    const INITIAL_FILL_ROWS = 3;
    
    // Get DOM elements
    const gridContainer = document.getElementById('game-grid');
    const scoreElement = document.getElementById('score-value');
    const restartButton = document.getElementById('restart-button');
    const refillButton = document.getElementById('refill-button');
    
    // Initialize game components
    const grid = new Grid(ROWS, COLS, INITIAL_FILL_ROWS);
    const cells = grid.createGrid(gridContainer);
    
    const gameLogic = new GameLogic(ROWS, COLS, cells);
    const uiController = new UIController(gameLogic, scoreElement, grid);
    
    // Set up UI event handlers
    uiController.setupEventListeners(gridContainer, restartButton, refillButton);
    
    // Initialize score display
    uiController.updateScoreDisplay(gameLogic.score);
});
