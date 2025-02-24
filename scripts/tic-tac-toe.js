"use strict";

const topLeftCellIndex = 0;
const centerCellIndex = 4;
const bottomRightCellIndex = 8;

const State = {
    OVER : -1,
    DRAW : 0,
    ONGOING : 1,
};

class Board {
    constructor(cells) {
        this.cells = cells;
        this.cellsContent = cells.map(item => item.textContent);
        this.state = State.ONGOING;
        this.changedIndices = [];
    }

    updateCellsContents() {
        this.cellsContent = this.cells.map(item => item.textContent);
    }

    updateGameBoard() {
        this.cells = this.cells.map( (item, index) => {
            item.textContent = this.cellsContent[index];
            return item;
        });
    }

    updateState() {
        if (this.completeRow(0) || this.completeColumn(0)) {
            this.state = State.OVER;
            this.winner = this.cellsContent[topLeftCellIndex];
        }
        else if (this.completeRow(1) || this.completeColumn(1) || this.completeFirstDiagonal() || this.completeSecondDiagonal()) {
            this.state = State.OVER;
            this.winner = this.cellsContent[centerCellIndex];
        }
        else if (this.completeRow(2) || this.completeColumn(2)) {
            this.state = State.OVER;
            this.winner = this.cellsContent[bottomRightCellIndex];
        }
        else if (this.isTerminal()) {
            this.state = State.DRAW;
            this.winner = "Draw";
        }
        else this.state = State.ONGOING;
    }

    isTerminal() {
        return !this.cellsContent.some(item => item === "");
    }

    getPossibleMoves() {
        return this.cellsContent.map( (item, index) => {
            if (item === "") return index;
            return -1;
        }).filter(item => item != -1);
    }

    makeMove(index, marker="X") {
        this.changedIndices.push(index);
        this.cellsContent[index] = marker;
        this.updateState();
        this.updateGameBoard();
    }

    revertLastMove() {
        this.cellsContent[this.changedIndices.pop()] = "";
        this.updateState();
        this.updateGameBoard();
    }

    completeRow(rowNum) {
        return this.cellsContent[rowNum * 3] != "" && this.cellsContent[rowNum * 3] === this.cellsContent[rowNum * 3 + 1] && this.cellsContent[rowNum * 3 + 1] === this.cellsContent[rowNum * 3 + 2];
    }

    completeColumn(colNum) {
        return this.cellsContent[colNum] != "" && this.cellsContent[colNum] === this.cellsContent[colNum + 3] && this.cellsContent[colNum + 3] === this.cellsContent[colNum + 2 * 3];
    }

    completeFirstDiagonal() {
        return this.cellsContent[0] != "" && this.cellsContent[0] === this.cellsContent[4] && this.cellsContent[4] === this.cellsContent[8];
    }

    completeSecondDiagonal() {
        return this.cellsContent[6] != "" && this.cellsContent[6] === this.cellsContent[4] && this.cellsContent[4] === this.cellsContent[2];
    }
}

// minMax algorithm is used to get the best move for the bot.
function minMax(isMaximizerTurn, maximizerMark, board, depth=0) {
    depth+=1
    if (board.state === State.DRAW) {
        return 0;
    } else if (board.state === State.OVER) {
        return maximizerMark === board.winner ? 1 : -1;
    }

    let scores = [];
    for (let move of board.getPossibleMoves()) {
        board.makeMove(move, isMaximizerTurn ? maximizerMark : otherMark(maximizerMark));
        scores.push(
            minMax(!isMaximizerTurn, maximizerMark, board, depth) * (1/depth)
        );
        board.revertLastMove();
    }
    return scores.reduce( (sum, item) => sum += item, 0);
}

function getBestMove(board, maximizerMark = "X") {
    let bestScore = -Infinity;
    let bestMove;
    let score;
    const possibleMoves = board.getPossibleMoves();
    console.log(`possible moves = ${possibleMoves}`);
    for (let move of possibleMoves) {
        board.makeMove(move, maximizerMark);
        score = minMax(false, maximizerMark, board);
        console.log(`move = ${move} -- score = ${score}`);
        board.revertLastMove();
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }
    return bestMove;
}

function random(num) {
    return Math.floor(Math.random() * num);
}

function otherMark(mark) {
    return mark === "X" ? "O" : "X";
}

const cells = Array.from(document.querySelectorAll(".row>div"));
const gameCanvas = document.querySelector("#game-canvas");
const turnDisplay = document.querySelector("#current-turn");
const board = new Board(cells);

let playerTurn = random(2) === 0;
let [playerMarker, computerMarker] = playerTurn ? ["X", "O"] : ["O", "X"];

if (!playerTurn) {
    turnDisplay.textContent = "Computer's Turn";
    setTimeout(() => computerMove(board, computerMarker), 1000);
}

function declareWinner() {
    alert(board.winner);
}

function computerMove(board, computerMarker) {
    board.makeMove(getBestMove(board, computerMarker), computerMarker);
    if (board.state != State.ONGOING) {
        setTimeout(() => declareWinner(), 500);
    } else {
        playerTurn = !playerTurn;
        turnDisplay.textContent = "Player's Turn"
    }
}

gameCanvas.addEventListener("click", event => {
    console.log("clicked", playerTurn);
    if (!playerTurn) console.log("Not Your Turn");
    if (playerTurn) {
        event.target.closest("div").textContent = playerMarker;
        board.updateCellsContents();
        board.updateState();
        if (board.state != State.ONGOING) {
            setTimeout(() => declareWinner(), 500);
        } else {
            playerTurn = !playerTurn;
            turnDisplay.textContent = "Computer's Turn";
            setTimeout(() => computerMove(board, computerMarker), 1000);
        }
    }
    });

function playerClickHandler(event) {
    if (playerTurn) {
        event.target.closest("div").textContent = playerMarker;
        board.updateCellsContents();
        board.updateState();

        if (board.state != State.ONGOING) {
            setTimeout(() => declareWinner(), 500);
        } else {
            playerTurn = !playerTurn;
            turnDisplay.textContent = "Computer's Turn";
            setTimeout(() => computerMove(board, computerMarker), 1000);
        }
    }
}