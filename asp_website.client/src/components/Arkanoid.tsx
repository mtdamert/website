import React, { useEffect, useState } from 'react';
import { World } from 'ldtk';
import ark_blocks from '../images/ark_blocks.png';
import ark_paddle from '../images/ark_paddle.png';
import ark_ball from '../images/ark_ball_rendered.png';


class Block {
    div: (HTMLDivElement | null);
    image: (HTMLImageElement | null);
    blockType: number;
    x: number;
    y: number;
    numHits: number;

    setBlockType = (imageYCoord: number): void => {
        this.blockType = imageYCoord / BLOCK_HEIGHT;
    }

    blockHit = (): boolean => {
        this.numHits++;
        switch (this.blockType)
        {
            case BLOCK_TYPE_BASIC:
                return true;
            case BLOCK_TYPE_STRONG:
                if (this.numHits >= 2) {
                    return true;
                }
        }

        return false;
    }

    constructor() {
        this.div = null;
        this.image = null;
        this.blockType = BLOCK_TYPE_BASIC;
        this.x = 0;
        this.y = 0;
        this.numHits = 0;
    };
}

class Vector {
    direction: number; // in radians - should always be in the range of (0, 2*PI)
    magnitude: number;

    reverseXDirection = (): void => {
        if (this.direction < Math.PI) {
            this.direction = Math.PI - this.direction;
        } else {
            this.direction = Math.PI - (this.direction - Math.PI) + Math.PI;
        }
    }

    reverseYDirection = (): void => {
        this.direction = -this.direction + (2 * Math.PI);
    }

    adjustDirection = (collisionType: number): void => {
        // Only change direction if it doesn't push the direction over/under threshold of x*PI
        // So if the current direction is (7 / 8)*PI and we're going to increase it, don't increase it
        if (collisionType === COLLISION_WITH_PADDLE_RIGHT) {
            if (this.direction < Math.PI && this.direction < ((7 / 8) * Math.PI)) {
                this.direction += Math.PI / 8;
            } else if (this.direction > Math.PI && this.direction < ((15 / 8) * Math.PI)) {
                this.direction += Math.PI / 8;
            }
        } else if (collisionType === COLLISION_WITH_PADDLE_LEFT) {
            if (this.direction > Math.PI && this.direction > ((9 / 8) * Math.PI)) {
                this.direction -= Math.PI / 8;
            } else if (this.direction > 0 && this.direction > ((1 / 8) * Math.PI)) {
                this.direction -= Math.PI / 8;
            }
        }

        if (this.direction > 2 * Math.PI) {
            this.direction -= 2 * Math.PI;
        }
    }

    getX = (): number => {
        return Math.cos(this.direction) * this.magnitude;
    }

    getY = (): number => {
        return Math.sin(this.direction) * this.magnitude;
    }

