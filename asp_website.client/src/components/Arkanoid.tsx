import React, { useEffect, useState } from 'react';
import ark_block_base from './ark_block_base.png';


class Block {
    div: (HTMLDivElement | null);
    image: (HTMLImageElement | null);
    pieceType: number;
    x: number;
    y: number;

    constructor() {
        this.div = null;
        this.image = null;
        this.x = 0;
        this.y = 0;
    };
}

class HighScore {
    scorerName: string;
    highScore: number;
    isCurrentScore: boolean;

    constructor() {
        this.scorerName = "";
        this.highScore = 0;
    }
}


// Initial speeds
let ballSpeed: number = 10;
let currentScore: number = 0;
let numBlocksDestroyed: number = 0;
let currentHighScores: HighScore[];

let playingGrid: Array<Array<(Block | null)>>; // array
let isGameOver: boolean = false;
let gameOverVarsSet: boolean = false;
let gameState: number;
let highScoresLoaded = false;
let currentUserName: string = "(current)";

const BOARD_WIDTH: number = 22;
const BOARD_HEIGHT: number = 22;
const PIECE_WIDTH: number = 64;
const PIECE_HEIGHT: number = 32;

const DIRECTION_UP_LEFT: number = 0;
const DIRECTION_UP_RIGHT: number = 1;
const DIRECTION_DOWN_LEFT: number = 2;
const DIRECTION_DOWN_RIGHT: number = 3;
let ballDirection: number = 0;

const STATE_GAME_RUNNING: number = 0;
const STATE_GAME_PAUSED: number = 1;

const NUM_HIGH_SCORES: number = 5;

let Level1Color: string = '#00ff00';

const gameLoop = (): void => {
    //game loop
    moveBall();

    //end conditions
    if (isGameOver === false && gameState !== STATE_GAME_PAUSED) {
        //still in play - keep the loop going
        gameOverVarsSet = false;
        setTimeout(gameLoop, 50);
    } else if (isGameOver === true) {
        gameOver();
    }
    else if (gameState === STATE_GAME_PAUSED) {
        // idle
    }
}

// Pull high scores from the server
const loadHighScores = async (): Promise<Response> => {
    if (highScoresLoaded) {
        currentHighScores.forEach((highScore) => { highScore.isCurrentScore = false; });
        return null;
    }

    const response: Promise<Response> = await fetch('arkanoidhighscores');
    const data: Array<HighScore> = await response.json();

    console.log("loadHighScores data: " + data);

    // Make all high scores black (which means they're not in the current game)
    for (let i: number = 0; i < NUM_HIGH_SCORES; i++) {
        //let highScoreDivName: string = "highScoreText" + (i + 1);
        let highScoreDiv: (HTMLElement | null) = document.getElementById("highScoreText" + (i + 1));
        if (highScoreDiv !== null) {
            highScoreDiv.style.color = "rgb(0,0,0)";
            highScoreDiv.innerHTML = "<div style='min-width: 180px;'><span style='font-weight: 500;'>" + data[i].scorerName + "</span> <span style='float: right;'>" + data[i].highScore + "</span></div>";

            currentHighScores[i].scorerName = data[i].scorerName;
            currentHighScores[i].highScore = data[i].highScore;
            currentHighScores[i].isCurrentScore = false;
        }
    }

    highScoresLoaded = true;

    return response;
}

const saveHighScores = async (): Promise<Response> => {
    const fetchSendHighScores = fetch('arkanoidhighscores', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentHighScores)
    })

    return fetchSendHighScores;
}

const movePaddle = (direction) => {
    // todo
}

