// TODO: Graphics
//       - make notes prettier (bounce when hit?)
//       - make text placement better & prettier
//       - what do I want the game to look like?
//       - prettier start screen (& other screens)
//       stage format
//       end-of-level scoring

import React, { useEffect } from 'react';
import dot_image from '../images/dot.png';

const STATE_START_SCREEN: number = 0;
const STATE_GAME_RUNNING: number = 1;
const STATE_GAME_PAUSED: number = 2;

const SCREEN_HEIGHT: number = 320;
const SCREEN_WIDTH: number = 640;
const NOTE_RADIUS: number = SCREEN_WIDTH * 0.015;
const HIT_POINT: number = SCREEN_WIDTH * 0.5;

let startMenuSelectedOption: number = 0;
const START_MENU_NUM_OPTIONS: number = 1;
const startMenuItems: Array<(HTMLDivElement | null)> = [];

let gameState: number = STATE_START_SCREEN;
let isGameOver: boolean;
let gameOverVarsSet: boolean = false;
let firstTitleScreenDraw: boolean = true;

const keysPressed: Array<(KeyPressed | null)> = [];
const notes: Array<(Note | null)> = [];
const NOTE_SIMPLE: number = 0;
const NOTE_DOUBLE_LENGTH: number = 1;

const DOUBLE_LENGTH_NOTE_WIDTH: number = SCREEN_WIDTH * 0.06;

const NOTE_POS_TOP: number = 0;
const NOTE_POS_SECOND: number = 1;
const NOTE_POS_BOTTOM: number = 2;

const NOTE_LEEWAY: number = 200;
const NOTE_OK_RANGE: number = 60;
const NOTE_GREAT_RANGE: number = 150;
// Beyond that, all notes are in the EXCELLENT range

let score: number = 0;
let lastTimeSpacePressed: number = 0;
let lastTimeSpaceReleased: number = 0;
let lastFrameTime: number = 0;

let onscreenMessages: Array<(OnscreenMessage | null)> = [];
let particleSystems: Array<(ParticleSystem | null)> = [];

let debugMode: boolean = true;


class Note {
    startTime: number; // when the note started being rendered onscreen
    x: number;
    y: number;
    speed: number;
    startHitTime: number;
    endHitTime: number;
    startReleaseHoldTime: number; // For notes that have to be held, like a double-length note
    endReleaseHoldTime: number; // For notes that have to be held, like a double-length note
    wasHit: boolean;
    endWasHit: boolean;
    hitPercentage: number;
    noteType: number;
    keyPressOnHit: KeyPressed;
    scorePerMsHeld: number;

    updateHitTime(): void {
        this.startHitTime = this.startTime + (HIT_POINT / this.speed) - NOTE_LEEWAY;
        this.endHitTime = this.startHitTime + (2 * NOTE_LEEWAY);

        switch (this.noteType) {
            case NOTE_SIMPLE:
                //console.log('creating NOTE_SIMPLE with startHitTime of ' + this.startHitTime + ' and endHitTime of ' + this.endHitTime);
                break;
            case NOTE_DOUBLE_LENGTH:
                // TODO: Not sure if this is right; we want the endReleaseHoldTime to be sometime between when the middle of the note ends and {that point + NOTE_LEEWAY}
                this.startReleaseHoldTime = this.startTime + ((HIT_POINT + DOUBLE_LENGTH_NOTE_WIDTH) / this.speed);
                this.endReleaseHoldTime = this.startReleaseHoldTime + (2 * NOTE_LEEWAY);

                console.log('creating NOTE_DOUBLE_LENGTH with startHitTime of ' + this.startHitTime + ' and endHitTime of ' + this.endHitTime
                    + ' and startReleaseHoldTime of ' + this.startReleaseHoldTime + ' and endReleaseHoldTime of ' + this.endReleaseHoldTime);
                break;
        }

    }