    constructor(radians, velocity) {
        this.direction = radians;
        this.magnitude = velocity;
    }
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
let paddleSpeed: number = 400;
let lastFrameTime: number = new Date().getTime();
let lastPauseTime: number = 0;
let currentScore: number = 0;
let currentLevel: number = 1;
let numBlocksDestroyed: number = 0;
let currentHighScores: HighScore[];

let blocks: Array<(Block | null)>;
let isGameOver: boolean = false;
let gameOverVarsSet: boolean = false;
let gameState: number;
let extraLives: number;
let highScoresLoaded = false;
let currentUserName: string = "(current)";

const BOARD_WIDTH: number = 640;
const BOARD_HEIGHT: number = 640;
const BLOCK_WIDTH: number = 64;
const BLOCK_HEIGHT: number = 32;

let ballXPos: number = 450;
let ballYPos: number = 30;
let ballVelocity: (Vector | null) = null;
let ballDiv: (HTMLDivElement | null) = null;
let ballImage: (HTMLImageElement | null) = null;

const DIRECTION_LEFT: number = 0;
const DIRECTION_RIGHT: number = 1;
let isLeftKeyPressed: boolean = false;
let isRightKeyPressed: boolean = false;
let paddleXPos: number = 280;
const paddleYPos: number = 590;
let paddleDiv: (HTMLDivElement | null) = null;
let paddleImage: (HTMLImageElement | null) = null;

let gameSuspendedCountdown: number = 0;
const LOADING_LEVEL_INTERVAL: number = 8000;
const LOST_LIFE_INTERVAL: number = 4000;

const FPS_FRAME_LENGTH: number = 17;

const STATE_GAME_RUNNING: number = 0;
const STATE_GAME_PAUSED: number = 1;
const STATE_LOADING_LEVEL: number = 2;
const STATE_GAME_LOST_LIFE: number = 3;
const STATE_YOU_WIN: number = 4;

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

const BLOCK_TYPE_BASIC: number = 0;
const BLOCK_TYPE_STRONG: number = 1;


const gameLoop = (): void => {
    if (gameState === STATE_GAME_RUNNING) {
        //game loop
        moveBall();
    } else {
        gameSuspendedCountdown -= FPS_FRAME_LENGTH;
        if (gameState !== STATE_GAME_PAUSED && gameSuspendedCountdown <= 0) {
            gameState = STATE_GAME_RUNNING;

            let infoBox: (HTMLElement | null) = document.getElementById("infoBox");
            if (infoBox !== null) {
                infoBox.style.visibility = 'hidden';
            }

            let playingAreaScreen: (HTMLElement | null) = document.getElementById("playingAreaScreen");
            if (playingAreaScreen !== null) {
                playingAreaScreen.style.visibility = 'hidden';
            }
        }
    }

    if (isLeftKeyPressed) movePaddle(DIRECTION_LEFT);
    if (isRightKeyPressed) movePaddle(DIRECTION_RIGHT);

    lastFrameTime = new Date().getTime();

    //end conditions
    if (isGameOver === false && gameState !== STATE_GAME_PAUSED && gameState !== STATE_YOU_WIN) {
        //still in play - keep the loop going
        gameOverVarsSet = false;
        setTimeout(gameLoop, FPS_FRAME_LENGTH);
    } else if (isGameOver === true) {
        gameOver();
    }
    else if (gameState === STATE_GAME_PAUSED || gameState === STATE_YOU_WIN) {
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

    // Make all high scores black (which means they're not in the current game)
    for (let i: number = 0; i < NUM_HIGH_SCORES; i++) {
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


const updateExtraLivesDisplay = () => {
    if (extraLives < 0) {
        extraLives = 0;
    }

    // Show extra lives
    let extraLivesBox: (HTMLElement | null) = document.getElementById("extraLivesBox");
    if (extraLivesBox !== null) {
        let extraLifeBallDiv: Array<(HTMLDivElement | null)> = new Array<(HTMLDivElement | null)>(extraLives);
        let extraLifeBallImg: Array<(HTMLImageElement | null)> = new Array<(HTMLImageElement | null)>(extraLives);

        while (extraLivesBox.hasChildNodes()) {
            extraLivesBox.removeChild(extraLivesBox.firstChild);
        }

        for (let i: number = 0; i < extraLives; i++) {
            extraLifeBallDiv[i] = document.createElement('div');
            extraLifeBallDiv[i].style.visibility = 'visible';
            extraLifeBallDiv[i].style.display = 'inline-block';
            extraLifeBallDiv[i].style.width = '24px';
            extraLifeBallImg[i] = document.createElement('img');
            extraLifeBallImg[i].src = ark_ball;
            extraLifeBallDiv[i].appendChild(extraLifeBallImg[i]);

            extraLivesBox.appendChild(extraLifeBallDiv[i]);
        }
    }

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
    extraLives = 3;

    ballVelocity = new Vector(Math.PI / 4, 140);

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

    let infoBox: (HTMLElement | null) = document.getElementById("infoBox");
    if (infoBox !== null) {
        infoBox.style.visibility = 'hidden';
        infoBox.innerHTML = "PAUSED";
        infoBox.style.color = "rgb(175, 58, 57)";
        infoBox.style.backgroundColor = "rgb(192,192,192)";
    }

    let scoreBox: (HTMLElement | null) = document.getElementById("scoreBox");
    if (scoreBox !== null) {
        scoreBox.style.color = "white";
        scoreBox.style.backgroundColor = "rgb(68, 148, 229)";
        scoreBox.innerText = 'Score: ' + currentScore + "; Level: " + currentLevel + "; Blocks Destroyed: " + numBlocksDestroyed;
    }

    updateExtraLivesDisplay();

    loadHighScores();

    // Make all high scores black (which means they're not in the current game)
    for (let i: number = 0; i < NUM_HIGH_SCORES; i++) {
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

    blocks = new Array<(Block | null)>(0);
    loadLevel(currentLevel);

    // Handle key presses
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
                    isLeftKeyPressed = true;
                    break;
                case "KeyD":
                case "ArrowRight":
                    isRightKeyPressed = true;
                    break;
                case "Escape":
                    handleEscKeyPress();
                    break;
            }
        },
        true,
    );

    window.addEventListener(
        "keyup",
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
                    isLeftKeyPressed = false;
                    break;
                case "KeyD":
                case "ArrowRight":
                    isRightKeyPressed = false;
                    break;
            }
        },
        true,
    );
    
