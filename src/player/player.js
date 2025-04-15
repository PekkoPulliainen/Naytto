import { Sword } from "./sword.js";

class Player {
  constructor(ctx) {
    this.ctx = ctx;
    this.sprite = new Image();
    this.sprite.src = "./dist/images/player/link.png";

    this.beamSprite = new Image();
    this.beamSprite.src = "./dist/images/player/beams.png";

    this.frameWidth = 48;
    this.frameHeight = 48;

    this.x = 400;
    this.y = 400;
    this.speed = 3;

    this.frameX = 0;
    this.playerFrameX = 0;
    this.direction = 0;

    this.lastToggle = 0;
    this.facing = "s"; // START FACING DOWN
    this.attacking = false; // ATTACKING STATE
    this.attackFrameTimer = 0; // ATTACK FRAME TIMER

    this.keys = {}; // KEY STATE
    this.canAttack = true; // ALLOW ATTACKS
    this.spacePressed = false; // SPACE KEY PRESSED

    this.hpCount = 6; // PLAYER HEALTH

    this.sword = new Sword(ctx);

    window.addEventListener("keydown", (e) => this.handleKeyDown(e)); // KEYDOWN EVENT
    window.addEventListener("keyup", (e) => this.handleKeyUp(e)); // KEYUP EVENT
  }

  // HP FUNKTIO

  hP(i, number = 1) {
    switch (i) {
      case "damage":
        this.hpCount = Math.max(0, this.hpCount - number);
        break;
      case "heal":
        this.hpCount = Math.min(6, this.hpCount + number);
        break;
      case "set":
        this.hpCount = Math.max(0, Math.min(6, number));
        break;
      case "fullhp":
        return this.hpCount === 6;
    }
  }

  setAlive(alive) {
    this.alive = alive; // SET ALIVE STATE
  }

  handleKeyDown(e) {
    if (!this.alive) return; // DO NOT UPDATE IF DEAD

    // NO SCROLL
    if (e.key === " " || e.code === "Space") {
      e.preventDefault();
    }

    // SO SPACE HOLD ATTACK ISNT POSSIBLE
    if (e.key.toLowerCase() === " " && !this.spacePressed && this.canAttack) {
      this.keys[e.key.toLowerCase()] = true;
      this.spacePressed = true;

      this.sword.startAttack(this.facing);
      console.log("normal");

      if (this.hP("fullhp") && this.sword.beamReady === true) {
        this.sword.beamReady = false;
        setTimeout(() => {
          this.sword.launch(this.facing, this.x, this.y); // SWORD SHOOT
        }, 200);
        console.log("shoot");
        // FOR TESTING BOTH ATTACK METHODS
        //this.hpCount -=1;
      }

      this.attacking = true;
      this.direction = 2; // FOR ATTACK ANIMATIONS CORRECT DIRECTION
      this.attackFrameTimer = performance.now();
      this.canAttack = false;
    } else {
      this.keys[e.key.toLowerCase()] = true;
    }
  }

  handleKeyUp(e) {
    if (e.key.toLowerCase() === " ") {
      this.spacePressed = false;
    }
    this.keys[e.key.toLowerCase()] = false;
  }

  update(timestamp) {
    if (!this.alive) return;
    let moving = false;

    // MOVING
    if (!this.attacking) {
      if (this.keys["w"] || this.keys["arrowup"]) {
        this.y -= this.speed;
        this.playerFrameX = 2;
        this.facing = "w";
        moving = true;
      } else if (this.keys["s"] || this.keys["arrowdown"]) {
        this.facing = "s";
        this.playerFrameX = 0;
        this.y += this.speed;
        moving = true;
      } else if (this.keys["a"] || this.keys["arrowleft"]) {
        this.x -= this.speed;
        this.playerFrameX = 1;
        this.facing = "a";
        moving = true;
      } else if (this.keys["d"] || this.keys["arrowright"]) {
        this.x += this.speed;
        this.playerFrameX = 3;
        this.facing = "d";
        moving = true;
      }
    }

    // ANIMATION DIRECTION TOGGLE
    if (moving && timestamp - this.lastToggle > 150) {
      this.direction = this.direction === 0 ? 1 : 0;
      this.lastToggle = timestamp;
    }

    // ATTACK DURATION
    if (this.attacking && timestamp - this.attackFrameTimer >= 300) {
      this.attacking = false;
      this.canAttack = true;
      console.log("Attack finished");
    }

    // Update sword state
    this.sword.update(timestamp, this.attacking);

    if (!moving && !this.attacking) {
      this.direction = 0;
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    this.sword.draw(this.x, this.y, this.frameWidth, this.frameHeight);

    this.ctx.drawImage(
      this.sprite,
      this.playerFrameX * this.frameWidth,
      this.direction * this.frameHeight,
      this.frameWidth,
      this.frameHeight,
      this.x,
      this.y,
      this.frameWidth,
      this.frameHeight
    );

    if (this.sword.explosion) {
      this.sword.beamExplosion(this.sword.flyX, this.sword.flyY);
    }
  }

  drawBeam() {
    this.sword.drawBeam(this.x, this.y, this.frameWidth, this.frameHeight);
  }
}

export default Player;