    constructor(speed: number, noteType: number, notePos: number, scorePerMsHeld: number) {
        this.startTime = new Date().getTime();
        this.x = 0;
        this.speed = speed;
        this.wasHit = false;
        this.endWasHit = false;
        this.hitPercentage = 0;
        this.noteType = noteType;
        this.keyPressOnHit = null;
        this.scorePerMsHeld = scorePerMsHeld;
        this.updateHitTime();

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

    getStartHitXCoord(currentTime: number): number {
        let result: number = this.getXCoord(this.startHitTime, currentTime);
        return result;
    }

    getEndHitXCoord(currentTime: number): number {
        let result: number = this.getXCoord(this.endHitTime, currentTime);
        return result;
    }

    getXCoord(targetTime: number, currentTime: number): number {
        // This works because we're trying to calculate how far targetTime is from the HIT_POINT
        return (currentTime - targetTime) * this.speed + HIT_POINT;
    }

    getLengthOfNoteToDraw(currentTime: number): number {
        if (this.keyPressOnHit == null) {
            return 0;
        }

        if (!this.keyPressOnHit.isCurrentlyDown) {
            if (this.keyPressOnHit.releaseTime <= 0) { // Key has not been pressed yet
                return 0;
            }
            else { // Key has been pressed and released
                return (this.keyPressOnHit.releaseTime - this.keyPressOnHit.pressTime) * this.speed;
            }
        } else if (this.keyPressOnHit.isCurrentlyDown) { // Key has been pressed but not released
            return (currentTime - this.keyPressOnHit.pressTime) * this.speed;
        }
    }

    // TODO: Make sure this only gets called once per note
    keyPressWasReleased(ctx: CanvasRenderingContext2D): void {
        //console.log("note released at " + this.keyPressOnHit.releaseTime + "; expected from ("
        //    + this.startReleaseHoldTime + " - " + this.endReleaseHoldTime + ")");

        // If we have a double-length note, detect when key was released on the end of the note
        if (this.noteType === NOTE_DOUBLE_LENGTH && this.keyPressOnHit.isCurrentlyDown === false // Both conditions on this line should always be true
            && this.endWasHit === false
            && this.keyPressOnHit.releaseTime >= this.startReleaseHoldTime
            && this.keyPressOnHit.releaseTime <= this.endReleaseHoldTime) {
            this.endWasHit = true;

            scoreNoteHit(ctx, this.startHitTime, this.endHitTime, 20, 50, 100);
        }
    }
}


class KeyPressed {
    pressTime: number;
    releaseTime: number = 0;
    isCurrentlyDown: boolean;
    keyName: string;
    scoreAwarded: number = 0;
    observers: Array<Note> = [];

    constructor(pressTime: number) {
        this.pressTime = pressTime;
        this.isCurrentlyDown = true;

        // TODO: For now, the space bar is the only key that gets pressed
        this.keyName = 'space';
    }

    addObserver(note: Note): void {
        this.observers.push(note);
    }

    notifyObservers(ctx: CanvasRenderingContext2D): void {
        for (let i = 0; i < this.observers.length; i++) {
            this.observers[i].keyPressWasReleased(ctx);
        }
    }
}


class OnscreenMessage {
    text: string;
    x: number;
    y: number;
    startTime: number;
    duration: number;

    constructor(x: number, y: number, text: string) {
        this.x = x;
        this.y = y;
        this.text = text;

        this.startTime = new Date().getTime();
        this.duration = 1000;
    }
}


class ParticleSystem {
    startTime: number;
    startXPos: number;
    startYPos: number;
    duration: number;
    numParticles: number;
    particles: Array<CircleParticle> = [];

    constructor(startTime: number, startXPos: number, startYPos: number, duration: number, numParticles: number) {
        this.startTime = startTime;
        this.startXPos = startXPos;
        this.startYPos = startYPos;
        this.duration = duration;
        this.numParticles = numParticles;

        for (let i: number = 0; i < this.numParticles; i++) {
            // Push each particle in random direction and vary its velocity
            const angle = Math.random() * 2 * Math.PI;
            const radius = Math.random() * (NOTE_RADIUS * 0.02); // Random radius 0 to 1 (or whatever value we multiply by)

            // Convert polar coordinates to Cartesian
            const xVelocity = radius * Math.cos(angle);
            const yVelocity = radius * Math.sin(angle);

            this.particles.push(new CircleParticle(this.startXPos, this.startYPos, xVelocity, yVelocity, 5, "#2b7fff"));
        }
    }

    update(msSinceLastFrame: number): void {
        // Update all particles
        for (let i: number = 0; i < this.numParticles; i++) {
            this.particles[i].update(msSinceLastFrame);
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].draw(ctx);
        }
    }

    // TODO: Make this particle system observed by a note. When that note moves, we can also move the particle system
    move(x: number, y: number) {
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].xPos += x;
            this.particles[i].yPos += y;
        }
    }

    isFinished(currentTime: number) {
        if (currentTime > (this.startTime + this.duration)) {
            return true;
        }

        return false;
    }
}


class CircleParticle {
    xPos: number;
    yPos: number;
    xVelocity: number;
    yVelocity: number;
    radius: number;
    color: string;

