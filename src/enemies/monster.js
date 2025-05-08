import Player from "../player/player.js";
import Hud from "../hud/hud.js";
import Sword from "../player/sword.js";

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

    this.canMove = false;

    this.monsterHPCount = 2;

    this.shootingRock = new Image();
    this.shootingRock.src = "./dist/images/units/ROCK.png";

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
    this.canHitPlayer = false;

    // TIMER FOR SPAWN EFFECT TO NORMAL MONSTER.
    setTimeout(() => {
      this.showSpawnEffect = false;
      this.canHitPlayer = true;
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

  // VIHUJEN LIIKKEELLE.
  monsterMovement() {
    if (!this.alive) return; // Don't move if the monster is dead
    if (this.shootRock) return;
    if (!this.canMove) return;

    const speed = 1; // Speed of movement

    if (!this.movementInterval) {
      this.randomDirection = Math.floor(Math.random() * 4);

      this.movementInterval = setInterval(() => {
        this.randomDirection = Math.floor(Math.random() * 4);
      }, 1000);
    }
    // Move the monster based on the current direction
    switch (this.randomDirection) {
      case 0:
        this.pos.y -= speed; // Move up
        this.sprite.x = 96;
        break;
      case 1:
        this.pos.y += speed; // Move down
        this.sprite.x = 0;
        break;
      case 2:
        this.pos.x -= speed; // Move left
        this.sprite.x = 48;
        break;
      case 3:
        this.pos.x += speed; // Move right
        this.sprite.x = 144;
        break;
    }
  }

  shootRocks() {
    if (!this.alive) return;

    const rockSize = 16; // Size of the rock
    let rockX = this.pos.x + this.pos.width / 2 - rockSize / 2; // Initial horizontal position
    let rockY = this.pos.y + this.pos.height / 2 - rockSize / 2; // Initial vertical position
    this.shootRock = true;
    const rockSpeed = 2; // Speed of the rock
    const rockDirection = this.randomDirection; // Direction of the rock

    this.canshootRock = false;

    // Draw the rock at the updated position
    this.ctx.drawImage(
      this.shootingRock,
      0,
      0,
      32,
      32,
      rockX,
      rockY,
      rockSize,
      rockSize
    );

    // Stop moving the rock if it goes offscreen
    if (
      rockX < 0 ||
      rockX > this.ctx.canvas.width ||
      rockY < 0 ||
      rockY > this.ctx.canvas.height
    ) {
      return;
    }
  }

  shootRocksCheckXY() {
    const onSameLineX =
      Math.abs(this.pos.x - this.player.pos.x) < this.pos.width;
    const onSameLineY =
      Math.abs(this.pos.y - this.player.pos.y) < this.pos.height;

    const monsterSeesPlayer =
      (this.randomDirection === 1 &&
        this.player.pos.y > this.pos.y &&
        onSameLineX) ||
      (this.randomDirection === 0 &&
        this.player.pos.y < this.pos.y &&
        onSameLineX) ||
      (this.randomDirection === 2 &&
        this.player.pos.x < this.pos.x &&
        onSameLineY) ||
      (this.randomDirection === 3 &&
        this.player.pos.x > this.pos.x &&
        onSameLineY);

    if (monsterSeesPlayer) {
      console.log("Monster and player are on same line");
      this.shootRocks();
    } else {
      this.shootRock = false;
    }
  }

  shootRocks() {
    if (!this.alive) return;

    const rockSize = 16; // Size of the rock
    let rockX = this.pos.x + this.pos.width / 2 - rockSize / 2; // Initial horizontal position
    let rockY = this.pos.y + this.pos.height / 2 - rockSize / 2; // Initial vertical position
    this.shootRock = true;
    const rockSpeed = 2; // Speed of the rock
    const rockDirection = this.randomDirection; // Direction of the rock

    this.canshootRock = false;

    // Draw the rock at the updated position
    this.ctx.drawImage(
      this.shootingRock,
      0,
      0,
      32,
      32,
      rockX,
      rockY,
      rockSize,
      rockSize
    );

    // Stop moving the rock if it goes offscreen
    if (
      rockX < 0 ||
      rockX > this.ctx.canvas.width ||
      rockY < 0 ||
      rockY > this.ctx.canvas.height
    ) {
      return;
    }
  }

  shootRocksCheckXY() {
    const onSameLineX =
      Math.abs(this.pos.x - this.player.pos.x) < this.pos.width;
    const onSameLineY =
      Math.abs(this.pos.y - this.player.pos.y) < this.pos.height;

    const monsterSeesPlayer =
      (this.randomDirection === 1 &&
        this.player.pos.y > this.pos.y &&
        onSameLineX) ||
      (this.randomDirection === 0 &&
        this.player.pos.y < this.pos.y &&
        onSameLineX) ||
      (this.randomDirection === 2 &&
        this.player.pos.x < this.pos.x &&
        onSameLineY) ||
      (this.randomDirection === 3 &&
        this.player.pos.x > this.pos.x &&
        onSameLineY);

    if (monsterSeesPlayer) {
      console.log("Monster and player are on same line");
      this.shootRocks();
    } else {
      this.shootRock = false;
    }
  }

  killmonster(normalAttack = false) {
    // Check if the monster is alive
    if (!this.alive) return;

    // SWORD HITBOX FROM SWORD.js
    const swordHitBox = {
      x: this.sword.beamX || this.sword.swordHitBoxX,
      y: this.sword.beamY || this.sword.swordHitBoxY,
      width: this.sword.beamWidth || this.sword.swordHitBoxWidth,
      height: this.sword.beamHeight || this.sword.swordHitBoxHeight,
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

    //console.log("Sword X: " + this.sword.swordX + " Sword Y: " + this.sword.swordY);
    this.ctx.strokeStyle = "red";
    this.ctx.strokeRect(
      this.sword.swordHitBoxX,
      this.sword.swordHitBoxY,
      this.sword.swordHitBoxWidth,
      this.sword.swordHitBoxHeight
    );

    this.ctx.strokeStyle = "green";
    this.ctx.strokeRect(
      this.sword.beamHitBoxX,
      this.sword.beamHitBoxY,
      this.sword.beamWidth,
      this.sword.beamHeight
    );

    this.ctx.strokeStyle = "blue";
    this.ctx.strokeRect(
      this.pos.x,
      this.pos.y,
      this.pos.width,
      this.pos.height
    );

    if (collisionDetected) {
      this.monsterHPCount -= this.sword.swordDamage;
      if (this.monsterHPCount === 0 || 0 > this.monsterHPCount) {
        this.alive = false; // Mark the monster as dead
        this.showDeathEffect = true; // Show the death effect
        console.log("Monster killed!");
      }
      this.sword.enemyHit();
      this.hitEnemySound.play();
      console.log("Monster hit!");

      if (this.showDeathEffect) {
        setTimeout(() => {
          this.showDeathEffect = false;
        }, 100);
      }
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
      this.player.hP("damage", 0.5); // Call the player's method to reduce health
      this.hurtSound.play();

      // Notify the HUD to update the health display
      this.hud.updateHearts(this.player.hpCount, this.player.maxHPCount);
      this.sword.superSword();
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
