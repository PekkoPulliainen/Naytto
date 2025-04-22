import Player from "../player/player.js";
import Hud from "../hud/hud.js";

class Monster {
  // SPIRTEX, SPRITEY ARE FOR MONSTER SPRITE POSITION, X AND Y ARE FOR MONSTER POSITION ON THE MAP
  constructor(ctx, sword, player, spriteX = 0, spriteY = 0, x = 300, y = 300) {
    this.ctx = ctx;
    this.sword = sword;
    this.enemy = new Image();
    this.enemy.src = "./dist/images/units/overworld-enemies.png";

    this.hud = new Hud(ctx, player); // Initialize the HUD with the player

    this.spawnEffect = new Image();
    this.spawnEffect.src = "./dist/images/effects.png";

    this.deathEffect = new Image();
    this.deathEffect.src = "./dist/images/effects.png";

    this.hurtSound = new Audio();
    this.hurtSound.src = "./dist/sfx/link-hurt.wav";

    this.hitEnemySound = new Audio();
    this.hitEnemySound.src = "./dist/sfx/hit-enemy.wav";

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
    this.canHitPlayer = true;

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

  killmonster(normalAttack = false) {
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
  
    // DETECT COLLISION FOR BEAM OR NORMAL ATTACK
    const collisionDetected = normalAttack
      ? this.sword.swordX < monsterHitBox.x + monsterHitBox.width &&
        this.sword.swordX + this.sword.beamWidth > monsterHitBox.x &&
        this.sword.swordY < monsterHitBox.y + monsterHitBox.height &&
        this.sword.swordY + this.sword.beamHeight > monsterHitBox.y
      : swordHitBox.x < monsterHitBox.x + monsterHitBox.width &&
        swordHitBox.x + swordHitBox.width > monsterHitBox.x &&
        swordHitBox.y < monsterHitBox.y + monsterHitBox.height &&
        swordHitBox.y + swordHitBox.height > monsterHitBox.y;
  
    if (collisionDetected) {
      this.alive = false; // Mark the monster as dead
      this.showDeathEffect = true; // Show the death effect
      this.hitEnemySound.play();
      console.log("Monster killed!");

      setTimeout(() => {
        this.showDeathEffect = false;
      }, 100);
    }
  }

  hitPlayer() {
    if (!this.alive) return;
  
    // Ensure the monster can only hit the player if allowed
    if (!this.canHitPlayer) return;
  
    const playerHitBox = {
      x: this.player.pos.x,
      y: this.player.pos.y,
      width: this.player.pos.width,
      height: this.player.pos.height,
    };
  
    const monsterHitBox = {
      x: this.pos.x,
      y: this.pos.y,
      width: this.pos.width,
      height: this.pos.height,
    };
  
    if (
      playerHitBox.x < monsterHitBox.x + monsterHitBox.width &&
      playerHitBox.x + playerHitBox.width > monsterHitBox.x &&
      playerHitBox.y < monsterHitBox.y + monsterHitBox.height &&
      playerHitBox.y + playerHitBox.height > monsterHitBox.y
    ) {
      // Reduce player's health by 2, 2= 1 heart
      this.player.hP("damage", 2);
  
      // Notify the HUD to update the health display
      this.hud.updateHearts(this.player.hpCount);
  
      console.log("Player hit by monster! Current HP:", this.player.hpCount);
  
      // 500MS COOLDOWN
      this.canHitPlayer = false;
      setTimeout(() => {
        this.canHitPlayer = true;
      }, 1500);
    }
  }
}

export default Monster;
  