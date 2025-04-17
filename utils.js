// utils.js - Utility helper functions

// Generate random integer between min and max (inclusive)
export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Convert linear index to row, column coordinates
export function getCoords(index, cols) {
    return {
        row: Math.floor(index / cols),
        col: index % cols
    };
}

// Convert row, column coordinates to linear index
export function getIndex(row, col, rows, cols) {
    if (row < 0 || row >= rows || col < 0 || col >= cols) {
        return -1; // Out of bounds
    }
    return row * cols + col;
}

// Find first non-empty cell in a row
export function findFirstNonEmptyInRow(rowIndex, cols, cells) {
    if (rowIndex < 0 || rowIndex >= cells.length / cols) return null; // Out of bounds
    for (let c = 0; c < cols; c++) {
        const index = getIndex(rowIndex, c, cells.length / cols, cols);
        const cell = cells[index];
        if (!cell.classList.contains('empty')) {
            return cell;
        }
    }
    return null; // Row is empty or out of bounds
}

// Find last non-empty cell in a row
export function findLastNonEmptyInRow(rowIndex, cols, cells) {
    if (rowIndex < 0 || rowIndex >= cells.length / cols) return null; // Out of bounds
    for (let c = cols - 1; c >= 0; c--) {
        const index = getIndex(rowIndex, c, cells.length / cols, cols);
        const cell = cells[index];
        if (!cell.classList.contains('empty')) {
            return cell;
        }
    }
    return null; // Row is empty or out of bounds
}