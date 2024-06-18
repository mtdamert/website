import React, { useEffect, useState } from 'react';
import ark_block_base from '../images/ark_block_base2.png';
import ark_paddle from '../images/ark_paddle.png';
import ark_ball from '../images/ark_ball.png';


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
    blockNumberCollision: number;

    // Set x and y to -100 if they have no value yet
    constructor(x: number, y: number, x0: number, y0: number) {
        this.xPos = x;
        this.yPos = y;
        this.pointXPos = x0;
        this.pointYPos = y0;
        this.collisionType = COLLISION_NONE;
        this.blockNumberCollision = -1;
    }

    getDistance = (): number => {
        if (!this.hasValue()) {
            return -1;
        }

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

let ballXPos: number = 450;
let ballYPos: number = 30;
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
const PADDLE_SIDE_WIDTH = 10;

const STATE_GAME_RUNNING: number = 0;
const STATE_GAME_PAUSED: number = 1;

const NUM_HIGH_SCORES: number = 5;

const COLLISION_NONE: number = -1;
const COLLISION_WITH_LEFT_WALL: number = 1;
const COLLISION_WITH_TOP_WALL: number = 2;
const COLLISION_WITH_RIGHT_WALL: number = 3;
const COLLISION_WITH_BOTTOM_WALL: number = 4;
const COLLISION_WITH_PADDLE_LEFT: number = 5;
const COLLISION_WITH_PADDLE_MIDDLE: number = 6;
const COLLISION_WITH_PADDLE_RIGHT: number = 7;
const COLLISION_WITH_BLOCK_LEFT: number = 8;
const COLLISION_WITH_BLOCK_RIGHT: number = 9;
const COLLISION_WITH_BLOCK_BOTTOM: number = 10;
const COLLISION_WITH_BLOCK_TOP: number = 11;

const PADDLE_NOT_MOVING: number = 1;
const PADDLE_MOVING_RIGHT: number = 2;
const PADDLE_MOVING_LEFT: number = 3;
let paddleMotion: number = PADDLE_NOT_MOVING;

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

        paddleMotion = PADDLE_MOVING_LEFT;
    } else if (direction === DIRECTION_RIGHT) {
        paddleXPos += movePaddleDistance;
        if (paddleXPos > (BOARD_WIDTH - paddleImage.width)) {
            paddleXPos = (BOARD_WIDTH - paddleImage.width);
        }
        paddleImage.style.left = paddleXPos + 'px';

        paddleMotion = PADDLE_MOVING_RIGHT;
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
    blocks = new Array<(Block | null)>(0);
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
    let playingArea: (HTMLElement | null) = document.getElementById("playingArea");

    let newBlock: Block = new Block();
    newBlock.div = document.createElement('div');
    newBlock.div.style.visibility = 'visible';
    newBlock.x = 400;
    newBlock.y = 370;
    newBlock.image = document.createElement('img');
    newBlock.image.src = ark_block_base;
    newBlock.image.style.backgroundColor = '#ff0000';
    newBlock.image.style.position = 'absolute';
    newBlock.image.style.top = newBlock.y + 'px';
    newBlock.image.style.left = newBlock.x + 'px';
    newBlock.div.appendChild(newBlock.image);
    if (playingArea !== null) { playingArea.appendChild(newBlock.div); }
    blocks.push(newBlock);

    newBlock = new Block();
    newBlock.div = document.createElement('div');
    newBlock.div.style.visibility = 'visible';
    newBlock.x = 200;
    newBlock.y = 370;
    newBlock.image = document.createElement('img');
    newBlock.image.src = ark_block_base;
    newBlock.image.style.backgroundColor = '#ff0000';
    newBlock.image.style.position = 'absolute';
    newBlock.image.style.top = newBlock.y + 'px';
    newBlock.image.style.left = newBlock.x + 'px';
    newBlock.div.appendChild(newBlock.image);
    if (playingArea !== null) { playingArea.appendChild(newBlock.div); }
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

    blocks[y].image.style.visibility = 'hidden';
    blocks[y] = null;
    numBlocksDestroyed++;

    let blocksRemaining: number = 0;
    for (let i: number = 0; i < blocks.length; i++) {
        if (blocks[i] !== null) {
            blocksRemaining++;
        }
    }

    if (blocksRemaining === 0) {
        levelUp(++currentLevel);
    }
}

