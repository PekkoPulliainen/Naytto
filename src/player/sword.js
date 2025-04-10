const swordSprite = new Image();
swordSprite.src = "./dist/images/player/link.png";

const swordSound = new Audio("./dist/sfx/sword.wav");
swordSound.preload = "auto";
swordSound.volume = 0.5;

export class Sword {
  constructor(ctx) {
    this.ctx = ctx;
    this.attacking = false;
    this.frameX = 0;
    this.attackFrameTimer = 0;
    this.facing = "s";
  }

  startAttack(facing) {
    if (this.attacking) return;
    this.attacking = true;
    this.attackFrameTimer = performance.now();
    this.facing = facing;

    switch (facing) {
      case "w": this.frameX = 31; break;
      case "s": this.frameX = 29; break;
      case "a": this.frameX = 30; break;
      case "d": this.frameX = 32; break;
    }

    swordSound.currentTime = 0;
    swordSound.play();
  }

  update(timestamp) {
    if (this.attacking && timestamp - this.attackFrameTimer >= 200) {
      this.attacking = false;
    }
  }

  draw(x, y, frameWidth, frameHeight) {
    if (!this.attacking) return;

    let swordX = x;
    let swordY = y;

    switch (this.facing) {
      case "w": swordY -= frameHeight - 10; swordX -= 3.5; break;
      case "s": swordY += frameHeight - 12; swordX += 2; break;
      case "a": swordX -= frameWidth - 12; swordY -= 1.5; break;
      case "d": swordX += frameWidth - 12; swordY -= 1.5; break;
    }

    this.ctx.drawImage(
      swordSprite,
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
