// ui-controller.js - UI interactions and display updates
export class UIController {
    constructor(gameLogic, scoreElement, grid) {
        this.gameLogic = gameLogic;
        this.scoreElement = scoreElement;
        this.grid = grid; // Store reference to the grid
    }

    // Update score display
    updateScoreDisplay(score) {
        this.scoreElement.textContent = score;
    }

    // Handle click events on grid cells
    async handleCellClick(event) {
        // Don't process clicks if game is over or won
        if (this.grid.gameState !== 'playing') {
            return;
        }
        
        const clickedCell = event.target;

        // Ignore clicks on non-cells or empty cells
        if (!clickedCell.classList.contains('grid-cell') || clickedCell.classList.contains('empty')) {
            return;
        }

        // Clear evaluation styling if any
        if (this.gameLogic.evaluated) {
            this.gameLogic.clearEvaluationStyles();
            this.gameLogic.selectedCells = [];
        }

        // Toggle selection state of clicked cell
        const selectionResult = this.gameLogic.toggleCellSelection(clickedCell);

        // If two cells are now selected, process the selection
        if (this.gameLogic.selectedCells.length === 2) {
            const result = this.gameLogic.processTwoCellSelection(this.grid);
            
            if (result && result.result === 'match') {
                // Check for blank rows and update score accordingly
                const additionalScore = await this.grid.checkForBlankRows();
                this.gameLogic.score += additionalScore;
                
                // Update score display
                this.updateScoreDisplay(this.gameLogic.score);
                
                // Check if game is won (all cells are empty)
                this.grid.checkForWin();

                // Recalculate the highest filled index
                this.grid.recalculateHighestFilledIndex();

                // Mark the refill starting point with blue border
                this.grid.updateRefillMarker();
            }
        }
    }

    // Handle restart button click
    handleRestartClick() {
        // Reset grid
        this.grid.resetGrid();
        
        // Reset game logic
        this.gameLogic.score = 0;
        this.gameLogic.selectedCells = [];
        this.gameLogic.evaluated = false;
        this.gameLogic.clearEvaluationStyles();
        
        // Update score display
        this.updateScoreDisplay(0);
    }

    // Handle refill button click
    async handleRefillClick() {
        // Don't refill if game is over or won
        if (this.grid.gameState !== 'playing') {
            return;
        }
        
        // Refill the grid
        const refillResult = this.grid.refillGrid();
        
        // If new rows were added, check for blank rows
        if (refillResult.cellsAdded > 0) {
            const additionalScore = await this.grid.checkForBlankRows();
            this.gameLogic.score += additionalScore;
        }
        
        // Update score display
        this.updateScoreDisplay(this.gameLogic.score);
    }

    // Set up event listeners
    setupEventListeners(gridContainer, restartButton, refillButton) {
        gridContainer.addEventListener('click', this.handleCellClick.bind(this));
        restartButton.addEventListener('click', this.handleRestartClick.bind(this));
        refillButton.addEventListener('click', this.handleRefillClick.bind(this));
    }
}