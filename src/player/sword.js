import * as Util from "../util/util.js";
import * as constants from "../util/constants.js";

export class Sword {
  constructor(ctx, collisionCtx) {
    this.ctx = ctx;
    this.collisionCtx = collisionCtx;
    this.sprite = new Image();
    this.sprite.src = "./dist/images/player/link.png"; // Or sword-specific sprite

    this.beamSprite = new Image();
    this.beamSprite.src = "./dist/images/player/beams.png"; // Beam sprites
    this.beamColor = 1;

    this.explosionSprite = new Image();
    this.explosionSprite.src = "./dist/images/player/explosion.png";
    this.explosionColorCooldown = 0;
    this.explosionColor = 1;

    this.frameX = 0;
    this.attacking = false;

    this.launching = false;
    this.beamReady = true;
    this.beamCooldown = 0;
    this.beamColorCooldown = 0;
    this.explosion = false;
    this.spacing = 1;
    this.spacingCooldown = 0;
    this.explosionWidth = 24;
    this.explosionHeight = 48;
    this.beamLandedX = 0;
    this.beamLandedY = 0;

    this.swordHitBoxX = 48;
    this.swordHitBoxY = 48;
    this.swordHitBoxWidth = 48;
    this.swordHitBoxHeight = 48;

    this.facing = "s";

    this.beamX = 0;
    this.beamY = 0;
    this.beamWidth = 24; // Adjust to match the beam sprite's width
    this.beamHeight = 24; // Adjust to match the beam sprite's height
    this.beamHitBoxX = 0;
    this.beamHitBoxY = 0;

    this.flyDistance = 0;
    this.maxDistance = 1000; // DISTANCE FOR SWORD
    this.speed = 7;

    this.retracting = false;
    this.retractProgress = 0;
    this.retractSpeed = 0.24;

    this.sound = new Audio("./dist/sfx/sword.wav");
    this.swordBeamAudio = new Audio("./dist/sfx/sword-beam.wav");

    this.enemyDead = false;

    this.swordDamage = 1;

    // Map Borders
    this.MAP_LEFT = 0;
    this.MAP_TOP = 140;
    this.MAP_RIGHT = this.collisionCtx.canvas.width; // Canvas width
    this.MAP_BOTTOM = this.collisionCtx.canvas.height; // Canvas height
  }

  // WHEN CALLED CHANGES THE SPRITE TO OTHER SWORD, NOW ON THE THIRD ROW OF LINK.png.

  // FOR TESTING ADDED IN MONSTER.JS WHEN TAKING DAMAGE CALLED superSword() FUNCTION.
  superSword() {
    this.swordDamage *= 1;
    this.spriteRow = 2;
    console.log("Super Sword");
  }

  masterSword() {
    this.swordDamage = 2;
    this.spriteRow = 1;
    console.log("Master Sword");
  }

  startAttack(facing) {
    this.attacking = true;
    this.facing = facing;
    this.sound.currentTime = 0;
    this.sound.play();
  }

  launch(facing, startX, startY) {
    this.launching = true;
    this.beamFacing = facing;
    this.swordBeamAudio.currentTime = 0;
    this.swordBeamAudio.play();

    switch (facing) {
      case "w":
        this.beamX = startX - 2;
        this.beamY = startY - 50;
        this.beamHitBoxX = startX + 8.5;
        this.beamHitBoxY = startY - 50;
        this.beamWidth = 24;
        this.beamHeight = 48;
        break;
      case "s":
        this.beamX = startX + 2;
        this.beamY = startY + 42;
        this.beamHitBoxX = startX + 15;
        this.beamHitBoxY = startY + 42;
        this.beamWidth = 24;
        this.beamHeight = 48;
        break;
      case "a":
        this.beamX = startX - 40;
        this.beamY = startY - 2;
        this.beamHitBoxX = startX - 40;
        this.beamHitBoxY = startY + 15;
        this.beamWidth = 48;
        this.beamHeight = 24;
        break;
      case "d":
        this.beamX = startX + 40;
        this.beamY = startY - 2;
        this.beamHitBoxX = startX + 40;
        this.beamHitBoxY = startY + 15;
        this.beamWidth = 48;
        this.beamHeight = 24;
        break;
    }
    this.flyDistance = 0;
    this.updateBeamCD();
    this.updateBeamColor();
  }

