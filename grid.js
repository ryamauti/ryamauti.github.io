// grid.js - Grid creation and management
import { getRandomInt, getCoords, getIndex } from './utils.js';

export class Grid {
    constructor(rows, cols, initialFillRows) {
        this.rows = rows;
        this.cols = cols;
        this.totalCells = rows * cols;
        this.initialFillRows = initialFillRows;
        this.cells = [];
    }

    // Create grid cells and append to container
    createGrid(gridContainer) {
        for (let i = 0; i < this.totalCells; i++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.dataset.index = i;
            
            gridContainer.appendChild(cell);
            this.cells.push(cell);
        }

        this.resetGrid();

        return this.cells;
    }

    // Reset grid to create new game
    resetGrid() {
        this.cells.forEach((cell, i) => {
            if (i < this.initialFillRows * this.cols) {
                cell.textContent = getRandomInt(1, 9);
                cell.classList.remove('empty', 'selected', 'evaluated-red', 'evaluated-dark-red', 'refill-marker');
            } else {
                cell.classList.add('empty');
                cell.classList.remove('selected', 'evaluated-red', 'evaluated-dark-red', 'refill-marker');
                cell.textContent = '';
            }
        });
        
        // Recalculate the highest filled index
        this.recalculateHighestFilledIndex();
        
        // Reset game state
        this.gameState = 'playing';
        document.getElementById('game-grid').classList.remove('game-over', 'game-win');
        
        // Mark the refill starting point
        this.updateRefillMarker();
    }

    // Calculate the highest filled index based on the current grid state
    recalculateHighestFilledIndex() {
        let lastFilledIndex = -1;
        
        // Find the last cell with content
        for (let i = 0; i < this.totalCells; i++) {
            if (this.cells[i].textContent.trim() !== '') {
                lastFilledIndex = i;
            }
        }
        
        this.highestFilledIndex = lastFilledIndex;
        return this.highestFilledIndex;
    }

    // Check if a row can be cleared (all cells are either empty or blank)
    canClearRow(rowIndex) {
        for (let col = 0; col < this.cols; col++) {
            const index = getIndex(rowIndex, col, this.rows, this.cols);
            // Check if the cell has content (not empty and has a value)
            if (!this.cells[index].classList.contains('empty')) {
                return false; // Row cannot be cleared
            }
            
        }
        return true;
    }

    // Highlight a row with green animation
    highlightRow(rowIndex) {
        return new Promise(resolve => {
            // Add highlight class to all cells in the row
            for (let col = 0; col < this.cols; col++) {
                const index = getIndex(rowIndex, col, this.rows, this.cols);
                this.cells[index].classList.add('highlight-green');
            }
            
            // Resolve after animation time
            setTimeout(() => {
                // Remove highlight class
                for (let col = 0; col < this.cols; col++) {
                    const index = getIndex(rowIndex, col, this.rows, this.cols);
                    this.cells[index].classList.remove('highlight-green');
                }
                resolve();
            }, 800); // Animation duration
        });
    }

