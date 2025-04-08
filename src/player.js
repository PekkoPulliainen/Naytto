class Player {
    constructor(ctx) {
      this.ctx = ctx;
      this.sprite = new Image();
      this.sprite.src = "./dist/images/player/link.png";

      // Char size
      this.frameWidth = 48; 
      this.frameHeight = 48;
      // Char size
      
      // Spawn point
      this.x = 400;
      this.y = 400;
      this.speed = 3;
      this.direction = 0; 
        
      this.keys = {};
      window.addEventListener("keydown", (e) => this.keys[e.key.toLowerCase()] = true);
      window.addEventListener("keyup", (e) => this.keys[e.key.toLowerCase()] = false);
    }
  
    // MOVING
    update() {
      if (this.keys["w"]) {
        this.y -= this.speed;
        this.direction = 3; 
      } else if (this.keys["s"]) {
        this.y += this.speed;
        this.direction = 0;
      } else if (this.keys["a"]) {
        this.x -= this.speed;
        this.direction = 1;
      } else if (this.keys["d"]) {
        this.x += this.speed;
        this.direction = 4; 
      }
    }
    

    // Creating player
    draw() {
      const frameX = 2; 
      const frameY = this.direction;
  
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  
      this.ctx.drawImage(
        this.sprite,
        frameX * this.frameWidth,
        frameY * this.frameHeight,
        this.frameWidth, this.frameHeight, 
        this.x, this.y,
        this.frameWidth, this.frameHeight
      );
    }
  }

export default Player;