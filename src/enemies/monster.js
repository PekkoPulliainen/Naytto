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

    this.canMove = true;
    this.blocked = false;

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

    if (!this.canMove) {
      if (this.movementInterval) {
        clearInterval(this.movementInterval);
        this.movementInterval = null;
      }
      return;
    }
  
    const speed = 1;
  
    if (!this.movementInterval) {
      this.randomDirection = Math.floor(Math.random() * 4);
  
      this.movementInterval = setInterval(() => {
        // UPDATE MOVEMENT IF MONSTER CAN MOVE
        if (this.canMove) {
          this.randomDirection = Math.floor(Math.random() * 4);
        }
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

  drawRock() {
    if (this.rockIsMoving) {
      this.ctx.drawImage(
        this.shootingRock,
        0,
        0,
        32,
        32,
        this.rockX,
        this.rockY,
        this.rockSize,
        this.rockSize
      );
    }
  }
  

  enemyShoot() {
    if (!this.alive || this.rockIsMoving) return; // Prevent multiple shots
  
    this.rockIsMoving = true; // Flag to track active rock
  
    const rockSize = 32;
    this.rockX = this.pos.x + this.pos.width / 2 - rockSize / 2;
    this.rockY = this.pos.y + this.pos.height / 2 - rockSize / 2;
    this.rockSize = rockSize;
  
    this.canMove = false; // Stop monster movement while shooting
  
    const direction = this.randomDirection;
    const speed = 2; // PIXELS PER FRAME

    const shootFlyTime = 2000; // Duration the rock moves (in ms)
    const startTime = Date.now();

    const moveRock = () => {
      const shootTimer = Date.now() - startTime;
  
      if (this.blocked || shootTimer >= shootFlyTime) {
        this.rockIsMoving = false;
        this.canMove = true;
        return;
      }
  
      // ROCK MOVES SAME WAY AS MONSTER "this.RANDOMDIRECTIOn"
      switch (direction) {
        case 0: this.rockY -= speed; break; // Up
        case 1: this.rockY += speed; break; // Down
        case 2: this.rockX -= speed; break; // Left
        case 3: this.rockX += speed; break; // Right
      }
  
      requestAnimationFrame(moveRock); // Animate next frame
    };
  
    moveRock(); // START ROCK MOVEMENT
  
    console.log("Shooting a Rock");
  }

  blockShoot(){

    const playerHitBox = {
      x: this.player.pos.x,
      y: this.player.pos.y,
      width: this.player.pos.width,
      height: this.player.pos.height,
    };

    const rockHitBox = {
      x: this.rockX,
      y: this.rockY,
      width: this.rockSize,
      height: this.rockSize
    }

    const playerLooksAtMonster = 
    (this.randomDirection === 1 && this.player.pos.y > this.pos.y && this.player.facing == "w") ||  
    (this.randomDirection === 0 && this.player.pos.y < this.pos.y && this.player.facing == "s") ||  
    (this.randomDirection === 2 && this.player.pos.x < this.pos.x && this.player.facing == "d") ||  
    (this.randomDirection === 3 && this.player.pos.x > this.pos.x && this.player.facing == "a");

    if (
      playerHitBox.x < rockHitBox.x + rockHitBox.width &&
      playerHitBox.x + playerHitBox.width > rockHitBox.x &&
      playerHitBox.y < rockHitBox.y + rockHitBox.height &&
      playerHitBox.y + playerHitBox.height > rockHitBox.y && playerLooksAtMonster
    ) {
      this.blocked = true;
      console.log("Blocked");
    }
    
    else {
      this.blocked = false;

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
      this.enemyShoot();
    }

    else{
      this.canMove = true;
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

