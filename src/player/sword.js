export class Sword {
  constructor(ctx) {
    this.ctx = ctx;
    this.sprite = new Image();
    this.sprite.src = "./dist/images/player/link.png"; // Or sword-specific sprite

    this.beamSprite = new Image();
    this.beamSprite.src = "./dist/images/player/beams.png"; // Beam sprites

    this.frameX = 0;
    this.attacking = false;
    this.launching = false;
    this.beamReady = true;
    this.beamCooldown = 0;
    this.facing = "s";
    this.flyX = 0;
    this.flyY = 0;
    this.flyDistance = 0;
    this.maxDistance = 400; // DISTANCE FOR SWORD
    this.speed = 6;

    this.sound = new Audio("./dist/sfx/sword.wav");
  }

  startAttack(facing) {
    this.attacking = true;
    this.facing = facing;
    this.sound.currentTime = 0;
    this.sound.play();
  }

  launch(facing, startX, startY) {
    this.launching = true;
    this.facing = facing;
    this.flyX = startX;
    this.flyY = startY;
    this.flyDistance = 0;
    this.sound.currentTime = 0;
    this.sound.play();
    this.updateBeamCD();
  }

  update(timestamp, attacking) {
    // Manage attacking state: end after 200ms
    if (attacking) {
      if (!this.attacking) {
        this.attacking = true;
        this.attackTimer = timestamp; // Start the attack timer
        console.log("Beam cd: " + this.beamCooldown);
      }

      // End attack after 200ms
      if (timestamp - this.attackTimer >= 200) {
        this.attacking = false; // Stop attacking
        console.log("Sword attack finished");
      }
    } else {
      this.attacking = false; // Reset attacking state if no longer attacking
    }

    // SWORD LAUNCHING
    if (this.launching) {
      const move = this.speed;
      switch (this.facing) {
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
        this.launching = false;
      }
    }
  }

  updateBeamCD() {
    this.beamCooldownInterval = setInterval(() => {
      this.beamCooldown++;
      if (this.beamCooldown === 30) {
        this.beamReady = true;
        clearInterval(this.beamCooldownInterval);
        this.beamCooldown = 0;
      }
    }, 100);
  }

  draw(playerX, playerY, frameWidth, frameHeight) {
    if (this.launching) {
      this.ctx.drawImage(
        this.beamSprite,
        this.getFlyingFrameX() * frameWidth,
        0,
        frameWidth,
        frameHeight,
        this.flyX,
        this.flyY,
        frameWidth,
        frameHeight
      );
      return;
    }

    // Draw the attacking sword if in attacking state (but not launching)
    if (this.attacking) {
      let swordX = playerX;
      let swordY = playerY;

      switch (this.facing) {
        case "w":
          swordY -= frameHeight - 10;
          swordX -= 3.5;
          this.frameX = 31;
          break;
        case "s":
          swordY += frameHeight - 12;
          swordX += 2;
          this.frameX = 29;
          break;
        case "a":
          swordX -= frameWidth - 12;
          swordY -= 1.5;
          this.frameX = 30;
          break;
        case "d":
          swordX += frameWidth - 12;
          swordY -= 1.5;
          this.frameX = 32;
          break;
      }

      this.ctx.drawImage(
        this.sprite,
        this.frameX * frameWidth,
        0,
        frameWidth,
        frameHeight,
        swordX,
        swordY,
        frameWidth,
        frameHeight
      );
    }
  }

  getFlyingFrameX() {
    switch (this.facing) {
      case "w":
        return 31;
      case "s":
        return 29;
      case "a":
        return 30;
      case "d":
        return 32;
    }
  }
}