    gameState = STATE_GAME_RUNNING;

    // start the game loop
    gameLoop();
}


const updateScoreBox = (): void => {
    let scoreBox: (HTMLElement | null) = document.getElementById("scoreBox");
    if (scoreBox !== null) {
        scoreBox.innerText = 'Score: ' + currentScore + "; Level: " + currentLevel + "; Blocks Destroyed: " + numBlocksDestroyed;
    }
}


const loadLevel = async (level: number): Promise<Response> => {
    const levelResponse: Promise<Response> = await fetch('arkanoidlevel?id=' + level);

    // Assume that the player just finished the final level
    if (!levelResponse.ok) {
        return levelResponse;
    }

    const levelData: string = await levelResponse.json();

    let playingArea: (HTMLElement | null) = document.getElementById("playingArea");

    let myWorld: World = World.fromJSON(levelData);
    let currentLevel = myWorld.levels[0];
    // create a new, empty board
    if (blocks !== null && blocks?.length > 0) {
        for (let i: number = 0; i < blocks.length; i++) {
            if (blocks[i] !== null && blocks[i].image !== null && blocks[i].image.style !== null) {
                blocks[i].image.style.visibility = 'hidden';
                blocks[i] = null;
            }
        }

        blocks = new Array<(Block | null)>(0);
    }

    // Populate board
    const blockColorField = currentLevel.data.fieldInstances.find((instance) => instance.__identifier === "BlockColor");
    let blockColor = "#000000";
    if (blockColorField !== null) {
        blockColor = blockColorField.__value;
    }

    let blockCounter: number = 0;
    for (const tile of currentLevel.layers[0].data.gridTiles) {
        if (tile.src[0] === 0) {
            let newBlock: Block = new Block();
            newBlock.div = document.createElement('div');
            newBlock.div.style.visibility = 'visible';
            newBlock.x = tile.px[0];
            newBlock.y = tile.px[1];
            newBlock.div.id = "block" + blockCounter++;

            newBlock.div.style.backgroundImage = `url(${ark_blocks})`;
            newBlock.div.style.backgroundPosition = "0px " + tile.src[1] + "px"; // Visible coordinates in image
            newBlock.div.style.height = BLOCK_HEIGHT + 'px';
            newBlock.div.style.width = BLOCK_WIDTH + 'px';
            newBlock.div.style.position = 'absolute';
            newBlock.div.style.top = newBlock.y + 'px';
            newBlock.div.style.left = newBlock.x + 'px';
            newBlock.div.style.backgroundColor = blockColor;
            newBlock.image = null;

            newBlock.setBlockType(tile.src[1]);

            if (playingArea !== null) { playingArea.appendChild(newBlock.div); }
            blocks.push(newBlock);
        }
    }

    playingArea.style.backgroundColor = currentLevel.background.color;

    numBlocksDestroyed = 0;
    updateScoreBox();

    console.log("LEVEL " + level + " LOADED");

    return levelResponse;
}


