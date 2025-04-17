// game-logic.js - Core game mechanics and rules
import { getCoords, getIndex, findFirstNonEmptyInRow, findLastNonEmptyInRow } from './utils.js';

export class GameLogic {
    constructor(rows, cols, cells) {
        this.rows = rows;
        this.cols = cols;
        this.cells = cells;
        this.score = 0;
        this.selectedCells = [];
        this.evaluated = false;
    }

    // Determine if two cells are neighbors according to game rules
    areNeighbors(cell1, cell2) {
        const index1 = parseInt(cell1.dataset.index);
        const index2 = parseInt(cell2.dataset.index);
        const coords1 = getCoords(index1, this.cols);
        const coords2 = getCoords(index2, this.cols);

        // 1. Check Standard Adjacency (Horizontal, Vertical, Diagonal - skipping empty)
        const directions = [
            { dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 },
            { dr: -1, dc: -1 }, { dr: -1, dc: 1 }, { dr: 1, dc: -1 }, { dr: 1, dc: 1 }
        ];
        for (const dir of directions) {
            let r = coords1.row;
            let c = coords1.col;
            while (true) {
                r += dir.dr;
                c += dir.dc;
                const currentIndex = getIndex(r, c, this.rows, this.cols);
                if (currentIndex === -1) break; // Out of bounds

                const currentCell = this.cells[currentIndex];
                if (!currentCell.classList.contains('empty')) {
                    if (currentIndex === index2) return true; // Found cell2 as first non-empty
                    else break; // Found a different non-empty cell first
                }
                // Continue if empty
            }
        }

        // 2. Check Row Wrap-Around Adjacency
        // Check if cell1 is the last in its row AND cell2 is the first in the next row
        const lastInRow1 = findLastNonEmptyInRow(coords1.row, this.cols, this.cells);
        const firstInRow2 = findFirstNonEmptyInRow(coords1.row + 1, this.cols, this.cells);
        if (lastInRow1 === cell1 && firstInRow2 === cell2) {
            return true;
        }

        // Check the opposite: cell2 is last in its row AND cell1 is first in the next row
        const lastInRow2 = findLastNonEmptyInRow(coords2.row, this.cols, this.cells);
        const firstInRow1 = findFirstNonEmptyInRow(coords2.row + 1, this.cols, this.cells);
        if (lastInRow2 === cell2 && firstInRow1 === cell1) {
            return true;
        }

        // If none of the above conditions met
        return false;
    }

    // Check if two cells can be matched according to game rules
    canMatch(cell1, cell2) {
        if (!this.areNeighbors(cell1, cell2)) {
            return false;
        }

        const num1 = parseInt(cell1.textContent);
        const num2 = parseInt(cell2.textContent);
        return (num1 === num2 || num1 + num2 === 10);
    }

    // Handle removal of matched cells
    removeMatchedCells(cell1, cell2, grid) {
        [cell1, cell2].forEach(cell => {            
            cell.classList.add('empty');
            cell.classList.remove('selected', 'evaluated-red', 'evaluated-dark-red');
        });
        this.selectedCells = [];
        this.evaluated = false;
        this.score++;
        
        // Return the new score
        return this.score;
    }

    // Add/remove a cell from selection
    toggleCellSelection(cell) {
        const indexInSelection = this.selectedCells.findIndex(selected => selected === cell);
        
        if (indexInSelection > -1) {
            cell.classList.remove('selected');
            this.selectedCells.splice(indexInSelection, 1);
            return 'removed';
        } else if (this.selectedCells.length < 2) {
            cell.classList.add('selected');
            this.selectedCells.push(cell);
            return 'added';
        }
        
        return 'ignored';
    }

    // Clear evaluation styling
    clearEvaluationStyles() {
        const evaluatedCells = document.querySelectorAll('.evaluated-red, .evaluated-dark-red');
        evaluatedCells.forEach(cell => {
            cell.classList.remove('evaluated-red', 'evaluated-dark-red');
        });
        this.evaluated = false;
    }

    // Process selection when two cells are selected
    processTwoCellSelection(grid) {
        if (this.selectedCells.length !== 2) return null;

        const [cell1, cell2] = this.selectedCells;
        cell1.classList.remove('selected');
        cell2.classList.remove('selected');

        if (this.areNeighbors(cell1, cell2)) {
            const num1 = parseInt(cell1.textContent);
            const num2 = parseInt(cell2.textContent);

            if (num1 === num2 || num1 + num2 === 10) {
                // Valid match
                const newScore = this.removeMatchedCells(cell1, cell2, grid);
                
                // Check for blank rows (async) and update score
                return { result: 'match', score: newScore };
            } else {
                // Neighbors but invalid pair
                cell1.classList.add('evaluated-dark-red');
                cell2.classList.add('evaluated-dark-red');
                this.evaluated = true;
                this.selectedCells = [];
                return { result: 'invalid-pair' };
            }
        } else {
            // Not neighbors
            cell1.classList.add('evaluated-red');
            cell2.classList.add('evaluated-red');
            this.evaluated = true;
            this.selectedCells = [];
            return { result: 'not-neighbors' };
        }
    }
}