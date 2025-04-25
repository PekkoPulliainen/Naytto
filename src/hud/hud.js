import * as Util from "../util/util.js";
import Player from "../player/player.js";

class Hud {
  constructor(ctx, player) {
    this.ctx = ctx;

    // PELAAJA

    this.player = player;

    this.menu = new Image();
    this.menu.src = "./dist/images/ui/menu.png"; // Menu image
    this.hudPosition = { x: 0, y: 0 }; // Position of the HUD on the canvas
    this.mapPosition = { x: 7, y: 7 };

    this.primaryItems = new Image();
    this.primaryItems.src = "./dist/images/items/primaryItems.png"; // Primary items image

    this.secondaryItems = new Image();
    this.secondaryItems.src = "./dist/images/items/secondaryItems.png"; // Secondary items image

    this.hearts = new Image();
    this.hearts.src = "./dist/images/items/hearts.png"; // Hearts image

    // FOR TESTING

    this.numbers = new Image();
    this.numbers.src = "./dist/images/ui/numbers.png"; // Numbers image

    this.startPage = new Image();
    this.startPage.src = "./dist/images/ui/start.png"; // Start page image
  }

  renderStartPage() {
    this.ctx.drawImage(this.startPage, 0, 0); // Draw the start page
  }

  clearStartPage() {
    this.ctx.clearRect(0, 0, 768, 696); // Clear the canvas
    this.render(); // Render the HUD after clearing the start page
  }

  render() {
    this.ctx.drawImage(
      this.menu,
      0,
      528,
      768,
      696,
      this.hudPosition.x,
      this.hudPosition.y,
      768,
      696
    );
    this.updateHearts(this.player.hpCount, this.player.maxHPCount); // Update hearts with a placeholder value
    this.updateMinimap(this.mapPosition);
    this.updateMoney(1);
    this.updateKeys(0);
    this.updateBombs(0);
    this.updatePrimary(0);
    this.updateSecondary(0);
  }
  updateHearts(hpCount, maxHPCount) {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(528, 96, 192, 48);

    for (let i = 0; i < maxHPCount; i++) {
      this.ctx.drawImage(
        this.hearts,
        i < hpCount - 0.5 ? 24 : i < hpCount ? 48 : 72,
        0,
        24,
        24,
        528 + 24 * i,
        96,
        26,
        24
      );
    }
  }

  updateMapPos(position) {
    this.mapPosition = position;
    return;
  }

  updateMinimap(mapPosition) {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(48, 24, 192, 48);
    this.ctx.fillStyle = "gray";
    this.ctx.fillRect(48, 48, 192, 96);
    this.ctx.fillStyle = "green";
    this.ctx.fillRect(51 + mapPosition.x * 12, 48 + mapPosition.y * 12, 9, 9);
  }

  updateMoney(money) {
    this.ctx.fillStyle = "black"; // Set fill color to black
    this.ctx.fillRect(320, 48, 48, 24); // Clear the money area
    let digits = Util.splitNum(money); // Split the money into digits
    digits.forEach((digit, i) => {
      // Loop through each digit
      this.ctx.drawImage(
        this.numbers,
        0 + 24 * digit, // Get the x position based on the digit
        0,
        24,
        24,
        312 + 24 * i, // Position the digits horizontally
        48,
        24,
        24
      );
    });
  }
  updateKeys(keys) {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(312, 96, 48, 24);
    let digits = Util.splitNum(keys);
    digits.forEach((digit, i) => {
      this.ctx.drawImage(
        this.numbers,
        0 + 24 * digit,
        0,
        24,
        24,
        312 + 24 * i,
        96,
        24,
        24
      );
    });
  }
  updateBombs(bombs) {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(312, 120, 48, 24);
    let digits = Util.splitNum(bombs);
    digits.forEach((digit, i) => {
      this.ctx.drawImage(
        this.numbers,
        0 + 24 * digit,
        0,
        24,
        24,
        312 + 24 * i,
        120,
        24,
        24
      );
    });
  }
  updatePrimary(primarySword) {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(380, 72, 32, 48);
    let indexes = Util.splitNum(primarySword);
    indexes.forEach((index, i) => {
      this.ctx.drawImage(
        this.primaryItems,
        0 + 24 * index,
        0,
        24,
        48,
        386 + 24 * i,
        72,
        24,
        48
      );
    });
  }
  updateSecondary(secondaryEquip) {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(450, 72, 32, 48);
    let indexes = Util.splitNum(secondaryEquip);
    indexes.forEach((index, i) => {
      this.ctx.drawImage(
        this.secondaryItems,
        0 + 24 * index,
        0,
        24,
        48,
        457 + 24 * i,
        72,
        24,
        48
      );
    });
  }
}

export default Hud;