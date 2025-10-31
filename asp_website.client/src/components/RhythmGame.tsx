import React, { useEffect } from 'react';
import dot_image from '../images/dot.png';

const STATE_START_SCREEN: number = 0;
const STATE_GAME_RUNNING: number = 1;
const STATE_GAME_PAUSED: number = 2;

const SCREEN_HEIGHT: number = 320;
const SCREEN_WIDTH: number = 640;
const NOTE_RADIUS: number = SCREEN_WIDTH * 0.015;

let startMenuSelectedOption: number = 0;
const START_MENU_NUM_OPTIONS: number = 1;
const startMenuItems: Array<(HTMLDivElement | null)> = [];

let gameState: number = STATE_START_SCREEN;
let isGameOver: boolean;
let gameOverVarsSet: boolean = false;
let firstTitleScreenDraw: boolean = true;

const notes: Array<(Note | null)> = [];
const NOTE_SIMPLE: number = 0;
const NOTE_DOUBLE_LENGTH: number = 1;

const DOUBLE_LENGTH_NOTE_WIDTH: number = SCREEN_WIDTH * 0.06;

const NOTE_POS_TOP: number = 0;
const NOTE_POS_SECOND: number = 1;
const NOTE_POS_BOTTOM: number = 2;

let score: number = 0;
let lastTimeSpacePressed: number = 0;
let lastTimeSpaceReleased: number = 0;


class Note {
    startTime: number; // when the note started being rendered onscreen
    x: number;
    y: number;
    speed: number;
    startHitTime: number;
    endHitTime: number;
    wasHit: boolean;
    noteType: number;

    updateHitTime(): void {
        switch (this.noteType) {
            case NOTE_SIMPLE:
                this.startHitTime = this.endHitTime = this.startTime + (SCREEN_WIDTH * 0.5 / this.speed); // 0.5 is the middle of the screen
                break;
            case NOTE_DOUBLE_LENGTH:
                this.startHitTime = this.startTime + ((SCREEN_WIDTH * 0.5 + NOTE_RADIUS) / this.speed); // 0.5 is the middle of the screen
                this.endHitTime = this.startHitTime + (DOUBLE_LENGTH_NOTE_WIDTH * 0.5 / this.speed);
                break;
        }

    }