const levelUp = (newLevel: number): void => {
    // todo
    console.log("LEVEL COMPLETED");
}

const removeFromPlayingGrid = (x: number, y: number, block: Block): void => {
    blocks[x][y] = null;

    // Update graphics
    if (block !== null && block.image !== null) {
        block.image.style.display = 'none';
    }
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

    // while there are collisions, run a loop of collision checks

    // We want to check for all possible collisions and check in them in order, because there may be multiple collisions per frame
    let wallCollision: (DistanceFromPoint | null) = checkForWallCollisions(oldBallXPos, oldBallYPos);
    let blockCollision: (DistanceFromPoint | null) = checkForBlockCollisions(oldBallXPos, oldBallYPos);
    let paddleCollision: (DistanceFromPoint | null) = checkForPaddleCollisions(oldBallXPos, oldBallYPos);
    let nearestCollision: (DistanceFromPoint | null) = null;

    let collisionsCounter = 0;
    // There was a collision. Get the nearest collision
    do {
        if ((wallCollision !== null && wallCollision.hasValue()) || (blockCollision !== null && blockCollision.hasValue()) || (paddleCollision !== null && paddleCollision.hasValue())) {
            if ((wallCollision !== null && wallCollision.hasValue()) && (blockCollision === null || wallCollision.getDistance() > blockCollision.getDistance())
                && (paddleCollision === null || wallCollision.getDistance() > paddleCollision.getDistance())) {
                // wall collision is nearest
                nearestCollision = wallCollision;

                if (wallCollision.collisionType === COLLISION_WITH_LEFT_WALL) {
                    ballXPos = -ballXPos;
                    ballXVelocity = -ballXVelocity;
                    changedXDirection = true;
                } else if (wallCollision.collisionType === COLLISION_WITH_RIGHT_WALL) {
                    ballXPos = ballXPos - (2 * (ballXPos - (BOARD_WIDTH - ballImage.width)));
                    ballXVelocity = -ballXVelocity;
                    changedXDirection = true;
                } else if (wallCollision.collisionType === COLLISION_WITH_TOP_WALL) {
                    ballYPos = -ballYPos;
                    ballYVelocity = -ballYVelocity;
                    changedYDirection = true;
                } else {
                    // TODO: Death
                    ballYPos = ballYPos - (2 * (ballYPos - (BOARD_HEIGHT - ballImage.height)));
                    ballYVelocity = -ballYVelocity;
                    changedYDirection = true;
                }

                oldBallXPos = wallCollision.xPos;
                oldBallYPos = wallCollision.yPos;
            } else if ((blockCollision !== null && blockCollision.hasValue()) && (wallCollision === null || blockCollision.getDistance() > wallCollision.getDistance())
                && (paddleCollision === null || blockCollision.getDistance() > paddleCollision.getDistance())) {
                // block collision is nearest
                nearestCollision = blockCollision;

                if (blockCollision.collisionType === COLLISION_WITH_BLOCK_LEFT) {
                    ballXVelocity = -ballXVelocity;
                    changedXDirection = true;
                } else if (blockCollision.collisionType === COLLISION_WITH_BLOCK_RIGHT) {
                    ballXVelocity = -ballXVelocity;
                    changedXDirection = true;
                } else if (blockCollision.collisionType === COLLISION_WITH_BLOCK_BOTTOM) {
                    ballYVelocity = -ballYVelocity;
                    changedYDirection = true;
                } else if (blockCollision.collisionType === COLLISION_WITH_BLOCK_TOP) {
                    ballYVelocity = -ballYVelocity;
                    changedYDirection = true;
                }

                removeBlock(blockCollision.blockNumberCollision);
            } else {
                // paddle collision is nearest
                nearestCollision = paddleCollision;

                ballYVelocity = -ballYVelocity;
                changedYDirection = true;
            }

            // If the ball changed direction, we need to recalculate the ball's final x and y positions
            if (changedXDirection) {
                //ballXPos = ballXPos - (2 * (oldBallXPos - ballXPos));
                //console.log("initial X[0]: " + oldBallXPos + ", initial X[1]: " + ballXPos);
                //console.log("trying to move ball X from " + ballXPos + " to " + (ballXPos - (2 * (oldBallXPos - ballXPos))));
            }
            if (changedYDirection) {
                //ballYPos = ballYPos - (2 * (oldBallYPos - ballYPos));
            }

            // Move the ball using the point of this collision as its starting point
            oldBallXPos = nearestCollision.xPos;
            oldBallYPos = nearestCollision.yPos;

            // Re-run the collisions so we can run the loop again
            nearestCollision = null;
            wallCollision = checkForWallCollisions(oldBallXPos, oldBallYPos);
            blockCollision = checkForBlockCollisions(oldBallXPos, oldBallYPos);
            paddleCollision = checkForPaddleCollisions(oldBallXPos, oldBallYPos);
        }
    } while (wallCollision !== null || blockCollision !== null || paddleCollision !== null);


    // Handle bounces against walls
    //if (ballXPos < 0) {
    //    ballXPos = -ballXPos;
    //    ballXVelocity = -ballXVelocity;
    //    changedXDirection = true;
    //}
    //if (ballYPos < 0) {
    //    ballYPos = -ballYPos;
    //    ballYVelocity = -ballYVelocity;
    //    changedYDirection = true;
    //}
    //if (ballXPos > (BOARD_WIDTH - ballImage.width)) {
    //    ballXPos = (BOARD_WIDTH - ballImage.width) - (ballXPos - (BOARD_WIDTH - ballImage.width));
    //    ballXVelocity = -ballXVelocity;
    //    changedXDirection = true;
    //}
    //if (ballYPos > (BOARD_HEIGHT - ballImage.height)) {
    //    ballYPos = (BOARD_HEIGHT - ballImage.height) - (ballYPos - (BOARD_HEIGHT - ballImage.height));
    //    ballYVelocity = -ballYVelocity;
    //    changedYDirection = true;
    //}

    // Handle bounces against the paddle
    // we assume the paddle is a static line across its top and check whether the ball's change in position intersected with the ball

    //if ((oldBallYPos + ballImage.height) < paddleYPos && (ballYPos + ballImage.height) >= paddleYPos) {
    //    if (!changedYDirection) {
    //        let initialBallY: number = oldBallYPos + ballImage.height;
    //        let finalBallY: number = ballYPos + ballImage.height;
    //        let collisionTime: number = (paddleYPos - initialBallY) / (finalBallY - initialBallY); // in the range of 0 (old frame) and 1 (new frame), when did the ball hit the paddle?

    //        // Figure out what the ball's X pos was when it intersected with the top surface of the paddle
    //        let ballXAtCollisionTime: number = ((ballXPos - oldBallXPos) * collisionTime) + ballXPos;

    //        if (ballXAtCollisionTime < (paddleXPos + paddleImage.width) && (ballXAtCollisionTime + ballImage.width) > paddleXPos) {
    //            //console.log("PADDLE COLLISION");
    //            //console.log("ball y: " + ballYPos);
    //            //console.log("ball height: " + ballImage.height);
    //            //console.log("paddle y: " + paddleYPos);
    //            //console.log("new ball y: " + (2 * ((ballYPos + ballImage.height) - paddleYPos)));
    //            ballYPos = ballYPos - (2 * ((ballYPos + ballImage.height) - paddleYPos));
    //            ballYVelocity = -ballYVelocity;
    //        }
    //    } else {
    //        // TODO (changedYDirection === true)
    //    }
    //}

    ballImage.style.left = ballXPos + 'px';
    ballImage.style.top = ballYPos + 'px';
}

