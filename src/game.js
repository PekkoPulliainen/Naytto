import Board from "./board.js";
import Player from "./player.js";

class Game {
  constructor(hudCtx, spriteCtx, boardCtx, collisionCtx) {
    //this.hud = new Hud(hudCtx); // Context for the HUD (Heads-Up Display)
    this.spriteCtx = spriteCtx; // Context for the player and enemy sprites
    this.board = new Board(boardCtx, collisionCtx); // Create a new Board instance
    this.collisionCtx = collisionCtx; // Context for the collision map
    this.player = new Player(spriteCtx);

    this.startmusic = new Audio("./dist/sfx/overworldstart.ogg");
    this.startmusic.volume = 0.1;
    this.music = new Audio("./dist/sfx/overworld.ogg");
    this.music.volume = 0.1;

    document.addEventListener("keydown", (e) => {
      this.startmusic.play(); // Play the start music
      setTimeout(() => {
        this.music.play();
        this.music.loop = true; // Loop the music
      }, 6410); // Delay the start music for 6.41 seconds
    });
  }

  init() {
    this.board.render(); // Render the board
    requestAnimationFrame(() => this.gameLoop()); // Start the game loop
  }

  gameLoop() {
    //this.clear(); // Clear the canvas
    //this.step(this.collisionCtx); // Update the game state
    //this.draw(); // Draw the game state
    this.player.update();
    this.player.draw();
    requestAnimationFrame(() => this.gameLoop()); // Request the next frame
  }

  //clear() {}

  //step(collisionCtx) {}

  //draw() {}
}

export default Game; // Export the Game class for use in other modules

