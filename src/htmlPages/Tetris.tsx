import React, { useEffect } from 'react';


class Block {
    div: (HTMLDivElement | null);
    image: (HTMLImageElement | null);
    x: number;
    y: number;

    constructor() {
        this.div = null;
        this.image = null;
        this.x = 0;
        this.y = 0;
    };
}

class Piece {
    type: number;
    blocks: Array<(Block | null)> = [null, null, null, null]; // DIV objects here
    //images: Array<(HTMLImageElement | null)> = [null, null, null, null]; // IMG objects here 
    x: number;
    y: number;
    rotation: number;

    constructor(type: number) {
        this.type = type;
        this.x = 0;
        this.y = 0;
        this.rotation = 0;
    };
}


// Initial speeds
let msPerPieceDrop: number = 800;
let lastPieceTime: number;
let currentScore: number = 0;
let totalNumLines: number = 0;
let currentHighScores: number[];

let currentPiece: Piece;
let nextPieceType: number;

var previewBlocks: Block[];

let playingGrid: Array<Array<(Block | null)>>; // array
let isGameOver: boolean = false;
let gameState: number;

const BOARD_WIDTH: number = 10;
const BOARD_HEIGHT: number = 22;
const PIECE_WIDTH: number = 32;
const PIECE_HEIGHT: number = 32;

const DIRECTION_LEFT: number = 0;
const DIRECTION_RIGHT: number = 1;
const DIRECTION_DOWN: number = 2;

const ROTATE_LEFT: number = 0;
const ROTATE_RIGHT: number = 1;

const I_BAR_PIECE: number = 0;
const L_BLOCK_PIECE: number = 1;
const J_BLOCK_PIECE: number = 2;
const S_BLOCK_PIECE: number = 3;
const Z_BLOCK_PIECE: number = 4;
const SQUARE_PIECE: number = 5;
const T_BLOCK_PIECE: number = 6;

const STATE_GAME_RUNNING: number = 0;
const STATE_GAME_PAUSED: number = 1;

const NUM_HIGH_SCORES: number = 5;

const IBarColor = '#ff0000';
const LBlockColor = '#ffff00';
const JBlockColor = '#c000ff';
const SBlockColor = '#0000ff';
const ZBlockColor = '#ff8000';
const SquareBlockColor = '#606060';
const TBlockColor = '#00ff00';

const gameLoop = (): void => {
    //game loop
    dropPieces();

    //end conditions
    if (isGameOver === false && gameState !== STATE_GAME_PAUSED) {
        //still in play - keep the loop going
        setTimeout(gameLoop, 50);
    } else if (isGameOver === true) {
        gameOver();
    }
    else if (gameState === STATE_GAME_PAUSED) {
        // idle
    }
}


const startNewGame = (): void => {
    currentScore = 0;
    totalNumLines = 0;
    msPerPieceDrop = 800;

    let playingAreaScreen: (HTMLElement | null) = document.getElementById("playingAreaScreen");
    if (playingAreaScreen !== null) {
        playingAreaScreen.style.visibility = 'hidden';
    }

    let playAgainButton: (HTMLElement | null) = document.getElementById("playAgainButton");
    if (playAgainButton !== null) {
        playAgainButton.style.visibility = 'hidden';
    }
    
    let pausedBox: (HTMLElement | null) = document.getElementById("pausedBox");
    if (pausedBox !== null) {
        pausedBox.style.visibility = 'hidden';
        pausedBox.innerHTML = "PAUSED";
        pausedBox.style.color = "maroon";
        pausedBox.style.backgroundColor = "rgb(192,192,192)";
    }

    let scoreBox: (HTMLElement | null) = document.getElementById("scoreBox");
    if (scoreBox !== null) {
        scoreBox.style.color = "white";
        scoreBox.style.backgroundColor = "rgb(32, 128, 64)";
        scoreBox.innerHTML = 'Score: ' + currentScore + "; Lines: " + totalNumLines;
    }

    // Make all high scores black (which means they're not in the current game)
    for (let i: number = 0; i < NUM_HIGH_SCORES; i++) {
        let highScoreDivName: string = "highScoreText" + (i + 1);
        let highScoreDiv: (HTMLElement | null) = document.getElementById("highScoreText" + (i + 1));
        if (highScoreDiv !== null) {
            highScoreDiv.style.color = "rgb(0,0,0)";
        }
    }


    let highScoreText1: (HTMLElement | null) = document.getElementById("highScoreText1");
    if (highScoreText1 !== null) {
        highScoreText1.style.color = "rgb(0,0,0)";
    }
    
    isGameOver = false;

    // Clear out the playing area and the next piece box
    let playingArea: (HTMLElement | null) = document.getElementById("playingArea");
    if (playingArea !== null) {
        while (playingArea.hasChildNodes()) {
            playingArea.removeChild(playingArea.firstChild);
        }
    }

    let nextPieceBox: (HTMLElement | null) = document.getElementById("nextPieceBox");
    if (nextPieceBox !== null) {
        while (nextPieceBox.hasChildNodes()) {
            nextPieceBox.removeChild(nextPieceBox.firstChild);
        }
    }

    // create a new, empty board
    playingGrid = new Array<Array<(Block | null)>>(BOARD_WIDTH);
    for (let i: number = 0; i < BOARD_WIDTH; i++) {
        playingGrid[i] = new Array<(Block | null)>(BOARD_HEIGHT);
        for (let j: number = 0; j < BOARD_HEIGHT; j++) {
            playingGrid[i][j] = null;
        }
    }

    window.addEventListener(
        "keydown",
        (event) => {
            if (event.defaultPrevented) {
                return; // Do nothing if event already handled
            }

            // Ignore input when we're paused as long as the input isn't un-pausing the game
            if (gameState === STATE_GAME_PAUSED && event.code !== "Escape")
                return;
            if (isGameOver === true)
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
        },
        true,
    );
    
    nextPieceType = Math.floor((Math.random() * 7));
    setPreviewPiece(nextPieceType);
    currentPiece = addPiece(Math.floor((Math.random() * 7)));
    lastPieceTime = new Date().getTime();
    gameState = STATE_GAME_RUNNING;

    // start the game loop
    gameLoop();
}

