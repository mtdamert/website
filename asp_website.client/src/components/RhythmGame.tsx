import React from 'react';

const PRESSED_SPACE: number = 0;

const STATE_START_SCREEN: number = 0;
const STATE_GAME_RUNNING: number = 1;
const STATE_GAME_PAUSED: number = 2;

let gameState: number;
let isGameOver: boolean;
let gameOverVarsSet: boolean = false;

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
}


function RhythmGame() {
    return (
        <div class="content">
            <div class="title">Rhythm Game</div>
            <span className="italic absolute top-[140px] left-[100px]">Press space when the dot hits the middle of the screen.<br/>Press ESC to pause.</span>

            <div id="fullArea">
                <div id="playingArea" className="absolute top-[200px] left-[80px] border-t-[1px] w-[320px] h-[640px] bg-[#c0c0c0]" />
                <div id="pausedBox" className="absolute top-[500px] left-[80px] border-t-[1px] border-black w-[320px] h-[48px] text-4xl text-center bold invisible z-10 text-orange-700 bg-[#808080]">
                    PAUSED
                </div>
            </div>
        </div>
    );
}

export default RhythmGame;
