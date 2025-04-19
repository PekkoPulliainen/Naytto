import Player from "../player/player.js";

class Monster {
  // SPIRTEX, SPRITEY ARE FOR MONSTER SPRITE POSITION, X AND Y ARE FOR MONSTER POSITION ON THE MAP
  constructor(ctx, sword, player, spriteX = 0, spriteY = 0, x = 300, y = 300) {
    this.ctx = ctx;
    this.sword = sword;
    this.enemy = new Image();
    this.enemy.src = "./dist/images/units/overworld-enemies.png";

    this.spawnEffect = new Image();
    this.spawnEffect.src = "./dist/images/effects.png";

    this.deathEffect = new Image();
    this.deathEffect.src = "./dist/images/effects.png";

    this.player = player;

    // POSITION FOR ENEMY
    this.pos = {
      x: x,
      y: y,
      width: 48,
      height: 48,
    };

    this.sprite = {
      x: spriteX * 48, // TILE INDEX
      y: spriteY * 48,
      width: 48,
      height: 48,
    };

    this.alive = true; // Track if the monster is alive
    this.showSpawnEffect = true;
    this.showDeathEffect = false; // Track if the death effect is being shown
    // TIMER FOR SPAWN EFFECT TO NORMAL MONSTER.
    setTimeout(() => {
      this.showSpawnEffect = false;
    }, 700);
  }

  drawImage() {
    if (this.showDeathEffect) {
      // Draw the death effect image
      this.ctx.drawImage(
        // CALCULATED THE POSITIOn AS 432, 48*9.
        this.deathEffect,
        432, 
        0,
        48,
        48,
        this.pos.x,
        this.pos.y,
        this.pos.width,
        this.pos.height
      );
      return; // Stop drawing anything else if the death effect is active
    }

    if (!this.alive) return; // Don't draw if the monster is dead and no death effect is active

    if (this.showSpawnEffect) {
      // Draw the spawn effect image
      this.ctx.drawImage(
        this.spawnEffect,
        0,
        0,
        48,
        48,
        this.pos.x,
        this.pos.y,
        this.pos.width,
        this.pos.height
      );
    } else {
      // Draw the monster image
      this.ctx.drawImage(
        this.enemy,
        this.sprite.x,
        this.sprite.y,
        this.sprite.width,
        this.sprite.height,
        this.pos.x,
        this.pos.y,
        this.pos.width,
        this.pos.height
      );
    }
  }

  killmonster() {
    // Check if the monster is alive
    if (!this.alive) return;

    // SWORD HITBOX FROM SWORD.js
    const swordHitBox = {
      x: this.sword.flyX || this.sword.swordX,
      y: this.sword.flyY || this.sword.swordY,
      width: this.sword.beamWidth,
      height: this.sword.beamHeight,
    };

    // HITBOX FOR MONSTER
    const monsterHitBox = {
      x: this.pos.x,
      y: this.pos.y,
      width: this.pos.width,
      height: this.pos.height,
    };

    // DETECT COLLISION
    if (
      swordHitBox.x < monsterHitBox.x + monsterHitBox.width &&
      swordHitBox.x + swordHitBox.width > monsterHitBox.x &&
      swordHitBox.y < monsterHitBox.y + monsterHitBox.height &&
      swordHitBox.y + swordHitBox.height > monsterHitBox.y
    ) {
      this.alive = false; // Mark the monster as dead
      this.showDeathEffect = true; // Show the death effect

      console.log("Monster killed!");

      // DEATH EFFECT = 100MS
      setTimeout(() => {
        this.showDeathEffect = false;
      }, 100);
    }
  }

  hitPlayer(){
    
  }
}

export default Monster;
  