const handleEscKeyPress = (): void => {
    let pausedBox: (HTMLElement | null) = document.getElementById("pausedBox");
    let playingAreaScreen: (HTMLElement | null) = document.getElementById("playingAreaScreen");

    if (gameState === STATE_GAME_RUNNING) {
        gameState = STATE_GAME_PAUSED;
        if (pausedBox !== null) {
            pausedBox.style.visibility = 'visible';
        }
        if (playingAreaScreen !== null) {
            playingAreaScreen.style.visibility = 'visible';
        }
    }
    else if (gameState === STATE_GAME_PAUSED) {
        gameState = STATE_GAME_RUNNING;
        if (pausedBox !== null) {
            pausedBox.style.visibility = 'hidden';
        }
        if (playingAreaScreen !== null) {
            playingAreaScreen.style.visibility = 'hidden';
        }

        setTimeout(() => {gameLoop()}, 50);
    }
}

const init = (): void => {
    currentHighScores = new Array<number>(NUM_HIGH_SCORES);

    let c: string = document.cookie; // get a semicolon-separated list of all cookies
    let cookies: (string[] | {});
    // TODO: Also get other high scores; create a function that gets a cookie
    if (c.indexOf('tetrisHighScore1') > -1) {
        cookies = {};

        for(let i: number = c.length - 1; i >= 0; i--){
            let C: string[] = c[i].split('=');
            cookies[C[0]] = C[1];
        }

        for (let i: number = 0; i < NUM_HIGH_SCORES; i++) {
            let highScoreDivName: string = "highScoreText" + (i + 1);

            let currentHighScore: string = cookies[highScoreDivName];

            let highScoreDiv: (HTMLElement | null) = document.getElementById("highScoreText" + (i + 1));
            if (highScoreDiv !== null) {
                highScoreDiv.innerHTML = "" + currentHighScore;
                highScoreDiv.style.top = "390px";
                highScoreDiv.style.color = "rgb(0,0,0)";
            }
        }
    }

    // Create high score DIV elements if they don't already exist
    let rightPanel: (HTMLElement | null) = document.getElementById("rightPanel");
    for (let i: number = 0; i < NUM_HIGH_SCORES; i++) {
        let highScoreDiv: HTMLDivElement = document.createElement('div');
        // TODO: Make sure the DIV elements don't already exist
        let top = (390 + (20) * i);
        highScoreDiv.className = "absolute top-[" + top + "px] left-[440px] text-lg";
        highScoreDiv.id = "highScoreText" + (i + 1);
        highScoreDiv.style.top = "" + top + "px";
        highScoreDiv.style.color = "rgb(0,0,0)";

        if (rightPanel !== null) {
            console.log("Adding to right panel: " + highScoreDiv.id);
            rightPanel.appendChild(highScoreDiv);
        }
    }

    startNewGame();
}

const dropPieces = (): void => {
    // Check whether it's time to drop the current piece
    if ((new Date().getTime() - lastPieceTime) > msPerPieceDrop) {
        lastPieceTime = new Date().getTime();
        moveCurrentPiece(DIRECTION_DOWN);
    }
}