const checkForWallCollisions = (oldBallXPos: number, oldBallYPos: number): (DistanceFromPoint | null) => {
    // Find and return the nearest wall collision
    let collisionLeft: DistanceFromPoint = new DistanceFromPoint(-100, -100, oldBallXPos, oldBallYPos);
    let collisionTop: DistanceFromPoint = new DistanceFromPoint(-100, -100, oldBallXPos, oldBallYPos);
    let collisionRight: DistanceFromPoint = new DistanceFromPoint(-100, -100, oldBallXPos, oldBallYPos);
    let collisionBottom: DistanceFromPoint = new DistanceFromPoint(-100, -100, oldBallXPos, oldBallYPos);

    if (ballXPos < 0) {
        collisionLeft.xPos = 0;
        let collisionTime: number = oldBallXPos / (oldBallXPos - ballXPos); // in the range of 0 (old frame) and 1 (new frame), when did the ball hit the paddle?
        collisionLeft.yPos = oldBallYPos + ((ballYPos - oldBallYPos) * collisionTime); // TODO: collisionTime in this function's equations doesn't feel right

        //console.log("Found left wall collision: " + ballXPos + ", " + ballYPos);
        collisionLeft.collisionType = COLLISION_WITH_LEFT_WALL;
    }
    if (ballYPos < 0) {
        collisionTop.yPos = 0;
        let collisionTime: number = oldBallYPos / (oldBallYPos - ballYPos);
        collisionTop.xPos = oldBallXPos + ((ballXPos - oldBallXPos) * collisionTime);

        //console.log("Found top wall collision: " + ballXPos + ", " + ballYPos);
        collisionTop.collisionType = COLLISION_WITH_TOP_WALL;
    }
    if (ballXPos > (BOARD_WIDTH - ballImage.width)) {
        collisionRight.xPos = BOARD_WIDTH - ballImage.width;
        let collisionTime: number = oldBallXPos / (oldBallXPos - ballXPos);
        collisionRight.yPos = oldBallYPos + ((ballYPos - oldBallYPos) * collisionTime);

        //console.log("Found right wall collision: " + ballXPos + ", " + ballYPos);
        collisionRight.collisionType = COLLISION_WITH_RIGHT_WALL;
    }
    if (ballYPos > (BOARD_HEIGHT - ballImage.height)) {
        collisionBottom.yPos = BOARD_HEIGHT - ballImage.height;
        let collisionTime: number = oldBallYPos / (oldBallYPos - ballYPos);
        collisionBottom.xPos = oldBallXPos + ((ballXPos - oldBallXPos) * collisionTime);

        //console.log("Found bottom wall collision: " + ballXPos + ", " + ballYPos);
        collisionBottom.collisionType = COLLISION_WITH_BOTTOM_WALL;
    }

    // If there are multiple collisions against the walls, figure out which is the nearest and return it
    let nearestCollision: (DistanceFromPoint | null) = null;
    if (collisionLeft.hasValue())
        nearestCollision = collisionLeft;
    if (collisionTop.hasValue()) {
        if (nearestCollision === null || (collisionTop.getDistance() < nearestCollision.getDistance()))
            nearestCollision = collisionTop;
    }
    if (collisionRight.hasValue()) {
        if (nearestCollision === null || (collisionRight.getDistance() < nearestCollision.getDistance()))
            nearestCollision = collisionRight;
    }
    if (collisionBottom.hasValue()) {
        if (nearestCollision === null || (collisionBottom.getDistance() < nearestCollision.getDistance()))
            nearestCollision = collisionBottom;
    }

    return nearestCollision;
}

