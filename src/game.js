import Board from "./board.js";
import Hud from "./hud/hud.js";
import Player from "./player/player.js";
import Sword from "./player/sword.js";
import * as constants from "./util/constants.js";
import * as Util from "./util/util.js";
import Monster from "./enemies/monster.js";

class Game {
  constructor(hudCtx, spriteCtx, boardCtx, collisionCtx) {
    this.player = new Player(spriteCtx, collisionCtx);
    this.hud = new Hud(hudCtx, this.player);
    this.spriteCtx = spriteCtx;
    this.board = new Board(boardCtx, collisionCtx);
    this.collisionCtx = collisionCtx;

    // CREATE 3 MONSTERS FOR TESTING

    // FIRST TWO NUMBERS ARE FOR THE SPRITE SHEET, FOR EXAMPLE 500 AND 400 IS FOR POSITION.
    // NOW CAN CREATE EASILY TO RANDOMIZE THEIR POSITION AND SPRITE SHEET POSITION
    this.safeZone = true;
    this.safePositions = [
      { x: 7, y: 7 },
      { x: 0, y: 0 },
    ];

    this.monsters = [];

    this.monster = new Monster(spriteCtx);

    this.scrolling = false;
    this.scrollQueue = 0;

    this.lastTime = performance.now();

    this.units = [];
    this.grid = null;
    this.openSpaces = null;
    this.enemyCount = 0;

    this.musicPlaying = false;
    this.musicMuted = false; // MUTE

    this.startMusic = new Audio("./dist/sfx/overworldstart.ogg");
    this.startMusic.volume = 0.1;

    this.music = new Audio("./dist/sfx/overworld.ogg");
    this.music.volume = 0.1;

    this.alive = false;

    // Start the game with ENTER key
    document.addEventListener("keydown", (e) => {
      if (e.key.toLowerCase() === "enter") {
        // Only start the game on Enter key press
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
            this.music.muted = this.musicMuted;
          }, 6410);
        }
      }