const handleEscKeyPress = (): void => {
    let infoBox: (HTMLElement | null) = document.getElementById("infoBox");
    let playingAreaScreen: (HTMLElement | null) = document.getElementById("playingAreaScreen");
    let currentTime = new Date().getTime();

    // Wait 0.1 seconds between ESC presses so we don't accidentally register a double-press in debug mode when frames are drawn twice
    if ((lastPauseTime + 100) < currentTime) {
        lastPauseTime = currentTime;

        if (gameState === STATE_GAME_RUNNING) {
            gameState = STATE_GAME_PAUSED;
            if (infoBox !== null) {
                infoBox.style.visibility = 'visible';
                infoBox.innerHTML = "PAUSED";
            }
            if (playingAreaScreen !== null) {
                playingAreaScreen.style.visibility = 'visible';
            }
        }
        else if (gameState === STATE_GAME_PAUSED) {
            gameState = STATE_GAME_RUNNING;
            if (infoBox !== null) {
                infoBox.style.visibility = 'hidden';
            }
            if (playingAreaScreen !== null) {
                playingAreaScreen.style.visibility = 'hidden';
            }

            lastFrameTime = new Date().getTime() - FPS_FRAME_LENGTH;
            setTimeout(() => { gameLoop() }, FPS_FRAME_LENGTH);
        }
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
            rightPanel.appendChild(highScoreDiv);
        }
    }

    startNewGame();
}


const removeBlock = (blockNumber: number): void => {
    if (blocks[blockNumber].image !== null) {
        blocks[blockNumber].image.style.visibility = 'hidden';
    }
    blocks[blockNumber].div.style.display = 'none';
    blocks[blockNumber].div.style.visibility = 'hidden';
    // TODO: Using getElementById works; accessing the blocks[] array seems to access copies of the blocks, not the blocks themselves
    document.getElementById("block" + blockNumber).style.display = 'none';
    blocks[blockNumber] = null;
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

    incrementScore(1);

    updateScoreBox();
}


const levelUp = (newLevel: number): void => {
    console.log("LEVEL " + (newLevel - 1) + " COMPLETED");

    gameState = STATE_LOADING_LEVEL;

    let playingAreaScreen: (HTMLElement | null) = document.getElementById("playingAreaScreen");
    if (playingAreaScreen !== null) {
        playingAreaScreen.style.visibility = 'visible';
    }

    gameSuspendedCountdown = LOADING_LEVEL_INTERVAL;

    // Speed ball up by 12.5%
    ballVelocity.magnitude += (ballVelocity.magnitude / 8);

    const levelResponse: Promise<Response> = loadLevel(newLevel);

    if (levelResponse !== null) {

        levelResponse.then((result) => { // TODO: Should the IF condition be one function, and the ELSE condition be another function? And each function is passed as an arg to then()?

            if (result.ok) {
                let infoBox: (HTMLElement | null) = document.getElementById("infoBox");
                if (infoBox !== null) {
                    infoBox.style.visibility = 'visible';
                    infoBox.style.color = "rgb(56, 175, 68)";
                    infoBox.innerHTML = "LEVEL " + newLevel;
                }
            } else {
                console.log("No level found. Is the game over?");
                console.log("levelResponse: ");
                console.log(result);
                let infoBox: (HTMLElement | null) = document.getElementById("infoBox");
                if (infoBox !== null) {
                    infoBox.style.visibility = 'visible';
                    infoBox.style.color = "rgb(0, 128, 255)";
                    infoBox.innerHTML = "YOU WIN!";
                }

                gameState = STATE_YOU_WIN;

                if (currentHighScores.some((highScore) => { return highScore.isCurrentScore === true })) {
                    let enterName: (HTMLElement | null) = document.getElementById("enterName");
                    if (enterName !== null) {
                        enterName.style.visibility = 'visible';
                    }

                    saveHighScores();
                }

                // Add a NEW GAME button
                let playAgainButton: (HTMLElement | null) = document.getElementById("playAgainButton");
                if (playAgainButton !== null) {
                    playAgainButton.style.visibility = 'visible';
                }

                let playingAreaScreen: (HTMLElement | null) = document.getElementById("playingAreaScreen");
                if (playingAreaScreen !== null) {
                    playingAreaScreen.style.visibility = 'visible';
                }
            }
        });
    }
}


