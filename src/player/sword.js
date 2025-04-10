export class Sword {
  constructor(ctx) {
    this.ctx = ctx;
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
    this.explosionTimer = 0;
    this.explosionWidth = 24;
    this.explosionHeight = 48;

    this.facing = "s";

    this.flyX = 0;
    this.flyY = 0;
    this.flyDistance = 0;
    this.maxDistance = 150; // DISTANCE FOR SWORD
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
      this.updateExplosionColor();
    }
  }

  beamExplosion(flyX, flyY) {
    console.log("explosian at x: " + this.flyX + " Y: " + this.flyY);
    this.offsetX = flyX;
    this.offsetY = flyY;

    this.explosionTimer++;

    this.ctx.drawImage(
      this.explosionSprite,
      this.explosionColor * this.explosionWidth,
      0,
      this.explosionWidth,
      this.explosionHeight,
      this.offsetX,
      this.offsetY,
      this.explosionWidth,
      this.explosionHeight
    );
    if (this.explosionTimer >= 100) {
      this.explosion = false;
      return;
    }
  }

  updateExplosionColor() {
    if (this.explosionTimer < 10) {
      console.log("Returning explosion 0");
      return 0;
    }
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
        this.flyX,
        this.flyY,
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

        // Start retracting after 700ms
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
