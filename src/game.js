import Board from "./board.js";
import Player from "./player.js";

class Game {
  constructor(hudCtx, spriteCtx, boardCtx, collisionCtx) {
    this.spriteCtx = spriteCtx;
    this.board = new Board(boardCtx, collisionCtx);
    this.collisionCtx = collisionCtx;
    this.player = new Player(spriteCtx);

    this.startmusic = new Audio("./dist/sfx/overworldstart.ogg");
    this.startmusic.volume = 0.1;
    this.music = new Audio("./dist/sfx/overworld.ogg");
    this.music.volume = 0.1;

    document.addEventListener("keydown", () => {
      this.startmusic.play();
      setTimeout(() => {
        this.music.play();
        this.music.loop = true;
      }, 6410);
    });
  }

  init() {
    this.board.render();
    requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
  }

  gameLoop(timestamp) {
    this.player.update(timestamp);
    this.player.draw();
    requestAnimationFrame((t) => this.gameLoop(t));
  }
}

export default Game;