    // Update the visual marker for the refill starting point
    updateRefillMarker() {
        // Remove refill marker class from all cells
        this.cells.forEach(cell => cell.classList.remove('refill-marker'));
        
        // Add marker to the next cell after highestFilledIndex
        const nextIndex = this.highestFilledIndex + 1;
        if (nextIndex < this.totalCells) {
            this.cells[nextIndex].classList.add('refill-marker');
        }
        
        // Add CSS for the refill marker if it doesn't exist
        if (!document.getElementById('refill-marker-style')) {
            const style = document.createElement('style');
            style.id = 'refill-marker-style';
            style.textContent = `
                .refill-marker {
                    border: 2px solid blue !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Remove a row and shift all content upward
    async removeRow(rowIndex) {
        // First highlight the row
        await this.highlightRow(rowIndex);
        
        // Move cells from rows below up one row
        for (let row = rowIndex; row < this.rows - 1; row++) {
            for (let col = 0; col < this.cols; col++) {
                const currentIndex = getIndex(row, col, this.rows, this.cols);
                const belowIndex = getIndex(row + 1, col, this.rows, this.cols);
                
                // Copy data from the cell below
                this.cells[currentIndex].textContent = this.cells[belowIndex].textContent;
                
                // Copy classes
                if (this.cells[belowIndex].classList.contains('empty')) {
                    this.cells[currentIndex].classList.add('empty');
                } else {
                    this.cells[currentIndex].classList.remove('empty');
                }
            }
        }
        
        // Clear the bottom row
        for (let col = 0; col < this.cols; col++) {
            const bottomIndex = getIndex(this.rows - 1, col, this.rows, this.cols);
            this.cells[bottomIndex].textContent = '';
            this.cells[bottomIndex].classList.add('empty');
        }
        
        // Recalculate the highest filled index after row removal
        this.recalculateHighestFilledIndex();
        
        // Update the visual marker for the refill starting point
        this.updateRefillMarker();
        
        return 10; // Return points for removing a row
    }

    // Check for and process clearable rows - only in the initially filled rows area
    async checkForBlankRows() {
        let additionalScore = 0;
        let rowCleared = false;
        
        // Only check the rows that were originally filled with numbers
        let maxrow = Math.floor(this.highestFilledIndex / 9);
        for (let row = 0; row < maxrow; row++) {
            if (this.canClearRow(row)) {
                additionalScore += await this.removeRow(row);
                rowCleared = true;
                // Don't increment row as we need to recheck the same position
                // since rows have shifted
                row--; 
                maxrow--;
            }
        }
        
        return additionalScore;
    }

    // Check if the game is won (all cells are empty)
    checkForWin() {
        for (let i = 0; i < this.totalCells; i++) {
            if (!this.cells[i].classList.contains('empty') && this.cells[i].textContent.trim() !== '') {
                return false;
            }
        }
        this.gameState = 'win';
        document.getElementById('game-grid').classList.add('game-win');
        return true;
    }

    // Refill grid with new numbers based on remaining cells
    refillGrid() {
        // First check if player has won
        if (this.checkForWin()) {
            return { cellsAdded: 0, additionalScore: 0, gameState: 'win' };
        }
                
        // Make sure highestFilledIndex is accurate
        this.recalculateHighestFilledIndex();
        // Start filling one position after the highest filled index
        const startFillIndex = this.highestFilledIndex + 1;      

        // Count non-empty cells to determine how many new cells to add        
        let nonEmptyCellArray = [];
        for (let i = 0; i < startFillIndex; i++) {
            if (!this.cells[i].classList.contains('empty') && this.cells[i].textContent.trim() !== '') {                
                nonEmptyCellArray.push(this.cells[i].textContent.trim());
            }
        }
        let cellsAdded = nonEmptyCellArray.length;

        // Check if refill would go beyond available space
        if (this.highestFilledIndex + cellsAdded > this.totalCells) {
            this.gameState = 'game-over';
            // redue the nonEmptyCellArray to only include the cells that can be added
            cellsAdded = this.totalCells - startFillIndex;
            nonEmptyCellArray = nonEmptyCellArray.slice(0, cellsAdded);
        }

        // Add new cells according to nonEmptyCellArray
        for (let i = 0; i < nonEmptyCellArray.length; i++) {
            const cell = this.cells[i + startFillIndex];
            cell.textContent = nonEmptyCellArray[i]
            cell.classList.remove('empty');            
        }
        
        if (this.gameState == 'game-over') {
            document.getElementById('game-grid').classList.add('game-over');
            return { cellsAdded, additionalScore: 0, gameState: 'game-over' };
        }

        // Recalculate highest filled index after adding new cells
        this.recalculateHighestFilledIndex();
        
        // Update the visual marker for the refill starting point
        this.updateRefillMarker();

        return { cellsAdded, additionalScore: 0, gameState: 'playing' };
    }
}