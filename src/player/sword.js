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
    this.beamWidth = 24; // Adjust to match the beam sprite's width
    this.beamHeight = 24; // Adjust to match the beam sprite's height

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

    this.facing = "s";

    this.flyX = 0;
    this.flyY = 0;
    this.flyDistance = 0;
    this.maxDistance = 600; // DISTANCE FOR SWORD
    this.speed = 5.5;

    this.retracting = false;
    this.retractProgress = 0;
    this.retractSpeed = 0.24;

    this.sound = new Audio("./dist/sfx/sword.wav");
    this.swordBeamAudio = new Audio("./dist/sfx/sword-beam.wav");
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
        this.flyX = startX - 2;
        this.flyY = startY - 50;
        break;
      case "s":
        this.flyX = startX + 2;
        this.flyY = startY + 42;
        break;
      case "a":
        this.flyX = startX - 40;
        this.flyY = startY - 2;
        break;
      case "d":
        this.flyX = startX + 40;
        this.flyY = startY - 2;
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

      const hitboxPadding = 10;
      const collisionPixel = Util.getMapPixel(
        this.collisionCtx,
        this.flyX + hitboxPadding, // X position of the beam
        this.flyY + hitboxPadding, // Y position of the beam
        this.beamWidth - hitboxPadding * 2, // Width of the beam
        this.beamHeight - hitboxPadding * 2 // Height of the beam
      );
      const collisionValue = Util.sumArr(collisionPixel);

      if (
        collisionValue === constants.WALL ||
        collisionValue === constants.WATER
      ) {
        console.log("Beam hit a collision target!");
        this.explosion = true;
        this.launching = false;
        return;
      }

      switch (this.beamFacing) {
        case "w":
          this.flyY -= move;
          break;
        case "s":
          this.flyY += move;
          break;
        case "a":
          this.flyX -= move;
          break;
        case "d":
          this.flyX += move;
          break;
      }
      this.flyDistance += move;

      if (this.flyDistance >= this.maxDistance) {
        console.log("Beam has struck a target " + this.flyX + " " + this.flyY);
        this.explosionTimer = 0;
        this.explosion = true;
        this.launching = false;
      }
    }
    if (this.explosion) {
      this.beamExplosion(this.flyX, this.flyY);
      this.animateExplosion();
      this.updateExplosionColor();
    }
  }

  beamExplosion(flyX, flyY) {
    this.ctx.save();

    const explosions = [
      { dx: -this.spacing, dy: -this.spacing, rotation: 0, flip: false }, // ↖ up-left
      { dx: -this.spacing, dy: this.spacing, rotation: 180, flip: true }, // ↙ down-left
      { dx: this.spacing, dy: this.spacing, rotation: 180, flip: false }, // ↘ down-right
      { dx: this.spacing, dy: -this.spacing, rotation: 0, flip: true }, // ↗ up-right
    ];

    for (const { dx, dy, rotation, flip } of explosions) {
      const explosionOffsetX = flyX + dx;
      const explosionOffsetY = flyY + dy;

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
        Math.round(this.flyX),
        Math.round(this.flyY),
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
      0,
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
            this.swordX -= 3.5;
            this.frameX = 31;
            break;
          case "s":
            this.swordY += frameHeight - 12;
            this.swordX += 3;
            this.frameX = 29;
            break;
          case "a":
            this.swordX -= frameWidth - 12;
            this.swordY -= 1.5;
            this.frameX = 30;
            break;
          case "d":
            this.swordX += frameWidth - 12;
            this.swordY -= 1.5;
            this.frameX = 32;
            break;
        }

        // Calculate offset from player to sword (needed for retraction)
        this.offsetX = this.swordX - this.originX;
        this.offsetY = this.swordY - this.originY;

        // NOW MATCHES FOR AL "300MS"
        setTimeout(() => {
          this.retracting = true;
          this.retractProgress = 0;
        }, 210);
      }

      this.ctx.drawImage(
        this.sprite,
        this.frameX * frameWidth,
        0,
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