const checkForPaddleCollisions = (oldBallXPos: number, oldBallYPos: number): (DistanceFromPoint | null) => {
    let nearestCollision: (DistanceFromPoint | null) = null;

    let oldBallBottomYPos: number = oldBallYPos + ballImage.height;
    let ballBottomYPos: number = ballYPos + ballImage.height;
    if (oldBallBottomYPos < paddleYPos && ballBottomYPos >= paddleYPos) {
        let collisionTime: number = (paddleYPos - oldBallBottomYPos) / (ballBottomYPos - oldBallBottomYPos);

        // Figure out what the ball's X pos was when it intersected with the top surface of the paddle
        let ballXAtCollisionTime: number = ((ballXPos - oldBallXPos) * collisionTime) + ballXPos;

        // Collision detected
        // Detect whether the collision is on the side of the paddle or not - TODO: do we want to use this info?
        if (ballXAtCollisionTime < (paddleXPos + paddleImage.width) && (ballXAtCollisionTime + ballImage.width) > paddleXPos) {
            let paddleCollision: DistanceFromPoint = new DistanceFromPoint(ballXAtCollisionTime, paddleYPos, oldBallXPos, oldBallYPos);
            paddleCollision.collisionType = COLLISION_WITH_PADDLE_MIDDLE;
            if ((ballXAtCollisionTime - PADDLE_SIDE_WIDTH) < paddleXPos) {
                paddleCollision.collisionType = COLLISION_WITH_PADDLE_LEFT;
            } else if ((ballXAtCollisionTime + ballImage.width + PADDLE_SIDE_WIDTH) > (paddleXPos + paddleImage.width)) {
                paddleCollision.collisionType = COLLISION_WITH_PADDLE_RIGHT;
            }

            console.log("Paddle collision detected");
            return paddleCollision;
        }
    }

    return null;
}

