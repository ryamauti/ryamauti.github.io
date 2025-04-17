document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('game-grid');
    const scoreElement = document.getElementById('score-value'); // Get score element
    const rows = 10;
    const cols = 9;
    const totalCells = rows * cols;
    const initialFillRows = 3;
    let cells = []; // Array to hold references to all cell elements
    let selectedCells = [];
    let evaluated = false;
    let score = 0; // Initialize score

    // --- Helper Functions ---
    // Helper function to generate random integer
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Helper function to get row and column from index
    function getCoords(index) {
        return {
            row: Math.floor(index / cols),
            col: index % cols
        };
    }

    // Helper function to get index from row and column
    function getIndex(row, col) {
        if (row < 0 || row >= rows || col < 0 || col >= cols) {
            return -1; // Out of bounds
        }
        return row * cols + col;
    }

    // --- Helper: Find first non-empty cell in a row ---
    function findFirstNonEmptyInRow(rowIndex) {
        if (rowIndex < 0 || rowIndex >= rows) return null; // Out of bounds
        for (let c = 0; c < cols; c++) {
            const index = getIndex(rowIndex, c);
            const cell = cells[index];
            if (!cell.classList.contains('empty')) {
                return cell;
            }
        }
        return null; // Row is empty or out of bounds
    }

    // --- Helper: Find last non-empty cell in a row ---
    function findLastNonEmptyInRow(rowIndex) {
         if (rowIndex < 0 || rowIndex >= rows) return null; // Out of bounds
         for (let c = cols - 1; c >= 0; c--) {
             const index = getIndex(rowIndex, c);
             const cell = cells[index];
             if (!cell.classList.contains('empty')) {
                 return cell;
             }
         }
         return null; // Row is empty or out of bounds
    }


    // --- Updated areNeighbors function ---
    function areNeighbors(cell1, cell2) {
        const index1 = parseInt(cell1.dataset.index);
        const index2 = parseInt(cell2.dataset.index);
        const coords1 = getCoords(index1);
        const coords2 = getCoords(index2); // Need coords for cell2 as well

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
                const currentIndex = getIndex(r, c);
                if (currentIndex === -1) break; // Out of bounds

                const currentCell = cells[currentIndex];
                if (!currentCell.classList.contains('empty')) {
                    if (currentIndex === index2) return true; // Found cell2 as first non-empty
                    else break; // Found a different non-empty cell first
                }
                // Continue if empty
            }
        }

        // 2. Check Row Wrap-Around Adjacency
        // Check if cell1 is the last in its row AND cell2 is the first in the next row
        const lastInRow1 = findLastNonEmptyInRow(coords1.row);
        const firstInRow2 = findFirstNonEmptyInRow(coords1.row + 1); // Check row below cell1's row
        if (lastInRow1 === cell1 && firstInRow2 === cell2) {
            return true;
        }

        // Check the opposite: cell2 is last in its row AND cell1 is first in the next row
        const lastInRow2 = findLastNonEmptyInRow(coords2.row);
        const firstInRow1 = findFirstNonEmptyInRow(coords2.row + 1); // Check row below cell2's row
         if (lastInRow2 === cell2 && firstInRow1 === cell1) {
            return true;
        }

        // If none of the above conditions met
        return false;
    }

    // --- Function to update score display ---
    function updateScoreDisplay() {
        scoreElement.textContent = score;
    }

    // --- Function to remove cells (make them empty) ---
    function removeCells(cell1, cell2) {
        [cell1, cell2].forEach(cell => {
            cell.textContent = '';
            cell.classList.add('empty');
            cell.classList.remove('selected', 'evaluated-red', 'evaluated-dark-red');
        });
        selectedCells = [];
        evaluated = false;

        // Increment score and update display
        score++;
        updateScoreDisplay();
    }

    // --- Function to clear evaluation styles (reds) ---
    function clearEvaluationStyles() {
        // No changes needed here from previous version
        const evaluatedCells = gridContainer.querySelectorAll('.evaluated-red, .evaluated-dark-red');
        evaluatedCells.forEach(cell => {
            cell.classList.remove('evaluated-red', 'evaluated-dark-red');
        });
        evaluated = false;
    }


    // 1. Initialize Score Display
    updateScoreDisplay();

    // 2. Generate Grid Cells & Store References
    for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');
        cell.dataset.index = i;

        if (i < initialFillRows * cols) {
            cell.textContent = getRandomInt(1, 9);
        } else {
            cell.classList.add('empty');
            cell.textContent = '';
        }
        gridContainer.appendChild(cell);
        cells.push(cell); // Store reference
    }

    // 3. Add Click Event Listener
    gridContainer.addEventListener('click', (event) => {
        const clickedCell = event.target;

        if (!clickedCell.classList.contains('grid-cell') || clickedCell.classList.contains('empty')) {
            return;
        }

        if (evaluated) {
            clearEvaluationStyles();
            selectedCells = [];
        }

        const indexInSelection = selectedCells.findIndex(cell => cell === clickedCell);

        if (indexInSelection > -1) {
            clickedCell.classList.remove('selected');
            selectedCells.splice(indexInSelection, 1);
        } else {
            if (selectedCells.length === 0) {
                clickedCell.classList.add('selected');
                selectedCells.push(clickedCell);
            } else if (selectedCells.length === 1) {
                const cell1 = selectedCells[0];
                const cell2 = clickedCell;
                cell2.classList.add('selected');
                // selectedCells.push(cell2); // Don't push yet, evaluation decides fate

                const neighbors = areNeighbors(cell1, cell2); // Use updated neighbor check

                // --- Remove temporary yellow selection before applying result ---
                cell1.classList.remove('selected');
                cell2.classList.remove('selected');

                if (neighbors) {
                    const num1 = parseInt(cell1.textContent);
                    const num2 = parseInt(cell2.textContent);

                    if (num1 === num2 || num1 + num2 === 10) {
                        // Valid Removal - removeCells handles score update
                        removeCells(cell1, cell2);
                        // selectedCells already cleared in removeCells
                        evaluated = false; // Reset evaluation state
                    } else {
                        // Neighbors but Invalid Pair (dark red)
                        cell1.classList.add('evaluated-dark-red');
                        cell2.classList.add('evaluated-dark-red');
                        evaluated = true;
                    }
                } else {
                    // Not Neighbors (light red)
                    cell1.classList.add('evaluated-red');
                    cell2.classList.add('evaluated-red');
                    evaluated = true;
                }

                // Clear logical selection array if evaluation occurred (red/dark-red)
                if (evaluated) {
                    selectedCells = [];
                }
            }
        }
    });
});