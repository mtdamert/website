import React, { useEffect } from 'react';

const PRESSED_SPACE: number = 0;

const STATE_START_SCREEN: number = 0;
const STATE_GAME_RUNNING: number = 1;
const STATE_GAME_PAUSED: number = 2;

let gameState: number = STATE_START_SCREEN;
let isGameOver: boolean;
let gameOverVarsSet: boolean = false;

const init = (): void => {
    let pausedBox: (HTMLElement | null) = document.getElementById("pausedBox");
    if (pausedBox !== null) {
        pausedBox.style.visibility = 'hidden';
        pausedBox.innerHTML = "PAUSED";
        pausedBox.style.color = "rgb(175, 58, 57)";
        pausedBox.style.backgroundColor = "rgb(192,192,192)";
    }

    let titleScreen: (HTMLElement | null) = document.getElementById("titleScreen");
    if (titleScreen !== null) {
        titleScreen.style.visibility = 'visible';
    }
}

const gameLoop = (): void => {

    if (gameState === STATE_GAME_RUNNING) {
        // main game loop
        playSong();
    }

    // end conditions
    if (isGameOver === false && gameState !== STATE_GAME_PAUSED) {
        // still in play - keep the loop going
        gameOverVarsSet = false;
        setTimeout(gameLoop, 50);
    } else if (isGameOver === true) {
        gameOver();
    }
    else if (gameState === STATE_GAME_PAUSED) {
        // idle
    }
}

const playSong = (): void => {
    // Check whether it's time to drop the current piece
//    if ((new Date().getTime() - lastPieceTime) > msPerPieceDrop) {
//        lastPieceTime = new Date().getTime();
//        moveCurrentPiece(DIRECTION_DOWN);
//    }
}


const gameOver = (): void => {
    isGameOver = true;

    if (gameOverVarsSet)
        return;

    // TODO: Set vars

    gameOverVarsSet = true;
}


const startNewGame = (): void => {
    //    currentScore = 0;
    //    totalNumLines = 0;
    //    msPerPieceDrop = 800;

    let pausedBox: (HTMLElement | null) = document.getElementById("pausedBox");
    if (pausedBox !== null) {
        pausedBox.style.visibility = 'hidden';
        pausedBox.innerHTML = "PAUSED";
        pausedBox.style.color = "rgb(175, 58, 57)";
        pausedBox.style.backgroundColor = "rgb(192,192,192)";
    }

    let titleScreen: (HTMLElement | null) = document.getElementById("titleScreen");
    if (titleScreen !== null) {
        titleScreen.style.visibility = 'hidden';
    }

    gameState = STATE_GAME_RUNNING;
    isGameOver = false;

    // start the game loop
    gameLoop();
}


function RhythmGame() {
    useEffect(() => {
        init();
    }, []);

    return (
        <div class="content">
            <div class="title">Rhythm Game</div>
            <span className="italic absolute top-[140px] left-[100px]">Press space when the dot hits the middle of the screen.<br/>Press ESC to pause.</span>

            <div id="fullArea">
                <div id="playingArea" className="absolute top-[200px] left-[80px] border-t-[1px] w-[320px] h-[640px] bg-[#c0c0c0]" />
                <div id="pausedBox" className="absolute top-[500px] left-[80px] border-t-[1px] border-black w-[320px] h-[48px] text-4xl text-center bold invisible z-10 text-orange-700 bg-[#808080]">
                    PAUSED
                </div>
                <div id="titleScreen" className="absolute top-[300px] left-[80px] w-[320px] h-[48px] text-4xl text-center bold invisible z-10 text-pink-700">
                    Rhythm Game
                    <button id="startGameButton" onClick={startNewGame} className="relative top-[200px] text-2xl text-blue-500">Start New Game</button>
                </div>
            </div>
        </div>
    );
}

export default RhythmGame;