      // TOGGLE MUSIC
      if (e.key.toLowerCase() === "m") {
        this.musicMuted = !this.musicMuted;
        this.music.muted = this.musicMuted;
        this.startMusic.muted = this.musicMuted;
        console.log(`Music ${this.musicMuted ? "muted" : "unmuted"}`);
      }
    });
  }

  init() {
    this.board.render(); // Render the board
    this.hud.render(); // Render the HUD
    //this.player.render();
    this.hud.renderStartPage(); // Render the start page
    requestAnimationFrame((timestamp) => this.gameLoop(timestamp)); // Start the game loop
  }

  gameLoop(timestamp, currentTime) {
    const delta = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    const cappedDelta = Math.min(delta, 0.066);

    this.clear();
    this.step(this.collisionCtx);

    this.player.move(null, null, null);
    this.player.update(timestamp);
    this.player.drawImage();
    this.hud.render(); // RENDER HUD

    // FOR MONSTERS
    this.monsters.forEach((monster) => {
      monster.killmonster(true); // Check if the monster is hit
      monster.killmonster(false);
      monster.hitPlayer();
      monster.drawImage(); // DRAW MONSTER
      monster.monsterMovement();
      monster.shootRocksCheckXY();
    });

    if (this.player.sword.launching) {
      this.player.drawBeam();
    }

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  clear() {
    //this.clearUnits();
    //this.clearAttacks();
    this.player.clear();
  }

  step(collisionCtx) {
    this.checkBorder();
    this.scroll(collisionCtx);
    this.processInput(collisionCtx);
    //this.stepUnits(collisionCtx)
    this.player.step();
  }

  draw() {
    if (this.player.hpCount <= 0) {
      //this.hud.renderDeathPage();
      this.music.pause();
      this.music.currentTime = 0;
    }
    //this.drawEnemies();
    //this.drawAttacks();
    //this.player.render();
  }

  scanGrid(ctx) {
    let newGrid = [];
    let openSpaces = [];
    for (let y = 168; y < 696; y += 48) {
      let row = [];
      for (let x = 0; x < 768; x += 48) {
        let value = Util.scanMapTile(ctx, x, y);
        row.push(value);
        if (value === 1020) openSpaces.push([x, y]);
      }
      newGrid.push(row);
    }
    this.openSpaces = openSpaces;
    this.grid = newGrid;
  }

  knockBackPlayer(ctx) {
    let faceDirection = this.player.pos.direction;
    let x = this.player.pos.x;
    let y = this.player.pos.y;

    if (
      faceDirection === 96 &&
      y < 634 &&
      !this.impassableTerrain("down", ctx)
    ) {
      this.player.move(0, 12);
    } else if (
      faceDirection === 144 &&
      x > 14 &&
      !this.impassableTerrain("left", ctx)
    ) {
      this.player.move(-12, 0);
    } else if (
      faceDirection === 0 &&
      y > 188 &&
      !this.impassableTerrain("up", ctx)
    ) {
      this.player.move(0, -12);
    } else if (
      faceDirection === 48 &&
      x < 706 &&
      !this.impassableTerrain("right", ctx)
    ) {
      this.player.move(12, 0);
    }
  }

  scroll(collisionCtx) {
    if (!this.scrolling) return;
    if (this.scrollQueue <= 0) {
      this.hud.updateMapPos(this.board.getMapPos());
      this.safeZoneCheck(this.board.getMapPos());
      this.scrolling = false;
      this.board.drawCollisionMap(collisionCtx);
      this.scanGrid(collisionCtx);
      //this.setEnemySpawns();
    } else {
      let playerDirection = this.player.pos.direction2;
      if (playerDirection === 96) {
        this.board.pos.y -= 8;
        if (this.scrollQueue > 48) this.player.move(0, 8, "up");
      }
      if (playerDirection === 144) {
        this.board.pos.x += 8;
        if (this.scrollQueue > 48) this.player.move(-8, 0, "right");
      }
      if (playerDirection === 0) {
        this.board.pos.y += 8;
        if (this.scrollQueue > 48) this.player.move(0, -8, "down");
      }
      if (playerDirection === 48) {
        this.board.pos.x -= 8;
        if (this.scrollQueue > 48) this.player.move(8, 0, "left");
      }
      this.scrollQueue -= 8;
      this.board.drawWorld();
    }
  }

  safeZoneCheck(mapPos) {
    const isSafe = this.safePositions.some(
      (pos) => mapPos.x === pos.x && mapPos.y === pos.y
    );
    if (isSafe) {
      this.safeZone = true;
      return;
    } else {
      this.safeZone = false;
      this.monsters = [];
      // SPAWN MONSTERS
      this.spawnMonsters();
    }
  }

  spawnMonsters() {
    // Clear existing monsters
    this.monsters = [];

    // RANGES FOR MONSTERS
    const minX = 200;
    const maxX = 500;
    const minY = 200;
    const maxY = 500;

    const minMonsters = 2;
    const maxMonsters = 5;

    // NUMBER OF MONSTERS TO SPAWN
    const numberOfMonsters =
      Math.floor(Math.random() * (maxMonsters - minMonsters + 1)) + minMonsters;

    // CREATE MONSTERS AT RANDOM POSITIONS
    for (let i = 0; i < numberOfMonsters; i++) {
      // Generate random positions within the defined range
      const randomX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
      const randomY = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

      // RANDOMIZE SPRITE SHEET POSITION
      const spriteX = Math.floor(Math.random() * 3);
      const spriteY = Math.floor(Math.random() * 3);

      // Add the new monster to the monsters array
      this.monsters.push(
        new Monster(
          this.spriteCtx,
          this.player.sword,
          this.player,
          spriteX,
          spriteY,
          randomX,
          randomY
        )
      );
    }
    console.log("New monsters spawned:", this.monsters);
    console.log(this.player.pos.x, this.player.pos.y);
  }

  checkBorder() {
    // function detects when the player crosses the screen boundaries and prepares the game for a screen transition
    if (
      this.player.pos.y < constants.BORDERTOP ||
      this.player.pos.y > constants.BORDERBOTTOM
    ) {
      this.scrolling = true;
      this.scrollQueue = 528;
      this.monsters = [];
    }
    if (
      this.player.pos.x > constants.BORDERRIGHT ||
      this.player.pos.x < constants.BORDERLEFT
    ) {
      this.scrolling = true;
      this.scrollQueue = 768;
      this.monsters = [];
    }
  }

  enterDungeon() {
    console.log("ENTERING DUNGEON");
    this.board.changeMap(); // Switch to the cave map and clear the collision map
}

  checkIfBarrier(pixel1, pixel2) {
    let pixel1value = Util.sumArr(pixel1);
    let pixel2value = Util.sumArr(pixel2);
    if (pixel1value === constants.WALL || pixel1value === constants.WATER) {
      return true;
    }
    if (pixel2value === constants.WALL || pixel2value === constants.WATER) {
      return true;
    }
    if (pixel1value === constants.DUNGEON || pixel2value === constants.DUNGEON) {
      console.log("DUNGEON");
      this.enterDungeon();
    }
    return false;
  }

  impassableTerrain(direction, ctx) {
    if (direction === "up") {
      const topPixel = Util.getMapPixel(
        ctx,
        this.player.traceBox.topLeft[0],
        this.player.traceBox.topLeft[1] - 3
      );
      const bottomPixel = Util.getMapPixel(
        ctx,
        this.player.traceBox.topRight[0],
        this.player.traceBox.topRight[1] - 3
      );
      return this.checkIfBarrier(topPixel, bottomPixel);
    } else if (direction === "right") {
      const topPixel = Util.getMapPixel(
        ctx,
        this.player.traceBox.topRight[0] + 3,
        this.player.traceBox.topRight[1]
      );
      const bottomPixel = Util.getMapPixel(
        ctx,
        this.player.traceBox.bottomRight[0] + 3,
        this.player.traceBox.bottomRight[1]
      );
      return this.checkIfBarrier(topPixel, bottomPixel);
    } else if (direction === "down") {
      const topPixel = Util.getMapPixel(
        ctx,
        this.player.traceBox.bottomLeft[0],
        this.player.traceBox.bottomLeft[1] + 3
      );
      const bottomPixel = Util.getMapPixel(
        ctx,
        this.player.traceBox.bottomRight[0],
        this.player.traceBox.bottomRight[1] + 3
      );
      return this.checkIfBarrier(topPixel, bottomPixel);
    } else if (direction === "left") {
      const topPixel = Util.getMapPixel(
        ctx,
        this.player.traceBox.topLeft[0] - 3,
        this.player.traceBox.topRight[1]
      );
      const bottomPixel = Util.getMapPixel(
        ctx,
        this.player.traceBox.bottomLeft[0] - 3,
        this.player.traceBox.bottomLeft[1] // it's like I have to have 1 thing for finding the player location then their hitbox and then follow both when I move so the game knows exactly where I am and can constantly draw the map again depending on my location. Look I'll show you.
      );
      return this.checkIfBarrier(topPixel, bottomPixel);
    }
  }

  processInput(ctx) {
    if (this.scrolling) return;
    if (!this.alive) return;
    let direction = this.player.getInput();
    let speed = null;
    switch (direction) {
      case "up":
        speed = this.impassableTerrain(direction, ctx) ? 0 : -4;
        this.player.move(0, speed, direction);
        break;
      case "right":
        speed = this.impassableTerrain(direction, ctx) ? 0 : 4;
        this.player.move(speed, 0, direction);
        break;
      case "down":
        speed = this.impassableTerrain(direction, ctx) ? 0 : 4;
        this.player.move(0, speed, direction);
        break;
      case "left":
        speed = this.impassableTerrain(direction, ctx) ? 0 : -4;
        this.player.move(speed, 0, direction);
        break;
    }
  }
}

export default Game;