const moveBall = (): void => {
    let moveBallXDistance: number = ((new Date().getTime() - lastFrameTime) / 1000) * ballVelocity.getX();
    let moveBallYDistance: number = ((new Date().getTime() - lastFrameTime) / 1000) * ballVelocity.getY();

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

    // There was a collision. Get the nearest collision
    do {
        changedXDirection = false;
        changedYDirection = false;

        if ((wallCollision !== null && wallCollision.hasValue()) || (blockCollision !== null && blockCollision.hasValue()) || (paddleCollision !== null && paddleCollision.hasValue())) {
            if ((wallCollision !== null && wallCollision.hasValue()) && (blockCollision === null || wallCollision.getDistance() > blockCollision.getDistance())
                && (paddleCollision === null || wallCollision.getDistance() > paddleCollision.getDistance())) {
                // WALL COLLISION is nearest
                nearestCollision = wallCollision;

                if (wallCollision.collisionType === COLLISION_WITH_LEFT_WALL) {
                    ballXPos = -ballXPos;
                    ballVelocity.reverseXDirection();
                    changedXDirection = true;
                } else if (wallCollision.collisionType === COLLISION_WITH_RIGHT_WALL) {
                    ballXPos = ballXPos - (2 * (ballXPos - (BOARD_WIDTH - ballImage.width)));
                    ballVelocity.reverseXDirection();
                    changedXDirection = true;
                } else if (wallCollision.collisionType === COLLISION_WITH_TOP_WALL) {
                    ballYPos = -ballYPos;
                    ballVelocity.reverseYDirection();
                } else {
                    // Death
                    extraLives--;
                    updateExtraLivesDisplay();

                    if (extraLives <= 0) {
                        gameOver();
                    } else {
                        gameState = STATE_GAME_LOST_LIFE;
                        gameSuspendedCountdown = LOST_LIFE_INTERVAL;

                        let infoBox: (HTMLElement | null) = document.getElementById("infoBox");
                        if (infoBox !== null) {
                            infoBox.style.visibility = 'visible';
                            infoBox.style.color = "rgb(56, 175, 68)";
                            infoBox.innerHTML = "" + extraLives + " LIVES LEFT";
                        }

                        let playingAreaScreen: (HTMLElement | null) = document.getElementById("playingAreaScreen");
                        if (playingAreaScreen !== null) {
                            playingAreaScreen.style.visibility = 'visible';
                        }
                    }

                    // TODO: Reset ball to start position
                    ballXPos = 450;
                    ballYPos = 30;
                    ballVelocity.direction = Math.PI / 4;
                }

                oldBallXPos = wallCollision.xPos;
                oldBallYPos = wallCollision.yPos;
            } else if ((blockCollision !== null && blockCollision.hasValue()) && (wallCollision === null || blockCollision.getDistance() > wallCollision.getDistance())
                && (paddleCollision === null || blockCollision.getDistance() > paddleCollision.getDistance())) {
                // BLOCK COLLISION is nearest
                nearestCollision = blockCollision;

                if (blockCollision.collisionType === COLLISION_WITH_BLOCK_LEFT) {
                    ballVelocity.reverseXDirection();
                    changedXDirection = true;
                } else if (blockCollision.collisionType === COLLISION_WITH_BLOCK_RIGHT) {
                    ballVelocity.reverseXDirection();
                    changedXDirection = true;
                } else if (blockCollision.collisionType === COLLISION_WITH_BLOCK_BOTTOM) {
                    ballVelocity.reverseYDirection();
                    changedYDirection = true;
                } else if (blockCollision.collisionType === COLLISION_WITH_BLOCK_TOP) {
                    ballVelocity.reverseYDirection();
                    changedYDirection = true;
                }

                //console.log("Block being removed for collision: " + blockCollision.blockNumberCollision);
                // Remove the block if it's been hit enough times
                if (blocks[blockCollision.blockNumberCollision].blockHit()) {
                    removeBlock(blockCollision.blockNumberCollision);
                }
            } else {
                // PADDLE COLLISION is nearest
                paddleCollision.collisionType = COLLISION_WITH_PADDLE_MIDDLE;
                if (isLeftKeyPressed === true) paddleCollision.collisionType = COLLISION_WITH_PADDLE_LEFT;
                if (isRightKeyPressed === true) paddleCollision.collisionType = COLLISION_WITH_PADDLE_RIGHT;
                nearestCollision = paddleCollision;

                ballVelocity.reverseYDirection();
                ballVelocity.adjustDirection(paddleCollision.collisionType);
            }

            // If the ball changed direction, we need to recalculate the ball's final x and y positions
            if (changedXDirection) {
                //ballXPos = ballXPos - (2 * (oldBallXPos - ballXPos));
                //console.log("initial X[0]: " + oldBallXPos + ", initial X[1]: " + ballXPos);
                //console.log("trying to move ball X from " + ballXPos + " to " + (ballXPos - (2 * (oldBallXPos - ballXPos))));
            }
            if (changedYDirection) {
                console.log("ball Y direction changed; y pos: " + ballYPos + ", collision y pos: " + nearestCollision.yPos);
                ballYPos = ballYPos - (2 * (ballYPos - nearestCollision.yPos));
            }

            // Move the ball using the point of this collision as its starting point
            oldBallXPos = nearestCollision.xPos;
            oldBallYPos = nearestCollision.yPos;

            //if (nearestCollision !== null && (nearestCollision.collisionType === COLLISION_WITH_PADDLE_LEFT ||
            //    nearestCollision.collisionType === COLLISION_WITH_PADDLE_MIDDLE || nearestCollision.collisionType === COLLISION_WITH_PADDLE_RIGHT)) {
            //    console.log("Found a collision with paddle at (" + oldBallXPos + ", " + oldBallYPos + "), new ball pos: (" + ballXPos + ", " + ballYPos + ")");
            //}

            // Re-run the collisions so we can run the loop again
            nearestCollision = null;
            wallCollision = checkForWallCollisions(oldBallXPos, oldBallYPos);
            blockCollision = checkForBlockCollisions(oldBallXPos, oldBallYPos);
            paddleCollision = checkForPaddleCollisions(oldBallXPos, oldBallYPos);
        }
    } while (wallCollision !== null || blockCollision !== null || paddleCollision !== null);

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
            //paddleCollision.collisionType = COLLISION_WITH_PADDLE_MIDDLE;
            // collision in different directions based on where it hits the paddle
            //if ((ballXAtCollisionTime - PADDLE_SIDE_WIDTH) < paddleXPos) {
            //    paddleCollision.collisionType = COLLISION_WITH_PADDLE_LEFT;
            //} else if ((ballXAtCollisionTime + ballImage.width + PADDLE_SIDE_WIDTH) > (paddleXPos + paddleImage.width)) {
            //    paddleCollision.collisionType = COLLISION_WITH_PADDLE_RIGHT;
            //}

            //console.log("Paddle collision detected");
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
            let blockRightXPos: number = blocks[i].x + parseInt(blocks[i].div.style.width, 10);
            let blockBottomYPos: number = blocks[i].y + parseInt(blocks[i].div.style.height, 10);

            // TODO: Collisions should happen if the bottom of the ball hits the top of the block;
            //       and if the top of the ball hits the bottom of the block

            if (ballXPos < oldBallXPos) { // Check for right collision
                if (ballXPos <= blockRightXPos && oldBallXPos > blockRightXPos) {
                    // Ball passed the block's right plane since last frame. But did it collide with the ball then?
                    //console.log("Ball passed block's right plane");

                    // find the point where the line hits the plane
                    // if that point intersects with the block's line segment, fill in data in the rightCollision object
                    let collisionTime: number = (oldBallXPos - blockRightXPos) / (oldBallXPos - ballXPos); // in the range of 0 (old frame) and 1 (new frame), when did the ball hit the paddle?
                    let collisionY: number = oldBallYPos + ((ballYPos - oldBallYPos) * collisionTime);
                    //console.log("collision time: " + collisionTime + ", collisionY: " + collisionY + ", blocks[i].y: " + blocks[i].y + ", blockBottomYPos: " + blockBottomYPos);
                    if ((collisionY + ballImage.height) > blocks[i].y && collisionY < blockBottomYPos) {
                        rightCollision.xPos = oldBallXPos + ((ballXPos - oldBallXPos) * collisionTime);
                        rightCollision.yPos = collisionY;
                        rightCollision.blockNumberCollision = i;

                        console.log("Block right collision detected with block number " + i);
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

                        console.log("Block left collision detected with block number " + i);
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

                        console.log("Block bottom collision detected with block number " + i);
                    }

                }
            }
            if (ballYPos > oldBallYPos) { // Check for top collision
                if ((ballYPos + ballImage.height) >= blocks[i].y && (oldBallYPos + ballImage.height) < blocks[i].y) {
                    //console.log("Ball passed block's top plane");

                    let collisionTime: number = (blocks[i].y - (oldBallYPos + ballImage.height)) / (ballYPos - oldBallYPos);
                    let collisionX: number = oldBallXPos + ((ballXPos - oldBallXPos) * collisionTime);
                    //console.log("collision time: " + collisionTime + ", collisionX: " + collisionX + ", blocks[i].x: " + blocks[i].x + ", blockRightXPos: " + blockRightXPos);
                    if ((collisionX + ballImage.width) > blocks[i].x && collisionX < blockRightXPos) {
                        topCollision.xPos = collisionX;
                        topCollision.yPos = oldBallYPos + ((ballYPos - oldBallYPos) * collisionTime);
                        topCollision.blockNumberCollision = i;

                        console.log("Top collision: y = " + topCollision.yPos + ", block y = " + blocks[i].y);

                        console.log("Block top collision detected with block number " + i);
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


const incrementScore = (amount: number): void => {
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

    let infoBox: (HTMLElement | null) = document.getElementById("infoBox");
    if (infoBox !== null) {
        infoBox.style.visibility = 'visible';
        infoBox.innerHTML = "GAME OVER";
        infoBox.style.color = "rgb(224,224,224)";
        infoBox.style.backgroundColor = "rgb(175, 58, 57)";
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
            <span className="italic absolute top-[140px] left-[100px]">Press ESC to pause</span>

            <div id="fullArea">
                <div id="playingArea" className={`absolute top-[200px] left-[80px] border-t-[1px] w-[640px] h-[${BOARD_HEIGHT}px] bg-[#c0c0c0]`} />
                <div id="infoBox" className={`absolute top-[500px] left-[80px] border-t-[1px] border-black w-[${BOARD_WIDTH}px] h-[48px] text-4xl text-center invisible z-10 font-semibold text-orange-700 bg-[#808080]`}>
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

                <button id="playAgainButton" onClick={startNewGame} className="absolute top-[580px] left-[306px] text-xl center invisible z-10 px-3 py-1 text-[#256bb4] bg-[#c0c0c0]">
                    Click to Play Again
                </button>
                <div id="scoreBox" className={`absolute top-[840px] left-[80px] border-t-[1px] border-black w-[${BOARD_WIDTH}px] h-[24px] text-base text-white bg-[#007fff]`}>
                    Score: 0; Level: 1; Blocks Destroyed: 0
                </div>
                <div id="extraLivesBox" className="absolute top-[840px] left-[600px] h-[24px] text-base text-white"><img src={ark_ball} className="float-left top-0" /> </div>


                <div id="playingAreaScreen" className={`absolute top-[200px] left-[80px] border-t-[1px] border-black w-[${BOARD_WIDTH}px] h-[${BOARD_HEIGHT}px] opacity-80 bg-[#080808]`}> </div>

                <div id="rightPanel">
                    <div id="highScoreHeader" className="absolute top-[365px] left-[760px] font-semibold text-lg underline">High Scores:</div>
                </div>

            </div>
        </div>
    );
}
