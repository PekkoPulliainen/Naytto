class Player {
  constructor(ctx) {
    this.ctx = ctx;
    this.sprite = new Image();
    this.sprite.src = "./dist/images/player/link.png";

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

    window.addEventListener("keydown", (e) => this.handleKeyDown(e)); // KEYDOWN EVENT
    window.addEventListener("keyup", (e) => this.handleKeyUp(e)); // KEYUP EVENT
  }

  setAlive(alive) {
    this.alive = alive; // SET ALIVE STATE
  }

  handleKeyDown(e) {
    if (!this.alive) return; // DO NOT UPDATE IF DEAD

    const swordSound = new Audio("./dist/sfx/sword.wav");
    swordSound.preload = "auto";

    // SO SPACE HOLD ATTACK ISNT POSSIBLE
    if (e.key.toLowerCase() === " " && !this.spacePressed && this.canAttack) {
      this.keys[e.key.toLowerCase()] = true;
      this.spacePressed = true;

      // ATTACK
      this.attacking = true;
      swordSound.currentTime = 0;
      swordSound.play();

      this.direction = 2; // FOR ATTACK ANIMATIONS CORRECT DIRECTION
      this.attackFrameTimer = performance.now();
      this.canAttack = false;
    } else {
      // Handle other keys like WASD for movement
      this.keys[e.key.toLowerCase()] = true;
    }
  }

  handleKeyUp(e) {
    if (e.key.toLowerCase() === " ") {
      // SPACE KEY RELEASED
      this.spacePressed = false;
    }
    this.keys[e.key.toLowerCase()] = false;
  }

  update(timestamp) {
    if (!this.alive) return; // DO NOT UPDATE IF DEAD
    let moving = false; // MOVING STATE

    // MOVING
    if (!this.attacking) {
      if (this.keys["w"]) {
        this.y -= this.speed;
        this.playerFrameX = 2;
        this.facing = "w";
        moving = true;
      } else if (this.keys["s"]) {
        this.facing = "s";
        this.playerFrameX = 0;
        this.y += this.speed;
        moving = true;
      } else if (this.keys["a"]) {
        this.x -= this.speed;
        this.playerFrameX = 1;
        this.facing = "a";
        moving = true;
      } else if (this.keys["d"]) {
        this.x += this.speed;
        this.playerFrameX = 3;
        this.facing = "d";
        moving = true;
      }
    }

    // Switch direction if moving
    if (moving && timestamp - this.lastToggle > 300) {
      // 300ms delay to prevent rapid direction changes
      this.direction = this.direction === 0 ? 1 : 0;
      this.lastToggle = timestamp;
    }

    // SWORD FRAMES, 1 ATTACK IS 200MS
    if (this.attacking) {
      if (timestamp - this.attackFrameTimer < 200) {
        switch (this.facing) {
          case "w":
            this.frameX = 31;
            break;
          case "s":
            this.frameX = 29;
            break;
          case "a":
            this.frameX = 30;
            break;
          case "d":
            this.frameX = 32;
            break;
        }
      } else {
        this.attacking = false; // END ATTACK AFTER 200MS
        this.canAttack = true; // ALLOW ATTACKS AGAIN
        console.log("attack is stopping");
      }
    }

    // Reset direction when not moving or attacking
    if (!moving && !this.attacking) {
      this.direction = 0; // Reset direction to default
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height); // Clear the canvas

    // SWORD
    if (this.attacking) {
      // DRAW SWORD
      let swordX = this.x; // SWORD X POSITION
      let swordY = this.y; // SWORD Y POSITION

      switch (
        this.facing // SWORD DIRECTION
      ) {
        case "w":
          swordY -= this.frameHeight - 10;
          swordX -= 3.5;
          break;
        case "s":
          swordY += this.frameHeight - 12;
          swordX += 2;
          break;
        case "a":
          swordX -= this.frameWidth - 12;
          swordY -= 1.5;
          break;
        case "d":
          swordX += this.frameWidth - 12;
          swordY -= 1.5;
          break;
      }

      this.ctx.drawImage(
        this.sprite,
        this.frameX * this.frameWidth,
        0,
        this.frameWidth,
        this.frameHeight,
        swordX,
        swordY,
        this.frameWidth,
        this.frameHeight
      );
    }

    // PLAYER
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
  }
}

export default Player;