const incrementSpeed = (): void => {
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

const previewIBar = (previewBlocks: Block[]): void => {
    for (let i: number = 0; i < 4; i++) {
        if (previewBlocks[i] !== null && previewBlocks[i].image !== null) {
            //previewBlocks[i].image.src = 'tetris_block.gif';
            previewBlocks[i].image.src = 'tetris_block_base.png';
            previewBlocks[i].image.style.backgroundColor = IBarColor;
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
    
    for (let i: number = 0; i < 4; i++) {
        if (previewBlocks[i] !== null && previewBlocks[i].image !== null) {
            previewBlocks[i].image.style.top = PIECE_WIDTH * previewBlocks[i].y + 44 + "px";
            previewBlocks[i].image.style.left = PIECE_HEIGHT * previewBlocks[i].x + 12 + "px";
        }
    }
}

const previewLBlock = (previewBlocks: Block[]): void => {
    for (let i: number = 0; i < 4; i++) {
        if (previewBlocks[i] !== null && previewBlocks[i].image !== null) {
            //previewBlocks[i].image.src = 'tetris_block_yellow.gif';
            previewBlocks[i].image.src = 'tetris_block_base.png';
            previewBlocks[i].image.style.backgroundColor = LBlockColor;
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

    for (let i: number = 0; i < 4; i++) {
        if (previewBlocks[i] !== null && previewBlocks[i].image !== null) {
            previewBlocks[i].image.style.top = PIECE_WIDTH * previewBlocks[i].y + 12 + "px";
            previewBlocks[i].image.style.left = PIECE_HEIGHT * previewBlocks[i].x + 44 + "px";
        }
    }
}

const previewJBlock = (previewBlocks: Block[]): void => {
    for (let i: number = 0; i < 4; i++) {
        if (previewBlocks[i] !== null && previewBlocks[i].image !== null) {
            //previewBlocks[i].image.src = 'tetris_block_purple.gif';
            previewBlocks[i].image.src = 'tetris_block_base.png';
            previewBlocks[i].image.style.backgroundColor = JBlockColor;
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

    for (let i: number = 0; i < 4; i++) {
        if (previewBlocks[i] !== null && previewBlocks[i].image !== null) {
            previewBlocks[i].image.style.top = PIECE_WIDTH * previewBlocks[i].y + 12 + "px";
            previewBlocks[i].image.style.left = PIECE_HEIGHT * previewBlocks[i].x + 44 + "px";
        }
    }
}

const previewSBlock = (previewBlocks: Block[]): void => {
    for (let i: number = 0; i < 4; i++) {
        if (previewBlocks[i] !== null && previewBlocks[i].image !== null) {
            //previewBlocks[i].image.src = 'tetris_block_blue.gif';
            previewBlocks[i].image.src = 'tetris_block_base.png';
            previewBlocks[i].image.style.backgroundColor = SBlockColor;
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

    for (let i: number = 0; i < 4; i++) {
        if (previewBlocks[i] !== null && previewBlocks[i].image !== null) {
            previewBlocks[i].image.style.top = PIECE_WIDTH * previewBlocks[i].y + 28 + "px";
            previewBlocks[i].image.style.left = PIECE_HEIGHT * previewBlocks[i].x + 28 + "px";
        }
    }
}

const previewZBlock = (previewBlocks: Block[]): void => {
    for (let i: number = 0; i < 4; i++) {
        if (previewBlocks[i] !== null && previewBlocks[i].image !== null) {
            //previewBlocks[i].image.src = 'tetris_block_orange.gif';
            previewBlocks[i].image.src = 'tetris_block_base.png';
            previewBlocks[i].image.style.backgroundColor = ZBlockColor;
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

    for (let i: number = 0; i < 4; i++) {
        if (previewBlocks[i] !== null && previewBlocks[i].image !== null) {
            previewBlocks[i].image.style.top = PIECE_WIDTH * previewBlocks[i].y + 28 + "px";
            previewBlocks[i].image.style.left = PIECE_HEIGHT * previewBlocks[i].x + 28 + "px";
        }
    }
}

const previewSquareBlock = (previewBlocks: Block[]): void => {
    for (let i: number = 0; i < 4; i++) {
        if (previewBlocks[i] !== null && previewBlocks[i].image !== null) {
            //previewBlocks[i].image.src = 'tetris_block_gray.gif';
            previewBlocks[i].image.src = 'tetris_block_base.png';
            previewBlocks[i].image.style.backgroundColor = SquareBlockColor;
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

    for (let i: number = 0; i < 4; i++) {
        if (previewBlocks[i] !== null && previewBlocks[i].image !== null) {
            previewBlocks[i].image.style.top = PIECE_WIDTH * previewBlocks[i].y + 28 + "px";
            previewBlocks[i].image.style.left = PIECE_HEIGHT * previewBlocks[i].x + 44 + "px";
        }
    }
}

const previewTBlock = (previewBlocks: Block[]): void => {
    for (let i: number = 0; i < 4; i++) {
        if (previewBlocks[i] !== null && previewBlocks[i].image !== null) {
            //previewBlocks[i].image.src = 'tetris_block_green.gif';
            previewBlocks[i].image.src = 'tetris_block_base.png';
            previewBlocks[i].image.style.backgroundColor = TBlockColor;
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

    for (let i: number = 0; i < 4; i++) {
        if (previewBlocks[i] !== null && previewBlocks[i].image !== null) {
        previewBlocks[i].image.style.top = PIECE_WIDTH * previewBlocks[i].y + 28 + "px";
            previewBlocks[i].image.style.left = PIECE_HEIGHT * previewBlocks[i].x + 28 + "px";
        }
    }
}

const removeLine = (y: number): void => {
    // Check all playingArea's children - they should all be of type 'block'
    let playingArea: (HTMLElement | null) = document.getElementById("playingArea");

    if (playingArea !== null) {
        let blockImages: NodeListOf<ChildNode> = playingArea.childNodes;
        for (let i: number = 0; i < blockImages.length; i++)
            if ((blockImages[i].firstChild as HTMLImageElement).style.top === ((y - 2) * PIECE_HEIGHT + "px")) {
                (blockImages[i].firstChild as HTMLImageElement).style.visibility = 'hidden';
            }

        // shift everything above this line down one
        for (let i: number = 0; i < blockImages.length; i++) {
            if (parseInt((blockImages[i].firstChild as HTMLImageElement).style.top) < ((y - 2) * PIECE_HEIGHT)) {
                (blockImages[i].firstChild as HTMLImageElement).style.top = parseInt((blockImages[i].firstChild as HTMLImageElement).style.top) + PIECE_HEIGHT + "px";
            }
        }
    }

    // Update collision grid
    for (let x: number = 0; x < BOARD_WIDTH; x++) {
        playingGrid[x][y] = null;
    }

    // Update the collision grid to shift down every row above this line
    for (; y > 0; y--)
        for (let x: number = 0; x < BOARD_WIDTH; x++)
            playingGrid[x][y] = playingGrid[x][y - 1];

    totalNumLines++;
    if (totalNumLines % 10 === 0) {
        incrementSpeed();
    }
}

const levelUp = (newLevel: number): void => {
    // cycle thru hue values as the time changes
    let hue: number = (currentScore / 5) % 255;
    let r: number = hue + 255 / 3;
    let g: number = hue;
    let b: number = hue - 255 / 3;

    if (r > 255) r -= 255;
    if (b < 0) b += 255;

    r = scaleForHue(r);
    g = scaleForHue(g);
    b = scaleForHue(b);
    
    let playingArea: (HTMLElement | null) = document.getElementById("playingArea");
    if (playingArea !== null) {
        playingArea.style.backgroundColor = 'rgb(' + r + ', ' + g + ', ' + b + ')';
    }
}

// Check whether the player has achieved any lines. If so, clear them
const checkForLines = (): void => {
    let numLinesFound: number = 0;

    // Check for lines from the top down
    for (let y: number = 0; y < BOARD_HEIGHT; y++) {
        let numBlocks: number = 0;
        for (let x: number = 0; x < BOARD_WIDTH; x++) {
            if (playingGrid[x][y] !== null) {
                numBlocks++;
            }
            else
                break;

            if (numBlocks === BOARD_WIDTH) {
                removeLine(y);
                numLinesFound++;
            }
        }
    }

    let levelNumber: number = Math.floor(totalNumLines / 10);

    let oldLevelNumber: number = Math.floor((totalNumLines - numLinesFound) / 10);
    if (oldLevelNumber !== levelNumber)
            levelUp(levelNumber);

    if (numLinesFound === 1)
        incrementScore(40 * (levelNumber + 1));
    else if (numLinesFound === 2)
        incrementScore(100 * (levelNumber + 1));
    else if (numLinesFound === 3)
        incrementScore(300 * (levelNumber + 1));
    else if (numLinesFound === 4)
        incrementScore(1200 * (levelNumber + 1));
}

const createNewPiece = (): void => {
    checkForLines();

    currentPiece = addPiece(nextPieceType);
    nextPieceType = Math.floor((Math.random() * 7));
    for (let i: number = 0; i < 4; i++) {
        let nextPieceBox: (HTMLElement | null) = document.getElementById("nextPieceBox");
        if (nextPieceBox !== null) {
            nextPieceBox.removeChild(previewBlocks[i].div);
        }
    }

    setPreviewPiece(nextPieceType);
}

// Return true if we find a collision here
const addToPlayingGrid = (block: Block): boolean => {
    let collision: boolean = (playingGrid[block.x][block.y] !== null);
    
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

const removeFromPlayingGrid = (x: number, y: number, block: Block): void => {
    playingGrid[x][y] = null;

    // Update graphics
    if (block !== null && block.image !== null) {
        block.image.style.display = 'none';
    }
}

// various piece types
function addIBar(blocks: Block[], centerPos: number) {
    for (let i: number = 0; i < 4; i++) {
        if (blocks[i] !== null && blocks[i].image !== null) {
            //blocks[i].image.src = 'tetris_block.gif';
            blocks[i].image.src = 'tetris_block_base.png';
            blocks[i].image.style.backgroundColor = IBarColor;
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
    blocks[0].y = 0
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

const addLBlock = (blocks: Block[], centerPos: number): boolean => {
    for (let i: number = 0; i < 4; i++)
        if (blocks[i] !== null && blocks[i].image !== null) {
            //blocks[i].image.src = 'tetris_block_yellow.gif';
            blocks[i].image.src = 'tetris_block_base.png';
            blocks[i].image.style.backgroundColor = LBlockColor;
        }

    // Set positions for the block graphics
    blocks[0].image.style.left = PIECE_WIDTH * (0 + centerPos) + "px";
    blocks[1].image.style.left = PIECE_WIDTH * (0 + centerPos) + "px";
    blocks[1].image.style.top = PIECE_HEIGHT * 1 + "px";
    blocks[2].image.style.left = PIECE_WIDTH * (0 + centerPos) + "px";
    blocks[2].image.style.top = PIECE_HEIGHT * 2 + "px";
    blocks[3].image.style.left = PIECE_WIDTH * (1 + centerPos) + "px";
    blocks[3].image.style.top = PIECE_HEIGHT * 2 + "px";

    // Fill in spots in our tetris grid
    let collision: boolean = false;
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

const addJBlock = (blocks: Block[], centerPos: number): boolean => {
    for (let i: number = 0; i < 4; i++) {
        //blocks[i].image.src = 'tetris_block_purple.gif';
        blocks[i].image.src = 'tetris_block_base.png';
        blocks[i].image.style.backgroundColor = JBlockColor;
}

    // Set positions for the block graphics
    blocks[0].image.style.left = PIECE_WIDTH * (0 + centerPos) + "px";
    blocks[0].image.style.top = PIECE_HEIGHT * 2 + "px";
    blocks[1].image.style.left = PIECE_WIDTH * (1 + centerPos) + "px";
    blocks[2].image.style.left = PIECE_WIDTH * (1 + centerPos) + "px";
    blocks[2].image.style.top = PIECE_HEIGHT * 1 + "px";
    blocks[3].image.style.left = PIECE_WIDTH * (1 + centerPos) + "px";
    blocks[3].image.style.top = PIECE_HEIGHT * 2 + "px";

    // Fill in spots in our tetris grid
    let collision: boolean = false;
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

const addSBlock = (blocks: Block[], centerPos: number): boolean => {
    for (let i: number = 0; i < 4; i++) {
        //blocks[i].image.src = 'tetris_block_blue.gif';
        blocks[i].image.src = 'tetris_block_base.png';
        blocks[i].image.style.backgroundColor = SBlockColor;
    }

    // Set positions for the block graphics
    blocks[0].image.style.left = PIECE_WIDTH * (1 + centerPos) + "px";
    blocks[1].image.style.left = PIECE_WIDTH * (2 + centerPos) + "px";
    blocks[2].image.style.left = PIECE_WIDTH * (0 + centerPos) + "px";
    blocks[2].image.style.top = PIECE_HEIGHT * 1 + "px";
    blocks[3].image.style.left = PIECE_WIDTH * (1 + centerPos) + "px";
    blocks[3].image.style.top = PIECE_HEIGHT * 1 + "px";

    // Fill in spots in our tetris grid
    let collision: boolean = false;
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

const addZBlock = (blocks: Block[], centerPos: number): boolean => {
    for (let i: number = 0; i < 4; i++)
        if (blocks[i] !== null && blocks[i].image !== null) {
            //blocks[i].image.src = 'tetris_block_orange.gif';
            blocks[i].image.src = 'tetris_block_base.png';
            blocks[i].image.style.backgroundColor = ZBlockColor;
        }

    // Set positions for the block graphics
    blocks[0].image.style.left = PIECE_WIDTH * (0 + centerPos) + "px";
    blocks[1].image.style.left = PIECE_WIDTH * (1 + centerPos) + "px";
    blocks[2].image.style.left = PIECE_WIDTH * (1 + centerPos) + "px";
    blocks[2].image.style.top = PIECE_HEIGHT * 1 + "px";
    blocks[3].image.style.left = PIECE_WIDTH * (2 + centerPos) + "px";
    blocks[3].image.style.top = PIECE_HEIGHT * 1 + "px";

    // Fill in spots in our tetris grid
    let collision: boolean = false;
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

const addSquareBlock = (blocks: Block[], centerPos: number): boolean => {
    for (let i: number = 0; i < 4; i++)
        if (blocks[i] !== null && blocks[i].image !== null) {
            //blocks[i].image.src = 'tetris_block_gray.gif';
            blocks[i].image.src = 'tetris_block_base.png';
            blocks[i].image.style.backgroundColor = SquareBlockColor;
        }

    // Set positions for the block graphics
    blocks[0].image.style.left = PIECE_WIDTH * (0 + centerPos) + "px";
    blocks[1].image.style.left = PIECE_WIDTH * (1 + centerPos) + "px";
    blocks[2].image.style.left = PIECE_WIDTH * (0 + centerPos) + "px";
    blocks[2].image.style.top = PIECE_HEIGHT * 1 + "px";
    blocks[3].image.style.left = PIECE_WIDTH * (1 + centerPos) + "px";
    blocks[3].image.style.top = PIECE_HEIGHT * 1 + "px";

    // Fill in spots in our tetris grid
    let collision: boolean = false;
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

const addTBlock = (blocks: Block[], centerPos: number): boolean => {
    for (let i: number = 0; i < 4; i++)
        if (blocks[i] !== null && blocks[i].image !== null) {
            //blocks[i].image.src = 'tetris_block_green.gif';
            blocks[i].image.src = 'tetris_block_base.png';
            blocks[i].image.style.backgroundColor = TBlockColor;
        }

    // Set positions for the block graphics
    blocks[0].image.style.left = PIECE_WIDTH * (1 + centerPos) + "px";
    blocks[1].image.style.left = PIECE_WIDTH * (0 + centerPos) + "px";
    blocks[1].image.style.top = PIECE_HEIGHT * 1 + "px";
    blocks[2].image.style.top = PIECE_HEIGHT * 1 + "px";
    blocks[2].image.style.left = PIECE_WIDTH * (1 + centerPos) + "px";
    blocks[3].image.style.top = PIECE_HEIGHT * 1 + "px";
    blocks[3].image.style.left = PIECE_WIDTH * (2 + centerPos) + "px";

    // Fill in spots in our tetris grid
    let collision: boolean = false;
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

const addPiece = (pieceType: number): Piece => {
    let piece: Piece = new Piece(pieceType);

    // Every piece has 4 segments
    let newBlocks: Block[] = new Array<Block>(4);
    piece.blocks = newBlocks;
    //let newPieceImages: HTMLImageElement[] = new Array<HTMLImageElement>(4);
    //piece.images = new Array<HTMLImageElement>(4);
    for (let i: number = 0; i < 4; i++) {
        let newBlock: Block = new Block();
        newBlocks[i] = newBlock;

        newBlocks[i].div = document.createElement('div');
        //newPieceImages[i] = document.createElement('img');
        //newBlocks[i].image = newPieceImages[i];
        newBlocks[i].image = document.createElement('img');
        //newBlocks[i].image.src = 'tetris_block.gif';
        newBlocks[i].image.src = 'tetris_block_base.png';
        newBlocks[i].image.style.backgroundColor = '#ff0000';
        newBlocks[i].div.appendChild(newBlocks[i].image);
        
        newBlocks[i].image.style.position = 'absolute';
        newBlocks[i].image.style.top = "0px";
        newBlocks[i].image.style.left = "0px";
    }

    //newBlocks[0].image.src = {tetris_block}; // TEST

    let screenCenter: number = 4;
    let collision: boolean = false;

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

    if (collision === true)
        isGameOver = true;

    // Add the block to the onscreen DIV
    for (let i: number = 0; i < 4; i++) {
        let playingArea: (HTMLElement | null) = document.getElementById("playingArea");
        if (playingArea !== null) {
            playingArea.appendChild(newBlocks[i].div);
        }
    }

    // reset the timer causing pieces to drop
    lastPieceTime = new Date().getTime();

    return piece;
}

const setPreviewPiece = (pieceType: number): void => {
    previewBlocks = new Array<Block>(4);

    for (let i: number = 0; i < 4; i++) {
        let newBlock = new Block();
        previewBlocks[i] = newBlock;

        previewBlocks[i].div = null;
        previewBlocks[i].div = document.createElement('div');
        previewBlocks[i].image = document.createElement('img');
        previewBlocks[i].div.appendChild(previewBlocks[i].image);

        previewBlocks[i].image.style.position = 'absolute';
        previewBlocks[i].image.style.top = "0px";
        previewBlocks[i].image.style.left = "0px";
        let nextPieceBox: (HTMLElement | null) = document.getElementById("nextPieceBox");
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

const doesPieceCollideWithBlocksOnLeft = (): boolean => {
    let numCollisionsWithBlocksOnLeft: number = 0;
    for (let i: number = 0; i < 4; i++) {
        if (playingGrid[(currentPiece.blocks[i].x - 1)][currentPiece.blocks[i].y] !== null)
            numCollisionsWithBlocksOnLeft++;
    }

    let collided: boolean = false;
    switch (currentPiece.type) {
    case I_BAR_PIECE:
        if (currentPiece.rotation % 2 === 0) {
            if (numCollisionsWithBlocksOnLeft > 3)
                collided = true;
        }
        else
            if (numCollisionsWithBlocksOnLeft > 0)
                collided = true;
        break;
    case L_BLOCK_PIECE:
    case J_BLOCK_PIECE:
        if (currentPiece.rotation % 2 === 0) {
            if (numCollisionsWithBlocksOnLeft > 1)
                collided = true;
        }
        else
            if (numCollisionsWithBlocksOnLeft > 2)
                collided = true;
        break;
    case S_BLOCK_PIECE:
    case Z_BLOCK_PIECE:
            if (currentPiece.rotation % 2 === 0) {
                if (numCollisionsWithBlocksOnLeft > 2)
                    collided = true;
            }
            else
                if (numCollisionsWithBlocksOnLeft > 1)
                    collided = true;
            break;
    case SQUARE_PIECE:
            if (numCollisionsWithBlocksOnLeft > 2)
                collided = true;
            break;
    case T_BLOCK_PIECE:
        if (currentPiece.rotation % 2 === 0) {
            if (numCollisionsWithBlocksOnLeft > 2)
                collided = true;
        }
        else
            if (numCollisionsWithBlocksOnLeft > 1)
                collided = true;
        break;
    }

    return collided;
}

const doesPieceCollideWithBlocksOnRight = (): boolean => {
    let numCollisionsWithBlocksOnRight: number = 0;
    for (let i: number = 0; i < 4; i++) {
        if (playingGrid[(currentPiece.blocks[i].x + 1)][currentPiece.blocks[i].y] !== null)
            numCollisionsWithBlocksOnRight++;
    }

    let collided: boolean = false;
    switch (currentPiece.type) {
    case I_BAR_PIECE:
        if (currentPiece.rotation % 2 === 0) {
            if (numCollisionsWithBlocksOnRight > 3)
                collided = true;
        }
        else
            if (numCollisionsWithBlocksOnRight > 0)
                collided = true;
        break;
    case L_BLOCK_PIECE:
    case J_BLOCK_PIECE:
        if (currentPiece.rotation % 2 === 0) {
            if (numCollisionsWithBlocksOnRight > 1)
                collided = true;
        }
        else
            if (numCollisionsWithBlocksOnRight > 2)
                collided = true;
        break;
    case S_BLOCK_PIECE:
    case Z_BLOCK_PIECE:
        if (currentPiece.rotation % 2 === 0) {
            if (numCollisionsWithBlocksOnRight > 2)
                collided = true;
        }
        else
            if (numCollisionsWithBlocksOnRight > 1)
                collided = true;
        break;
    case SQUARE_PIECE:
        if (numCollisionsWithBlocksOnRight > 2)
            collided = true;
        break;
    case T_BLOCK_PIECE:
        if (currentPiece.rotation % 2 === 0) {
            if (numCollisionsWithBlocksOnRight > 2)
                collided = true;
        }
        else
            if (numCollisionsWithBlocksOnRight > 1)
                collided = true;
        break;
    }

    return collided;
}

const didPieceCollideWithBlocksBelow = (): boolean => {
    let numCollisionsWithBlocksBelow: number = 0;
    for (let i: number = 0; i < 4; i++) {
        if (playingGrid[(currentPiece.blocks[i].x)][currentPiece.blocks[i].y + 1] !== null) {
            numCollisionsWithBlocksBelow++;
        }
    }

    let collided: boolean = false;
    switch (currentPiece.type) {
    case I_BAR_PIECE:
            if (currentPiece.rotation % 2 === 0) {
                if (numCollisionsWithBlocksBelow > 0)
                    collided = true;
            }
            else
                if (numCollisionsWithBlocksBelow > 3)
                    collided = true;
            break;
    case L_BLOCK_PIECE:
    case J_BLOCK_PIECE:
        if (currentPiece.rotation % 2 === 0) {
            if (numCollisionsWithBlocksBelow > 2)
                collided = true;
        }
        else
            if (numCollisionsWithBlocksBelow > 1)
                collided = true;
        break;
    case S_BLOCK_PIECE:
    case Z_BLOCK_PIECE:
        if (currentPiece.rotation % 2 === 0) {
            if (numCollisionsWithBlocksBelow > 1)
                collided = true;
            }
            else
                if (numCollisionsWithBlocksBelow > 2)
                    collided = true;
            break;
    case SQUARE_PIECE:
            if (numCollisionsWithBlocksBelow > 2)
                    collided = true;
            break;
    case T_BLOCK_PIECE:
        if (currentPiece.rotation % 2 === 0) {
            if (numCollisionsWithBlocksBelow > 1)
                collided = true;
        }
        else
            if (numCollisionsWithBlocksBelow > 2)
                collided = true;
        break;
    }

    // Check if the piece hit the floor of the board
    if (collided === false) {
        for (let i: number = 0; i < 4; i++)
            if ((currentPiece.blocks[i].y + 1) >= BOARD_HEIGHT)
                return true;
    }

    return collided;
}

const moveCurrentPieceRight = (): void => {
    // Update internal playing grid array
    for (let i: number = 0; i < 4; i++) {
        removeFromPlayingGrid(currentPiece.blocks[i].x, currentPiece.blocks[i].y, currentPiece.blocks[i]);

        currentPiece.blocks[i].x = currentPiece.blocks[i].x + 1;
    }
    for (let i: number = 0; i < 4; i++) {
        addToPlayingGrid(currentPiece.blocks[i]);
    }

    // Update graphics
    for (let i: number = 0; i < 4; i++) {
        currentPiece.blocks[i].image.style.left = PIECE_WIDTH * currentPiece.blocks[i].x + "px";
        currentPiece.blocks[i].image.style.top = PIECE_HEIGHT * currentPiece.blocks[i].y  - (2 * PIECE_HEIGHT) + "px";
    }

    currentPiece.x += 1;
}

const moveCurrentPieceLeft = (): void => {
    // Update internal playing grid array
    for (let i: number = 0; i < 4; i++) {
        removeFromPlayingGrid(currentPiece.blocks[i].x, currentPiece.blocks[i].y, currentPiece.blocks[i]);

        currentPiece.blocks[i].x = currentPiece.blocks[i].x - 1;
    }
    for (let i: number = 0; i < 4; i++) {
        addToPlayingGrid(currentPiece.blocks[i]);
    }

    // Update graphics
    for (let i: number = 0; i < 4; i++) {
        currentPiece.blocks[i].image.style.left = PIECE_WIDTH * currentPiece.blocks[i].x + "px";
        currentPiece.blocks[i].image.style.top = PIECE_HEIGHT * currentPiece.blocks[i].y - (2 * PIECE_HEIGHT) + "px";
    }

    currentPiece.x -= 1;
}

const moveCurrentPieceDown = (): void => {
    if (didPieceCollideWithBlocksBelow() === true) {
        createNewPiece();
        return;
    }

    // Update internal playing grid array
    for (let i: number = 0; i < 4; i++) {
        removeFromPlayingGrid(currentPiece.blocks[i].x, currentPiece.blocks[i].y, currentPiece.blocks[i]);

        currentPiece.blocks[i].y = currentPiece.blocks[i].y + 1;
    }
    for (let i: number = 0; i < 4; i++) {
        addToPlayingGrid(currentPiece.blocks[i]);
    }

    // DEBUG - Print current playingGrid
    for (let y: number = 0; y < BOARD_HEIGHT; y++) {
        let debugRowData = " ";
        for (let x: number = 0; x < BOARD_WIDTH; x++) {
            debugRowData += (playingGrid[x][y] === null) ? " " : "X";
        }
        //console.log(debugRowData);
    }
    //console.log("============");

    currentPiece.y += 1;
}

const moveCurrentPiece = (direction): void => {
    if (direction === DIRECTION_RIGHT) {
        // Check whether the place we want to move the piece to is free
        let failed: boolean = false;

        // Check for wall collisions
        for (let i: number = 0; i < 4; i++) {
            if ((currentPiece.blocks[i].x + 1) >= BOARD_WIDTH) {
                failed = true;
                break;
            }
        }

        if (failed === false)
            if (doesPieceCollideWithBlocksOnRight() === false)
                moveCurrentPieceRight();
    }

    if (direction === DIRECTION_LEFT) {
        // Check whether the place we want to move the piece to is free
        let failed: boolean = false;

        // Check for wall collisions
        for (let i: number = 0; i < 4; i++) {
            if (currentPiece.blocks[i].x <= 0) {
                failed = true;
                break;
            }
        }

        if (failed === false)
            if (doesPieceCollideWithBlocksOnLeft() === false)
                moveCurrentPieceLeft();
    }

    if (direction === DIRECTION_DOWN) {
        moveCurrentPieceDown();
    }
}

const rotateIBar = (): void => {
    if (currentPiece.rotation % 2 === 0) { // rotate into vertical position
        if ((currentPiece.y - 2) >= 0 &&
            playingGrid[currentPiece.x][currentPiece.y - 2] == null &&
            playingGrid[currentPiece.x][currentPiece.y - 1] == null &&
            playingGrid[currentPiece.x][currentPiece.y + 1] == null) {
            // remove piece from its previous position
            for (let i: number = 0; i < 4; i++)
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

            for (let i: number = 0; i < 4; i++)
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
            for (let i: number = 0; i < 4; i++)
                removeFromPlayingGrid(currentPiece.blocks[i].x, currentPiece.blocks[i].y, currentPiece.blocks[i]);
            
            // add the piece in its new position
            currentPiece.blocks[0].x = currentPiece.x - 2;
            currentPiece.blocks[0].y = currentPiece.y;
            currentPiece.blocks[1].x = currentPiece.x - 1;
            currentPiece.blocks[1].y = currentPiece.y;
            currentPiece.blocks[3].x = currentPiece.x + 1;
            currentPiece.blocks[3].y = currentPiece.y;

            for (let i: number = 0; i < 4; i++)
                addToPlayingGrid(currentPiece.blocks[i]);
            
            // record that the rotation occurred
            currentPiece.rotation += 1;
        }
    }
}

const rotateLBlock = (): void => {
    if (currentPiece.rotation % 4 === 0) {
        if ((currentPiece.x - 1) >= 0 &&
            (currentPiece.x + 1) < BOARD_WIDTH &&
            playingGrid[currentPiece.x - 1][currentPiece.y] == null &&
            playingGrid[currentPiece.x - 1][currentPiece.y + 1] == null &&
            playingGrid[currentPiece.x + 1][currentPiece.y] == null) {
            // remove piece from its previous position
            for (let i: number = 0; i < 4; i++)
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

            for (let i: number = 0; i < 4; i++)
                addToPlayingGrid(currentPiece.blocks[i]);
            
            // record that the rotation occurred
            currentPiece.rotation += 1;
        }
    }
    else if (currentPiece.rotation % 4 === 1) {
        if (playingGrid[currentPiece.x - 1][currentPiece.y - 1] == null &&
            playingGrid[currentPiece.x][currentPiece.y - 1] == null &&
            playingGrid[currentPiece.x][currentPiece.y + 1] == null) {
            // remove piece from its previous position
            for (let i: number = 0; i < 4; i++)
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

            for (let i: number = 0; i < 4; i++)
                addToPlayingGrid(currentPiece.blocks[i]);
            
            // record that the rotation occurred
            currentPiece.rotation += 1;
        }
    }
    else if (currentPiece.rotation % 4 === 2) {
        if ((currentPiece.x - 1) >= 0 &&
            playingGrid[currentPiece.x + 1][currentPiece.y - 1] == null &&
            playingGrid[currentPiece.x - 1][currentPiece.y] == null &&
            playingGrid[currentPiece.x + 1][currentPiece.y] == null) {
            // remove piece from its previous position
            for (let i: number = 0; i < 4; i++)
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

            for (let i: number = 0; i < 4; i++)
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
            for (let i: number = 0; i < 4; i++)
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

            for (let i: number = 0; i < 4; i++)
                addToPlayingGrid(currentPiece.blocks[i]);
            
            // record that the rotation occurred
            currentPiece.rotation += 1;
        }
    }
}

const rotateJBlock = (): void => {
    if (currentPiece.rotation % 4 === 0) {
        if ((currentPiece.x + 1) < BOARD_WIDTH &&
            playingGrid[currentPiece.x - 1][currentPiece.y - 1] == null &&
            playingGrid[currentPiece.x - 1][currentPiece.y] == null &&
            playingGrid[currentPiece.x + 1][currentPiece.y] == null) {
            // remove piece from its previous position
            for (let i: number = 0; i < 4; i++)
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

            for (let i: number = 0; i < 4; i++)
                addToPlayingGrid(currentPiece.blocks[i]);
            
            // record that the rotation occurred
            currentPiece.rotation += 1;
        }						
    }
    else if (currentPiece.rotation % 4 === 1) {
        if (playingGrid[currentPiece.x][currentPiece.y - 1] == null &&
            playingGrid[currentPiece.x + 1][currentPiece.y - 1] == null &&
            playingGrid[currentPiece.x][currentPiece.y + 1] == null) {
            // remove piece from its previous position
            for (let i: number = 0; i < 4; i++)
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

            for (let i: number = 0; i < 4; i++)
                addToPlayingGrid(currentPiece.blocks[i]);
            
            // record that the rotation occurred
            currentPiece.rotation += 1;
        }
    }
    else if (currentPiece.rotation % 4 === 2) {
        if ((currentPiece.x - 1) >= 0 &&
            playingGrid[currentPiece.x - 1][currentPiece.y] == null &&
            playingGrid[currentPiece.x + 1][currentPiece.y] == null &&
            playingGrid[currentPiece.x + 1][currentPiece.y + 1] == null) {
            // remove piece from its previous position
            for (let i: number = 0; i < 4; i++)
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

            for (let i: number = 0; i < 4; i++)
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
            for (let i: number = 0; i < 4; i++)
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

            for (let i: number = 0; i < 4; i++)
                addToPlayingGrid(currentPiece.blocks[i]);
            
            // record that the rotation occurred
            currentPiece.rotation += 1;
        }
    }
}

const rotateSBlock = (): void => {
    if (currentPiece.rotation % 2 === 0) {
        if ((currentPiece.y - 1) >= 0 &&
            playingGrid[currentPiece.x][currentPiece.y - 1] == null &&
            playingGrid[currentPiece.x + 1][currentPiece.y + 1] == null) {
            // remove piece from its previous position
            for (let i: number = 0; i < 4; i++)
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
            
            for (let i: number = 0; i < 4; i++)
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
            for (let i: number = 0; i < 4; i++)
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

            for (let i: number = 0; i < 4; i++)
                addToPlayingGrid(currentPiece.blocks[i]);
            
            // record that the rotation occurred
            currentPiece.rotation += 1;
        }
    }
}

const rotateZBlock = (): void => {
    if (currentPiece.rotation % 2 === 0) {
        if ((currentPiece.y - 1) >= 0 &&
            playingGrid[currentPiece.x + 1][currentPiece.y - 1] == null &&
            playingGrid[currentPiece.x + 1][currentPiece.y] == null) {
            // remove piece from its previous position
            for (let i: number = 0; i < 4; i++)
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

            for (let i: number = 0; i < 4; i++)
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
            for (let i: number = 0; i < 4; i++)
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

            for (let i: number = 0; i < 4; i++)
                addToPlayingGrid(currentPiece.blocks[i]);
            
            // record that the rotation occurred
            currentPiece.rotation += 1;
        }
    }
}

const rotateTBlock = (): void => {
    if (currentPiece.rotation % 4 === 0) {
        if (playingGrid[currentPiece.x][currentPiece.y + 1] == null) {
            // remove piece from its previous position
            for (let i: number = 0; i < 4; i++)
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

            for (let i: number = 0; i < 4; i++)
                addToPlayingGrid(currentPiece.blocks[i]);
            
            // record that the rotation occurred
            currentPiece.rotation += 1;
        }
    }
    else if (currentPiece.rotation % 4 === 1) {
        if ((currentPiece.x - 1) >= 0 &&
            playingGrid[currentPiece.x - 1][currentPiece.y] == null) {
            // remove piece from its previous position
            for (let i: number = 0; i < 4; i++)
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

            for (let i: number = 0; i < 4; i++)
                addToPlayingGrid(currentPiece.blocks[i]);
            
            // record that the rotation occurred
            currentPiece.rotation += 1;
        }
    }
    else if (currentPiece.rotation % 4 === 2) {
        if ((currentPiece.y - 1) >= 0 &&
            playingGrid[currentPiece.x][currentPiece.y - 1] == null) {
            // remove piece from its previous position
            for (let i: number = 0; i < 4; i++)
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

            for (let i: number = 0; i < 4; i++)
                addToPlayingGrid(currentPiece.blocks[i]);
            
            // record that the rotation occurred
            currentPiece.rotation += 1;
        }
    }
    else {
        if ((currentPiece.x + 1) < BOARD_WIDTH &&
            playingGrid[currentPiece.x + 1][currentPiece.y] == null) {
            // remove piece from its previous position
            for (let i: number = 0; i < 4; i++)
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

            for (let i: number = 0; i < 4; i++)
                addToPlayingGrid(currentPiece.blocks[i]);
            
            // record that the rotation occurred
            currentPiece.rotation += 1;
        }
    }
}

const rotateCurrentPiece = (direction: number): void => {
    if (direction === ROTATE_LEFT) {
            //currentPiece.rotation += 1;
    }
    else if (direction === ROTATE_RIGHT) {
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
function scaleForHue(color: number): number {
    if (color < 43)
        color = 255 - (255 * 6) * (color / 255.0);
    else if (color < 128)
        color = 0;
    else if (color < 171)
        color = (6 * 255) * (color / 255.0) - (255 * 3);
    else
        color = 255;

    // Scale color so it's bright (between 128 and 255)
    color = color / 2 + 128;

    return color;
}

const setCookie = (cname: string, cvalue: number, exdays: number): void => {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

const incrementScore = (amount: number): void => {
    currentScore += amount;

    // If this is a high score, push other old scores down the list
    let prevHighScore: number = 0;
    for (let i: number = 0; i < NUM_HIGH_SCORES; i++) {
        let highScoreDiv: (HTMLElement | null) = document.getElementById("highScoreText" + (i + 1));
        if (highScoreDiv != null) {
            console.log("found high score div " + (i + 1));
            // current high score: "rgb(0,192,64)";
            // existing high score: "rgb(0,192,64)";

            if (currentScore > Number(highScoreDiv.innerHTML) /*&& highScoreDiv.style.color == "rgb(0, 0, 0)"*/) {
                prevHighScore = Number(highScoreDiv.innerHTML);
                highScoreDiv.innerHTML = "" + currentScore;
                highScoreDiv.style.color = "rgb(0,192,64)";

                // push all other scores down the list and make them "rgb(0,0,0)"
                let updatedHighScore: number = prevHighScore;
                for (i = i + 1; i < NUM_HIGH_SCORES; i++) {
                    let highScoreDiv: (HTMLElement | null) = document.getElementById("highScoreText" + (i + 1));
                    if (highScoreDiv != null) {
                        prevHighScore = Number(highScoreDiv.innerHTML);
                        if (prevHighScore !== 0)
                            highScoreDiv.innerHTML = "" + prevHighScore;
                        highScoreDiv.style.color = "rgb(0,0,0)";
                                
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

    let scoreBox: (HTMLElement | null) = document.getElementById("scoreBox");
    if (scoreBox !== null) {
        scoreBox.innerHTML = 'Score: ' + currentScore + "; Lines: " + totalNumLines;
    }

}

const gameOver = (): void => {
    isGameOver = true;

    // TODO: Cookies
    // TODO: Only do this if there is an 'allowCookies' cookie 
    //     console.log("Setting cookie: " + currentScore);
    //     setCookie('score', currentScore, 10);

    let scoreBox: (HTMLElement | null) = document.getElementById("scoreBox");
    if (scoreBox !== null) {
        scoreBox.style.backgroundColor = 'rgb(128,0,0)';
    }

    let pausedBox: (HTMLElement | null) = document.getElementById("pausedBox");
    if (pausedBox !== null) {
        pausedBox.style.visibility = 'visible';
        pausedBox.innerHTML = "GAME OVER";
        pausedBox.style.color = "rgb(224,224,224)";
        pausedBox.style.backgroundColor = "red";
    }
    let playingAreaScreen: (HTMLElement | null) = document.getElementById("playingAreaScreen");
    if (playingAreaScreen !== null) {
        playingAreaScreen.style.visibility = 'visible';
    }

    // Add a NEW GAME button
    let playAgainButton: (HTMLElement | null) = document.getElementById("playAgainButton");
    if (playAgainButton !== null) {
        playAgainButton.style.visibility = 'visible';
    }
}

export default function Tetris() {
    useEffect(() => {
        init();
      }, []);

      {/* the playing area is 22 * 10, except that the top 2 rows are hidden
	    i.e. 320 x 704
        */}
    return (
        <div>
            <span className="italic absolute top-[140px] left-[100px]">Press up arrow to rotate.<br/>Press ESC to pause.</span>

            <div id="fullArea">
                <div id="playingArea" className="absolute top-[200px] left-[80px] border-t-[1px] w-[320px] h-[640px] bg-[#c0c0c0]">
                </div>
                    <div id="pausedBox" className="absolute top-[500px] left-[80px] border-t-[1px] border-black w-[320px] h-[48px] text-4xl text-center bold invisible z-10 text-orange-700 bg-[#08080]">
                        PAUSED
                    </div>
                    <button id="playAgainButton" onClick={startNewGame} className="absolute top-[580px] left-[163px] text-xl center invisible z-10 text-green-500 bg-[#c0c0c0]">
                        Click to Play Again
                    </button>
                    <div id="scoreBox" className="absolute top-[840px] left-[80px] border-t-[1px] border-black w-[320px] h-[24px] text-base text-white bg-[#208040]">
                        Score: 0; Lines: 0
                    </div>
                <div id="playingAreaScreen" className="absolute top-[200px] left-[80px] border-t-[1px] border-black w-[320px] h-[640px] opacity-80 bg-[#080808]"> </div>

                <div id="rightPanel">
                    <div id="nextPieceHeader" className="absolute top-[200px] left-[440px] w-[152px] center bold text-2xl">Next Piece:</div>
                    <div id="nextPieceBox" className="absolute top-[230px] left-[440px] border-t-[1px] border-black w-[152px] h-[120px] bg-[#c0c0c0]"></div>
                    <div id="highScoreHeader" className="absolute top-[365px] left-[440px] text-lg">High Scores:</div>
                </div>
            </div>
        </div>
    );
}
