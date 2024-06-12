import React, { useEffect, useState } from 'react';
import ark_block_base from './ark_block_base.png';
import ark_paddle from './ark_paddle.png';
import ark_ball from './ark_ball.png';


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

class DistanceFromPoint {
    xPos: number;
    yPos: number;
    pointXPos: number;
    pointYPos: number;
    collisionType: number;

    // Set x and y to -100 if they have no value yet
    constructor(x: number, y: number, x0: number, y0: number) {
        this.xPos = x;
        this.yPos = y;
        this.pointXPos = x0;
        this.pointYPos = y0;
        this.collisionType = COLLISION_NONE;
    }

    getDistance = (): number => {
        let xDistanceSquared: number = Math.pow((this.xPos - this.pointXPos), 2);
        let yDistanceSquared: number = Math.pow((this.yPos - this.pointYPos), 2);
        return Math.sqrt(xDistanceSquared  + yDistanceSquared);
    }

    hasValue = (): boolean => {
        return (this.xPos !== -100 || this.yPos !== -100);
    }
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
let paddleSpeed: number = 200;
let lastFrameTime: number = new Date().getTime();
let currentScore: number = 0;
let currentLevel: number = 1;
let numBlocksDestroyed: number = 0;
let currentHighScores: HighScore[];

let blocks: Array<(Block | null)>;
let isGameOver: boolean = false;
let gameOverVarsSet: boolean = false;
let gameState: number;
let highScoresLoaded = false;
let currentUserName: string = "(current)";

const BOARD_WIDTH: number = 640;
const BOARD_HEIGHT: number = 640;
const PIECE_WIDTH: number = 64;
const PIECE_HEIGHT: number = 32;

let ballXPos: number = 80;
let ballYPos: number = 200;
let ballXVelocity: number = 120;
let ballYVelocity: number = 120;
let ballDiv: (HTMLDivElement | null) = null;
let ballImage: (HTMLImageElement | null) = null;

const DIRECTION_LEFT: number = 0;
const DIRECTION_RIGHT: number = 1;
let paddleXPos: number = 280;
const paddleYPos: number = 590;
let paddleDiv: (HTMLDivElement | null) = null;
let paddleImage: (HTMLImageElement | null) = null;

const STATE_GAME_RUNNING: number = 0;
const STATE_GAME_PAUSED: number = 1;

const NUM_HIGH_SCORES: number = 5;

const COLLISION_NONE: number = -1;
const COLLISION_WITH_LEFT_WALL: number = 1;
const COLLISION_WITH_TOP_WALL: number = 2;
const COLLISION_WITH_RIGHT_WALL: number = 3;
const COLLISION_WITH_BOTTOM_WALL: number = 4;

let Level1Color: string = '#00ff00';

const gameLoop = (): void => {
    //game loop
    moveBall();
    lastFrameTime = new Date().getTime();

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

    //console.log("loadHighScores data: " + data);

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
    let movePaddleDistance: number = ((new Date().getTime() - lastFrameTime) / 1000) * paddleSpeed;

    if (direction === DIRECTION_LEFT) {
        paddleXPos -= movePaddleDistance;
        if (paddleXPos < 0) {
            paddleXPos = 0;
        }
        paddleImage.style.left = paddleXPos + 'px';
    } else if (direction === DIRECTION_RIGHT) {
        paddleXPos += movePaddleDistance;
        if (paddleXPos > (BOARD_WIDTH - paddleImage.width)) {
            paddleXPos = (BOARD_WIDTH - paddleImage.width);
        }
        paddleImage.style.left = paddleXPos + 'px';
    }
}

const startNewGame = (): void => {
    currentScore = 0;
    currentLevel = 1;
    numBlocksDestroyed = 0;

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
        scoreBox.innerHTML = 'Score: ' + currentScore + "; Level: " + currentLevel + "; Blocks Destroyed: " + numBlocksDestroyed;
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

    // create the paddle
    paddleDiv = document.createElement('div');
    paddleDiv.style.visibility = 'visible';
    paddleImage = document.createElement('img');
    paddleImage.src = ark_paddle;
    paddleImage.style.position = 'absolute';
    paddleImage.style.top = paddleYPos + 'px';
    paddleImage.style.left = paddleXPos + 'px';
    paddleDiv.appendChild(paddleImage);
    // Add the paddle to the onscreen DIV
    if (playingArea !== null) {
        playingArea.appendChild(paddleDiv);
    }

    // Create the ball
    ballDiv = document.createElement('div');
    ballDiv.style.visibility = 'visible';
    ballImage = document.createElement('img');
    ballImage.src = ark_ball;
    ballImage.style.position = 'absolute';
    ballImage.style.top = ballYPos + 'px';
    ballImage.style.left = ballXPos + 'px';
    ballDiv.appendChild(ballImage);
    if (playingArea !== null) {
        playingArea.appendChild(ballDiv);
    }

    // create a new, empty board
    blocks = new Array<Array<(Block | null)>>(BOARD_WIDTH);
    loadBlocks(1);

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

const loadBlocks = (level: number): void => {
    let newBlock: Block = new Block();
    newBlock.div = document.createElement('div');
    newBlock.div.style.visibility = 'visible';
    newBlock.image = document.createElement('img');
    newBlock.image.src = ark_block_base;
    newBlock.image.style.backgroundColor = '#ff0000';
    newBlock.image.style.position = 'absolute';
    newBlock.image.style.top = '100px';
    newBlock.image.style.left = ballXPos + '100px';
    newBlock.div.appendChild(newBlock.image);

    let playingArea: (HTMLElement | null) = document.getElementById("playingArea");
    if (playingArea !== null) {
        playingArea.appendChild(newBlock.div);
    }

    blocks.push(newBlock);
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

const removeBlock = (y: number): void => {
    // Check all playingArea's children - they should all be of type 'block'
    let playingArea: (HTMLElement | null) = document.getElementById("playingArea");

    if (playingArea !== null) {
        let blockImages: NodeListOf<ChildNode> = playingArea.childNodes;
        for (let i: number = 0; i < blockImages.length; i++)
            if ((blockImages[i].firstChild as HTMLImageElement).style.top === ((y - 2) * PIECE_HEIGHT + "px")) {
                (blockImages[i].firstChild as HTMLImageElement).style.visibility = 'hidden';
            }
    }

    // Update blocks array
    for (let x: number = 0; x < BOARD_WIDTH; x++) {
        blocks[x][y] = null;
    }

    // Update the blocks array to shift down every row above this line
    for (; y > 0; y--)
        for (let x: number = 0; x < BOARD_WIDTH; x++)
            blocks[x][y] = blocks[x][y - 1];

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
    let collision: boolean = (blocks[block.x][block.y] !== null);
    
    blocks[block.x][block.y] = block;

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
    blocks[x][y] = null;

    // Update graphics
    if (block !== null && block.image !== null) {
        block.image.style.display = 'none';
    }
}

const didBlockCollideWithBlocksOnLeft = (): boolean => {
    let numCollisionsWithBlocksOnLeft: number = 0;
    for (let i: number = 0; i < 4; i++) {
        if (blocks[(currentPiece.blocks[i].x - 1)][currentPiece.blocks[i].y] !== null)
            numCollisionsWithBlocksOnLeft++;
    }

    return numCollisionsWithBlocksOnLeft > 0;
}

const didBlockCollideWithBlocksOnRight = (): boolean => {
    let numCollisionsWithBlocksOnRight: number = 0;
    for (let i: number = 0; i < 4; i++) {
        if (blocks[(currentPiece.blocks[i].x + 1)][currentPiece.blocks[i].y] !== null)
            numCollisionsWithBlocksOnRight++;
    }

    return numCollisionsWithBlocksOnRight > 0;
}

const didBlockCollideWithBlocksBelow = (): boolean => {
    let numCollisionsWithBlocksBelow: number = 0;
    for (let i: number = 0; i < 4; i++) {
        if (blocks[(currentPiece.blocks[i].x)][currentPiece.blocks[i].y + 1] !== null) {
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

const moveBall = (): void => {
    let moveBallXDistance: number = ((new Date().getTime() - lastFrameTime) / 1000) * ballXVelocity;
    let moveBallYDistance: number = ((new Date().getTime() - lastFrameTime) / 1000) * ballYVelocity;

    // TODO: First go through a series of IF statements to check for collisions with blocks and the paddle
    let oldBallXPos = ballXPos;
    let oldBallYPos = ballYPos;
    ballXPos += moveBallXDistance;
    ballYPos += moveBallYDistance;

    //console.log("ball x: " + ballXPos);
    //console.log("ball y: " + ballYPos);

    //console.log("last frame time: " + lastFrameTime);
    //console.log("ball x move: " + moveBallXDistance);
    //console.log("ball y move: " + moveBallYDistance);

    let changedXDirection: boolean = false;
    let changedYDirection: boolean = false;

    // TODO: Check for nearest paddle collision - get distance
    // TODO: Check for nearest block collision - get distance
    // while there are collisions, run a loop of these. each should be its own function and return...? the distance from the prev position to the collision point?
    // >> an object containing { distance, x, y } ?

    // Check for nearest wall collision - get distance
    let wallCollision: (DistanceFromPoint | null) = checkForWallCollisions(oldBallXPos, oldBallYPos);

    // Handle bounces against walls
    if (ballXPos < 0) {
        ballXPos = -ballXPos;
        ballXVelocity = -ballXVelocity;
        changedXDirection = true;
    }
    if (ballYPos < 0) {
        ballYPos = -ballYPos;
        ballYVelocity = -ballYVelocity;
        changedYDirection = true;
    }
    if (ballXPos > (BOARD_WIDTH - ballImage.width)) {
        ballXPos = (BOARD_WIDTH - ballImage.width) - (ballXPos - (BOARD_WIDTH - ballImage.width));
        ballXVelocity = -ballXVelocity;
        changedXDirection = true;
    }
    if (ballYPos > (BOARD_HEIGHT - ballImage.height)) {
        ballYPos = (BOARD_HEIGHT - ballImage.height) - (ballYPos - (BOARD_HEIGHT - ballImage.height));
        ballYVelocity = -ballYVelocity;
        changedYDirection = true;
    }

    // Handle bounces against the paddle
    // we assume the paddle is a static line across its top and check whether the ball's change in position intersected with the ball

    if ((oldBallYPos + ballImage.height) < paddleYPos && (ballYPos + ballImage.height) >= paddleYPos) {
        if (!changedYDirection) {
            let initialBallY: number = oldBallYPos + ballImage.height;
            let finalBallY: number = ballYPos + ballImage.height;
            let collisionTime: number = (paddleYPos - initialBallY) / (finalBallY - initialBallY); // in the range of 0 (old frame) and 1 (new frame), when did the ball hit the paddle?

            // Figure out what the ball's X pos was when it intersected with the top surface of the paddle
            let ballXAtCollisionTime: number = ((ballXPos - oldBallXPos) * collisionTime) + ballXPos;

            if (ballXAtCollisionTime < (paddleXPos + paddleImage.width) && (ballXAtCollisionTime + ballImage.width) > paddleXPos) {
                console.log("COLLISION!");
                console.log("ball y: " + ballYPos);
                console.log("ball height: " + ballImage.height);
                console.log("paddle y: " + paddleYPos);
                console.log("new ball y: " + (2 * ((ballYPos + ballImage.height) - paddleYPos)));
                ballYPos = ballYPos - (2 * ((ballYPos + ballImage.height) - paddleYPos));
                ballYVelocity = -ballYVelocity;
            }
        } else {
            // TODO (changedYDirection === true)
        }
    }

    // We want to check for all possible collisions and check in them in order, because there may be multiple collisions per frame
    checkForBlockCollisions(oldBallXPos, oldBallYPos);


    if (ballYVelocity >= 0 && ballXVelocity >= 0) { // up & right
        // Check whether the place we want to move the piece to is free
        let failed: boolean = false;

        // Check for wall collisions
        for (let i: number = 0; i < 4; i++) {
        //    if ((currentPiece.blocks[i].x + 1) >= BOARD_WIDTH) {
        //        failed = true;
        //        break;
        //    }
        }

    //    if (failed === false)
    //        if (doesPieceCollideWithBlocksOnRight() === false)
    //            moveCurrentPieceRight();
    }

    if (ballYVelocity >= 0 && ballXVelocity <= 0) { // up & left
        // Check whether the place we want to move the piece to is free
        let failed: boolean = false;

        // Check for wall collisions
        for (let i: number = 0; i < 4; i++) {
        //    if (currentPiece.blocks[i].x <= 0) {
        //        failed = true;
        //        break;
        //    }
        }

    //    if (failed === false)
    //        if (doesPieceCollideWithBlocksOnLeft() === false)
    //            moveCurrentPieceLeft();
    }

    ballImage.style.left = ballXPos + 'px';
    ballImage.style.top = ballYPos + 'px';
}

const checkForWallCollisions = (oldBallXPos: number, oldBallYPos: number): (DistanceFromPoint | null) => {
    // Find and return the nearest wall collision
    let collision1: DistanceFromPoint = new DistanceFromPoint(-100, -100, oldBallXPos, oldBallYPos);
    let collision2: DistanceFromPoint = new DistanceFromPoint(-100, -100, oldBallXPos, oldBallYPos);
    let collision3: DistanceFromPoint = new DistanceFromPoint(-100, -100, oldBallXPos, oldBallYPos);
    let collision4: DistanceFromPoint = new DistanceFromPoint(-100, -100, oldBallXPos, oldBallYPos);

    if (ballXPos < 0) {
        collision1.xPos = 0;
        let collisionTime: number = oldBallXPos / (oldBallXPos - ballXPos); // in the range of 0 (old frame) and 1 (new frame), when did the ball hit the paddle?
        collision1.yPos = oldBallYPos + ((ballYPos - oldBallYPos) * collisionTime);

        collision1.collisionType = COLLISION_WITH_LEFT_WALL;
    }
    if (ballYPos < 0) {
        collision2.yPos = 0;
        let collisionTime: number = oldBallYPos / (oldBallYPos - ballYPos);
        collision2.xPos = oldBallXPos + ((ballXPos - oldBallXPos) * collisionTime);

        collision2.collisionType = COLLISION_WITH_TOP_WALL;
    }
    if (ballXPos > (BOARD_WIDTH - ballImage.width)) {
        ballXPos = BOARD_WIDTH - ballImage.width;
        let collisionTime: number = oldBallXPos / (oldBallXPos - ballXPos);
        collision3.yPos = oldBallYPos + ((ballYPos - oldBallYPos) * collisionTime);

        collision3.collisionType = COLLISION_WITH_RIGHT_WALL;
    }
    if (ballYPos > (BOARD_HEIGHT - ballImage.height)) {
        ballYPos = BOARD_HEIGHT - ballImage.height;
        let collisionTime: number = oldBallYPos / (oldBallYPos - ballYPos);
        collision4.xPos = oldBallXPos + ((ballXPos - oldBallXPos) * collisionTime);

        collision4.collisionType = COLLISION_WITH_BOTTOM_WALL;
    }

    // If there are multiple collisions against the walls, figure out which is the nearest and return it
    let nearestCollision: (DistanceFromPoint | null) = null;
    if (collision1.hasValue())
        nearestCollision = collision1;
    if (collision2.hasValue()) {
        if (nearestCollision === null || (collision2.getDistance() < nearestCollision.getDistance()))
            nearestCollision = collision2;
    }
    if (collision3.hasValue()) {
        if (nearestCollision === null || (collision3.getDistance() < nearestCollision.getDistance()))
            nearestCollision = collision3;
    }
    if (collision4.hasValue()) {
        if (nearestCollision === null || (collision4.getDistance() < nearestCollision.getDistance()))
            nearestCollision = collision4;
    }

    return nearestCollision;
}

const checkForBlockCollisions = (oldBallXPos: number, oldBallYPos: number): void => {
    for (let i: number = 0; i < blocks.length; i++) {
        // Check for left collision
        if (ballXPos < oldBallXPos) {

        } else if (ballXPos > oldBallXPos) {

        } else if (ballYPos < oldBallYPos) {

        } else if (ballYPos > oldBallYPos) {

        }
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
        scoreBox.innerHTML = 'Score: ' + currentScore + "; Level: " + currentLevel + "; Blocks Destroyed: " + numBlocksDestroyed;
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

      // the playing area is 640 x 640 (BOARD_WIDTH x BOARD_HEIGHT)
    return (
        <div>
            <span className="italic absolute top-[140px] left-[100px]">Press up arrow to rotate.<br/>Press ESC to pause.</span>

            <div id="fullArea">
                <div id="playingArea" className={`absolute top-[200px] left-[80px] border-t-[1px] w-[${BOARD_WIDTH}px] h-[${BOARD_HEIGHT}px] bg-[#c0c0c0]`} />
                    <div id="pausedBox" className={`absolute top-[500px] left-[80px] border-t-[1px] border-black w-[${BOARD_WIDTH}px] h-[48px] text-4xl text-center bold invisible z-10 text-orange-700 bg-[#808080]`}>
                        PAUSED
                    </div>
                    <div id="enterName" className={`absolute top-[400px] left-[80px] w-[${BOARD_WIDTH}px] border-black bg-[#C0C0C0] text-center text-lg z-10`}>
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
                        <div id="scoreBox" className={`absolute top-[840px] left-[80px] border-t-[1px] border-black w-[${BOARD_WIDTH}px] h-[24px] text-base text-white bg-[#007fff]`}>
                        Score: 0; Lines: 0
                    </div>

                <div id="playingAreaScreen" className={`absolute top-[200px] left-[80px] border-t-[1px] border-black w-[${BOARD_WIDTH}px] h-[${BOARD_HEIGHT}px] opacity-80 bg-[#080808]`}> </div>

                <div id="rightPanel">
                    <div id="highScoreHeader" className="absolute top-[365px] left-[760px] font-semibold text-lg underline">High Scores:</div>
                </div>

            </div>
        </div>
    );
}