const startNewGame = (): void => {
    currentScore = 0;
    numBlocksDestroyed = 0;
    ballSpeed = 10;

    let playingAreaScreen: (HTMLElement | null) = document.getElementById("playingAreaScreen");
    if (playingAreaScreen !== null) {
        playingAreaScreen.style.visibility = 'hidden';
    }

    let playAgainButton: (HTMLElement | null) = document.getElementById("playAgainButton");
    if (playAgainButton !== null) {
        playAgainButton.style.visibility = 'hidden';
    }

    let enterName: (HTMLElement | null) = document.getElementById("enterName");
    if (enterName !== null) {
        enterName.style.visibility = 'hidden';
    }
    
    let pausedBox: (HTMLElement | null) = document.getElementById("pausedBox");
    if (pausedBox !== null) {
        pausedBox.style.visibility = 'hidden';
        pausedBox.innerHTML = "PAUSED";
        pausedBox.style.color = "rgb(175, 58, 57)";
        pausedBox.style.backgroundColor = "rgb(192,192,192)";
    }

    let scoreBox: (HTMLElement | null) = document.getElementById("scoreBox");
    if (scoreBox !== null) {
        scoreBox.style.color = "white";
        scoreBox.style.backgroundColor = "rgb(68, 148, 229)";
        scoreBox.innerHTML = 'Score: ' + currentScore + "; Blocks Destroyed: " + numBlocksDestroyed;
    }

    loadHighScores();

    // Make all high scores black (which means they're not in the current game)
    for (let i: number = 0; i < NUM_HIGH_SCORES; i++) {
        //let highScoreDivName: string = "highScoreText" + (i + 1);
        let highScoreDiv: (HTMLElement | null) = document.getElementById("highScoreText" + (i + 1));
        if (highScoreDiv !== null) {
            highScoreDiv.style.color = "rgb(0,0,0)";
        }
    }
    
    isGameOver = false;

    // Clear out the playing area
    let playingArea: (HTMLElement | null) = document.getElementById("playingArea");
    if (playingArea !== null) {
        while (playingArea.hasChildNodes()) {
            playingArea.removeChild(playingArea.firstChild);
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
                case "KeyA":
                case "ArrowLeft":
                    movePaddle(DIRECTION_LEFT);
                    break;
                case "KeyD":
                case "ArrowRight":
                    movePaddle(DIRECTION_RIGHT);
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
    currentHighScores = new Array<HighScore>(NUM_HIGH_SCORES);
    for (let i: number = 0; i < NUM_HIGH_SCORES; i++)
        currentHighScores[i] = new HighScore();

    // Create high score DIV elements if they don't already exist
    let rightPanel: (HTMLElement | null) = document.getElementById("rightPanel");
    for (let i: number = 0; i < NUM_HIGH_SCORES; i++) {
        let highScoreDiv: HTMLDivElement = document.createElement('div');
        // TODO: Make sure the DIV elements don't already exist
        let top = (390 + (20) * i);
        highScoreDiv.className = "absolute top-[" + top + "px] left-[760px] text-lg";
        highScoreDiv.id = "highScoreText" + (i + 1);
        highScoreDiv.style.top = "" + top + "px";
        highScoreDiv.style.color = "rgb(0,0,0)";

        if (rightPanel !== null) {
            //console.log("Adding to right panel: " + highScoreDiv.id);
            rightPanel.appendChild(highScoreDiv);
        }
    }

    startNewGame();
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
    // 10-11             5 (0.08s)
    // 12-13             4 (0.07s)
    // 14-15               (0.06s)
    // 16-17             3 (0.05s)
    // 18-19               (0.04s)
    // 20-23             2 (0.03s)
    // 24-28               (0.035s)
    //   29+             1 (0.02s)

    // TODO
}

const removePiece = (y: number): void => {
    // Check all playingArea's children - they should all be of type 'block'
    let playingArea: (HTMLElement | null) = document.getElementById("playingArea");

    if (playingArea !== null) {
        let blockImages: NodeListOf<ChildNode> = playingArea.childNodes;
        for (let i: number = 0; i < blockImages.length; i++)
            if ((blockImages[i].firstChild as HTMLImageElement).style.top === ((y - 2) * PIECE_HEIGHT + "px")) {
                (blockImages[i].firstChild as HTMLImageElement).style.visibility = 'hidden';
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

    numBlocksDestroyed++;
    if (numBlocksDestroyed % 10 === 0) {
        incrementSpeed();
    }
}

const levelUp = (newLevel: number): void => {
    // todo
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

//const addTBlock = (blocks: Block[], centerPos: number): boolean => {
//    for (let i: number = 0; i < 4; i++)
//        if (blocks[i] !== null && blocks[i].image !== null) {
//            blocks[i].pieceType = T_BLOCK_PIECE;
//            blocks[i].image.src = tetris_block_base;
//            blocks[i].image.style.backgroundColor = TBlockColor;
//        }

//    // Set positions for the block graphics
//    blocks[0].image.style.left = PIECE_WIDTH * (1 + centerPos) + "px";
//    blocks[1].image.style.left = PIECE_WIDTH * (0 + centerPos) + "px";
//    blocks[1].image.style.top = PIECE_HEIGHT * 1 + "px";
//    blocks[2].image.style.top = PIECE_HEIGHT * 1 + "px";
//    blocks[2].image.style.left = PIECE_WIDTH * (1 + centerPos) + "px";
//    blocks[3].image.style.top = PIECE_HEIGHT * 1 + "px";
//    blocks[3].image.style.left = PIECE_WIDTH * (2 + centerPos) + "px";

//    // Fill in spots in our tetris grid
//    let collision: boolean = false;
//    blocks[0].x = 1 + centerPos;
//    blocks[0].y = 0;
//    collision = addToPlayingGrid(blocks[0]);
//    blocks[1].x = 0 + centerPos;
//    blocks[1].y = 1;
//    collision = addToPlayingGrid(blocks[1]) || collision;
//    blocks[2].x = 1 + centerPos;
//    blocks[2].y = 1;
//    collision = addToPlayingGrid(blocks[2]) || collision;
//    blocks[3].x = 2 + centerPos;
//    blocks[3].y = 1;
//    collision = addToPlayingGrid(blocks[3]) || collision;

//    return collision;
//}

const didBlockCollideWithBlocksOnLeft = (): boolean => {
    let numCollisionsWithBlocksOnLeft: number = 0;
    for (let i: number = 0; i < 4; i++) {
        if (playingGrid[(currentPiece.blocks[i].x - 1)][currentPiece.blocks[i].y] !== null)
            numCollisionsWithBlocksOnLeft++;
    }

    return numCollisionsWithBlocksOnLeft > 0;
}

const didBlockCollideWithBlocksOnRight = (): boolean => {
    let numCollisionsWithBlocksOnRight: number = 0;
    for (let i: number = 0; i < 4; i++) {
        if (playingGrid[(currentPiece.blocks[i].x + 1)][currentPiece.blocks[i].y] !== null)
            numCollisionsWithBlocksOnRight++;
    }

    return numCollisionsWithBlocksOnRight > 0;
}

const didBlockCollideWithBlocksBelow = (): boolean => {
    let numCollisionsWithBlocksBelow: number = 0;
    for (let i: number = 0; i < 4; i++) {
        if (playingGrid[(currentPiece.blocks[i].x)][currentPiece.blocks[i].y + 1] !== null) {
            numCollisionsWithBlocksBelow++;
        }
    }

    // Check if the piece hit the floor of the board
    let collided: boolean = false;
    if (collided === false) {
        for (let i: number = 0; i < 4; i++)
            if ((currentPiece.blocks[i].y + 1) >= BOARD_HEIGHT)
                return true;
    }

    return collided;
}

const didBlockCollideWithBlocksAbove = (): boolean => {
    return false;
}

const movePaddleRight = (): void => {
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

const movePaddleLeft = (): void => {
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

const moveBall = (direction: number): void => {
    if (direction === DIRECTION_UP_RIGHT) {
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

    if (direction === DIRECTION_UP_LEFT) {
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

    if (direction === DIRECTION_DOWN_RIGHT) {
        moveCurrentPieceDown();
    }
}

const redrawHighScores = (): void => {
    for (let i: number = 0; i < NUM_HIGH_SCORES; i++) {
        let highScoreDiv: (HTMLElement | null) = document.getElementById("highScoreText" + (i + 1));

        highScoreDiv.innerHTML = currentHighScores[i].scorerName + " " + currentHighScores[i].highScore;
        if (currentHighScores[i].isCurrentScore) {
            highScoreDiv.style.color = "rgb(0,192,64)";
        }
        else {
            highScoreDiv.style.color = "rgb(0,0,0)";
        }
    }
}

const newIncrementScore = (amount: number): void => {
    currentScore += amount;
    let currentScoreAdded: boolean = false;
    let redrawScores: boolean = false;
    let tempScore1: number = 0;
    let tempScorerName1: string = "";
    let tempScore2: number = 0;
    let tempScorerName2: string = "";

    // start at the top of the high score list and check whether the current score can fit anywhere in that list
    for (let i: number = 0; i < NUM_HIGH_SCORES; i++) {
        if (!currentScoreAdded && currentScore > currentHighScores[i].highScore) {
            if (currentHighScores[i].isCurrentScore) {
                currentHighScores[i].highScore = currentScore;
                currentHighScores[i].scorerName = currentUserName;
                currentHighScores[i].isCurrentScore = true;

                tempScore1 = 0;
            }
            else {
                tempScore1 = currentHighScores[i].highScore;
                tempScorerName1 = currentHighScores[i].scorerName;

                currentHighScores[i].highScore = currentScore;
                currentHighScores[i].scorerName = currentUserName;
                currentHighScores[i].isCurrentScore = true;
            }

            currentScoreAdded = true;
            redrawScores = true;
        }
        else if (currentScoreAdded && tempScore1 > 0) { // shift scores down
            if (currentHighScores[i].isCurrentScore) { // shift down 1 and overwrite previous (currentUserName) score
                currentHighScores[i].highScore = tempScore1;
                currentHighScores[i].scorerName = tempScorerName1;
                currentHighScores[i].isCurrentScore = false;

                break;
            }
            else if (!currentHighScores[i].isCurrentScore) { // save this score; shift down 1
                tempScore2 = currentHighScores[i].highScore;
                tempScorerName2 = currentHighScores[i].scorerName;

                currentHighScores[i].highScore = tempScore1;
                currentHighScores[i].scorerName = tempScorerName1;
                currentHighScores[i].isCurrentScore = false;

                tempScore1 = tempScore2;
                tempScorerName1 = tempScorerName2;
            }
        }
    }

    // Now draw score to screen
    if (redrawScores) {
        redrawHighScores();
    }

    let scoreBox: (HTMLElement | null) = document.getElementById("scoreBox");
    if (scoreBox !== null) {
        scoreBox.innerHTML = 'Score: ' + currentScore + "; Lines: " + totalNumLines;
    }
}

const incrementScore = (amount: number): void => {
    currentScore += amount;

    // If this is a high score, push other old scores down the list
    let prevHighScore: number = 0;
    for (let i: number = 0; i < NUM_HIGH_SCORES; i++) {
        let highScoreDiv: (HTMLElement | null) = document.getElementById("highScoreText" + (i + 1));
        if (highScoreDiv != null) {
            console.log("found high score div " + (i + 1) + ", value: " + Number(highScoreDiv.innerHTML));
            // current high score: "rgb(0,192,64)";
            // existing high score: "rgb(0,192,64)";

            if (currentScore > Number(highScoreDiv.innerHTML)) {
                if (highScoreDiv.style.color === "rgb(0, 0, 0)") {
                    console.log("REPLACING BLACK TEXT ON THE HIGH SCORES");
                    prevHighScore = Number(highScoreDiv.innerHTML);
                    highScoreDiv.innerHTML = "" + currentScore;
                    highScoreDiv.style.color = "rgb(0,192,64)";

                    // push all other scores down the list and make them "rgb(0,0,0)"
                    let updatedHighScore: number = prevHighScore;
                    console.log("Updated high score value: " + updatedHighScore);
                    for (i = i + 1; i < NUM_HIGH_SCORES; i++) {
                        highScoreDiv = document.getElementById("highScoreText" + (i + 1));
                        if (highScoreDiv != null && updatedHighScore !== 0) {
                            prevHighScore = Number(highScoreDiv.innerHTML);
                            highScoreDiv.innerHTML = "" + updatedHighScore;

                            if (updatedHighScore !== 0 && highScoreDiv.style.color === "rgb(0, 0, 0)") { // If a black score is found (a score from another game), shift it down the list
                                updatedHighScore = prevHighScore;
                            }
                            else { // If a colored score is found (an old score from the current game), replace it and stop shifting scores down
                                updatedHighScore = 0;
                            }
                            highScoreDiv.style.color = "rgb(0,0,0)";
                        }
                    }
                }
                else { // Found current game's previous score. Just replace it
                    console.log("Found a high score to replace; score is " + highScoreDiv.innerText);
                    highScoreDiv.innerHTML = "" + currentScore;
                }

                break;
            }
            else {
                //console.log("Found a high score div, but didn't replace it because its color was " + highScoreDiv.style.color);
            }
        }
    }

    console.log("====================");

    let scoreBox: (HTMLElement | null) = document.getElementById("scoreBox");
    if (scoreBox !== null) {
        scoreBox.innerHTML = 'Score: ' + currentScore + "; Blocks Destroyed: " + numBlocksDestroyed;
    }

}

const gameOver = (): void => {
    isGameOver = true;

    if (gameOverVarsSet)
        return;

    if (currentHighScores.some((highScore) => { return highScore.isCurrentScore === true })) {
        let enterName: (HTMLElement | null) = document.getElementById("enterName");
        if (enterName !== null) {
            enterName.style.visibility = 'visible';
        }

        saveHighScores();
    }

    let scoreBox: (HTMLElement | null) = document.getElementById("scoreBox");
    if (scoreBox !== null) {
        scoreBox.style.backgroundColor = 'rgb(128,0,0)';
    }

    let pausedBox: (HTMLElement | null) = document.getElementById("pausedBox");
    if (pausedBox !== null) {
        pausedBox.style.visibility = 'visible';
        pausedBox.innerHTML = "GAME OVER";
        pausedBox.style.color = "rgb(224,224,224)";
        pausedBox.style.backgroundColor = "rgb(175, 58, 57)";
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

    gameOverVarsSet = true;
}

export default function Arkanoid() {
    const [userName, setUserName] = useState('');

    useEffect(() => {
        init();
    }, []);

    const handleNameSubmit = (event: Event) => {
        event.preventDefault();

        let currentHighScore: HighScore = currentHighScores.find((highScore) => { return highScore.isCurrentScore === true });
        if (userName !== null && userName !== "") {
            currentHighScore.scorerName = userName;
            currentUserName = userName;

            redrawHighScores();
            saveHighScores();
        }
    }

      // the playing area is 20 * 20
	  //  i.e. 640 x 640
    return (
        <div>
            <span className="italic absolute top-[140px] left-[100px]">Press up arrow to rotate.<br/>Press ESC to pause.</span>

            <div id="fullArea">
                <div id="playingArea" className="absolute top-[200px] left-[80px] border-t-[1px] w-[640px] h-[640px] bg-[#c0c0c0]" />
                    <div id="pausedBox" className="absolute top-[500px] left-[80px] border-t-[1px] border-black w-[320px] h-[48px] text-4xl text-center bold invisible z-10 text-orange-700 bg-[#808080]">
                        PAUSED
                    </div>
                    <div id="enterName" className="absolute top-[400px] left-[80px] w-[320px] border-black bg-[#C0C0C0] text-center text-lg z-10">
                        <div>New high score! Enter your name:</div>
                        <div>
                            <form onSubmit={handleNameSubmit}>
                                <span><input type="text" value={userName} onChange={e => setUserName(e.target.value)} id="highScoreName" name="userName" /></span>
                                <span><input type="submit" value="Enter" /></span>
                            </form>
                        </div>
                    </div>

                    <button id="playAgainButton" onClick={startNewGame} className="absolute top-[580px] left-[147px] text-xl center invisible z-10 px-3 py-1 text-[#256bb4] bg-[#c0c0c0]">
                        Click to Play Again
                    </button>
                        <div id="scoreBox" className="absolute top-[840px] left-[80px] border-t-[1px] border-black w-[640px] h-[24px] text-base text-white bg-[#007fff]">
                        Score: 0; Lines: 0
                    </div>

                <div id="playingAreaScreen" className="absolute top-[200px] left-[80px] border-t-[1px] border-black w-[640px] h-[640px] opacity-80 bg-[#080808]"> </div>

                <div id="rightPanel">
                    <div id="highScoreHeader" className="absolute top-[365px] left-[760px] font-semibold text-lg underline">High Scores:</div>
                </div>

            </div>
        </div>
    );
}
