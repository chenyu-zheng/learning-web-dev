const levels = {
    easy: new GameLevel(9, 9, 10),
    normal: new GameLevel(16, 16, 40),
    hard: new GameLevel(16, 30, 99)
};

const gameView = new GameView();

gameView.game = new Game();

gameView.table = document.getElementById("game-table");
gameView.timer = document.getElementById("time-text");
gameView.counter = document.getElementById("mine-text");
gameView.startBtn = document.getElementById("button-start");

gameView.reset(levels.easy);



// *****************
// Web 
// ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓

function GameView() {

    this.game;
    this.table;
    this.startBtn;
    this.levelForm;
    this.timer;
    this.counter;
    this.timerId;

    this.reset = function (gameLevel) {

        this.game.reset(gameLevel);

        const tbl = this.table;

        tbl.innerHTML = "";
        if (this.timerId !== undefined) {
            window.clearInterval(this.timerId);
            this.timerId = undefined;
        }
        this.updateCounter();


        for (let i = 0; i < gameLevel.nRow; ++i) {
            tbl.appendChild(document.createElement("tr"));
            tbl.lastElementChild.setAttribute("row", i);

            const tr = tbl.lastChild;
            for (let j = 0; j < gameLevel.nCol; ++j) {
                tr.appendChild(document.createElement("td"));
                tr.lastChild.setAttribute("col", j);
                tr.lastChild.style.backgroundColor = "rgb(120, 120, 120)";
            }
        }

        tbl.addEventListener("click", this.reveal.bind(this));

        tbl.addEventListener("auxclick", this.mark.bind(this));
    }

    this.updateUnit = function (row, col, gameUnit) {
        const td = document.querySelector(
            `#${this.table.getAttribute('id')} tr[row='${row.toString()}'] td[col='${col.toString()}']`
        );

        if (gameUnit.isFlagged) {
            td.innerHTML = '<img src="img/flag-32x32x32.png">';
        }
        if (gameUnit.isQuestioned) {
            td.innerHTML = "?";
            td.setAttribute("class", "color-q")
        }

        if (!gameUnit.isFlagged && !gameUnit.isQuestioned) {
            td.innerHTML = "";
        }

        if (gameUnit.isRevealed) {
            td.style.backgroundColor = "rgb(230, 230, 230)";
            const n = gameUnit.mineCount
            if (!gameUnit.hasMine && n > 0) {
                td.innerHTML = n;
                td.setAttribute("class", "color-" + n)
            }
            if (gameUnit.hasMine) {
                td.innerHTML = '<img src="img/mine-32x32x32.png">';
            }
            if (gameUnit.hasMine) {
                td.innerHTML = '<img src="img/mine-red-32x32x32.png">';
            }
        }
    }

    this.updateTimer = function () {
        this.timer.textContent = parseInt(this.timer.textContent) + 1;
    }

    this.updateCounter = function () {
        if (this.game.isEnded) {
            this.counter.textContent = this.game.hiddenMine;
        } else {
            this.counter.textContent = this.game.mine - this.game.flagged;
        }
    }

    this.reveal = function (evt) {
        let tgt = evt.target;
        if (tgt.tagName === "IMG") {
            tgt = tgt.parentNode;
        }
        const row = Number.parseInt(tgt.parentNode.getAttribute("row"));
        const col = Number.parseInt(tgt.getAttribute("col"));
        this.game.reveal(row, col, this.updateUnit.bind(this));

        if (this.timerId === undefined) {
            this.timerId = window.setInterval(this.updateTimer.bind(this), 1000);
        } else {
            if (this.game.isEnded) {
                window.clearInterval(this.timerId);
                this.updateCounter();
            }
        }
    }

    this.mark = function (evt) {
        let tgt = evt.target;
        if (tgt.tagName === "IMG") {
            tgt = tgt.parentNode;
        }
        let row = Number.parseInt(tgt.parentNode.getAttribute("row"));
        let col = Number.parseInt(tgt.getAttribute("col"));
        this.game.mark(row, col, this.updateUnit.bind(this));
        this.updateCounter();
        if (this.game.isEnded) {
            window.clearInterval(this.timerId);
        }
    }
}


// *****************
// Game data/logic 
// ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓

function GameLevel(nRow, nCol, nMine) {
    this.nRow = nRow;
    this.nCol = nCol;
    this.nMine = nMine;
}

