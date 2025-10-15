import React, { useEffect } from 'react';
import dot_image from '../images/dot.png';

const PRESSED_SPACE: boolean = false;

const STATE_START_SCREEN: number = 0;
const STATE_GAME_RUNNING: number = 1;
const STATE_GAME_PAUSED: number = 2;

let startScreenSelectedOption: number = 0;

let gameState: number = STATE_START_SCREEN;
let isGameOver: boolean;
let gameOverVarsSet: boolean = false;
let firstTitleScreenDraw: boolean = true;

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

    startScreenSelectedOption = 0;

    gameLoop();
}

const gameLoop = (): void => {
    if (gameState === STATE_START_SCREEN) {
        drawTitleScreen();
        setTimeout(gameLoop, 50);
    }
    else if (gameState === STATE_GAME_RUNNING) {
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

    const canvas: (HTMLCanvasElement) = document.getElementById("myCanvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(50, 50);
    ctx.lineTo(200, 150);
    ctx.lineWidth = 5;
    ctx.strokeStyle = "blue";
    ctx.lineCap = "round";
    ctx.stroke();
}


const gameOver = (): void => {
    isGameOver = true;

    if (gameOverVarsSet)
        return;

    // TODO: Set vars

    gameOverVarsSet = true;
}


const drawTitleScreen = () => {
    //let titleScreen: (HTMLDivElement | null) = document.getElementById("titleScreen") as HTMLDivElement;

    if (firstTitleScreenDraw) {
        // Draw a dot next to the selected menu item
        //let dotImageElement: HTMLImageElement = document.createElement('img');
        //dotImageElement.src = dot_image;
        //dotImageElement.style.position = 'absolute';
        //dotImageElement.style.top = '140px';
        //dotImageElement.style.left = '35px';
        //dotImageElement.style.height = '50%';
        //dotImageElement.style.display = 'block';

        //titleScreen.appendChild(dotImageElement);

        // Draw a canvas dot next to the selected menu item
        const canvas: (HTMLCanvasElement) = document.getElementById("myCanvas") as HTMLCanvasElement;
        const ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(45, 255, 10, 0, 2 * Math.PI);
        ctx.fillStyle = "#2b7fff";
        ctx.fill();

        firstTitleScreenDraw = false;
    }

    // TODO: Draw loop
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
}

function RhythmGame() {
    useEffect(() => {
        init();
    }, []);

    return (
        <div class="content">
            <div class="title">Rhythm Game</div>
            <span className="italic absolute top-[140px] left-[100px]">Press space when the dot hits the middle of the screen.<br/>Press ESC to pause.</span>

            <div id="fullArea" className="absolute top-[200px] left-[80px] border-t-[1px] w-[320px] h-[640px]">
                <div id="playingArea" className="relative w-full h-full bg-[#c0c0c0]">
                    <canvas id="myCanvas" className="absolute w-full h-full" width="320" height="640" />
                    <div id="pausedBox" className="absolute top-[300px] border-t-[1px] border-black w-[320px] h-[48px] text-4xl text-center bold  z-10 text-orange-700 bg-[#808080]">
                        PAUSED
                    </div>
                    <div id="titleScreen" className="absolute top-[100px] w-[320px] h-[48px] text-4xl text-center bold invisible z-10 text-pink-700">
                        <div>Rhythm Game</div>
                        <div id="startNewGameOption" onClick={startNewGame} className="absolute text-left text-blue-500 text-xl indent-[60px] top-[140px] hover:text-black">
                            Start New Game
                        </div>
                        <div id="startOtherOption" className="absolute text-left text-blue-500 text-xl indent-[60px] top-[170px] hover:text-black">
                            Other Options
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default RhythmGame;
