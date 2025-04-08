import Game from "./src/game.js"; // Import the Game class from the game.js file.

const menuCanvas = document.getElementById("menu-canvas"); // This is the canvas for the HUD when the game starts.
const hudCtx = menuCanvas.getContext("2d");
menuCanvas.width = 768;
menuCanvas.height = 696;

const spriteCanvas = document.getElementById("sprite-canvas"); // This is the canvas for the player and enemy sprites.
const spriteCtx = spriteCanvas.getContext("2d");
spriteCanvas.width = 768;
spriteCanvas.height = 696;

const mapCanvas = document.getElementById("map-canvas"); // This is the canvas for the map and collision detection.
const boardCtx = mapCanvas.getContext("2d");
mapCanvas.width = 768;
mapCanvas.height = 696;

const collisionCanvas = document.getElementById("collision-canvas"); // This is the canvas for the collision detection.
const collisionCtx = collisionCanvas.getContext("2d");
collisionCanvas.width = 768;
collisionCanvas.height = 696;

const game = new Game(hudCtx, spriteCtx, boardCtx, collisionCtx); // Create a new Game instance with the specified canvas contexts.

window.addEventListener(
  "load",
  () => {
    game.init();
  },
  false
); // Add an event listener to the window that initializes the game when the page loads.
