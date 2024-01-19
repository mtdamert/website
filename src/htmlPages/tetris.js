// Initial speeds
var msPerPieceDrop = 800;
var lastPieceTime;
var currentScore = 0;
var totalNumLines = 0;
var currentHighScores;
var currentPiece;
var nextPieceType;
var previewBlocks;
var playingGrid; // array
var isGameOver = false;
var gameState;
var BOARD_WIDTH = 10;
var BOARD_HEIGHT = 22;
var PIECE_WIDTH = 32;
var PIECE_HEIGHT = 32;
var DIRECTION_LEFT = 0;
var DIRECTION_RIGHT = 1;
var DIRECTION_DOWN = 2;
var ROTATE_LEFT = 0;
var ROTATE_RIGHT = 1;
var I_BAR_PIECE = 0;
var L_BLOCK_PIECE = 1;
var J_BLOCK_PIECE = 2;
var S_BLOCK_PIECE = 3;
var Z_BLOCK_PIECE = 4;
var SQUARE_PIECE = 5;
var T_BLOCK_PIECE = 6;
var STATE_GAME_RUNNING = 0;
var STATE_GAME_PAUSED = 1;
var NUM_HIGH_SCORES = 5;
var Block = /** @class */ (function () {
    function Block() {
        this.div = null;
        this.image = null;
        this.x = 0;
        this.y = 0;
    }
    ;
    return Block;
}());
var Piece = /** @class */ (function () {
    function Piece(type) {
        this.blocks = [null, null, null, null]; // DIV objects here
        this.type = type;
        this.x = 0;
        this.y = 0;
        this.rotation = 0;
    }
    ;
    return Piece;
}());
function startNewGame() {
    currentScore = 0;
    totalNumLines = 0;
    msPerPieceDrop = 800;
    var playingAreaScreen = document.getElementById("playingAreaScreen");
    if (playingAreaScreen !== null) {
        playingAreaScreen.style.visibility = 'hidden';
    }
    var playAgainButton = document.getElementById("playAgainButton");
    if (playAgainButton !== null) {
        playAgainButton.style.visibility = 'hidden';
    }
    var pausedBox = document.getElementById("pausedBox");
    if (pausedBox !== null) {
        pausedBox.style.visibility = 'hidden';
        pausedBox.innerHTML = "PAUSED";
        pausedBox.style.color = "maroon";
        pausedBox.style.backgroundColor = "rgb(192,192,192)";
    }
    var scoreBox = document.getElementById("scoreBox");
    if (scoreBox !== null) {
        scoreBox.style.color = "white";
        scoreBox.style.backgroundColor = "rgb(32, 128, 64)";
        scoreBox.innerHTML = 'Score: ' + currentScore + "; Lines: " + totalNumLines;
    }
    // Make all high scores black (which means they're not in the current game)
    for (var i = 0; i < NUM_HIGH_SCORES; i++) {
        var highScoreDivName = "highScoreText" + (i + 1);
        var highScoreDiv = document.getElementById("highScoreText" + (i + 1));
        if (highScoreDiv !== null) {
            highScoreDiv.style.color = "rgb(0,0,0)";
        }
    }
    var highScoreText1 = document.getElementById("highScoreText1");
    if (highScoreText1 !== null) {
        highScoreText1.style.color = "rgb(0,0,0)";
    }
    isGameOver = false;
    // Clear out the playing area and the next piece box
    var playingArea = document.getElementById("playingArea");
    if (playingArea !== null) {
        while (playingArea.hasChildNodes()) {
            playingArea.removeChild(playingArea.firstChild);
        }
    }
    var nextPieceBox = document.getElementById("nextPieceBox");
    if (nextPieceBox !== null) {
        while (nextPieceBox.hasChildNodes()) {
            nextPieceBox.removeChild(nextPieceBox.firstChild);
        }
    }
    // create a new, empty board
    playingGrid = new Array(BOARD_WIDTH);
    for (var i = 0; i < BOARD_WIDTH; i++) {
        playingGrid[i] = new Array(BOARD_HEIGHT);
        for (var j = 0; j < BOARD_HEIGHT; j++) {
            playingGrid[i][j] = null;
        }
    }
    window.addEventListener("keydown", function (event) {
        if (event.defaultPrevented) {
            return; // Do nothing if event already handled
        }
        // Ignore input when we're paused as long as the input isn't un-pausing the game
        if (gameState == STATE_GAME_PAUSED && event.code != "Escape")
            return;
        if (isGameOver == true)
            return;
        switch (event.code) {
            case "KeyS":
            case "ArrowDown":
                moveCurrentPiece(DIRECTION_DOWN);
                break;
            case "KeyW":
            case "ArrowUp":
                rotateCurrentPiece(ROTATE_RIGHT);
                break;
            case "KeyA":
            case "ArrowLeft":
                moveCurrentPiece(DIRECTION_LEFT);
                break;
            case "KeyD":
            case "ArrowRight":
                moveCurrentPiece(DIRECTION_RIGHT);
                break;
            case "Escape":
                handleEscKeyPress();
                break;
        }
        if (event.code !== "Tab") {
            // Consume the event so it doesn't get handled twice,
            // as long as the user isn't trying to move focus away
            event.preventDefault();
        }
    }, true);
    nextPieceType = Math.floor((Math.random() * 7));
    setPreviewPiece(nextPieceType);
    currentPiece = addPiece(Math.floor((Math.random() * 7)));
    lastPieceTime = new Date().getTime();
    gameState = STATE_GAME_RUNNING;
    // start the game loop
    gameLoop();
}
function handleEscKeyPress() {
    var pausedBox = document.getElementById("pausedBox");
    var playingAreaScreen = document.getElementById("playingAreaScreen");
    if (gameState == STATE_GAME_RUNNING) {
        gameState = STATE_GAME_PAUSED;
        if (pausedBox !== null) {
            pausedBox.style.visibility = 'visible';
        }
        if (playingAreaScreen !== null) {
            playingAreaScreen.style.visibility = 'visible';
        }
    }
    else if (gameState == STATE_GAME_PAUSED) {
        gameState = STATE_GAME_RUNNING;
        if (pausedBox !== null) {
            pausedBox.style.visibility = 'hidden';
        }
        if (playingAreaScreen !== null) {
            playingAreaScreen.style.visibility = 'hidden';
        }
        setTimeout('gameLoop()', 50);
    }
}
function init() {
    currentHighScores = new Array(NUM_HIGH_SCORES);
    var c = document.cookie; // get a semicolon-separated list of all cookies
    var cookies;
    // TODO: Also get other high scores; create a function that gets a cookie
    if (c.indexOf('tetrisHighScore1') > -1) {
        cookies = {};
        for (var i = c.length - 1; i >= 0; i--) {
            var C = c[i].split('=');
            cookies[C[0]] = C[1];
        }
        for (var i = 0; i < NUM_HIGH_SCORES; i++) {
            var highScoreDivName = "highScoreText" + (i + 1);
            var currentHighScore = cookies[highScoreDivName];
            var highScoreDiv = document.getElementById("highScoreText" + (i + 1));
            if (highScoreDiv !== null) {
                highScoreDiv.innerHTML = "" + currentHighScore;
                highScoreDiv.style.color = "rgb(0,0,0)";
            }
        }
    }
    // Create high score DIV elements if they don't already exist
    var rightPanel = document.getElementById("rightPanel");
    for (var i = 0; i < NUM_HIGH_SCORES; i++) {
        var highScoreDiv = document.createElement('div');
        // TODO: Make sure the DIV elements don't already exist
        highScoreDiv.className = "highScoreText";
        highScoreDiv.id = "highScoreText" + (i + 1);
        highScoreDiv.style.color = "rgb(0,0,0)";
        highScoreDiv.style.top = "" + (310 + (20) * i);
        //highScoreDiv.innerHTML = "0";
        if (rightPanel !== null) {
            console.log("Adding to right panel: " + highScoreDiv.id);
            rightPanel.appendChild(highScoreDiv);
        }
    }
    startNewGame();
}
function dropPieces() {
    // Check whether it's time to drop the current piece
    if ((new Date().getTime() - lastPieceTime) > msPerPieceDrop) {
        lastPieceTime = new Date().getTime();
        moveCurrentPiece(DIRECTION_DOWN);
    }
}
function gameLoop() {
    //game loop
    dropPieces();
    //end conditions
    if (isGameOver == false && gameState != STATE_GAME_PAUSED) {
        //still in play - keep the loop going
        setTimeout('gameLoop()', 50);
    }
    else if (isGameOver == true) {
        gameOver();
    }
    else if (gameState == STATE_GAME_PAUSED) {
        // idle
    }
}
function incrementSpeed() {
    // Level    Drop speed
    //        (frames/line)
    //    00            48 (0.8 s)
    //    01            43 (0.72s)
    //    02            38 (0.63s)
    //    03            33 (0.55s)
    //    04            28 (0.47s)
    //    05            23 (0.38s)
    //    06            18 (0.3 s)
    //    07            13 (0.22s)
    //    08             8 (0.13s)
    //    09             6 (0.1 s)
    // 10-12             5 (0.08s)
    // 13-15             4 (0.07s)
    // 16-18             3 (0.05s)
    // 19-28             2 (0.03s)
    //   29+             1 (0.02s)
    if (totalNumLines < 10)
        msPerPieceDrop = 800;
    else if (totalNumLines < 20)
        msPerPieceDrop = 720;
    else if (totalNumLines < 30)
        msPerPieceDrop = 630;
    else if (totalNumLines < 40)
        msPerPieceDrop = 550;
    else if (totalNumLines < 50)
        msPerPieceDrop = 470;
    else if (totalNumLines < 60)
        msPerPieceDrop = 380;
    else if (totalNumLines < 70)
        msPerPieceDrop = 300;
    else if (totalNumLines < 80)
        msPerPieceDrop = 220;
    else if (totalNumLines < 90)
        msPerPieceDrop = 130;
    else if (totalNumLines < 100)
        msPerPieceDrop = 100;
    else if (totalNumLines < 130)
        msPerPieceDrop = 80;
    else if (totalNumLines < 160)
        msPerPieceDrop = 70;
    else if (totalNumLines < 190)
        msPerPieceDrop = 50;
    else if (totalNumLines < 290)
        msPerPieceDrop = 30;
    else
        msPerPieceDrop = 20;
}
function previewIBar(previewBlocks) {
    for (var i = 0; i < 4; i++) {
        if (previewBlocks[i] !== null && previewBlocks[i].image !== null) {
            previewBlocks[i].image.src = 'tetris_block.gif';
        }
    }
    previewBlocks[0].x = 0;
    previewBlocks[0].y = 0;
    previewBlocks[1].x = 1;
    previewBlocks[1].y = 0;
    previewBlocks[2].x = 2;
    previewBlocks[2].y = 0;
    previewBlocks[3].x = 3;
    previewBlocks[3].y = 0;
    for (var i = 0; i < 4; i++) {
        if (previewBlocks[i] !== null && previewBlocks[i].image !== null) {
            previewBlocks[i].image.style.top = PIECE_WIDTH * previewBlocks[i].y + 44 + "px";
            previewBlocks[i].image.style.left = PIECE_HEIGHT * previewBlocks[i].x + 12 + "px";
        }
    }
}
function previewLBlock(previewBlocks) {
    for (var i = 0; i < 4; i++) {
        if (previewBlocks[i] !== null && previewBlocks[i].image !== null) {
            previewBlocks[i].image.src = 'tetris_block_yellow.gif';
        }
    }
    previewBlocks[0].x = 0;
    previewBlocks[0].y = 0;
    previewBlocks[1].x = 0;
    previewBlocks[1].y = 1;
    previewBlocks[2].x = 0;
    previewBlocks[2].y = 2;
    previewBlocks[3].x = 1;
    previewBlocks[3].y = 2;
    for (var i = 0; i < 4; i++) {
        if (previewBlocks[i] !== null && previewBlocks[i].image !== null) {
            previewBlocks[i].image.style.top = PIECE_WIDTH * previewBlocks[i].y + 12 + "px";
            previewBlocks[i].image.style.left = PIECE_HEIGHT * previewBlocks[i].x + 44 + "px";
        }
    }
}
function previewJBlock(previewBlocks) {
    for (var i = 0; i < 4; i++) {
        if (previewBlocks[i] !== null && previewBlocks[i].image !== null) {
            previewBlocks[i].image.src = 'tetris_block_purple.gif';
        }
    }
    previewBlocks[0].x = 0;
    previewBlocks[0].y = 2;
    previewBlocks[1].x = 1;
    previewBlocks[1].y = 0;
    previewBlocks[2].x = 1;
    previewBlocks[2].y = 1;
    previewBlocks[3].x = 1;
    previewBlocks[3].y = 2;
    for (var i = 0; i < 4; i++) {
        if (previewBlocks[i] !== null && previewBlocks[i].image !== null) {
            previewBlocks[i].image.style.top = PIECE_WIDTH * previewBlocks[i].y + 12 + "px";
            previewBlocks[i].image.style.left = PIECE_HEIGHT * previewBlocks[i].x + 44 + "px";
        }
    }
}
function previewSBlock(previewBlocks) {
    for (var i = 0; i < 4; i++) {
        if (previewBlocks[i] !== null && previewBlocks[i].image !== null) {
            previewBlocks[i].image.src = 'tetris_block_blue.gif';
        }
    }
    previewBlocks[0].x = 1;
    previewBlocks[0].y = 0;
    previewBlocks[1].x = 2;
    previewBlocks[1].y = 0;
    previewBlocks[2].x = 0;
    previewBlocks[2].y = 1;
    previewBlocks[3].x = 1;
    previewBlocks[3].y = 1;
    for (var i = 0; i < 4; i++) {
        if (previewBlocks[i] !== null && previewBlocks[i].image !== null) {
            previewBlocks[i].image.style.top = PIECE_WIDTH * previewBlocks[i].y + 28 + "px";
            previewBlocks[i].image.style.left = PIECE_HEIGHT * previewBlocks[i].x + 28 + "px";
        }
    }
}
function previewZBlock(previewBlocks) {
    for (var i = 0; i < 4; i++) {
        if (previewBlocks[i] !== null && previewBlocks[i].image !== null) {
            previewBlocks[i].image.src = 'tetris_block_orange.gif';
        }
    }
    previewBlocks[0].x = 0;
    previewBlocks[0].y = 0;
    previewBlocks[1].x = 1;
    previewBlocks[1].y = 0;
    previewBlocks[2].x = 1;
    previewBlocks[2].y = 1;
    previewBlocks[3].x = 2;
    previewBlocks[3].y = 1;
    for (var i = 0; i < 4; i++) {
        if (previewBlocks[i] !== null && previewBlocks[i].image !== null) {
            previewBlocks[i].image.style.top = PIECE_WIDTH * previewBlocks[i].y + 28 + "px";
            previewBlocks[i].image.style.left = PIECE_HEIGHT * previewBlocks[i].x + 28 + "px";
        }
    }
}
function previewSquareBlock(previewBlocks) {
    for (var i = 0; i < 4; i++) {
        if (previewBlocks[i] !== null && previewBlocks[i].image !== null) {
            previewBlocks[i].image.src = 'tetris_block_gray.gif';
        }
    }
    previewBlocks[0].x = 0;
    previewBlocks[0].y = 0;
    previewBlocks[1].x = 1;
    previewBlocks[1].y = 0;
    previewBlocks[2].x = 0;
    previewBlocks[2].y = 1;
    previewBlocks[3].x = 1;
    previewBlocks[3].y = 1;
    for (var i = 0; i < 4; i++) {
        if (previewBlocks[i] !== null && previewBlocks[i].image !== null) {
            previewBlocks[i].image.style.top = PIECE_WIDTH * previewBlocks[i].y + 28 + "px";
            previewBlocks[i].image.style.left = PIECE_HEIGHT * previewBlocks[i].x + 44 + "px";
        }
    }
}
function previewTBlock(previewBlocks) {
    for (var i = 0; i < 4; i++) {
        if (previewBlocks[i] !== null && previewBlocks[i].image !== null) {
            previewBlocks[i].image.src = 'tetris_block_green.gif';
        }
    }
    previewBlocks[0].x = 1;
    previewBlocks[0].y = 0;
    previewBlocks[1].x = 0;
    previewBlocks[1].y = 1;
    previewBlocks[2].x = 1;
    previewBlocks[2].y = 1;
    previewBlocks[3].x = 2;
    previewBlocks[3].y = 1;
    for (var i = 0; i < 4; i++) {
        if (previewBlocks[i] !== null && previewBlocks[i].image !== null) {
            previewBlocks[i].image.style.top = PIECE_WIDTH * previewBlocks[i].y + 28 + "px";
            previewBlocks[i].image.style.left = PIECE_HEIGHT * previewBlocks[i].x + 28 + "px";
        }
    }
}
function removeLine(y) {
    // Check all playingArea's children - they should all be of type 'block'
    var playingArea = document.getElementById("playingArea");
    if (playingArea !== null) {
        var blockImages = playingArea.childNodes;
        for (var i = 0; i < blockImages.length; i++)
            if (blockImages[i].firstChild.style.top == ((y - 2) * PIECE_HEIGHT + "px")) {
                blockImages[i].firstChild.style.visibility = 'hidden';
            }
        // shift everything above this line down one
        for (var i = 0; i < blockImages.length; i++) {
            if (parseInt(blockImages[i].firstChild.style.top) < ((y - 2) * PIECE_HEIGHT)) {
                blockImages[i].firstChild.style.top = parseInt(blockImages[i].firstChild.style.top) + PIECE_HEIGHT + "px";
            }
        }
    }
    // Update collision grid
    for (var x = 0; x < BOARD_WIDTH; x++) {
        playingGrid[x][y] = null;
    }
    // Update the collision grid to shift down every row above this line
    for (; y > 0; y--)
        for (var x = 0; x < BOARD_WIDTH; x++)
            playingGrid[x][y] = playingGrid[x][y - 1];
    totalNumLines++;
    if (totalNumLines % 10 == 0) {
        incrementSpeed();
    }
}
function levelUp(newLevel) {
    // cycle thru hue values as the time changes
    var hue = (currentScore / 5) % 255;
    var r = hue + 255 / 3;
    var g = hue;
    var b = hue - 255 / 3;
    if (r > 255)
        r -= 255;
    if (b < 0)
        b += 255;
    r = scaleForHue(r);
    g = scaleForHue(g);
    b = scaleForHue(b);
    var playingArea = document.getElementById("playingArea");
    if (playingArea !== null) {
        playingArea.style.backgroundColor = 'rgb(' + r + ', ' + g + ', ' + b + ')';
    }
}
// Check whether the player has achieved any lines. If so, clear them
function checkForLines() {
    var numLinesFound = 0;
    // Check for lines from the top down
    for (var y = 0; y < BOARD_HEIGHT; y++) {
        var numBlocks = 0;
        for (var x = 0; x < BOARD_WIDTH; x++) {
            if (playingGrid[x][y] !== null) {
                numBlocks++;
            }
            else
                break;
            if (numBlocks == BOARD_WIDTH) {
                removeLine(y);
                numLinesFound++;
            }
        }
    }
    var levelNumber = Math.floor(totalNumLines / 10);
    var oldLevelNumber = Math.floor((totalNumLines - numLinesFound) / 10);
    if (oldLevelNumber != levelNumber)
        levelUp(levelNumber);
    if (numLinesFound == 1)
        incrementScore(40 * (levelNumber + 1));
    else if (numLinesFound == 2)
        incrementScore(100 * (levelNumber + 1));
    else if (numLinesFound == 3)
        incrementScore(300 * (levelNumber + 1));
    else if (numLinesFound == 4)
        incrementScore(1200 * (levelNumber + 1));
}
function createNewPiece() {
    checkForLines();
    currentPiece = addPiece(nextPieceType);
    nextPieceType = Math.floor((Math.random() * 7));
    for (var i = 0; i < 4; i++) {
        var nextPieceBox = document.getElementById("nextPieceBox");
        if (nextPieceBox !== null) {
            nextPieceBox.removeChild(previewBlocks[i].div);
        }
    }
    setPreviewPiece(nextPieceType);
}
// Return true if we find a collision here
function addToPlayingGrid(block) {
    var collision = (playingGrid[block.x][block.y] !== null);
    playingGrid[block.x][block.y] = block;
    // Update graphics
    if (block !== null && block.image !== null) {
        block.image.style.display = 'inline';
        block.image.style.top = PIECE_WIDTH * block.y - (2 * PIECE_HEIGHT) + "px";
        block.image.style.left = PIECE_HEIGHT * block.x + "px";
        if (block.y < 2)
            block.image.style.visibility = 'hidden';
        else
            block.image.style.visibility = 'visible';
    }
    return collision;
}
function removeFromPlayingGrid(x, y, block) {
    playingGrid[x][y] = null;
    // Update graphics
    if (block !== null && block.image !== null) {
        block.image.style.display = 'none';
    }
}
// various piece types
function addIBar(blocks, centerPos) {
    for (var i = 0; i < 4; i++) {
        if (blocks[i] !== null && blocks[i].image !== null) {
            blocks[i].image.src = 'tetris_block.gif';
            //blocks[i].image.style.left = PIECE_WIDTH * (i + centerPos) + "px";
        }
    }
    // Set positions for the block graphics
    blocks[0].image.style.left = PIECE_WIDTH * (0 + centerPos) + "px";
    blocks[0].image.style.left = PIECE_WIDTH * (1 + centerPos) + "px";
    blocks[0].image.style.left = PIECE_WIDTH * (2 + centerPos) + "px";
    blocks[0].image.style.left = PIECE_WIDTH * (3 + centerPos) + "px";
    // Fill in spots in our tetris grid
    var collision = false;
    blocks[0].x = 0 + centerPos;
    blocks[0].y = 0;
    collision = addToPlayingGrid(blocks[0]);
    blocks[1].x = 1 + centerPos;
    blocks[1].y = 0;
    collision = addToPlayingGrid(blocks[1]) || collision;
    blocks[2].x = 2 + centerPos;
    blocks[2].y = 0;
    collision = addToPlayingGrid(blocks[2]) || collision;
    blocks[3].x = 3 + centerPos;
    blocks[3].y = 0;
    collision = addToPlayingGrid(blocks[3]) || collision;
    return collision;
}
function addLBlock(blocks, centerPos) {
    for (var i = 0; i < 4; i++)
        if (blocks[i] !== null && blocks[i].image !== null)
            blocks[i].image.src = 'tetris_block_yellow.gif';
    // Set positions for the block graphics
    blocks[0].image.style.left = PIECE_WIDTH * (0 + centerPos) + "px";
    blocks[1].image.style.left = PIECE_WIDTH * (0 + centerPos) + "px";
    blocks[1].image.style.top = PIECE_HEIGHT * 1 + "px";
    blocks[2].image.style.left = PIECE_WIDTH * (0 + centerPos) + "px";
    blocks[2].image.style.top = PIECE_HEIGHT * 2 + "px";
    blocks[3].image.style.left = PIECE_WIDTH * (1 + centerPos) + "px";
    blocks[3].image.style.top = PIECE_HEIGHT * 2 + "px";
    // Fill in spots in our tetris grid
    var collision = false;
    blocks[0].x = 0 + centerPos;
    blocks[0].y = 0;
    collision = addToPlayingGrid(blocks[0]);
    blocks[1].x = 0 + centerPos;
    blocks[1].y = 1;
    collision = addToPlayingGrid(blocks[1]) || collision;
    blocks[2].x = 0 + centerPos;
    blocks[2].y = 2;
    collision = addToPlayingGrid(blocks[2]) || collision;
    blocks[3].x = 1 + centerPos;
    blocks[3].y = 2;
    collision = addToPlayingGrid(blocks[3]) || collision;
    return collision;
}
function addJBlock(blocks, centerPos) {
    for (var i = 0; i < 4; i++)
        blocks[i].image.src = 'tetris_block_purple.gif';
    // Set positions for the block graphics
    blocks[0].image.style.left = PIECE_WIDTH * (0 + centerPos) + "px";
    blocks[0].image.style.top = PIECE_HEIGHT * 2 + "px";
    blocks[1].image.style.left = PIECE_WIDTH * (1 + centerPos) + "px";
    blocks[2].image.style.left = PIECE_WIDTH * (1 + centerPos) + "px";
    blocks[2].image.style.top = PIECE_HEIGHT * 1 + "px";
    blocks[3].image.style.left = PIECE_WIDTH * (1 + centerPos) + "px";
    blocks[3].image.style.top = PIECE_HEIGHT * 2 + "px";
    // Fill in spots in our tetris grid
    var collision = false;
    blocks[0].x = 0 + centerPos;
    blocks[0].y = 2;
    collision = addToPlayingGrid(blocks[0]);
    blocks[1].x = 1 + centerPos;
    blocks[1].y = 0;
    collision = addToPlayingGrid(blocks[1]) || collision;
    blocks[2].x = 1 + centerPos;
    blocks[2].y = 1;
    collision = addToPlayingGrid(blocks[2]) || collision;
    blocks[3].x = 1 + centerPos;
    blocks[3].y = 2;
    collision = addToPlayingGrid(blocks[3]) || collision;
    return collision;
}
function addSBlock(blocks, centerPos) {
    for (var i = 0; i < 4; i++)
        blocks[i].image.src = 'tetris_block_blue.gif';
    // Set positions for the block graphics
    blocks[0].image.style.left = PIECE_WIDTH * (1 + centerPos) + "px";
    blocks[1].image.style.left = PIECE_WIDTH * (2 + centerPos) + "px";
    blocks[2].image.style.left = PIECE_WIDTH * (0 + centerPos) + "px";
    blocks[2].image.style.top = PIECE_HEIGHT * 1 + "px";
    blocks[3].image.style.left = PIECE_WIDTH * (1 + centerPos) + "px";
    blocks[3].image.style.top = PIECE_HEIGHT * 1 + "px";
    // Fill in spots in our tetris grid
    var collision = false;
    blocks[0].x = 1 + centerPos;
    blocks[0].y = 0;
    collision = addToPlayingGrid(blocks[0]);
    blocks[1].x = 2 + centerPos;
    blocks[1].y = 0;
    collision = addToPlayingGrid(blocks[1]) || collision;
    blocks[2].x = 0 + centerPos;
    blocks[2].y = 1;
    collision = addToPlayingGrid(blocks[2]) || collision;
    blocks[3].x = 1 + centerPos;
    blocks[3].y = 1;
    collision = addToPlayingGrid(blocks[3]) || collision;
    return collision;
}
function addZBlock(blocks, centerPos) {
    for (var i = 0; i < 4; i++)
        if (blocks[i] !== null && blocks[i].image !== null)
            blocks[i].image.src = 'tetris_block_orange.gif';
    // Set positions for the block graphics
    blocks[0].image.style.left = PIECE_WIDTH * (0 + centerPos) + "px";
    blocks[1].image.style.left = PIECE_WIDTH * (1 + centerPos) + "px";
    blocks[2].image.style.left = PIECE_WIDTH * (1 + centerPos) + "px";
    blocks[2].image.style.top = PIECE_HEIGHT * 1 + "px";
    blocks[3].image.style.left = PIECE_WIDTH * (2 + centerPos) + "px";
    blocks[3].image.style.top = PIECE_HEIGHT * 1 + "px";
    // Fill in spots in our tetris grid
    var collision = false;
    blocks[0].x = 0 + centerPos;
    blocks[0].y = 0;
    collision = addToPlayingGrid(blocks[0]);
    blocks[1].x = 1 + centerPos;
    blocks[1].y = 0;
    collision = addToPlayingGrid(blocks[1]) || collision;
    blocks[2].x = 1 + centerPos;
    blocks[2].y = 1;
    collision = addToPlayingGrid(blocks[2]) || collision;
    blocks[3].x = 2 + centerPos;
    blocks[3].y = 1;
    collision = addToPlayingGrid(blocks[3]) || collision;
    return collision;
}
function addSquareBlock(blocks, centerPos) {
    for (var i = 0; i < 4; i++)
        if (blocks[i] !== null && blocks[i].image !== null)
            blocks[i].image.src = 'tetris_block_gray.gif';
    // Set positions for the block graphics
    blocks[0].image.style.left = PIECE_WIDTH * (0 + centerPos) + "px";
    blocks[1].image.style.left = PIECE_WIDTH * (1 + centerPos) + "px";
    blocks[2].image.style.left = PIECE_WIDTH * (0 + centerPos) + "px";
    blocks[2].image.style.top = PIECE_HEIGHT * 1 + "px";
    blocks[3].image.style.left = PIECE_WIDTH * (1 + centerPos) + "px";
    blocks[3].image.style.top = PIECE_HEIGHT * 1 + "px";
    // Fill in spots in our tetris grid
    var collision = false;
    blocks[0].x = 0 + centerPos;
    blocks[0].y = 0;
    collision = addToPlayingGrid(blocks[0]);
    blocks[1].x = 1 + centerPos;
    blocks[1].y = 0;
    collision = addToPlayingGrid(blocks[1]) || collision;
    blocks[2].x = 0 + centerPos;
    blocks[2].y = 1;
    collision = addToPlayingGrid(blocks[2]) || collision;
    blocks[3].x = 1 + centerPos;
    blocks[3].y = 1;
    collision = addToPlayingGrid(blocks[3]) || collision;
    return collision;
}
function addTBlock(blocks, centerPos) {
    for (var i = 0; i < 4; i++)
        if (blocks[i] !== null && blocks[i].image !== null)
            blocks[i].image.src = 'tetris_block_green.gif';
    // Set positions for the block graphics
    blocks[0].image.style.left = PIECE_WIDTH * (1 + centerPos) + "px";
    blocks[1].image.style.left = PIECE_WIDTH * (0 + centerPos) + "px";
    blocks[1].image.style.top = PIECE_HEIGHT * 1 + "px";
    blocks[2].image.style.top = PIECE_HEIGHT * 1 + "px";
    blocks[2].image.style.left = PIECE_WIDTH * (1 + centerPos) + "px";
    blocks[3].image.style.top = PIECE_HEIGHT * 1 + "px";
    blocks[3].image.style.left = PIECE_WIDTH * (2 + centerPos) + "px";
    // Fill in spots in our tetris grid
    var collision = false;
    blocks[0].x = 1 + centerPos;
    blocks[0].y = 0;
    collision = addToPlayingGrid(blocks[0]);
    blocks[1].x = 0 + centerPos;
    blocks[1].y = 1;
    collision = addToPlayingGrid(blocks[1]) || collision;
    blocks[2].x = 1 + centerPos;
    blocks[2].y = 1;
    collision = addToPlayingGrid(blocks[2]) || collision;
    blocks[3].x = 2 + centerPos;
    blocks[3].y = 1;
    collision = addToPlayingGrid(blocks[3]) || collision;
    return collision;
}
function addPiece(pieceType) {
    var piece = new Piece(pieceType);
    // Every piece has 4 segments
    var newBlocks = new Array(4);
    piece.blocks = newBlocks;
    //let newPieceImages: HTMLImageElement[] = new Array<HTMLImageElement>(4);
    //piece.images = new Array<HTMLImageElement>(4);
    for (var i = 0; i < 4; i++) {
        var newBlock = new Block();
        newBlocks[i] = newBlock;
        newBlocks[i].div = document.createElement('div');
        //newPieceImages[i] = document.createElement('img');
        //newBlocks[i].image = newPieceImages[i];
        newBlocks[i].image = document.createElement('img');
        newBlocks[i].image.src = 'tetris_block.gif';
        newBlocks[i].div.appendChild(newBlocks[i].image);
        newBlocks[i].image.style.position = 'absolute';
        newBlocks[i].image.style.top = "0px";
        newBlocks[i].image.style.left = "0px";
    }
    //newBlocks[0].image.src = 'tetris_block.gif'; // TEST
    var screenCenter = 4;
    var collision = false;
    // Create one of the six pieces at random
    switch (pieceType) {
        case I_BAR_PIECE:
            collision = addIBar(piece.blocks, screenCenter);
            piece.x = 2 + screenCenter;
            piece.y = 0;
            break;
        case L_BLOCK_PIECE:
            collision = addLBlock(piece.blocks, screenCenter);
            piece.x = 0 + screenCenter;
            piece.y = 1;
            break;
        case J_BLOCK_PIECE:
            collision = addJBlock(piece.blocks, screenCenter);
            piece.x = 1 + screenCenter;
            piece.y = 1;
            break;
        case S_BLOCK_PIECE:
            collision = addSBlock(piece.blocks, screenCenter);
            piece.x = 1 + screenCenter;
            piece.y = 0;
            break;
        case Z_BLOCK_PIECE:
            collision = addZBlock(piece.blocks, screenCenter);
            piece.x = 1 + screenCenter;
            piece.y = 0;
            break;
        case SQUARE_PIECE:
            collision = addSquareBlock(piece.blocks, screenCenter);
            piece.x = screenCenter;
            break;
        case T_BLOCK_PIECE:
            collision = addTBlock(piece.blocks, screenCenter);
            piece.x = 1 + screenCenter;
            piece.y = 1;
            break;
    }
    if (collision == true)
        isGameOver = true;
    // Add the block to the onscreen DIV
    for (var i = 0; i < 4; i++) {
        var playingArea = document.getElementById("playingArea");
        if (playingArea !== null) {
            playingArea.appendChild(newBlocks[i].div);
        }
    }
    // reset the timer causing pieces to drop
    lastPieceTime = new Date().getTime();
    return piece;
}
function setPreviewPiece(pieceType) {
    previewBlocks = new Array(4);
    for (var i = 0; i < 4; i++) {
        var newBlock = new Block();
        previewBlocks[i] = newBlock;
        previewBlocks[i].div = null;
        previewBlocks[i].div = document.createElement('div');
        previewBlocks[i].image = document.createElement('img');
        previewBlocks[i].div.appendChild(previewBlocks[i].image);
        previewBlocks[i].image.style.position = 'absolute';
        previewBlocks[i].image.style.top = "0px";
        previewBlocks[i].image.style.left = "0px";
        var nextPieceBox = document.getElementById("nextPieceBox");
        if (nextPieceBox !== null) {
            nextPieceBox.appendChild(previewBlocks[i].div);
        }
    }
    switch (pieceType) {
        case I_BAR_PIECE:
            previewIBar(previewBlocks);
            break;
        case L_BLOCK_PIECE:
            previewLBlock(previewBlocks);
            break;
        case J_BLOCK_PIECE:
            previewJBlock(previewBlocks);
            break;
        case S_BLOCK_PIECE:
            previewSBlock(previewBlocks);
            break;
        case Z_BLOCK_PIECE:
            previewZBlock(previewBlocks);
            break;
        case SQUARE_PIECE:
            previewSquareBlock(previewBlocks);
            break;
        case T_BLOCK_PIECE:
            previewTBlock(previewBlocks);
            break;
    }
}
function doesPieceCollideWithBlocksOnLeft() {
    var numCollisionsWithBlocksOnLeft = 0;
    for (var i = 0; i < 4; i++) {
        if (playingGrid[(currentPiece.blocks[i].x - 1)][currentPiece.blocks[i].y] !== null)
            numCollisionsWithBlocksOnLeft++;
    }
    var collided = false;
    switch (currentPiece.type) {
        case I_BAR_PIECE:
            if (currentPiece.rotation % 2 == 0) {
                if (numCollisionsWithBlocksOnLeft > 3)
                    collided = true;
            }
            else if (numCollisionsWithBlocksOnLeft > 0)
                collided = true;
            break;
        case L_BLOCK_PIECE:
        case J_BLOCK_PIECE:
            if (currentPiece.rotation % 2 == 0) {
                if (numCollisionsWithBlocksOnLeft > 1)
                    collided = true;
            }
            else if (numCollisionsWithBlocksOnLeft > 2)
                collided = true;
            break;
        case S_BLOCK_PIECE:
        case Z_BLOCK_PIECE:
            if (currentPiece.rotation % 2 == 0) {
                if (numCollisionsWithBlocksOnLeft > 2)
                    collided = true;
            }
            else if (numCollisionsWithBlocksOnLeft > 1)
                collided = true;
            break;
        case SQUARE_PIECE:
            if (numCollisionsWithBlocksOnLeft > 2)
                collided = true;
            break;
        case T_BLOCK_PIECE:
            if (currentPiece.rotation % 2 == 0) {
                if (numCollisionsWithBlocksOnLeft > 2)
                    collided = true;
            }
            else if (numCollisionsWithBlocksOnLeft > 1)
                collided = true;
            break;
    }
    return collided;
}
function doesPieceCollideWithBlocksOnRight() {
    var numCollisionsWithBlocksOnRight = 0;
    for (var i = 0; i < 4; i++) {
        if (playingGrid[(currentPiece.blocks[i].x + 1)][currentPiece.blocks[i].y] !== null)
            numCollisionsWithBlocksOnRight++;
    }
    var collided = false;
    switch (currentPiece.type) {
        case I_BAR_PIECE:
            if (currentPiece.rotation % 2 == 0) {
                if (numCollisionsWithBlocksOnRight > 3)
                    collided = true;
            }
            else if (numCollisionsWithBlocksOnRight > 0)
                collided = true;
            break;
        case L_BLOCK_PIECE:
        case J_BLOCK_PIECE:
            if (currentPiece.rotation % 2 == 0) {
                if (numCollisionsWithBlocksOnRight > 1)
                    collided = true;
            }
            else if (numCollisionsWithBlocksOnRight > 2)
                collided = true;
            break;
        case S_BLOCK_PIECE:
        case Z_BLOCK_PIECE:
            if (currentPiece.rotation % 2 == 0) {
                if (numCollisionsWithBlocksOnRight > 2)
                    collided = true;
            }
            else if (numCollisionsWithBlocksOnRight > 1)
                collided = true;
            break;
        case SQUARE_PIECE:
            if (numCollisionsWithBlocksOnRight > 2)
                collided = true;
            break;
        case T_BLOCK_PIECE:
            if (currentPiece.rotation % 2 == 0) {
                if (numCollisionsWithBlocksOnRight > 2)
                    collided = true;
            }
            else if (numCollisionsWithBlocksOnRight > 1)
                collided = true;
            break;
    }
    return collided;
}
function didPieceCollideWithBlocksBelow() {
    var numCollisionsWithBlocksBelow = 0;
    for (var i = 0; i < 4; i++) {
        if (playingGrid[(currentPiece.blocks[i].x)][currentPiece.blocks[i].y + 1] !== null) {
            numCollisionsWithBlocksBelow++;
        }
    }
    var collided = false;
    switch (currentPiece.type) {
        case I_BAR_PIECE:
            if (currentPiece.rotation % 2 == 0) {
                if (numCollisionsWithBlocksBelow > 0)
                    collided = true;
            }
            else if (numCollisionsWithBlocksBelow > 3)
                collided = true;
            break;
        case L_BLOCK_PIECE:
        case J_BLOCK_PIECE:
            if (currentPiece.rotation % 2 == 0) {
                if (numCollisionsWithBlocksBelow > 2)
                    collided = true;
            }
            else if (numCollisionsWithBlocksBelow > 1)
                collided = true;
            break;
        case S_BLOCK_PIECE:
        case Z_BLOCK_PIECE:
            if (currentPiece.rotation % 2 == 0) {
                if (numCollisionsWithBlocksBelow > 1)
                    collided = true;
            }
            else if (numCollisionsWithBlocksBelow > 2)
                collided = true;
            break;
        case SQUARE_PIECE:
            if (numCollisionsWithBlocksBelow > 2)
                collided = true;
            break;
        case T_BLOCK_PIECE:
            if (currentPiece.rotation % 2 == 0) {
                if (numCollisionsWithBlocksBelow > 1)
                    collided = true;
            }
            else if (numCollisionsWithBlocksBelow > 2)
                collided = true;
            break;
    }
    // Check if the piece hit the floor of the board
    if (collided == false) {
        for (var i = 0; i < 4; i++)
            if ((currentPiece.blocks[i].y + 1) >= BOARD_HEIGHT)
                return true;
    }
    return collided;
}
function moveCurrentPieceRight() {
    // Update internal playing grid array
    for (var i = 0; i < 4; i++) {
        removeFromPlayingGrid(currentPiece.blocks[i].x, currentPiece.blocks[i].y, currentPiece.blocks[i]);
        currentPiece.blocks[i].x = currentPiece.blocks[i].x + 1;
    }
    for (var i = 0; i < 4; i++) {
        addToPlayingGrid(currentPiece.blocks[i]);
    }
    // Update graphics
    for (var i = 0; i < 4; i++) {
        currentPiece.blocks[i].image.style.left = PIECE_WIDTH * currentPiece.blocks[i].x + "px";
        currentPiece.blocks[i].image.style.top = PIECE_HEIGHT * currentPiece.blocks[i].y - (2 * PIECE_HEIGHT) + "px";
    }
    currentPiece.x += 1;
}
function moveCurrentPieceLeft() {
    // Update internal playing grid array
    for (var i = 0; i < 4; i++) {
        removeFromPlayingGrid(currentPiece.blocks[i].x, currentPiece.blocks[i].y, currentPiece.blocks[i]);
        currentPiece.blocks[i].x = currentPiece.blocks[i].x - 1;
    }
    for (var i = 0; i < 4; i++) {
        addToPlayingGrid(currentPiece.blocks[i]);
    }
    // Update graphics
    for (var i = 0; i < 4; i++) {
        currentPiece.blocks[i].image.style.left = PIECE_WIDTH * currentPiece.blocks[i].x + "px";
        currentPiece.blocks[i].image.style.top = PIECE_HEIGHT * currentPiece.blocks[i].y - (2 * PIECE_HEIGHT) + "px";
    }
    currentPiece.x -= 1;
}
function moveCurrentPieceDown() {
    if (didPieceCollideWithBlocksBelow() == true) {
        createNewPiece();
        return;
    }
    // Update internal playing grid array
    for (var i = 0; i < 4; i++) {
        removeFromPlayingGrid(currentPiece.blocks[i].x, currentPiece.blocks[i].y, currentPiece.blocks[i]);
        currentPiece.blocks[i].y = currentPiece.blocks[i].y + 1;
    }
    for (var i = 0; i < 4; i++) {
        addToPlayingGrid(currentPiece.blocks[i]);
    }
    // DEBUG - Print current playingGrid
    for (var y = 0; y < BOARD_HEIGHT; y++) {
        var debugRowData = " ";
        for (var x = 0; x < BOARD_WIDTH; x++) {
            debugRowData += (playingGrid[x][y] === null) ? " " : "X";
        }
        //console.log(debugRowData);
    }
    //console.log("============");
    currentPiece.y += 1;
}
function moveCurrentPiece(direction) {
    if (direction == DIRECTION_RIGHT) {
        // Check whether the place we want to move the piece to is free
        var failed = false;
        // Check for wall collisions
        for (var i = 0; i < 4; i++) {
            if ((currentPiece.blocks[i].x + 1) >= BOARD_WIDTH) {
                failed = true;
                break;
            }
        }
        if (failed == false)
            if (doesPieceCollideWithBlocksOnRight() == false)
                moveCurrentPieceRight();
    }
    if (direction == DIRECTION_LEFT) {
        // Check whether the place we want to move the piece to is free
        var failed = false;
        // Check for wall collisions
        for (var i = 0; i < 4; i++) {
            if (currentPiece.blocks[i].x <= 0) {
                failed = true;
                break;
            }
        }
        if (failed == false)
            if (doesPieceCollideWithBlocksOnLeft() == false)
                moveCurrentPieceLeft();
    }
    if (direction == DIRECTION_DOWN) {
        moveCurrentPieceDown();
    }
}
function rotateIBar() {
    if (currentPiece.rotation % 2 == 0) { // rotate into vertical position
        if ((currentPiece.y - 2) >= 0 &&
            playingGrid[currentPiece.x][currentPiece.y - 2] == null &&
            playingGrid[currentPiece.x][currentPiece.y - 1] == null &&
            playingGrid[currentPiece.x][currentPiece.y + 1] == null) {
            // remove piece from its previous position
            for (var i = 0; i < 4; i++)
                removeFromPlayingGrid(currentPiece.blocks[i].x, currentPiece.blocks[i].y, currentPiece.blocks[i]);
            // add the piece in its new position
            currentPiece.blocks[0].x = currentPiece.x;
            currentPiece.blocks[0].y = currentPiece.y - 2;
            currentPiece.blocks[1].x = currentPiece.x;
            currentPiece.blocks[1].y = currentPiece.y - 1;
            currentPiece.blocks[2].x = currentPiece.x;
            currentPiece.blocks[2].y = currentPiece.y;
            currentPiece.blocks[3].x = currentPiece.x;
            currentPiece.blocks[3].y = currentPiece.y + 1;
            for (var i = 0; i < 4; i++)
                addToPlayingGrid(currentPiece.blocks[i]);
            // record that the rotation occurred
            currentPiece.rotation += 1;
        }
    }
    else { // rotate into horizontal position
        if ((currentPiece.x - 2) >= 0 &&
            (currentPiece.x + 1) < BOARD_WIDTH &&
            playingGrid[currentPiece.x - 2][currentPiece.y] == null &&
            playingGrid[currentPiece.x - 1][currentPiece.y] == null &&
            playingGrid[currentPiece.x + 1][currentPiece.y] == null) {
            // remove piece from its previous position
            for (var i = 0; i < 4; i++)
                removeFromPlayingGrid(currentPiece.blocks[i].x, currentPiece.blocks[i].y, currentPiece.blocks[i]);
            // add the piece in its new position
            currentPiece.blocks[0].x = currentPiece.x - 2;
            currentPiece.blocks[0].y = currentPiece.y;
            currentPiece.blocks[1].x = currentPiece.x - 1;
            currentPiece.blocks[1].y = currentPiece.y;
            currentPiece.blocks[3].x = currentPiece.x + 1;
            currentPiece.blocks[3].y = currentPiece.y;
            for (var i = 0; i < 4; i++)
                addToPlayingGrid(currentPiece.blocks[i]);
            // record that the rotation occurred
            currentPiece.rotation += 1;
        }
    }
}
function rotateLBlock() {
    if (currentPiece.rotation % 4 == 0) {
        if ((currentPiece.x - 1) >= 0 &&
            (currentPiece.x + 1) < BOARD_WIDTH &&
            playingGrid[currentPiece.x - 1][currentPiece.y] == null &&
            playingGrid[currentPiece.x - 1][currentPiece.y + 1] == null &&
            playingGrid[currentPiece.x + 1][currentPiece.y] == null) {
            // remove piece from its previous position
            for (var i = 0; i < 4; i++)
                removeFromPlayingGrid(currentPiece.blocks[i].x, currentPiece.blocks[i].y, currentPiece.blocks[i]);
            // add the piece in its new position
            currentPiece.blocks[0].x = currentPiece.x - 1;
            currentPiece.blocks[0].y = currentPiece.y;
            currentPiece.blocks[1].x = currentPiece.x - 1;
            currentPiece.blocks[1].y = currentPiece.y + 1;
            currentPiece.blocks[2].x = currentPiece.x;
            currentPiece.blocks[2].y = currentPiece.y;
            currentPiece.blocks[3].x = currentPiece.x + 1;
            currentPiece.blocks[3].y = currentPiece.y;
            for (var i = 0; i < 4; i++)
                addToPlayingGrid(currentPiece.blocks[i]);
            // record that the rotation occurred
            currentPiece.rotation += 1;
        }
    }
    else if (currentPiece.rotation % 4 == 1) {
        if (playingGrid[currentPiece.x - 1][currentPiece.y - 1] == null &&
            playingGrid[currentPiece.x][currentPiece.y - 1] == null &&
            playingGrid[currentPiece.x][currentPiece.y + 1] == null) {
            // remove piece from its previous position
            for (var i = 0; i < 4; i++)
                removeFromPlayingGrid(currentPiece.blocks[i].x, currentPiece.blocks[i].y, currentPiece.blocks[i]);
            // add the piece in its new position
            currentPiece.blocks[0].x = currentPiece.x - 1;
            currentPiece.blocks[0].y = currentPiece.y - 1;
            currentPiece.blocks[1].x = currentPiece.x;
            currentPiece.blocks[1].y = currentPiece.y - 1;
            currentPiece.blocks[2].x = currentPiece.x;
            currentPiece.blocks[2].y = currentPiece.y;
            currentPiece.blocks[3].x = currentPiece.x;
            currentPiece.blocks[3].y = currentPiece.y + 1;
            for (var i = 0; i < 4; i++)
                addToPlayingGrid(currentPiece.blocks[i]);
            // record that the rotation occurred
            currentPiece.rotation += 1;
        }
    }
    else if (currentPiece.rotation % 4 == 2) {
        if ((currentPiece.x - 1) >= 0 &&
            playingGrid[currentPiece.x + 1][currentPiece.y - 1] == null &&
            playingGrid[currentPiece.x - 1][currentPiece.y] == null &&
            playingGrid[currentPiece.x + 1][currentPiece.y] == null) {
            // remove piece from its previous position
            for (var i = 0; i < 4; i++)
                removeFromPlayingGrid(currentPiece.blocks[i].x, currentPiece.blocks[i].y, currentPiece.blocks[i]);
            // add the piece in its new position
            currentPiece.blocks[0].x = currentPiece.x + 1;
            currentPiece.blocks[0].y = currentPiece.y - 1;
            currentPiece.blocks[1].x = currentPiece.x - 1;
            currentPiece.blocks[1].y = currentPiece.y;
            currentPiece.blocks[2].x = currentPiece.x;
            currentPiece.blocks[2].y = currentPiece.y;
            currentPiece.blocks[3].x = currentPiece.x + 1;
            currentPiece.blocks[3].y = currentPiece.y;
            for (var i = 0; i < 4; i++)
                addToPlayingGrid(currentPiece.blocks[i]);
            // record that the rotation occurred
            currentPiece.rotation += 1;
        }
    }
    else {
        if ((currentPiece.y - 1) >= 0 &&
            playingGrid[currentPiece.x][currentPiece.y - 1] == null &&
            playingGrid[currentPiece.x][currentPiece.y + 1] == null &&
            playingGrid[currentPiece.x + 1][currentPiece.y + 1] == null) {
            // remove piece from its previous position
            for (var i = 0; i < 4; i++)
                removeFromPlayingGrid(currentPiece.blocks[i].x, currentPiece.blocks[i].y, currentPiece.blocks[i]);
            // add the piece in its new position
            currentPiece.blocks[0].x = currentPiece.x;
            currentPiece.blocks[0].y = currentPiece.y - 1;
            currentPiece.blocks[1].x = currentPiece.x;
            currentPiece.blocks[1].y = currentPiece.y + 1;
            currentPiece.blocks[2].x = currentPiece.x;
            currentPiece.blocks[2].y = currentPiece.y;
            currentPiece.blocks[3].x = currentPiece.x + 1;
            currentPiece.blocks[3].y = currentPiece.y + 1;
            for (var i = 0; i < 4; i++)
                addToPlayingGrid(currentPiece.blocks[i]);
            // record that the rotation occurred
            currentPiece.rotation += 1;
        }
    }
}
function rotateJBlock() {
    if (currentPiece.rotation % 4 == 0) {
        if ((currentPiece.x + 1) < BOARD_WIDTH &&
            playingGrid[currentPiece.x - 1][currentPiece.y - 1] == null &&
            playingGrid[currentPiece.x - 1][currentPiece.y] == null &&
            playingGrid[currentPiece.x + 1][currentPiece.y] == null) {
            // remove piece from its previous position
            for (var i = 0; i < 4; i++)
                removeFromPlayingGrid(currentPiece.blocks[i].x, currentPiece.blocks[i].y, currentPiece.blocks[i]);
            // add the piece in its new position
            currentPiece.blocks[0].x = currentPiece.x - 1;
            currentPiece.blocks[0].y = currentPiece.y - 1;
            currentPiece.blocks[1].x = currentPiece.x - 1;
            currentPiece.blocks[1].y = currentPiece.y;
            currentPiece.blocks[2].x = currentPiece.x;
            currentPiece.blocks[2].y = currentPiece.y;
            currentPiece.blocks[3].x = currentPiece.x + 1;
            currentPiece.blocks[3].y = currentPiece.y;
            for (var i = 0; i < 4; i++)
                addToPlayingGrid(currentPiece.blocks[i]);
            // record that the rotation occurred
            currentPiece.rotation += 1;
        }
    }
    else if (currentPiece.rotation % 4 == 1) {
        if (playingGrid[currentPiece.x][currentPiece.y - 1] == null &&
            playingGrid[currentPiece.x + 1][currentPiece.y - 1] == null &&
            playingGrid[currentPiece.x][currentPiece.y + 1] == null) {
            // remove piece from its previous position
            for (var i = 0; i < 4; i++)
                removeFromPlayingGrid(currentPiece.blocks[i].x, currentPiece.blocks[i].y, currentPiece.blocks[i]);
            // add the piece in its new position
            currentPiece.blocks[0].x = currentPiece.x;
            currentPiece.blocks[0].y = currentPiece.y - 1;
            currentPiece.blocks[1].x = currentPiece.x + 1;
            currentPiece.blocks[1].y = currentPiece.y - 1;
            currentPiece.blocks[2].x = currentPiece.x;
            currentPiece.blocks[2].y = currentPiece.y;
            currentPiece.blocks[3].x = currentPiece.x;
            currentPiece.blocks[3].y = currentPiece.y + 1;
            for (var i = 0; i < 4; i++)
                addToPlayingGrid(currentPiece.blocks[i]);
            // record that the rotation occurred
            currentPiece.rotation += 1;
        }
    }
    else if (currentPiece.rotation % 4 == 2) {
        if ((currentPiece.x - 1) >= 0 &&
            playingGrid[currentPiece.x - 1][currentPiece.y] == null &&
            playingGrid[currentPiece.x + 1][currentPiece.y] == null &&
            playingGrid[currentPiece.x + 1][currentPiece.y + 1] == null) {
            // remove piece from its previous position
            for (var i = 0; i < 4; i++)
                removeFromPlayingGrid(currentPiece.blocks[i].x, currentPiece.blocks[i].y, currentPiece.blocks[i]);
            // add the piece in its new position
            currentPiece.blocks[0].x = currentPiece.x - 1;
            currentPiece.blocks[0].y = currentPiece.y;
            currentPiece.blocks[1].x = currentPiece.x + 1;
            currentPiece.blocks[1].y = currentPiece.y;
            currentPiece.blocks[2].x = currentPiece.x;
            currentPiece.blocks[2].y = currentPiece.y;
            currentPiece.blocks[3].x = currentPiece.x + 1;
            currentPiece.blocks[3].y = currentPiece.y + 1;
            for (var i = 0; i < 4; i++)
                addToPlayingGrid(currentPiece.blocks[i]);
            // record that the rotation occurred
            currentPiece.rotation += 1;
        }
    }
    else {
        if ((currentPiece.y - 1) >= 0 &&
            playingGrid[currentPiece.x][currentPiece.y - 1] == null &&
            playingGrid[currentPiece.x - 1][currentPiece.y + 1] == null &&
            playingGrid[currentPiece.x][currentPiece.y + 1] == null) {
            // remove piece from its previous position
            for (var i = 0; i < 4; i++)
                removeFromPlayingGrid(currentPiece.blocks[i].x, currentPiece.blocks[i].y, currentPiece.blocks[i]);
            // add the piece in its new position
            currentPiece.blocks[0].x = currentPiece.x;
            currentPiece.blocks[0].y = currentPiece.y - 1;
            currentPiece.blocks[1].x = currentPiece.x - 1;
            currentPiece.blocks[1].y = currentPiece.y + 1;
            currentPiece.blocks[2].x = currentPiece.x;
            currentPiece.blocks[2].y = currentPiece.y;
            currentPiece.blocks[3].x = currentPiece.x;
            currentPiece.blocks[3].y = currentPiece.y + 1;
            for (var i = 0; i < 4; i++)
                addToPlayingGrid(currentPiece.blocks[i]);
            // record that the rotation occurred
            currentPiece.rotation += 1;
        }
    }
}
function rotateSBlock() {
    if (currentPiece.rotation % 2 == 0) {
        if ((currentPiece.y - 1) >= 0 &&
            playingGrid[currentPiece.x][currentPiece.y - 1] == null &&
            playingGrid[currentPiece.x + 1][currentPiece.y + 1] == null) {
            // remove piece from its previous position
            for (var i = 0; i < 4; i++)
                removeFromPlayingGrid(currentPiece.blocks[i].x, currentPiece.blocks[i].y, currentPiece.blocks[i]);
            // add the piece in its new position
            currentPiece.blocks[0].x = currentPiece.x;
            currentPiece.blocks[0].y = currentPiece.y - 1;
            currentPiece.blocks[1].x = currentPiece.x;
            currentPiece.blocks[1].y = currentPiece.y;
            currentPiece.blocks[2].x = currentPiece.x + 1;
            currentPiece.blocks[2].y = currentPiece.y;
            currentPiece.blocks[3].x = currentPiece.x + 1;
            currentPiece.blocks[3].y = currentPiece.y + 1;
            for (var i = 0; i < 4; i++)
                addToPlayingGrid(currentPiece.blocks[i]);
            // record that the rotation occurred
            currentPiece.rotation += 1;
        }
    }
    else {
        if ((currentPiece.x - 1) >= 0 &&
            playingGrid[currentPiece.x - 1][currentPiece.y + 1] == null &&
            playingGrid[currentPiece.x][currentPiece.y + 1] == null) {
            // remove piece from its previous position
            for (var i = 0; i < 4; i++)
                removeFromPlayingGrid(currentPiece.blocks[i].x, currentPiece.blocks[i].y, currentPiece.blocks[i]);
            // add the piece in its new position
            currentPiece.blocks[0].x = currentPiece.x;
            currentPiece.blocks[0].y = currentPiece.y;
            currentPiece.blocks[1].x = currentPiece.x + 1;
            currentPiece.blocks[1].y = currentPiece.y;
            currentPiece.blocks[2].x = currentPiece.x - 1;
            currentPiece.blocks[2].y = currentPiece.y + 1;
            currentPiece.blocks[3].x = currentPiece.x;
            currentPiece.blocks[3].y = currentPiece.y + 1;
            for (var i = 0; i < 4; i++)
                addToPlayingGrid(currentPiece.blocks[i]);
            // record that the rotation occurred
            currentPiece.rotation += 1;
        }
    }
}
function rotateZBlock() {
    if (currentPiece.rotation % 2 == 0) {
        if ((currentPiece.y - 1) >= 0 &&
            playingGrid[currentPiece.x + 1][currentPiece.y - 1] == null &&
            playingGrid[currentPiece.x + 1][currentPiece.y] == null) {
            // remove piece from its previous position
            for (var i = 0; i < 4; i++)
                removeFromPlayingGrid(currentPiece.blocks[i].x, currentPiece.blocks[i].y, currentPiece.blocks[i]);
            // add the piece in its new position
            currentPiece.blocks[0].x = currentPiece.x + 1;
            currentPiece.blocks[0].y = currentPiece.y - 1;
            currentPiece.blocks[1].x = currentPiece.x + 1;
            currentPiece.blocks[1].y = currentPiece.y;
            currentPiece.blocks[2].x = currentPiece.x;
            currentPiece.blocks[2].y = currentPiece.y;
            currentPiece.blocks[3].x = currentPiece.x;
            currentPiece.blocks[3].y = currentPiece.y + 1;
            for (var i = 0; i < 4; i++)
                addToPlayingGrid(currentPiece.blocks[i]);
            // record that the rotation occurred
            currentPiece.rotation += 1;
        }
    }
    else {
        if ((currentPiece.x - 1) >= 0 &&
            playingGrid[currentPiece.x - 1][currentPiece.y] == null &&
            playingGrid[currentPiece.x + 1][currentPiece.y + 1] == null) {
            // remove piece from its previous position
            for (var i = 0; i < 4; i++)
                removeFromPlayingGrid(currentPiece.blocks[i].x, currentPiece.blocks[i].y, currentPiece.blocks[i]);
            // add the piece in its new position
            currentPiece.blocks[0].x = currentPiece.x - 1;
            currentPiece.blocks[0].y = currentPiece.y;
            currentPiece.blocks[1].x = currentPiece.x;
            currentPiece.blocks[1].y = currentPiece.y + 1;
            currentPiece.blocks[2].x = currentPiece.x;
            currentPiece.blocks[2].y = currentPiece.y;
            currentPiece.blocks[3].x = currentPiece.x + 1;
            currentPiece.blocks[3].y = currentPiece.y + 1;
            for (var i = 0; i < 4; i++)
                addToPlayingGrid(currentPiece.blocks[i]);
            // record that the rotation occurred
            currentPiece.rotation += 1;
        }
    }
}
function rotateTBlock() {
    if (currentPiece.rotation % 4 == 0) {
        if (playingGrid[currentPiece.x][currentPiece.y + 1] == null) {
            // remove piece from its previous position
            for (var i = 0; i < 4; i++)
                removeFromPlayingGrid(currentPiece.blocks[i].x, currentPiece.blocks[i].y, currentPiece.blocks[i]);
            // add the piece in its new position
            currentPiece.blocks[0].x = currentPiece.x;
            currentPiece.blocks[0].y = currentPiece.y - 1;
            currentPiece.blocks[1].x = currentPiece.x + 1;
            currentPiece.blocks[1].y = currentPiece.y;
            currentPiece.blocks[2].x = currentPiece.x;
            currentPiece.blocks[2].y = currentPiece.y;
            currentPiece.blocks[3].x = currentPiece.x;
            currentPiece.blocks[3].y = currentPiece.y + 1;
            for (var i = 0; i < 4; i++)
                addToPlayingGrid(currentPiece.blocks[i]);
            // record that the rotation occurred
            currentPiece.rotation += 1;
        }
    }
    else if (currentPiece.rotation % 4 == 1) {
        if ((currentPiece.x - 1) >= 0 &&
            playingGrid[currentPiece.x - 1][currentPiece.y] == null) {
            // remove piece from its previous position
            for (var i = 0; i < 4; i++)
                removeFromPlayingGrid(currentPiece.blocks[i].x, currentPiece.blocks[i].y, currentPiece.blocks[i]);
            // add the piece in its new position
            currentPiece.blocks[0].x = currentPiece.x - 1;
            currentPiece.blocks[0].y = currentPiece.y;
            currentPiece.blocks[1].x = currentPiece.x + 1;
            currentPiece.blocks[1].y = currentPiece.y;
            currentPiece.blocks[2].x = currentPiece.x;
            currentPiece.blocks[2].y = currentPiece.y;
            currentPiece.blocks[3].x = currentPiece.x;
            currentPiece.blocks[3].y = currentPiece.y + 1;
            for (var i = 0; i < 4; i++)
                addToPlayingGrid(currentPiece.blocks[i]);
            // record that the rotation occurred
            currentPiece.rotation += 1;
        }
    }
    else if (currentPiece.rotation % 4 == 2) {
        if ((currentPiece.y - 1) >= 0 &&
            playingGrid[currentPiece.x][currentPiece.y - 1] == null) {
            // remove piece from its previous position
            for (var i = 0; i < 4; i++)
                removeFromPlayingGrid(currentPiece.blocks[i].x, currentPiece.blocks[i].y, currentPiece.blocks[i]);
            // add the piece in its new position
            currentPiece.blocks[0].x = currentPiece.x;
            currentPiece.blocks[0].y = currentPiece.y - 1;
            currentPiece.blocks[1].x = currentPiece.x - 1;
            currentPiece.blocks[1].y = currentPiece.y;
            currentPiece.blocks[2].x = currentPiece.x;
            currentPiece.blocks[2].y = currentPiece.y;
            currentPiece.blocks[3].x = currentPiece.x;
            currentPiece.blocks[3].y = currentPiece.y + 1;
            for (var i = 0; i < 4; i++)
                addToPlayingGrid(currentPiece.blocks[i]);
            // record that the rotation occurred
            currentPiece.rotation += 1;
        }
    }
    else {
        if ((currentPiece.x + 1) < BOARD_WIDTH &&
            playingGrid[currentPiece.x + 1][currentPiece.y] == null) {
            // remove piece from its previous position
            for (var i = 0; i < 4; i++)
                removeFromPlayingGrid(currentPiece.blocks[i].x, currentPiece.blocks[i].y, currentPiece.blocks[i]);
            // add the piece in its new position
            currentPiece.blocks[0].x = currentPiece.x;
            currentPiece.blocks[0].y = currentPiece.y - 1;
            currentPiece.blocks[1].x = currentPiece.x - 1;
            currentPiece.blocks[1].y = currentPiece.y;
            currentPiece.blocks[2].x = currentPiece.x;
            currentPiece.blocks[2].y = currentPiece.y;
            currentPiece.blocks[3].x = currentPiece.x + 1;
            currentPiece.blocks[3].y = currentPiece.y;
            for (var i = 0; i < 4; i++)
                addToPlayingGrid(currentPiece.blocks[i]);
            // record that the rotation occurred
            currentPiece.rotation += 1;
        }
    }
}
function rotateCurrentPiece(direction) {
    if (direction == ROTATE_LEFT) {
        //currentPiece.rotation += 1;
    }
    else if (direction == ROTATE_RIGHT) {
        switch (currentPiece.type) {
            case I_BAR_PIECE:
                rotateIBar();
                break;
            case L_BLOCK_PIECE:
                rotateLBlock();
                break;
            case J_BLOCK_PIECE:
                rotateJBlock();
                break;
            case S_BLOCK_PIECE:
                rotateSBlock();
                break;
            case Z_BLOCK_PIECE:
                rotateZBlock();
                break;
            case T_BLOCK_PIECE:
                rotateTBlock();
                break;
        }
    }
    if (currentPiece.rotation >= 4)
        currentPiece.rotation -= 4;
    if (currentPiece.rotation < 0)
        currentPiece.rotation += 4;
}
// Helper function for changing color over time.
// I honestly don't understand how this works.
// http://www.gamedev.net/topic/410133-code-for-cycling-through-hues-colors/
function scaleForHue(color) {
    if (color < 43)
        color = 255 - (255 * 6) * (color / 255.0);
    else if (color < 128)
        color = 0;
    else if (color < 171)
        color = (6 * 255) * (color / 255.0) - (255 * 3);
    else
        color = 255;
    // Scale color so it's between 128 and 255
    color = color / 2 + 128;
    return color;
}
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function incrementScore(amount) {
    currentScore += amount;
    // If this is a high score, push other old scores down the list
    var prevHighScore = 0;
    for (var i = 0; i < NUM_HIGH_SCORES; i++) {
        var highScoreDiv = document.getElementById("highScoreText" + (i + 1));
        if (highScoreDiv != null) {
            console.log("found high score div " + (i + 1));
            // current high score: "rgb(0,192,64)";
            // existing high score: "rgb(0,192,64)";
            if (currentScore > Number(highScoreDiv.innerHTML) /*&& highScoreDiv.style.color == "rgb(0, 0, 0)"*/) {
                prevHighScore = Number(highScoreDiv.innerHTML);
                highScoreDiv.innerHTML = "" + currentScore;
                highScoreDiv.style.color = "rgb(0,192,64)";
                // push all other scores down the list and make them "rgb(0,0,0)"
                var updatedHighScore = prevHighScore;
                for (i = i + 1; i < NUM_HIGH_SCORES; i++) {
                    var highScoreDiv_1 = document.getElementById("highScoreText" + (i + 1));
                    if (highScoreDiv_1 != null) {
                        prevHighScore = Number(highScoreDiv_1.innerHTML);
                        if (prevHighScore !== 0)
                            highScoreDiv_1.innerHTML = "" + prevHighScore;
                        highScoreDiv_1.style.color = "rgb(0,0,0)";
                        updatedHighScore = prevHighScore;
                    }
                }
                break;
            }
            else {
                console.log("Found a high score div, but didn't replace it because its color was " + highScoreDiv.style.color);
            }
        }
    }
    var scoreBox = document.getElementById("scoreBox");
    if (scoreBox !== null) {
        scoreBox.innerHTML = 'Score: ' + currentScore + "; Lines: " + totalNumLines;
    }
}
function gameOver() {
    isGameOver = true;
    var scoreBox = document.getElementById("scoreBox");
    if (scoreBox !== null) {
        scoreBox.style.backgroundColor = 'rgb(128,0,0)';
    }
    var pausedBox = document.getElementById("pausedBox");
    if (pausedBox !== null) {
        pausedBox.style.visibility = 'visible';
        pausedBox.innerHTML = "GAME OVER";
        pausedBox.style.color = "rgb(224,224,224)";
        pausedBox.style.backgroundColor = "red";
    }
    var playingAreaScreen = document.getElementById("playingAreaScreen");
    if (playingAreaScreen !== null) {
        playingAreaScreen.style.visibility = 'visible';
    }
    // Add a NEW GAME button
    var playAgainButton = document.getElementById("playAgainButton");
    if (playAgainButton !== null) {
        playAgainButton.style.visibility = 'visible';
    }
}
