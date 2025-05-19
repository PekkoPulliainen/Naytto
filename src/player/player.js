import { Sword } from "./sword.js";
import Game from "../game.js";

class Player {
  constructor(ctx, collisionCtx) {
    this.ctx = ctx;
    this.collisionCtx = collisionCtx;
    this.sprite = new Image();
    this.sprite.src = "./dist/images/player/link.png";

    this.beamSprite = new Image();
    this.beamSprite.src = "./dist/images/player/beams.png";

    this.secondaryItems = new Image();
    this.secondaryItems.src = "./dist/images/items/secondaryItems.png"; // Secondary items image

    this.heartContainer = new Image();
    this.heartContainer.src = "./dist/images/items/heartContainer.png";

    this.hurtSound = new Audio();
    this.hurtSound.src = "./dist/sfx/link-hurt.wav";

    this.receiveSound = new Audio();
    this.receiveSound.src = "./dist/sfx/item-received.wav";
    this.receiveSound.volume = 0.1;

    this.pos = {
      x: 336,
      y: 432,
      width: 48,
      height: 48,
      direction: 0,
      direction2: 0,
    };

    this.hitBox = {
      x: this.pos.x + 12,
      y: this.pos.y + 12,
      width: 24,
      height: 24,
    };

    this.traceBox = {
      topLeft: [this.pos.x + 9, this.pos.y + 24],
      topRight: [this.pos.x + 39, this.pos.y + 24],
      bottomLeft: [this.pos.x + 9, this.pos.y + 45],
      bottomRight: [this.pos.x + 39, this.pos.y + 45],
    };

    this.frames = {
      run: 0,
      attack: 0,
      cooldown: 0,
      invincibility: 0,
      knockback: 0,
    };

    this.moving = false;
    this.canMove = true;

    this.pickingUp = false;

    this.enteringDungeon = false;
    this.exitingDungeon = false;
    this.dungeonAnimated = false;
    this.dungeonFadeProgress = 0;

    this.frameX = 0;
    this.playerFrameX = 0;

    this.lastToggle = 0;
    this.facing = "s"; // START FACING DOWN
    this.attacking = false; // ATTACKING STATE
    this.attackFrameTimer = 0; // ATTACK FRAME TIMER

    this.keys = {}; // KEY STATE
    this.canAttack = false; // ALLOW ATTACKS
    this.spacePressed = false; // SPACE KEY PRESSED

    this.maxHPCount = 3; // MAX HP
    this.hpCount = 3; // PLAYER HEALTH
    this.maxHPUp = false;
    this.godMode = false;

    this.rubinCount = 0;

    this.hasSword = false;
    this.swordIndex = 0;
    this.pickingUpSword = false;

    this.sword = new Sword(ctx, collisionCtx);

    window.addEventListener("keydown", (e) => this.handleKeyDown(e)); // KEYDOWN EVENT
    window.addEventListener("keyup", (e) => this.handleKeyUp(e)); // KEYUP EVENT
  }

  // HP FUNKTIO

  hP(i, number = 1) {
    if (this.godMode) return;
    if (i === "damage") {
      if (this.frames.invincibility > 0) return; // Ignore damage if invincibility is active

      this.hpCount = Math.max(0, this.hpCount - number); // Reduce health
      this.hurtSound.play(); // Play hurt sound
      this.frames.invincibility = 90; // invincibility cooldown

      console.log("Player took damage! Current HP:", this.hpCount);
      if (this.hpCount === 0) {
        console.log("Player died...");
        this.setAlive(false);
      }
    } else if (i === "heal") {
      this.hpCount = Math.min(6, this.hpCount + number); // Heal health
    } else if (i === "set") {
      this.hpCount = Math.max(0, Math.min(6, number)); // Set health
    } else if (i === "fullhp") {
      return this.hpCount === this.maxHPCount; // Check if health is full
    }
  }

  clear() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  step() {
    if (this.frames.knockback) this.frames.knockback--;
    if (this.frames.invincibility) this.frames.invincibility--; // TIMER
  }

  setDirection(direction) {
    switch (direction) {
      case "up":
        this.pos.direction2 = 96;
        break;
      case "right":
        this.pos.direction2 = 144;
        break;
      case "down":
        this.pos.direction2 = 0;
        break;
      case "left":
        this.pos.direction2 = 48;
        break;
    }
  }

  setAlive(alive) {
    this.alive = alive; // SET ALIVE STATE
  }

  resetPlayer() {
    this.hpCount = this.maxHPCount;
    this.pos = { x: 336, y: 432, width: 48, height: 48, direction: 0 };
    this.traceBox = {
      topLeft: [this.pos.x + 9, this.pos.y + 24],
      topRight: [this.pos.x + 39, this.pos.y + 24],
      bottomLeft: [this.pos.x + 9, this.pos.y + 45],
      bottomRight: [this.pos.x + 39, this.pos.y + 45],
    };
    this.alive = true;
  }

