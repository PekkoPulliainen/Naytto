import Board from "./board.js";
import Hud from "./hud/hud.js";
import Player from "./player/player.js";
import Sword from "./player/sword.js";
import * as constants from "./util/constants.js";
import * as Util from "./util/util.js";
import Monster from "./enemies/monster.js";

class Game {
  constructor(hudCtx, spriteCtx, boardCtx, collisionCtx, worldCtx) {
    this.player = new Player(spriteCtx, collisionCtx);
    this.hud = new Hud(hudCtx, this.player);
    this.spriteCtx = spriteCtx;
    this.board = new Board(boardCtx, collisionCtx);
    this.collisionCtx = collisionCtx;
    this.worldCtx = worldCtx;

    // CREATE 3 MONSTERS FOR TESTING

    // FIRST TWO NUMBERS ARE FOR THE SPRITE SHEET, FOR EXAMPLE 500 AND 400 IS FOR POSITION.
    // NOW CAN CREATE EASILY TO RANDOMIZE THEIR POSITION AND SPRITE SHEET POSITION
    this.safeZone = true;
    this.safePositions = [
      { x: 7, y: 7 },
      { x: 0, y: 0 },
    ];
    this.dungeonPositions = [
      {
        x: 0,
        y: 4056,
        looted: false,
        isShop: false,
        moveX: 160,
        moveY: 360,
        returnX: -160,
        returnY: -368,
        moneyCave: false,
        optionCave: false,
        name: "beginning",
      }, //cave 1
      {
        x: 768,
        y: 4056,
        looted: false,
        isShop: false,
        moveX: 25,
        moveY: 360,
        returnX: -20,
        returnY: -368,
        moneyCave: false,
        optionCave: false,
        name: "master sword cave",
      }, // cave 2
      {
        x: 1536,
        y: 4056,
        looted: false,
        isShop: false,
        moveX: 160,
        moveY: 360,
        returnX: -160,
        returnY: -368,
        moneyCave: false,
        optionCave: true,
        option1: "potion",
        option2: "hpUp",
        name: "health cave1",
      },
      {
        x: 2304,
        y: 4056,
        looted: false,
        isShop: false,
        moveX: 260,
        moveY: 360,
        returnX: -255,
        returnY: -368,
        moneyCave: true,
        optionCave: false,
        rubins: 30,
        name: "money cave1",
      },
    ];
    this.monsters = [];
    this.dungeonIndex = { x: 0, y: 0, looted: false, isShop: false, name: "" };

    this.preDungeonMapPos = { x: 0, y: 0 };
    this.preDungeonPlayerPos = { x: 0, y: 0 };

    this.pickingUp = false;

    this.monster = new Monster(spriteCtx);
    this.spawningMonsters;

    this.dungeonFound = false;
    this.dungeonActive = false;
    this.dungeonAnimated = false;
    this.dungeonCD = 0;
    this.exitDungeon = false;
    this.dungeonSound = new Audio("./dist/sfx/enter-dungeon.wav");
    this.dungeonSound.volume = 0.1;

    this.blackScreen = false;
    this.blackScreenTimerRunning = false;

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

    this.collectSound = new Audio("./dist/sfx/collect.wav");
    this.collectSound.volume = 0.1;

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
      if (this.player.hpCount === 0 && e.key.toLocaleLowerCase() === "enter") {
        this.monsters = [];
        this.player.resetPlayer();
        this.board.pos = { x: 5376, y: 3528 };
        this.board.render();
        this.hud.render();
        this.hud.clearStartPage();
        this.hud.death = false;
        this.startMusic.play();
        setTimeout(() => {
          this.music.play();
          this.music.loop = true;
        }, 6410);
      }
    });
  }

  init() {
    this.board.render(); // Render the board
    this.hud.render(); // Render the HUD
    this.player.render();
    this.hud.renderStartPage(); // Render the start page
    requestAnimationFrame((timestamp) => this.gameLoop(timestamp)); // Start the game loop
  }

  gameLoop(timestamp, currentTime) {
    const delta = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    const cappedDelta = Math.min(delta, 0.066);

    this.clear();
    this.step(this.collisionCtx);
    this.draw();

    this.player.move(null, null, null);
    this.player.update(timestamp);
    this.player.drawImage();
    this.hud.render(); // RENDER HUD
    this.board.render();

    if (this.player.pickingUp) this.player.animatePickingUp();
    if (this.dungeonCD > 0) this.dungeonCooldown();
    if (this.animatingDungeon === true) this.dungeonAnimate();

    // FOR MONSTERS
    this.monsters.forEach((monster) => {
      monster.hitMonster(true); // Check if the monster is hit
      monster.hitMonster(false);
      monster.update();
      monster.hitPlayer();
      monster.drawImage(); // DRAW MONSTER
      monster.drawRock();
      monster.blockShoot();
      monster.monsterMovement();
      monster.shootRocksCheckXY();
      monster.updateAnimation();
    });

    if (this.player.sword.launching) {
      this.player.drawBeam();
    }

    if (this.blackScreen) {
      this.spriteCtx.fillStyle = "black";
      this.spriteCtx.fillRect(
        0,
        0,
        this.spriteCtx.canvas.width,
        this.spriteCtx.canvas.height
      );

      if (!this.blackScreenTimerRunning) {
        this.blackScreenTimerRunning = true;
        setTimeout(() => {
          this.blackScreen = false;
          this.blackScreenTimerRunning = false;
          this.player.moving = false;
        }, 300);
      }
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
    if (!this.animatingDungeon && !this.dungeonActive) {
      this.player.dungeonAnimated = false;
      this.dungeonAnimated = false;
    }
    this.processInput(collisionCtx);
    this.stepUnits(collisionCtx);
    this.player.step();
  }

  stepUnits(collisionCtx) {
    if (this.player.frames.knockback) this.knockBackPlayer(collisionCtx);
    this.monsters.forEach((monster) => {
      if (monster.frames.knockback)
        this.knockBackMonster(collisionCtx, monster);
    });
  }

  draw() {
    if (this.player.hpCount === 0) {
      this.hud.renderDeathPage();
      this.music.pause();
      this.music.currentTime = 0;
      this.monsters = [];
    }
    //this.drawEnemies();
    //this.drawAttacks();
    this.player.render();
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
    let faceDirection = this.player.pos.direction2;
    let x = this.player.pos.x;
    let y = this.player.pos.y;

    if (
      faceDirection === 96 &&
      y < 634 &&
      !this.impassableTerrain("down", ctx)
    ) {
      this.player.move(0, 12, "down");
    } else if (
      faceDirection === 144 &&
      x > 14 &&
      !this.impassableTerrain("left", ctx)
    ) {
      this.player.move(-12, 0, "left");
    } else if (
      faceDirection === 0 &&
      y > 188 &&
      !this.impassableTerrain("up", ctx)
    ) {
      this.player.move(0, -12, "up");
    } else if (
      faceDirection === 48 &&
      x < 706 &&
      !this.impassableTerrain("right", ctx)
    ) {
      this.player.move(12, 0, "right");
    }
  }

  knockBackMonster(ctx, monster) {
    let hitDirection = monster.pos.damageDirection;
    let faceDirection = monster.pos.direction2;
    let x = monster.pos.x;
    let y = monster.pos.y;

    if (
      hitDirection === "s" &&
      !this.impassableTerrainMonster("down", ctx, monster)
    ) {
      monster.move(0, 12, "down");
    } else if (
      hitDirection === "a" &&
      !this.impassableTerrainMonster("left", ctx, monster)
    ) {
      monster.move(-12, 0, "left");
    } else if (
      hitDirection === "w" &&
      !this.impassableTerrainMonster("up", ctx, monster)
    ) {
      monster.move(0, -12, "up");
    } else if (
      hitDirection === "d" &&
      !this.impassableTerrainMonster("right", ctx, monster)
    ) {
      monster.move(12, 0, "right");
    }
  }

  /* enterDungeon(collisionCtx) {
    console.log("ENTERING DUNGEON");
    this.board.changeMap(); // Switch to the cave map and clear the collision map
    this.board.drawCaveCollisionMap(collisionCtx);
    this.scanGrid(collisionCtx);
  } */

  scroll(collisionCtx) {
    if (
      this.dungeonAnimated &&
      !this.dungeonActive &&
      this.dungeonCD === 0 &&
      this.dungeonFound
    ) {
      this.preDungeonMapPos.x = this.board.pos.x;
      this.preDungeonMapPos.y = this.board.pos.y;
      this.preDungeonPlayerPos.x = this.player.pos.x;
      this.preDungeonPlayerPos.y = this.player.pos.y;
      console.log(
        `pre dungeon map: x=${this.preDungeonMapPos.x}, y=${this.preDungeonMapPos.y}`
      );
      console.log(
        `pre dungeon player: x=${this.preDungeonPlayerPos.x}, y=${this.preDungeonPlayerPos.y}`
      );
      if (
        this.preDungeonMapPos.x === 5376 &&
        this.preDungeonMapPos.y === 3528
        //this.preDungeonMapPos.y === 0
      ) {
        this.dungeonIndex = this.dungeonPositions[0];
      } else if (
        this.preDungeonMapPos.x === 4608 &&
        this.preDungeonMapPos.y === 3000
      ) {
        this.dungeonIndex = this.dungeonPositions[1];
      } else if (
        this.preDungeonMapPos.x === 3072 &&
        this.preDungeonMapPos.y === 1944
      ) {
        this.dungeonIndex = this.dungeonPositions[2];
      } else if (
        this.preDungeonMapPos.x === 3840 &&
        this.preDungeonMapPos.y === 3528
      )
        this.dungeonIndex = this.dungeonPositions[3];
      else this.dungeonIndex = this.dungeonPositions[0];
      if (this.dungeonIndex.looted) this.board.itemsAvailable = false;
      this.board.pos.x = this.dungeonIndex.x;
      this.board.pos.y = this.dungeonIndex.y;
      this.board.drawWorld();
      this.board.drawCollisionMap(collisionCtx);
      this.player.move(this.dungeonIndex.moveX, this.dungeonIndex.moveY, "up");
      this.scanGrid(collisionCtx);
      this.dungeonFound = false;
      this.dungeonActive = true;
      this.dungeonAnimated = false;
      this.player.dungeonAnimated = false;
      this.dungeonCD = 40;
      this.monsters = [];
    }
    if (this.dungeonFound && this.dungeonActive) {
      if (
        this.preDungeonMapPos.x === 5376 &&
        this.preDungeonMapPos.y === 3528 &&
        this.pickingUp
      )
        this.dungeonPositions[0].looted = true;
      else if (
        this.preDungeonMapPos.x === 4608 &&
        this.preDungeonMapPos.y === 3000 &&
        this.pickingUp
      ) {
        this.dungeonPositions[0].looted = true;
        this.dungeonPositions[1].looted = true;
      }
      this.pickingUp = false;
      this.board.pos.x = this.preDungeonMapPos.x;
      this.board.pos.y = this.preDungeonMapPos.y;
      this.board.drawWorld();
      this.board.drawCollisionMap(collisionCtx);
      this.player.move(
        this.dungeonIndex.returnX,
        this.dungeonIndex.returnY,
        "down"
      );
      this.scanGrid(collisionCtx);
      this.dungeonFound = false;
      this.dungeonActive = false;
      this.blackScreen = true;
      this.board.itemsAvailable = true;
      this.dungeonCD = 200;
      if (!this.safeZone) this.spawnMonsters();
    }
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
    this.monsters = Monster.spawnMonsters({
      spriteCtx: this.spriteCtx,
      collisionCtx: this.collisionCtx,
      sword: this.player.sword,
      player: this.player,
      minX: 200,
      maxX: 500,
      minY: 200,
      maxY: 500,
      minMonsters: 2,
      maxMonsters: 5,
    });
    this.spawningMonsters = true;
    console.log("New monsters spawned:", this.monsters);
    console.log(this.player.pos.x, this.player.pos.y);
  }

  dungeonCooldown() {
    if (this.dungeonCooldownInterval)
      clearInterval(this.dungeonCooldownInterval);
    this.dungeonCD--;

    this.dungeonCooldownInterval = setInterval(() => {
      if (this.dungeonCD === 0) {
        clearInterval(this.dungeonCooldownInterval);
        return;
      }
    }, 15);
  }

  dungeonAnimate() {
    if (this.player.dungeonAnimated) {
      this.animatingDungeon = false;
      this.dungeonAnimated = true;
      if (this.player.playerFrameX !== 0) {
        this.blackScreen = true;
      }
      if (this.exitDungeon === true) {
        this.exitDungeon = false;
        this.board.itemsAvailable = true;
      }
      return;
    }
    if (this.dungeonActive === false && !this.exitDungeon) {
      this.player.enterDungeon();
      this.dungeonSound.play();
    } else {
      setTimeout(() => {
        if (this.exitDungeon) this.dungeonSound.play();
      }, 350);
      this.player.exitDungeon();
    }
    if (this.exitDungeon) {
      this.monsters = [];
    }
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

  checkIfBarrier(pixel1, pixel2) {
    if (this.animatingDungeon) return;
    let pixel1value = Util.sumArr(pixel1);
    let pixel2value = Util.sumArr(pixel2);
    if (pixel1value === constants.WALL || pixel1value === constants.WATER) {
      return true;
    }
    if (pixel2value === constants.WALL || pixel2value === constants.WATER) {
      return true;
    }
    if (
      pixel1value === constants.DUNGEON ||
      pixel2value === constants.DUNGEON
    ) {
      if (this.dungeonCD === 0 && !this.dungeonActive) {
        this.animatingDungeon = true;
        this.dungeonFound = true;
      } else if (this.dungeonCD === 0 && this.dungeonActive) {
        this.exitDungeon = true;
        this.animatingDungeon = true;
        this.dungeonFound = true;
      }
    }
    if (pixel1value === constants.PICKUP || pixel2value === constants.PICKUP) {
      if (this.dungeonIndex.moneyCave) {
        this.player.rubinCount += this.dungeonIndex.rubins;
        this.collectSound.play();
        this.dungeonIndex.looted = true;
        this.board.itemsAvailable = false;
        this.board.render();
        return;
      }
      if (this.dungeonIndex.optionCave) {
        this.player.pickUp(this.dungeonIndex.name, this.dungeonIndex.option1);
        this.pickingUp = true;
        this.board.itemsAvailable = false;
        this.board.render();
        this.dungeonIndex.looted = true;
        console.log("picked up " + this.dungeonIndex.option1);
        return;
      }
      this.player.pickUp(this.dungeonIndex.name);
      this.pickingUp = true;
      this.board.itemsAvailable = false;
      this.board.render(); // Redraw to show the black rectangle
      console.log("picking up");
    }
    if (
      pixel1value === constants.PICKUP2 ||
      pixel2value === constants.PICKUP2
    ) {
      this.player.pickUp(this.dungeonIndex.name, this.dungeonIndex.option2);
      this.pickingUp = true;
      this.board.itemsAvailable = false;
      this.board.render();
      this.dungeonIndex.looted = true;
      console.log("picked up " + this.dungeonIndex.option2);
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
        this.player.traceBox.bottomLeft[1]
      );
      return this.checkIfBarrier(topPixel, bottomPixel);
    }
  }

  impassableTerrainMonster(direction, ctx, monster) {
    const { x, y, width, height } = monster.pos;
    let checkPoints = [];
    if (direction === "up") {
      checkPoints = [
        [x + 3, y - 3],
        [x + width - 3, y - 3],
      ];
    } else if (direction === "down") {
      checkPoints = [
        [x + 3, y + height + 3],
        [x + width - 3, y + height + 3],
      ];
    } else if (direction === "left") {
      checkPoints = [
        [x - 3, y + 3],
        [x - 3, y + height - 3],
      ];
    } else if (direction === "right") {
      checkPoints = [
        [x + width + 3, y + 3],
        [x + width + 3, y + height - 3],
      ];
    }
    const [p1, p2] = checkPoints;
    const pixel1 = Util.getMapPixel(ctx, p1[0], p1[1]);
    const pixel2 = Util.getMapPixel(ctx, p2[0], p2[1]);
    return this.checkIfBarrier(pixel1, pixel2);
  }

  processInput(ctx) {
    //if (this.player.hpCount === 0) return;
    if (this.scrolling) return;
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