  update(timestamp, attacking) {
    // Manage attacking state: end after 200ms
    if (attacking) {
      if (!this.attacking) {
        this.attacking = true;
        this.attackTimer = timestamp; // Start the attack timer
        this.swordX = undefined;
        this.swordY = undefined;
      }

      // End attack after 300ms
      if (timestamp - this.attackTimer >= 300) {
        this.attacking = false; // Stop attacking
        console.log("Sword attack finished");
      }
    } else {
      this.attacking = false; // Reset attacking state if no longer attacking
    }

    // SWORD LAUNCHING
    if (this.launching) {
      const move = this.speed;
      if (
        this.beamHitBoxX < this.MAP_LEFT || // Check if beam is out of bounds on the left
        this.beamHitBoxX > this.MAP_RIGHT || // Check if beam is out of bounds on the right
        this.beamHitBoxY < this.MAP_TOP || // Check if beam is out of bounds at the top
        this.beamHitBoxY > this.MAP_BOTTOM // Check if beam is out of bounds at the bottom
      ) {
        console.log("Beam hit a collision target or border!");
        this.explosion = true;
        this.launching = false;
        this.beamLandedX = this.beamX;
        this.beamLandedY = this.beamY;
        this.beamHitBoxX = 0;
        this.beamHitBoxY = 0;
        this.beamX = 0;
        this.beamY = 0;
        return;
      }

      switch (this.beamFacing) {
        case "w":
          this.beamY -= move;
          this.beamHitBoxY = this.beamY;
          break;
        case "s":
          this.beamY += move;
          this.beamHitBoxY = this.beamY;
          break;
        case "a":
          this.beamX -= move;
          this.beamHitBoxX = this.beamX;
          break;
        case "d":
          this.beamX += move;
          this.beamHitBoxX = this.beamX;
          break;
      }
      this.flyDistance += move;

      if (this.flyDistance >= this.maxDistance) {
        console.log(
          "Beam has struck a target " + this.beamX + " " + this.beamY
        );
        this.explosionTimer = 0;
        this.explosion = true;
        this.launching = false;
      }
    }
    if (this.explosion) {
      this.beamExplosion(this.beamX, this.beamY);
      this.animateExplosion();
      this.updateExplosionColor();
    }
  }

  enemyHit() {
    if (this.launching) {
      console.log("Beam has struck an enemy!");
      this.explosion = true;
      this.launching = false;
      this.beamLandedX = this.beamX;
      this.beamLandedY = this.beamY;
      this.beamHitBoxX = 0;
      this.beamHitBoxY = 0;
      this.beamX = 0;
      this.beamY = 0;
      return;
    }
  }

  beamExplosion(beamX, beamY) {
    this.ctx.save();

    const explosions = [
      { dx: -this.spacing, dy: -this.spacing, rotation: 0, flip: false }, // ↖ up-left
      { dx: -this.spacing, dy: this.spacing, rotation: 180, flip: true }, // ↙ down-left
      { dx: this.spacing, dy: this.spacing, rotation: 180, flip: false }, // ↘ down-right
      { dx: this.spacing, dy: -this.spacing, rotation: 0, flip: true }, // ↗ up-right
    ];

    for (const { dx, dy, rotation, flip } of explosions) {
      const explosionOffsetX = this.beamLandedX + dx;
      const explosionOffsetY = this.beamLandedY + dy;

      this.ctx.save(); // Save the current state

      // Translate to the center of the image before rotating
      this.ctx.translate(
        explosionOffsetX + this.explosionWidth / 2,
        explosionOffsetY + this.explosionHeight / 2
      );

      // Rotate the canvas (convert degrees to radians)
      this.ctx.rotate((rotation * Math.PI) / 180);

      if (flip) {
        this.ctx.scale(-1, 1);
      }

      // Draw image, adjusting so it rotates around its center
      this.ctx.drawImage(
        this.explosionSprite,
        this.explosionColor * this.explosionWidth,
        0,
        this.explosionWidth,
        this.explosionHeight,
        -this.explosionWidth / 2,
        -this.explosionHeight / 2,
        this.explosionWidth + 8,
        this.explosionHeight + 8
      );

      this.ctx.restore(); // Restore to previous state
    }

    this.ctx.restore();
  }

  animateExplosion() {
    if (this.explosionSpacingInterval) return;

    this.explosionSpacingInterval = setInterval(() => {
      this.spacing++;
      this.spacingCooldown++;

      if (this.spacingCooldown === 60) {
        clearInterval(this.explosionSpacingInterval);
        this.explosion = false;
        this.explosionSpacingInterval = null;
        this.spacingCooldown = 0;
        this.spacing = 1;
        return;
      }
    }, 8);
  }

  updateExplosionColor() {
    this.explosionColorCooldownInterval = setInterval(() => {
      if (this.explosionColor > 2) this.explosionColor = 0;
      this.explosionColor++;
      this.explosionColorCooldown++;
      if (this.explosionColorCooldown === 128) {
        clearInterval(this.explosionColorCooldownInterval);
        this.explosionColorCooldown = 0;
        return;
      }
    }, 20);
  }