  handleKeyDown(e) {
    if (!this.alive) return; // DO NOT UPDATE IF DEAD

    if (e.key.toLowerCase() === "j") {
      this.move(-240, 0, "left");
    }
    if (e.key.toLowerCase() === "i") {
      this.move(0, -100, "up");
    }
    if (e.key.toLowerCase() === "l") {
      this.move(240, 0, "right");
    }
    if (e.key.toLowerCase() === "k") {
      this.move(0, 100, "down");
    }

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

      if (
        (this.hP("fullhp") || this.hpCount + 0.5 === this.maxHPCount) &&
        this.sword.beamReady === true
      ) {
        this.sword.beamReady = false;
        setTimeout(() => {
          this.sword.launch(this.facing, this.pos.x, this.pos.y); // SWORD SHOOT
        }, 200);
        console.log("shoot");
        // FOR TESTING BOTH ATTACK METHODS
        //this.hpCount -=1;
      }

      this.attacking = true;
      this.pos.direction = 2; // FOR ATTACK ANIMATIONS CORRECT DIRECTION
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

  getInput() {
    if (!this.canMove) return;
    if (this.keys["w"] || this.keys["arrowup"]) return "up";
    if (this.keys["d"] || this.keys["arrowright"]) return "right";
    if (this.keys["s"] || this.keys["arrowdown"]) return "down";
    if (this.keys["a"] || this.keys["arrowleft"]) return "left";
    return null; // No input detected
  }

  move(x, y, direction) {
    if (this.attacking) {
      this.moving = false;
      return;
    }
    if (this.getInput() === null) this.moving = false;
    if (this.hpCount <= 0) return;
    if (this.frames.cooldown) return;
    if (direction === "up") {
      this.pos.y += y;
      this.hitBox.y += y;
      this.pos.x += x;
      this.hitBox.x += x;
      this.playerFrameX = 2;
      this.facing = "w";
      this.moving = true;
    } else if (direction === "down") {
      this.pos.y += y;
      this.hitBox.y += y;
      this.pos.x += x;
      this.hitBox.x += x;
      this.facing = "s";
      this.playerFrameX = 0;
      this.moving = true;
    } else if (direction === "left") {
      this.pos.x += x;
      this.hitBox.x += x;
      this.pos.y += y;
      this.hitBox.y += y;
      this.playerFrameX = 1;
      this.facing = "a";
      this.moving = true;
    } else if (direction === "right") {
      this.pos.x += x;
      this.hitBox.x += x;
      this.pos.y += y;
      this.hitBox.y += y;
      this.playerFrameX = 3;
      this.facing = "d";
      this.moving = true;
    }
    this.setDirection(direction);

    (this.traceBox.topLeft[0] += x), (this.traceBox.topLeft[1] += y);
    (this.traceBox.topRight[0] += x), (this.traceBox.topRight[1] += y);
    (this.traceBox.bottomLeft[0] += x), (this.traceBox.bottomLeft[1] += y);
    (this.traceBox.bottomRight[0] += x), (this.traceBox.bottomRight[1] += y);
  }

  update(timestamp) {
    if (!this.alive) return;

    // ATTACK DURATION
    if (this.attacking && timestamp - this.attackFrameTimer >= 300) {
      this.attacking = false;
      this.canAttack = true;
      console.log("Attack finished");
    }
    // Update sword state
    this.sword.update(timestamp, this.attacking);

    // ANIMATION DIRECTION TOGGLE
    if (this.moving && timestamp - this.lastToggle > 150) {
      this.pos.direction = this.pos.direction === 0 ? 1 : 0;
      this.lastToggle = timestamp;
    }

    if (!this.moving && !this.attacking) {
      this.pos.direction = 0;
    }
    if (this.enteringDungeon) {
    }
    // Entering
    if (this.enteringDungeon && this.dungeonFadeProgress < 1) {
      this.dungeonFadeProgress += 0.02; // ← slightly faster, tweak as needed
      if (this.dungeonFadeProgress >= 1) {
        this.dungeonFadeProgress = 1.3;
        this.enteringDungeon = false;
        this.canMove = true;
        this.dungeonAnimated = true;
        if (this.hasSword) this.canAttack = true;
      }
    }

    // Exiting
    if (this.exitingDungeon && this.dungeonFadeProgress > 0) {
      this.dungeonFadeProgress -= 0.02;
      if (this.dungeonFadeProgress <= 0) {
        this.dungeonFadeProgress = 0;
        this.exitingDungeon = false;
        this.canMove = true;
        this.dungeonAnimated = true;
        if (this.hasSword) this.canAttack = true;
      }
    }
  }

  pickUp(dungeonName, item) {
    this.pickingAnimation1 = false;
    this.pickingAnimation2 = false;
    this.pickingUp = true;
    this.receiveSound.play();
    if (dungeonName === "beginning") {
      this.pickingAnimation1 = true;
      this.hasSword = true;
      this.swordIndex = 0;
      this.pickingUpSword = true;
    }
    if (dungeonName === "master sword cave") {
      this.pickingAnimation1 = true;
      this.hasSword = true;
      this.swordIndex = 1;
      this.sword.masterSword();
      this.pickingUpSword = true;
    }
    if (item === "potion") {
      this.pickingAnimation2 = true;
      this.pickingUpPotion = true;
    }
    if (item === "hpUp") {
      this.pickingAnimation2 = true;
      this.maxHPUp = true;
    }
    this.canMove = false;
    this.moving = false;
    setTimeout(() => {
      if (this.pickingUpPotion) this.hpCount = this.maxHPCount;
      if (this.maxHPUp) {
        this.maxHPCount += 1;
        this.hpCount += 1;
      }
      this.pickingUp = false;
      this.canMove = true;
      this.canAttack = true;
      this.pickingUpSword = false;
      this.pickingUpPotion = false;
      this.maxHPUp = false;
    }, 2000);
  }

  animatePickingUp() {
    if (this.pickingAnimation1) {
      this.ctx.drawImage(
        this.sprite,
        0 * this.pos.width,
        5 * this.pos.height,
        this.pos.width,
        this.pos.height,
        Math.round(this.pos.x),
        Math.round(this.pos.y),
        this.pos.width,
        this.pos.height
      );
    }
    if (this.pickingAnimation2) {
      this.ctx.drawImage(
        this.sprite,
        1 * this.pos.width,
        5 * this.pos.height,
        this.pos.width,
        this.pos.height,
        Math.round(this.pos.x),
        Math.round(this.pos.y),
        this.pos.width,
        this.pos.height
      );
    }
    if (this.pickingUpSword) {
      this.ctx.drawImage(
        this.sprite,
        31 * 48,
        this.swordIndex * 48,
        48,
        48,
        Math.round(this.pos.x) - 12,
        Math.round(this.pos.y) - 47,
        48,
        48
      );
    }
    if (this.pickingUpPotion) {
      this.ctx.drawImage(
        this.secondaryItems,
        8 * 12,
        0 * 24,
        24,
        48,
        Math.round(this.pos.x) + 12,
        Math.round(this.pos.y) - 47,
        24,
        48
      );
    }
    if (this.maxHPUp) {
      this.ctx.drawImage(
        this.heartContainer,
        0,
        0,
        39,
        39,
        Math.round(this.pos.x) + 5,
        Math.round(this.pos.y) - 47,
        39,
        39
      );
    }
  }

  enterDungeon() {
    console.log("enterDungeon called");
    this.dungeonAnimated = false;
    this.playerFrameX = 2;
    this.canMove = false;
    this.canAttack = false;
    this.enteringDungeon = true;
  }

  exitDungeon() {
    console.log("exitDungeon called");
    this.dungeonAnimated = false;
    this.playerFrameX = 0;
    this.canMove = false;
    this.canAttack = false;
    this.exitingDungeon = true;
  }

  drawImage() {
    if (this.pickingUp) return;
    if (this.hasSword)
      this.sword.draw(
        Math.round(this.pos.x),
        Math.round(this.pos.y),
        this.pos.width,
        this.pos.height
      );

    let drawHeight = this.pos.height;
    let sourceOffsetY = 0;
    let visualOffsetY = 0;

    if (this.enteringDungeon || this.exitingDungeon) {
      const progress = this.dungeonFadeProgress;

      // Calculate how much of the sprite should be visible
      drawHeight = this.pos.height * (1 - progress);
      sourceOffsetY = 0;
      visualOffsetY = this.pos.height * progress;

      if (drawHeight > 0) {
        this.ctx.drawImage(
          this.sprite,
          this.playerFrameX * this.pos.width,
          this.pos.direction * this.pos.height + sourceOffsetY,
          this.pos.width,
          drawHeight,
          Math.round(this.pos.x),
          Math.round(this.pos.y + visualOffsetY),
          this.pos.width,
          drawHeight
        );
      }
    } else {
      this.ctx.drawImage(
        this.sprite,
        this.playerFrameX * this.pos.width,
        this.pos.direction * this.pos.height,
        this.pos.width,
        this.pos.height,
        Math.round(this.pos.x),
        Math.round(this.pos.y),
        this.pos.width,
        this.pos.height
      );
    }

    if (this.sword.explosion) {
      this.sword.beamExplosion(this.sword.beamX, this.sword.beamY);
    }
  }

  drawBeam() {
    if (!this.hasSword) return;
    this.sword.drawBeam(
      Math.round(this.pos.x), // Round to nearest integer
      Math.round(this.pos.y), // Round to nearest integer
      this.pos.width,
      this.pos.height
    );
  }
}

export default Player;