    // TODO: Allow particle to be created at non-zero time so it doesn't start in the middle of a circle, it starts slightly outside it already in motion
    constructor(startXPos: number, startYPos: number, xVelocity: number, yVelocity: number, radius: number, color: string) {
        this.xPos = startXPos;
        this.yPos = startYPos;
        this.xVelocity = xVelocity;
        this.yVelocity = yVelocity;
        this.radius = radius;
        this.color = color;
    }

    update(msSinceLastFrame: number): void {
        this.xPos = this.xPos + this.xVelocity * msSinceLastFrame;
        this.yPos = this.yPos + this.yVelocity * msSinceLastFrame;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        console.log("Drawing a particle at (" + this.xPos + ", " + this.yPos + ")");
        ctx.fillStyle = (this.color);
        ctx.beginPath();
        ctx.arc(this.xPos, this.yPos, this.radius, 0, 2 * Math.PI);
        ctx.fill();
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
        lastFrameTime = new Date().getTime();
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
    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // Draw a line at the middle of the screen
    drawHitPointLine(ctx);

    for (let i: number = 0; i < notes.length; i++) {
        // Move the note
        notes[i].x = (currentTime - notes[i].startTime) * notes[i].speed;

        // DEBUG: If the note has moved offscreen, delete it and add a new note
        if (notes[i].x > SCREEN_WIDTH) {
            let newStartTime = new Date().getTime();
            notes[i].startTime = newStartTime;
            notes[i].updateHitTime();
            notes[i].wasHit = false;
            notes[i].hitPercentage = 0;
            notes[i].endWasHit = false;
            notes[i].keyPressOnHit = null;
        }

        // detect notes hit
        // Don't remove this test! It's a useful way of showing the range where a note hit is registered
        //lastTimeSpacePressed = currentTime; // TEST note hit time

        if (currentTime >= notes[i].startTime) {
            // TODO: This needs to be more complex when we have more keypresses than just the space bar
            if (lastTimeSpacePressed >= notes[i].startHitTime && lastTimeSpacePressed <= notes[i].endHitTime) {
                // If this is the first time this note was hit, score a point
                if (notes[i].wasHit === false) {
                    scoreNoteHit(ctx, notes[i].startHitTime, notes[i].endHitTime, 10, 25, 50);
                    particleSystems.push(new ParticleSystem(currentTime, HIT_POINT, notes[i].y, 200, 20));
                }

                notes[i].wasHit = true;
                // attach the key press to this note so we can access it later and vice versa
                // TODO: This needs to be more complex when we have more keypresses than just the space bar
                notes[i].keyPressOnHit = keysPressed[keysPressed.length - 1];
                keysPressed[keysPressed.length - 1].addObserver(notes[i]);
            }
        }

        // Draw the note
        if (notes[i].noteType === NOTE_SIMPLE) {
            drawSimpleNote(ctx, notes[i], currentTime);
        } else if (notes[i].noteType === NOTE_DOUBLE_LENGTH) {
            drawDoubleLengthNote(ctx, notes[i], currentTime);
        }
    }

    updateAndRenderOnscreenMessages(currentTime, ctx);
    updateAndRenderParticleSystems(currentTime, currentTime - lastFrameTime, ctx);

    // Draw the current score
    drawScore(ctx);

    lastFrameTime = currentTime;
}


const scoreNoteHit = (ctx: CanvasRenderingContext2D, startHitTime: number, endHitTime: number, goodPoints: number, greatPoints: number, excellentPoints: number): void => {
    let message: string = "OK";
    let points: number = goodPoints;

    // How close were we to the center of this note?
    if (lastTimeSpacePressed >= (NOTE_OK_RANGE + startHitTime) && lastTimeSpacePressed <= (endHitTime - NOTE_OK_RANGE)) {
        message = "GREAT";
        points = greatPoints;

        if (lastTimeSpacePressed >= (NOTE_GREAT_RANGE + startHitTime) && lastTimeSpacePressed <= (endHitTime - NOTE_GREAT_RANGE)) {
            message = "EXCELLENT";
            points = excellentPoints;
        }
    }

    addOnscreenMessage(ctx, 0, 0, message);
    score += points;
}


const drawHitPointLine = (ctx: CanvasRenderingContext2D): void => {
    ctx.beginPath();
    ctx.moveTo(HIT_POINT, 0);
    ctx.lineTo(HIT_POINT, SCREEN_HEIGHT);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";
    ctx.lineCap = "round";
    ctx.stroke();
}


const drawSimpleNote = (ctx: CanvasRenderingContext2D, note: Note, currentTime: number): void => {
    if (debugMode) {
        // In debug mode, show the area where the note can be hit
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = (note.wasHit ? "#000000" : "#c6005c");
        ctx.beginPath();
        let rightXCoord = HIT_POINT - ((note.startHitTime - currentTime) * note.speed);
        let leftXCoord = HIT_POINT - ((note.endHitTime - currentTime) * note.speed); // Calculating this every time is ineffecient, but because this is debug mode, we don't care
        ctx.fillRect(rightXCoord, note.y - (1.5 * NOTE_RADIUS), (leftXCoord - rightXCoord), NOTE_RADIUS * 3);
        ctx.fill();

        ctx.globalAlpha = 1.0;
    }

    // Draw a circle
    ctx.fillStyle = (note.wasHit ? "#2b7fff" : "#b4871c");
    ctx.beginPath();
    ctx.arc(note.x, note.y, NOTE_RADIUS, 0, 2 * Math.PI);
    ctx.fill();
}


const drawDoubleLengthNote = (ctx: CanvasRenderingContext2D, note: Note, currentTime: number): void => {
    if (debugMode) {
        // In debug mode, show the area where the note can be hit
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = (note.wasHit ? "#000000" : "#c6005c");
        ctx.beginPath();
        let rightXCoord = HIT_POINT - ((note.startHitTime - currentTime) * note.speed);
        let leftXCoord = HIT_POINT - ((note.endHitTime - currentTime) * note.speed); // Calculating this every time is ineffecient, but because this is debug mode, we don't care
        ctx.fillRect(rightXCoord, note.y - (1.5 * NOTE_RADIUS), (leftXCoord - rightXCoord), NOTE_RADIUS * 3);
        ctx.fill();

        // Show where the key can be released after filling in as much of the note as possible
        ctx.beginPath();
        rightXCoord = HIT_POINT - ((note.startReleaseHoldTime - currentTime) * note.speed);
        leftXCoord = HIT_POINT - ((note.endReleaseHoldTime - currentTime) * note.speed);
        ctx.fillRect(rightXCoord, note.y - (1.5 * NOTE_RADIUS), (leftXCoord - rightXCoord), NOTE_RADIUS * 3);
        ctx.fill();

        ctx.globalAlpha = 1.0;
    }

    // Draw an ellipse
    ctx.fillStyle = (note.wasHit ? "#2b7fff" : "#b4871c");
    ctx.beginPath();
    ctx.arc(note.x, note.y, NOTE_RADIUS, 3 / 2 * Math.PI, 1 / 2 * Math.PI);
    ctx.fill();

    // Color only the portion of the note that the user has held the button for

    // Draw the colored-in portion of the note. This is for both if the player is still holding down the note or if the note was previously held
    ctx.beginPath();
    ctx.fillStyle = "#2b7fff";
    //ctx.fillStyle = (note.wasHit && note.keyPressOnHit.isCurrentlyDown) ? "#2b7fff" : "#b4871c";

    let noteBodyWidth = note.getLengthOfNoteToDraw(currentTime); //previously, this was DOUBLE_LENGTH_NOTE_WIDTH
    if (noteBodyWidth > DOUBLE_LENGTH_NOTE_WIDTH) {
        noteBodyWidth = DOUBLE_LENGTH_NOTE_WIDTH;
    }
    ctx.fillRect(note.x - noteBodyWidth - 2, note.y - NOTE_RADIUS, noteBodyWidth + 2, NOTE_RADIUS * 2); // 2 is a magic number so we slightly overdraw and remove aliasing
    ctx.fill();

    // Score the note if it's currently being held down
    if (note.keyPressOnHit != null && note.keyPressOnHit.isCurrentlyDown) {
        // TODO: How do we only add the portion of the score added since last frame?

        let noteHoldStartTime: number = note.startHitTime + NOTE_LEEWAY;
        if (currentTime >= noteHoldStartTime) {
            let noteHoldEndTime: number = note.startReleaseHoldTime;

            let currentHeldTime: number = ((currentTime > noteHoldEndTime) ? noteHoldEndTime : currentTime) - note.keyPressOnHit.pressTime;
            let scoreAwarded: number = currentHeldTime * note.scorePerMsHeld;
            score += (scoreAwarded - note.keyPressOnHit.scoreAwarded);
            note.keyPressOnHit.scoreAwarded = scoreAwarded;
        }

        // TODO: 
        //   -> a note starts at note.startTime + NOTE_LEEWAY and ends at startReleaseHoldTime + NOTE_LEEWAY
        //   -> figure out how much time has passed since last frame (note.keyPressed.scoreAwarded) and multiply by scorePerMsHeld,
        //      then update scoreAwarded
    }

    // Draw the un-colored-in portion of the note
    ctx.beginPath();
    ctx.fillStyle = "#b4871c";
    ctx.fillRect(note.x - DOUBLE_LENGTH_NOTE_WIDTH - 2, note.y - NOTE_RADIUS, (DOUBLE_LENGTH_NOTE_WIDTH - noteBodyWidth) + 2, NOTE_RADIUS * 2); // 2 is a magic number so we slightly overdraw and remove aliasing
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = (note.wasHit && note.endWasHit) ? "#2b7fff" : "#b4871c";
    ctx.arc(note.x - DOUBLE_LENGTH_NOTE_WIDTH, note.y, NOTE_RADIUS, (1 / 2) * Math.PI, (3 / 2) * Math.PI);
    ctx.fill();
}


const drawScore = (ctx: CanvasRenderingContext2D): void => {
    ctx.font = '30px Arial';
    ctx.fillStyle = '#c6005c'; // Color for filled text
    ctx.textAlign = 'center'; // Horizontal alignment
    ctx.textBaseline = 'middle'; // Vertical alignment
    ctx.fillText(score.toString(), SCREEN_WIDTH / 20 * 19, SCREEN_HEIGHT / 10);
}


const addOnscreenMessage = (ctx: CanvasRenderingContext2D, x: number, y: number, text: string): void => {
    let message: OnscreenMessage = new OnscreenMessage(x, y, text);
    onscreenMessages.push(message);
}


function updateAndRenderOnscreenMessages(currentTime: number, ctx: CanvasRenderingContext2D) {
    // Remove stale onscreen messages
    for (let i: number = onscreenMessages.length - 1; i >= 0; i--) {
        if (currentTime > (onscreenMessages[i].startTime + onscreenMessages[i].duration)) {
            onscreenMessages.splice(i, 1);
        }
    }

    // Render onscreen messages
    for (let i: number = 0; i < onscreenMessages.length; i++) {
        ctx.font = '30px Arial';
        ctx.fillStyle = '#c6005c'; // Color for filled text
        ctx.textAlign = 'left'; // Horizontal alignment
        ctx.textBaseline = 'top'; // Vertical alignment
        ctx.fillText(onscreenMessages[i].text, onscreenMessages[i].x, onscreenMessages[i].y);
    }
}


function updateAndRenderParticleSystems(currentTime: number, msSinceLastFrame: number, ctx: CanvasRenderingContext2D) {
    // Remove stale particle systems
    for (let i: number = particleSystems.length - 1; i >= 0; i--) {
        if (particleSystems[i].isFinished(currentTime)) {
            particleSystems.splice(i, 1);
        }
    }

    for (let i: number = 0; i < particleSystems.length; i++) {
        particleSystems[i].update(msSinceLastFrame);
        particleSystems[i].draw(ctx);
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

    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
}


const updateStartMenuCanvas = () => {
    const canvas: (HTMLCanvasElement) = document.getElementById("myCanvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");

    // Clear canvas
    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // Draw a dot next to the selected item
    ctx.beginPath();
    ctx.arc((SCREEN_WIDTH * 0.075), (SCREEN_HEIGHT * 0.55 + (SCREEN_HEIGHT * 0.1 * startMenuSelectedOption)), NOTE_RADIUS, 0, 2 * Math.PI);
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
        ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

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
                            keysPressed.push(new KeyPressed(lastTimeSpacePressed));
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

                            // TODO: This will have to be more sophisticated when we add keys other than the space bar
                            for (let i = 0; i < keysPressed.length; i++) {
                                if (keysPressed[i].isCurrentlyDown) {
                                    keysPressed[i].isCurrentlyDown = false;
                                    keysPressed[i].releaseTime = lastTimeSpaceReleased;

                                    keysPressed[i].notifyObservers(ctx);
                                }
                            }

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

    notes.push(new Note(0.1, NOTE_SIMPLE, NOTE_POS_TOP, 0)); // test simple note
    notes.push(new Note(0.05, NOTE_DOUBLE_LENGTH, NOTE_POS_SECOND, 1)); // test double-length note

    gameState = STATE_GAME_RUNNING;
    isGameOver = false;
}


function RhythmGame() {
    useEffect(() => {
        init();
    }, []);

    return (
        <div className="content">
            <div className="title">Rhythm Game</div>
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
