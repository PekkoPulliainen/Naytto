import Board from "./board.js";
import Hud from "./hud/hud.js";
import Player from "./player/player.js";

class Game {
  constructor(hudCtx, spriteCtx, boardCtx, collisionCtx) {
    this.hud = new Hud(hudCtx);
    this.spriteCtx = spriteCtx;
    this.board = new Board(boardCtx, collisionCtx);
    this.collisionCtx = collisionCtx;
    this.player = new Player(spriteCtx);

    this.musicPlaying = false;
    this.startMusic = new Audio("./dist/sfx/overworldstart.ogg");
    this.startMusic.volume = 0.1;
    this.music = new Audio("./dist/sfx/overworld.ogg");
    this.music.volume = 0.1;

    this.alive = false;

    document.addEventListener("keydown", (e) => {
      if (e.key.toLowerCase() !== "enter") return; // Only start the game on Enter key press
      if (!this.alive) {
        // Check if the game is not already started
        this.alive = true; // Set alive to true when the game starts
        this.hud.clearStartPage(); // Clear the start page
        this.player.setAlive(true); // Set the player to alive
      }
      if (!this.musicPlaying) {
        // Check if the music is not already playing
        this.startMusic.play(); // Play the start music
        this.musicPlaying = true;
        setTimeout(() => {
          // Delay the start of the main music
          this.music.play();
          this.music.loop = true;
        }, 6410);
      }
    });
  }

  init() {
    this.board.render(); // Render the board
    this.hud.render(); // Render the HUD
    this.hud.renderStartPage(); // Render the start page
    requestAnimationFrame((timestamp) => this.gameLoop(timestamp)); // Start the game loop
  }

  gameLoop(timestamp) {
    this.player.update(timestamp); // Update the player
    this.player.draw(); // Draw the player
    requestAnimationFrame((t) => this.gameLoop(t)); // Request the next animation frame
  }
}

export default Game;
