class Player {
  constructor(ctx) {
    this.ctx = ctx;
    this.sprite = new Image();
    this.sprite.src = "./dist/images/player/link.png";

    // Char size
    this.frameWidth = 48; 
    this.frameHeight = 48;

    // Spawn point
    this.x = 400;
    this.y = 400;
    this.speed = 3;

    // Sprite frame and animation setup
    this.frameX = 0;
    this.direction = 0;
    this.lastToggle = 0;

    this.keys = {};
    window.addEventListener("keydown", (e) => this.keys[e.key.toLowerCase()] = true);
    window.addEventListener("keyup", (e) => this.keys[e.key.toLowerCase()] = false);
  }

  // MOVING
  update(timestamp) {
    let moving = false;

    if (this.keys["w"]) {
      this.y -= this.speed;
      this.frameX = 2;
      moving = true;
    } else if (this.keys["s"]) {
      this.y += this.speed;
      this.frameX = 0;
      moving = true;
    } else if (this.keys["a"]) {
      this.x -= this.speed;
      this.frameX = 1;
      moving = true;
    } else if (this.keys["d"]) {
      this.x += this.speed;
      this.frameX = 3;
      moving = true;
    }

    // Toggle animation row every 0.5s if moving
    if (moving && timestamp - this.lastToggle > 500) {
      this.direction = this.direction === 0 ? 1 : 0;
      this.lastToggle = timestamp;
    }

    // Reset to default frame if not moving
    if (!moving) {
      this.direction = 0;
    }
  }

  // Drawing player
  draw() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    this.ctx.drawImage(
      this.sprite,
      this.frameX * this.frameWidth,
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
