import React, { useEffect } from 'react';
import dot_image from '../images/dot.png';

const STATE_START_SCREEN: number = 0;
const STATE_GAME_RUNNING: number = 1;
const STATE_GAME_PAUSED: number = 2;

const SCREEN_HEIGHT: number = 320;
const SCREEN_WIDTH: number = 640;

let startMenuSelectedOption: number = 0;
const START_MENU_NUM_OPTIONS: number = 1;
const startMenuItems: Array<(HTMLDivElement | null)> = [];

let gameState: number = STATE_START_SCREEN;
let isGameOver: boolean;
let gameOverVarsSet: boolean = false;
let firstTitleScreenDraw: boolean = true;

const notes: Array<(Note | null)> = [];


class Note {
    startTime: number;
    y: number;

    constructor() {
        this.startTime = new Date().getTime();
        this.y = 0;
    }
}


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

    // Load the array of start menu items
    if (startMenuItems.length === 0) {
        let startNewGameOption: HTMLDivElement = document.getElementById("startNewGameOption") as HTMLDivElement;
        startMenuItems.push(startNewGameOption);
        let startOtherOption: HTMLDivElement = document.getElementById("startOtherOption") as HTMLDivElement;
        startMenuItems.push(startOtherOption);
    }

    startMenuSelectedOption = 0;

    gameLoop();
}


const gameLoop = (): void => {
    if (gameState === STATE_START_SCREEN) {
        drawTitleScreen();
        setTimeout(gameLoop, 50);
    }
    else if (gameState === STATE_GAME_RUNNING) {
        if (isGameOver === false && gameState !== STATE_GAME_PAUSED) {
            // main game loop
            playSong();
            gameOverVarsSet = false;
            setTimeout(gameLoop, 50);
        } else if (isGameOver === true) {
            gameOver();
        }
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

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw a line at the middle of the screen
    ctx.beginPath();
    ctx.moveTo(0, 320);
    ctx.lineTo(320, 320);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";
    ctx.lineCap = "round";
    ctx.stroke();

    // Draw a dot
    let dotPosition: number = 100;
    ctx.beginPath();
    ctx.arc(45, 255 + (30 + dotPosition), 10, 0, 2 * Math.PI);
    ctx.fillStyle = "#2b7fff";
    ctx.fill();

    for (let i: number = 0; i < notes.length; i++) {
        // Move the dot
        notes[i].y = (new Date().getTime() - notes[i].startTime) * 0.2;

        // If the dot has moved offscreen, delete it and add a new dot
        if (notes[i].y > SCREEN_HEIGHT) {
            notes[i].startTime = new Date().getTime();
        }

        // Draw the dot
        ctx.beginPath();
        ctx.arc(155, notes[i].y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = "#2b7fff";
        ctx.fill();
    }
}


const gameOver = (): void => {
    isGameOver = true;

    if (gameOverVarsSet)
        return;

    // TODO: Set vars

    gameOverVarsSet = true;
}


const clearStartMenuCanvas = () => {
    const canvas: (HTMLCanvasElement) = document.getElementById("myCanvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
}


const updateStartMenuCanvas = () => {
    const canvas: (HTMLCanvasElement) = document.getElementById("myCanvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    console.log("canvas height: " + canvas.height);

    // Draw a dot next to the selected item
    ctx.beginPath();
    // TODO: Figure out where these mysterious 15s come from
    ctx.arc((canvas.width * 0.1) - 15, (canvas.height * 0.5 + (canvas.height * 0.1 * startMenuSelectedOption)) + 15, 10, 0, 2 * Math.PI);
    ctx.fillStyle = "#2b7fff";
    ctx.fill();

    // Make the selected item blue and all other items black
    for (let i: number = 0; i < startMenuItems.length; i++) {
        if (i === startMenuSelectedOption) {
            startMenuItems[i].style.color = "#2b7fff";
        } else {
            startMenuItems[i].style.color = "#000000";
        }
    }
}


const drawTitleScreen = () => {
    if (firstTitleScreenDraw) {
        // Clear canvas
        const canvas: (HTMLCanvasElement) = document.getElementById("myCanvas") as HTMLCanvasElement;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw a canvas dot next to the selected menu item
        updateStartMenuCanvas();

        firstTitleScreenDraw = false;

        window.addEventListener(
            "keydown",
            (event) => {
                if (event.defaultPrevented) {
                    return; // Do nothing if event already handled
                }

                // TODO: Do we need something like this?
                //if (isGameOver === true)
                //    return;

                if (gameState === STATE_START_SCREEN) {
                    switch (event.code) {
                        case "KeyS":
                        case "ArrowDown":
                            moveStartMenuPointerDown();
                            break;
                        case "KeyW":
                        case "ArrowUp":
                            moveStartMenuPointerUp();
                            break;
                        case "Enter":
                            handleChooseStartMenuItem();
                            break;
                    }
                }

            //    if (event.code !== "Tab") {
            //        // Consume the event so it doesn't get handled twice,
            //        // as long as the user isn't trying to move focus away
            //        event.preventDefault();
            //    }
            },
            true,
        );
    }
}


const moveStartMenuPointerDown = () => {
    if (startMenuSelectedOption < START_MENU_NUM_OPTIONS) {
        startMenuSelectedOption++;

        // Move dot and highlighted option
        updateStartMenuCanvas();
    }
}


const moveStartMenuPointerUp = () => {
    if (startMenuSelectedOption > 0) {
        startMenuSelectedOption--;

        // Move dot and highlighted option
        updateStartMenuCanvas();
    }
}


const handleChooseStartMenuItem = () => {
    if (startMenuSelectedOption === 0) {
        clearStartMenuCanvas();
        startNewGame();
    }
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

    notes.push(new Note());

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

            <div id="fullArea" className={`absolute top-[200px] left-[80px] border-t-[1px] w-[${SCREEN_WIDTH}px] h-[${SCREEN_HEIGHT}px]`}>
                <div id="playingArea" className="relative w-full h-full bg-[#c0c0c0]">
                    <canvas id="myCanvas" className="absolute w-full h-full" width={`${SCREEN_WIDTH}`} height={`${SCREEN_HEIGHT}`} />
                    <div id="pausedBox" className={`absolute top-[300px] border-t-[1px] border-black w-[${SCREEN_WIDTH}px] h-[48px] text-4xl text-center bold z-10 text-orange-700 bg-[#808080]`}>
                        PAUSED
                    </div>
                    <div id="titleScreen" className={`absolute h-[${SCREEN_HEIGHT}px] w-[${SCREEN_WIDTH}px] invisible z-10`}>
                        <div className={`absolute top-[15%] text-center text-4xl font-bold text-pink-700 w-[${SCREEN_WIDTH}px]`}>Rhythm Game</div>
                        <div id="startNewGameOption" onClick={startNewGame} className={`absolute text-left text-xl indent-[10%] top-[50%] w-[${SCREEN_WIDTH}px]`}>
                            Start New Game
                        </div>
                        <div id="startOtherOption" className={`absolute text-left text-xl indent-[10%] top-[60%] w-[${SCREEN_WIDTH}px]`}>
                            Other Options
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default RhythmGame;
