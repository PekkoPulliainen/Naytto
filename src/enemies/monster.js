import Player from "../player/player.js";
import Hud from "../hud/hud.js";
import Sword from "../player/sword.js";
import * as Util from "../util/util.js";
import * as constants from "../util/constants.js";

class Monster {
  // SPIRTEX, SPRITEY ARE FOR MONSTER SPRITE POSITION, X AND Y ARE FOR MONSTER POSITION ON THE MAP
  constructor(
    ctx,
    collisionCtx,
    sword,
    player,
    spriteX = 0,
    spriteY = 0,
    x = 300,
    y = 300
  ) {
    this.ctx = ctx;
    this.collisionCtx = collisionCtx;
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

    this.shieldSound = new Audio();
    this.shieldSound.src = "./dist/sfx/shield-deflect.wav";
    this.shieldSound.volume = 0.1;

    this.player = player;

    this.canMove = false;
    this.canTakeDamage = false;

    this.canShoot = false;
    this.blocked = false;
    this.rockHit = false;

    this.shootingRock = new Image();
    this.shootingRock.src = "./dist/images/units/ROCK.png";

    this.collisionCtx = collisionCtx;

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
      this.canTakeDamage = true;
      this.canMove = true;
      this.canShoot = true;
    }, 1400);
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

  static spawnMonsters({
    spriteCtx,
    collisionCtx,
    sword,
    player,
    minX = 200,
    maxX = 500,
    minY = 200,
    maxY = 500,
    minMonsters = 2,
    maxMonsters = 5,
  }) {
    const monsters = [];
    const monsterPositions = [];
    const numberOfMonsters =
      Math.floor(Math.random() * (maxMonsters - minMonsters + 1)) + minMonsters;

    for (let i = 0; i < numberOfMonsters; i++) {
      let validPosition = false;
      let randomX, randomY;
      let attempts = 0;
      while (!validPosition && attempts < 50) {
        attempts++;
        randomX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
        randomY = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

        // Check all four corners for walls/water
        const corners = [
          [randomX, randomY],
          [randomX + 47, randomY],
          [randomX, randomY + 47],
          [randomX + 47, randomY + 47],
        ];
        let blocked = false;
        for (const [cx, cy] of corners) {
          const pixel = Util.getMapPixel(collisionCtx, cx, cy);
          const value = Util.sumArr(pixel);
          if (value === constants.WALL || value === constants.WATER) {
            blocked = true;
            break;
          }
        }
        if (blocked) continue;

        // Check for overlap with existing monsters
        let overlap = false;
        for (const pos of monsterPositions) {
          if (
            randomX < pos.x + 48 &&
            randomX + 48 > pos.x &&
            randomY < pos.y + 48 &&
            randomY + 48 > pos.y
          ) {
            overlap = true;
            break;
          }
        }
        if (!overlap) {
          validPosition = true;
          monsterPositions.push({ x: randomX, y: randomY });
        }
      }
      if (!validPosition) continue;

      // RANDOMIZE SPRITE SHEET POSITION
      const spriteX = Math.floor(Math.random() * 3);
      const spriteY = Math.floor(Math.random() * 4);

      // Create the monster
      const monster = new Monster(
        spriteCtx,
        collisionCtx,
        sword,
        player,
        spriteX,
        spriteY,
        randomX,
        randomY
      );
      if (spriteY === 0 || spriteY === 1) {
        monster.color = "red";
        monster.hpCount = 1;
        monster.IFrames = 0;
      } else if (spriteY === 2 || spriteY === 3) {
        monster.color = "blue";
        monster.hpCount = 2;
        monster.IFrames = 0;
      }
      monsters.push(monster);
    }
    return monsters;
  }

  // VIHUJEN LIIKKEELLE.
  monsterMovement() {
    if (!this.alive) return; // Don't move if the monster is dead
    if (!this.canMove || this.showSpawnEffect) return;

    if (!this.movementInterval && this.canMove) {
      this.randomDirection = Math.floor(Math.random() * 4);

      this.movementInterval = setInterval(() => {
        // UPDATE MOVEMENT IF MONSTER CAN MOVE
        if (this.canMove) {
          this.randomDirection = Math.floor(Math.random() * 4);
        }
      }, 1000);
    }

    let dx = 0,
      dy = 0;
    switch (this.randomDirection) {
      case 0:
        dy = -1;
        break; // up
      case 1:
        dy = 1;
        break; // down
      case 2:
        dx = -1;
        break; //left
      case 3:
        dx = 1;
        break; // right
    }

    // Calculate next position
    const nextX = this.pos.x + dx;
    const nextY = this.pos.y + dy;
    const w = this.pos.width;
    const h = this.pos.height;

    // Check all four corners of monster's hitbox
    const corners = [
      [nextX, nextY], //top-left
      [nextX + w - 1, nextY], //top-right
      [nextX, nextY + h - 1], // bottom-left
      [nextX + w - 1, nextY + h - 1], // bottom-right
    ];

    let blocked = false;
    for (const [cx, cy] of corners) {
      const pixel = Util.getMapPixel(this.collisionCtx, cx, cy);
      const value = Util.sumArr(pixel);
      if (value === constants.WALL || value === constants.WATER) {
        blocked = true;
        break;
      }
    }

    // Move the monster based on the current direction
    if (!blocked) {
      this.pos.x = nextX;
      this.pos.y = nextY;

      switch (this.randomDirection) {
        case 0:
          this.sprite.x = 96;
          this.direction = "up";
          break;
        case 1:
          this.sprite.x = 0;
          this.direction = "down";
          break;
        case 2:
          this.sprite.x = 48;
          this.direction = "left";
          break;
        case 3:
          this.sprite.x = 144;
          this.direction = "right";
          break;
      }
    }
  }

  drawRock() {
    if (this.rockIsMoving) {
      let angle = 0;
      switch (this.rockDirection) {
        case 0:
          angle = 0;
          break;
        case 1:
          angle = Math.PI;
          break;
        case 2:
          angle = -Math.PI / 2;
          break;
        case 3:
          angle = Math.PI / 2;
          break;
      }
      this.ctx.save();

      this.ctx.translate(
        this.rockX + this.rockSize / 2,
        this.rockY + this.rockSize / 2
      );
      this.ctx.rotate(angle);
      // Draw the rock after rotation
      this.ctx.drawImage(
        this.shootingRock,
        0,
        0,
        32,
        32,
        -this.rockSize / 2,
        -this.rockSize / 2,
        this.rockSize,
        this.rockSize
      );
      this.ctx.restore();
    }
  }

  enemyShoot() {
    if (!this.alive || this.rockIsMoving) return; // Prevent multiple shots
    if (!this.canShoot) return;

    this.rockIsMoving = true; // Flag to track active rock

    const rockSize = 28;
    this.rockX = this.pos.x + this.pos.width / 2 - rockSize / 2;
    this.rockY = this.pos.y + this.pos.height / 2 - rockSize / 2;
    this.rockHitBoxX = 24;
    this.rockHitBoxY = 24;
    this.rockSize = rockSize;

    this.canMove = false; // Stop monster movement while shooting

    this.rockDirection = this.randomDirection;

    const direction = this.rockDirection;
    const speed = 3; // PIXELS PER FRAME

    const shootFlyTime = 3000; // Duration the rock moves (in ms)
    const startTime = Date.now();

    const moveRock = () => {
      const shootTimer = Date.now() - startTime;

      if (this.blocked || shootTimer >= shootFlyTime || this.rockHit) {
        this.rockIsMoving = false;

        this.rockX = 0;
        this.rockY = 0;
        this.rockHitBoxX = 0;
        this.rockHitBoxY = 0;
        this.rockSize = null;
        this.canMove = true;
        this.canShoot = false;

        setTimeout(() => {
          this.canShoot = true;
        }, 2500);

        return;
      }

      // ROCK MOVES SAME WAY AS MONSTER "this.RANDOMDIRECTIOn"
      switch (direction) {
        case 0:
          this.rockY -= speed;
          break; // Up
        case 1:
          this.rockY += speed;
          break; // Down
        case 2:
          this.rockX -= speed;
          break; // Left
        case 3:
          this.rockX += speed;
          break; // Right
      }

      requestAnimationFrame(moveRock); // Animate next frame
    };

    moveRock(); // START ROCK MOVEMENT

    console.log("Shooting a Rock");
  }

  blockShoot() {
    const playerHitBox = {
      x: this.player.pos.x,
      y: this.player.pos.y,
      width: this.player.pos.width,
      height: this.player.pos.height,
    };

    const playerLooksAtMonster =
      (this.randomDirection === 1 &&
        this.player.pos.y > this.pos.y &&
        this.player.facing == "w") ||
      (this.randomDirection === 0 &&
        this.player.pos.y < this.pos.y &&
        this.player.facing == "s") ||
      (this.randomDirection === 2 &&
        this.player.pos.x < this.pos.x &&
        this.player.facing == "d") ||
      (this.randomDirection === 3 &&
        this.player.pos.x > this.pos.x &&
        this.player.facing == "a");

    if (
      playerHitBox.x < this.rockX + this.rockHitBoxX &&
      playerHitBox.x + playerHitBox.width > this.rockX &&
      playerHitBox.y < this.rockY + this.rockHitBoxY &&
      playerHitBox.y + playerHitBox.height > this.rockY &&
      playerLooksAtMonster
    ) {
      this.blocked = true;
      this.rockHit = false;
      this.shieldSound.play();
      console.log("Blocked");
      return;
    }

    if (
      playerHitBox.x < this.rockX + this.rockHitBoxX &&
      playerHitBox.x + playerHitBox.width > this.rockX &&
      playerHitBox.y < this.rockY + this.rockHitBoxY &&
      playerHitBox.y + playerHitBox.height > this.rockY &&
      !playerLooksAtMonster
    ) {
      this.rockHit = true;
      console.log("Player didnt block the rock");
      this.player.hP("damage", 0.5);
      this.hud.updateHearts(this.player.hpCount, this.player.maxHPCount);
      return;
    } else {
      this.blocked = false;
      this.rockHit = false;
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
      this.enemyShoot();
    } else {
      this.canMove = true;
    }
  }

  killmonster(normalAttack = false) {
    if (this.showSpawnEffect) return;
    // Check if the monster is alive
    if (!this.alive) return;

    // HITBOX FOR MONSTER
    const monsterHitBox = {
      x: this.pos.x,
      y: this.pos.y,
      width: this.pos.width,
      height: this.pos.height,
    };

    // SWORD HITBOX FROM SWORD.js
    const swordHitBox = {
      x: this.sword.swordHitBoxX,
      y: this.sword.swordHitBoxY,
      width: this.sword.swordHitBoxWidth,
      height: this.sword.swordHitBoxHeight,
    };

    // Beam hitbox
    const beamHitBox = {
      x: this.sword.beamHitBoxX,
      y: this.sword.beamHitBoxY,
      width: this.sword.beamWidth,
      height: this.sword.beamHeight,
    };

    // DETECT COLLISION FOR BEAM OR NORMAL ATTACK
    const collisionDetected = normalAttack
      ? Util.checkCollision(swordHitBox, monsterHitBox)
      : Util.checkCollision(beamHitBox, monsterHitBox);

    //console.log("Sword X: " + this.sword.swordX + " Sword Y: " + this.sword.swordY);
    /* this.ctx.strokeStyle = "red";
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

    this.ctx.strokeStyle = "purple";
    this.ctx.strokeRect(
      this.rockX,
      this.rockY,
      this.rockHitBoxX,
      this.rockHitBoxY
    ); */

    if (collisionDetected) {
      if (this.IFrames === 0) {
        this.hpCount -= this.sword.swordDamage;
        this.IFrames = 1;
        setTimeout(() => {
          this.IFrames = 0;
        }, 1250);
        if (this.hpCount === 0 || 0 > this.hpCount) {
          this.alive = false; // Mark the monster as dead
          this.pos.x = 0;
          this.pos.y = 0;
          this.width = 0;
          this.height = 0;
          this.showDeathEffect = true; // Show the death effect
          console.log("Monster killed!");
        }
        this.sword.enemyHit();
        if (this.canTakeDamage) this.hitEnemySound.play();
        console.log("Monster hit!");
        if (this.showDeathEffect) {
          setTimeout(() => {
            this.showDeathEffect = false;
          }, 100);
        }
      }
    }
  }

  hitPlayer() {
    if (!this.player.alive) return;

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