    constructor(speed: number, noteType: number, notePos: number) {
        this.startTime = new Date().getTime();
        console.log("note start time: " + this.startTime);
        this.x = 0;
        this.speed = speed;
        this.wasHit = false;
        this.noteType = noteType;
        this.updateHitTime();
        console.log("note start hit time  : " + this.startHitTime);

        switch (notePos) {
            case NOTE_POS_TOP:
                this.y = SCREEN_HEIGHT / 4;
                break;
            case NOTE_POS_SECOND:
                this.y = SCREEN_HEIGHT / 4 * 2;
                break;
            case NOTE_POS_BOTTOM:
                this.y = SCREEN_HEIGHT / 4 * 3;
                break;
        }
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
    score = 0;

    gameLoop();
}


const gameLoop = (): void => {
    if (gameState === STATE_START_SCREEN) {
        drawTitleScreen();
        setTimeout(gameLoop, 17);
    }
    else if (gameState === STATE_GAME_RUNNING) {
        if (isGameOver === false && gameState !== STATE_GAME_PAUSED) {
            // main game loop
            requestAnimationFrame(playSong);
            gameOverVarsSet = false;
            setTimeout(gameLoop, 17);
        } else if (isGameOver === true) {
            gameOver();
        }
    }
    else if (gameState === STATE_GAME_PAUSED) {
        // idle
    }
}


const playSong = (): void => {
    const canvas: (HTMLCanvasElement) = document.getElementById("myCanvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    const currentTime = new Date().getTime();

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw a line at the middle of the screen
    ctx.beginPath();
    ctx.moveTo(SCREEN_WIDTH * 0.5, 0);
    ctx.lineTo(SCREEN_WIDTH * 0.5, SCREEN_HEIGHT);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";
    ctx.lineCap = "round";
    ctx.stroke();

    for (let i: number = 0; i < notes.length; i++) {
        // Move the note
        notes[i].x = (currentTime - notes[i].startTime) * notes[i].speed;

        // If the note has moved offscreen, delete it and add a new note
        if (notes[i].x > SCREEN_WIDTH) {
            notes[i].startTime = new Date().getTime();
            notes[i].updateHitTime();
            notes[i].wasHit = false;
        }

        // Don't remove this test! It's a useful way of showing the range where a note hit is registered
        //lastTimeSpacePressed = currentTime; // TEST note hit time

        if (currentTime >= notes[i].startTime) {
            let distanceFromHitTime: number = Math.abs(lastTimeSpacePressed - notes[i].startHitTime);
            if (distanceFromHitTime <= (notes[i].speed * 2000)) {
                // If this is the first time this note was hit, score a point
                if (notes[i].wasHit === false) {
                    score++;
                }

                notes[i].wasHit = true;
            }
        }

        // Draw the note
        ctx.fillStyle = (notes[i].wasHit ? "#2b7fff" : "#b4871c");
        ctx.beginPath();
        if (notes[i].noteType === NOTE_SIMPLE) {
            // Draw a circle
            ctx.arc(notes[i].x, notes[i].y, NOTE_RADIUS, 0, 2 * Math.PI);
        } else if (notes[i].noteType === NOTE_DOUBLE_LENGTH) {
            // Draw an ellipse
            ctx.arc(notes[i].x, notes[i].y, NOTE_RADIUS, 2 * Math.PI / 2, 1 / 2 * Math.PI);
            ctx.fill();

            // If the player is still holding down the note, color in the note
            ctx.beginPath();
            ctx.fillStyle = (notes[i].wasHit && notes[i].endHitTime < lastTimeSpaceReleased) ? "#2b7fff" : "#b4871c";

            // TODO: Color only the portion of the note that the user has held the button for
            ctx.lineTo(notes[i].x - DOUBLE_LENGTH_NOTE_WIDTH - 2, notes[i].y - NOTE_RADIUS); // 2 is a magic number so we slightly overdraw and remove aliasing
            ctx.lineTo(notes[i].x - 1, notes[i].y - NOTE_RADIUS);
            ctx.lineTo(notes[i].x - 1, notes[i].y + NOTE_RADIUS);
            ctx.lineTo(notes[i].x - DOUBLE_LENGTH_NOTE_WIDTH - 2, notes[i].y + NOTE_RADIUS);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(notes[i].x - DOUBLE_LENGTH_NOTE_WIDTH, notes[i].y, NOTE_RADIUS, 1 / 2 * Math.PI / 2, 3 / 2 * Math.PI);
        }
        ctx.fill();
    }

    // Draw the current score
    ctx.font = '30px Arial';
    ctx.fillStyle = '#c6005c'; // Color for filled text
    ctx.textAlign = 'center'; // Horizontal alignment
    ctx.textBaseline = 'middle'; // Vertical alignment
    ctx.fillText(score.toString(), canvas.width / 20 * 19, canvas.height / 10);
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

    // Draw a dot next to the selected item
    ctx.beginPath();
    ctx.arc((canvas.width * 0.075), (canvas.height * 0.55 + (canvas.height * 0.1 * startMenuSelectedOption)), NOTE_RADIUS, 0, 2 * Math.PI);
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
                } else if (gameState === STATE_GAME_RUNNING) {
                    switch (event.code) {
                        case "Space":
                            lastTimeSpacePressed = new Date().getTime();
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
        window.addEventListener(
            "keyup",
            (event) => {
                if (event.defaultPrevented) {
                    return; // Do nothing if event already handled
                }

                if (gameState === STATE_GAME_RUNNING) {
                    switch (event.code) {
                        case "Space":
                            lastTimeSpaceReleased = new Date().getTime();
                            break;
                    }
                }
            }
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

    notes.push(new Note(0.1, NOTE_SIMPLE, NOTE_POS_TOP)); // test simple note
    notes.push(new Note(0.15, NOTE_DOUBLE_LENGTH, NOTE_POS_SECOND)); // test long note

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

{/*            TODO: Adjust screen width and height, because these values seem to not be getting picked up*/}
            <div id="fullArea" className={`absolute top-[200px] left-[80px] border-t-[1px] h-[320px] w-[${SCREEN_WIDTH}px]`}>
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