function GameUnit(row, col) {
    this.row = row;
    this.col = col;
    this.hasMine = false;
    this.isRevealed = false;
    this.isFlagged = false;
    this.isQuestioned = false;
    this.isTriggered = false;
    this.mineCount = 0;
    this.neibours = new Set();

}

function Game() {
    this.units = [];
    this.mine;
    this.hiddenBlank;
    this.hiddenMine;
    this.flagged;
    this.isWinning = false;
    this.isEnded = false;

    this.createUnits = function (nRow, nCol) {
        for (let i = 0; i < nRow; ++i) {
            this.units.push([]);
            for (let j = 0; j < nCol; ++j) {
                this.units[i].push(new GameUnit(i, j));

                //set unit's neibours
                for (let k = i - 1; k <= i + 1; ++k) {
                    for (let l = j - 1; l <= j + 1; ++l) {
                        if (k === i && l === j) continue;
                        if (k in this.units && l in this.units[k]) {
                            this.units[i][j].neibours.add(this.units[k][l]);
                            this.units[k][l].neibours.add(this.units[i][j]);
                        }
                    }
                }

            }
        }
    }

    this.distributeMines = function (gameLevel) {
        let unitIndexes = [];
        for (let i = 0; i < gameLevel.nRow; ++i) {
            for (let j = 0; j < gameLevel.nCol; ++j) {
                unitIndexes.push({
                    row: i,
                    col: j
                });
            }
        }

        let nMineLeft = gameLevel.nMine;
        while (nMineLeft > 0) {
            const picked = Math.floor((Math.random() * unitIndexes.length));
            const row = unitIndexes[picked].row;
            const col = unitIndexes[picked].col;
            unitIndexes.splice(picked, 1);
            this.units[row][col].hasMine = true;
            this.units[row][col].neibours.forEach((v1, v2, set) => {
                v1.mineCount++;
            });
            nMineLeft--;
        }

    }

    this.reset = function (gameLevel) {
        this.createUnits(gameLevel.nRow, gameLevel.nCol);
        this.distributeMines(gameLevel);
        this.mine = gameLevel.nMine;
        this.hiddenBlank = gameLevel.nRow * gameLevel.nCol - gameLevel.nMine;
        this.hiddenMine = gameLevel.nMine;
        this.flagged = 0;
        this.isEnded = false;
        this.isWinning = false;
    }


    this.reveal = function revealUnit(row, col, callback) {
        if (this.isEnded) return;

        const unit = this.units[row][col];

        if (unit.isFlagged || unit.isQuestioned) return;

        if (unit.isRevealed) {
            if (unit.mineCount > 0 &&
                arguments.callee.caller.name !== "revealUnit") {
                for (const u of unit.neibours) {
                    this.reveal(u.row, u.col, callback);
                }
            }
            return;
        }

        unit.isRevealed = true;

        if (unit.hasMine) {
            this.isEnded = true;
            callback(row, col, unit)
            return;
        }

        this.hiddenBlank--;

        if (unit.mineCount === 0) {
            for (const u of unit.neibours) {
                this.reveal(u.row, u.col, callback);
            }
        }

        if (this.checkWinning()) {
            this.hiddenMine = 0;
            this.isEnded = true;
        }

        callback(row, col, unit)
    }


    this.mark = function (row, col, callback) {
        if (this.isEnded ||
            this.hiddenBlank + this.hiddenMine === this.units.length * this.units[0].length) return;

        if (this.units[row][col].isRevealed) return;

        if (this.units[row][col].isFlagged) {
            this.units[row][col].isFlagged = false;
            this.flagged--;
            this.units[row][col].isQuestioned = true;
            if (this.units[row][col].hasMine) {
                this.hiddenMine++;
            }

        } else if (this.units[row][col].isQuestioned) {
            this.units[row][col].isQuestioned = false;

        } else {
            this.units[row][col].isFlagged = true;
            this.flagged++;
            if (this.units[row][col].hasMine) {
                this.hiddenMine--;
            }
        }

        if (this.checkWinning()) {
            this.isEnded = true;
        }

        callback(row, col, this.units[row][col]);
    }

    this.checkWinning = function () {
        if (this.hiddenBlank === 0 || this.hiddenMine === 0) {
            this.isWinning = true;
            return true;
        }
        return false;
    }

}