  updateBeamCD() {
    this.beamCooldownInterval = setInterval(() => {
      this.beamCooldown++;
      if (this.beamCooldown === 20) {
        this.beamReady = true;
        clearInterval(this.beamCooldownInterval);
        this.beamCooldown = 0;
        return;
      }
    }, 100);
  }

  updateBeamColor() {
    if (this.beamReady) return;
    this.beamColorCooldownInterval = setInterval(() => {
      if (this.beamColor > 3) this.beamColor = -1;
      this.beamColor++;
      this.beamColorCooldown++;
      if (this.beamColorCooldown === 128) {
        clearInterval(this.beamColorCooldownInterval);
        this.beamColorCooldown = 0;
        return;
      }
    }, 20);
  }

  drawBeam(playerX, playerY, frameWidth, frameHeight) {
    if (this.launching && this.flyDistance <= this.maxDistance) {
      this.ctx.drawImage(
        this.beamSprite,
        this.getFlyingFrameX() * frameWidth,
        this.beamColor * frameHeight,
        frameWidth,
        frameHeight,
        Math.round(this.beamX),
        Math.round(this.beamY),
        frameWidth,
        frameHeight
      );
    }
  }

  drawRetractSword(frameWidth, frameHeight) {
    if (!this.retracting) return;

    // Animate offset back to player
    const progress = this.retractProgress;
    const currentX = this.originX + this.offsetX * (1 - progress);
    const currentY = this.originY + this.offsetY * (1 - progress);

    this.ctx.drawImage(
      this.sprite,
      this.frameX * frameWidth,
      (this.spriteRow || 0) * frameHeight,
      frameWidth,
      frameHeight,
      currentX + 1.5,
      currentY,
      frameWidth,
      frameHeight
    );

    this.retractProgress += this.retractSpeed;
    if (this.retractProgress >= 1) {
      this.retractProgress = 1;
      this.retracting = false;
      this.attacking = false;
      this.swordX = undefined;
      this.swordY = undefined;
      this.offsetX = 0;
      this.offsetY = 0;
    }
  }

  draw(playerX, playerY, frameWidth, frameHeight) {
    if (this.attacking && !this.retracting) {
      if (!this.swordX && !this.swordY) {
        this.originX = playerX;
        this.originY = playerY;

        this.swordX = playerX;
        this.swordY = playerY;

        switch (this.facing) {
          case "w":
            this.swordY -= frameHeight - 10;
            this.swordX -= 3;
            this.frameX = 31;
            this.swordHitBoxX = this.swordX + 9.5;
            this.swordHitBoxY = this.swordY - 2;
            this.swordHitBoxWidth = 24;
            this.swordHitBoxHeight = 48;
            break;
          case "s":
            this.swordY += frameHeight - 12;
            this.swordX += 3;
            this.frameX = 29;
            this.swordHitBoxX = this.swordX + 14;
            this.swordHitBoxY = this.swordY + 6;
            this.swordHitBoxWidth = 24;
            this.swordHitBoxHeight = 48;
            break;
          case "a":
            this.swordX -= frameWidth - 12;
            this.swordY -= 1.5;
            this.frameX = 30;
            this.swordHitBoxX = this.swordX;
            this.swordHitBoxY = this.swordY + 15;
            this.swordHitBoxWidth = 48;
            this.swordHitBoxHeight = 24;
            break;
          case "d":
            this.swordX += frameWidth - 12;
            this.swordY -= 1.5;
            this.frameX = 32;
            this.swordHitBoxX = this.swordX;
            this.swordHitBoxY = this.swordY + 15;
            this.swordHitBoxWidth = 48;
            this.swordHitBoxHeight = 24;
            break;
        }

        // Calculate offset from player to sword (needed for retraction)
        this.offsetX = this.swordX - this.originX;
        this.offsetY = this.swordY - this.originY;

        setTimeout(() => {
          this.swordHitBoxX = 0;
          this.swordHitBoxY = 0;
          this.retracting = true;
          this.retractProgress = 0;
        }, 210);
      }

      this.ctx.drawImage(
        this.sprite,
        this.frameX * frameWidth,
        (this.spriteRow || 0) * frameHeight,
        frameWidth,
        frameHeight,
        this.swordX,
        this.swordY,
        frameWidth,
        frameHeight
      );
    }

    if (this.retracting) {
      this.drawRetractSword(frameWidth, frameHeight);
    }
  }

  getFlyingFrameX() {
    switch (this.beamFacing) {
      case "w":
        return 2;
      case "s":
        return 0;
      case "a":
        return 1;
      case "d":
        return 3;
    }
  }
}

export default Sword;