const checkForBlockCollisions = (oldBallXPos: number, oldBallYPos: number): (DistanceFromPoint | null) => {
    let nearestCollision: (DistanceFromPoint | null) = null;

    let rightCollision: DistanceFromPoint = new DistanceFromPoint(-100, -100, oldBallXPos, oldBallYPos);
    rightCollision.collisionType = COLLISION_WITH_BLOCK_RIGHT;
    let leftCollision: DistanceFromPoint = new DistanceFromPoint(-100, -100, oldBallXPos, oldBallYPos);
    leftCollision.collisionType = COLLISION_WITH_BLOCK_LEFT;
    let bottomCollision: DistanceFromPoint = new DistanceFromPoint(-100, -100, oldBallXPos, oldBallYPos);
    bottomCollision.collisionType = COLLISION_WITH_BLOCK_BOTTOM;
    let topCollision: DistanceFromPoint = new DistanceFromPoint(-100, -100, oldBallXPos, oldBallYPos);
    topCollision.collisionType = COLLISION_WITH_BLOCK_TOP;

    for (let i: number = 0; i < blocks.length; i++) {
        if (blocks[i] !== null) {
            let blockRightXPos: number = blocks[i].x + blocks[i].image.width;
            let blockBottomYPos: number = blocks[i].y + blocks[i].image.height;

            // TODO: Collisions should happen if the bottom of the ball hits the top of the block;
            //       and if the top of the ball hits the bottom of the block

            if (ballXPos < oldBallXPos) { // Check for right collision
                if (ballXPos <= blockRightXPos && oldBallXPos > blockRightXPos) {
                    // Ball passed the block's right plane since last frame. But did it collide with the ball then?
                    console.log("Ball passed block's right plane");

                    // find the point where the line hits the plane
                    // if that point intersects with the block's line segment, fill in data in the rightCollision object
                    let collisionTime: number = (oldBallXPos - blockRightXPos) / (oldBallXPos - ballXPos); // in the range of 0 (old frame) and 1 (new frame), when did the ball hit the paddle?
                    let collisionY: number = oldBallYPos + ((ballYPos - oldBallYPos) * collisionTime);
                    console.log("collision time: " + collisionTime + ", collisionY: " + collisionY + ", blocks[i].y: " + blocks[i].y + ", blockBottomYPos: " + blockBottomYPos);
                    if ((collisionY + ballImage.height) > blocks[i].y && collisionY < blockBottomYPos) {
                        rightCollision.xPos = oldBallXPos + ((ballXPos - oldBallXPos) * collisionTime);
                        rightCollision.yPos = collisionY;
                        rightCollision.blockNumberCollision = i;

                        console.log("Block right collision detected");
                    }
                }
            }
            if (ballXPos > oldBallXPos) { // Check for left collision
                if ((ballXPos + ballImage.width) >= blocks[i].x && (oldBallXPos + ballImage.width) < blocks[i].x) {
                    //console.log("Ball passed block's left plane");

                    let collisionTime: number = (blocks[i].x - oldBallXPos) / (ballXPos - oldBallXPos);
                    let collisionY: number = oldBallYPos + ((ballYPos - oldBallYPos) * collisionTime);
                    //console.log("collision time: " + collisionTime + ", collisionY: " + collisionY + ", blocks[i].y: " + blocks[i].y + ", blockBottomYPos: " + blockBottomYPos);
                    if ((collisionY + ballImage.height) > blocks[i].y && collisionY < blockBottomYPos) {
                        leftCollision.xPos = oldBallXPos + ((ballXPos - oldBallXPos) * collisionTime);
                        leftCollision.yPos = collisionY;
                        leftCollision.blockNumberCollision = i;

                        console.log("Block left collision detected");
                    }
                }
            }
            if (ballYPos < oldBallYPos) { // Check for bottom collision
                if (ballYPos <= blockBottomYPos && oldBallYPos > blockBottomYPos) {
                    //console.log("Ball passed block's bottom plane");

                    let collisionTime: number = (blockBottomYPos - oldBallYPos) / (ballYPos - oldBallYPos);
                    let collisionX: number = oldBallXPos + ((ballXPos - oldBallXPos) * collisionTime);
                    //console.log("collision time: " + collisionTime + ", collisionX: " + collisionX + ", blocks[i].x: " + blocks[i].x + ", blockRightXPos: " + blockRightXPos);
                    if ((collisionX + ballImage.width) > blocks[i].x && collisionX < blockRightXPos) {
                        bottomCollision.xPos = collisionX;
                        bottomCollision.yPos = oldBallYPos + ((ballYPos - oldBallYPos) * collisionTime);
                        bottomCollision.blockNumberCollision = i;

                        console.log("Block bottom collision detected");
                    }

                }
            }
            if (ballYPos > oldBallYPos) { // Check for top collision
                if (ballYPos >= blocks[i].y && oldBallYPos < blocks[i].y) {
                    //console.log("Ball passed block's top plane");

                    let collisionTime: number = (blocks[i].y - oldBallYPos) / (oldBallYPos - ballYPos);
                    let collisionX: number = oldBallXPos + ((ballXPos - oldBallXPos) * collisionTime);
                    //console.log("collision time: " + collisionTime + ", collisionX: " + collisionX + ", blocks[i].x: " + blocks[i].x + ", blockRightXPos: " + blockRightXPos);
                    if ((collisionX + ballImage.width) > blocks[i].x && collisionX < blockRightXPos) {
                        topCollision.xPos = collisionX;
                        topCollision.yPos = oldBallYPos + ((ballYPos - oldBallYPos) * collisionTime);
                        topCollision.blockNumberCollision = i;

                        console.log("Block top collision detected");
                    }
                }
            }
        }

        if (rightCollision.hasValue() && nearestCollision === null) {
            nearestCollision = rightCollision;
        } else if (rightCollision.hasValue() && rightCollision.getDistance() < nearestCollision.getDistance()) {
            nearestCollision = rightCollision;
        }

        if (leftCollision.hasValue() && nearestCollision === null) {
            nearestCollision = leftCollision;
        } else if (leftCollision.hasValue() && leftCollision.getDistance() < nearestCollision.getDistance()) {
            nearestCollision = leftCollision;
        }

        if (bottomCollision.hasValue() && nearestCollision === null) {
            nearestCollision = bottomCollision;
        } else if (bottomCollision.hasValue() && bottomCollision.getDistance() < nearestCollision.getDistance()) {
            nearestCollision = bottomCollision;
        }

        if (topCollision.hasValue() && nearestCollision === null) {
            nearestCollision = topCollision;
        } else if (topCollision.hasValue() && topCollision.getDistance() < nearestCollision.getDistance()) {
            nearestCollision = topCollision;
        }
    }

    return nearestCollision;
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
                <div id="playingArea" className={`absolute top-[200px] left-[80px] border-t-[1px] w-[640px] h-[${BOARD_HEIGHT}px] bg-[#c0c0c0]`} />
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
