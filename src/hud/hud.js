import * as Util from "../util/util.js";

class Hud {
  constructor(ctx) {
    this.ctx = ctx;
    this.menu = new Image();
    this.menu.src = "./dist/images/ui/menu.png"; // Menu image
    this.hudPosition = { x: 0, y: 0 }; // Position of the HUD on the canvas

    this.primaryItems = new Image();
    this.primaryItems.src = "./dist/images/items/primaryItems.png"; // Primary items image

    this.secondaryItems = new Image();
    this.secondaryItems.src = "./dist/images/items/secondaryItems.png"; // Secondary items image

    this.hearts = new Image();
    this.hearts.src = "./dist/images/items/hearts.png"; // Hearts image
    this.maxHPCount = 6; // Maximum health points

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
    this.updateHearts(6); // Update hearts with a placeholder value
    this.updateMinimap({ x: 7, y: 7 });
    this.updateMoney(99);
    this.updateKeys(0);
    this.updateBombs(0);
    this.updatePrimary(0);
    this.updateSecondary(0);
  }
  updateHearts(hpCount) {
    this.ctx.fillStyle = "black"; // Set fill color to black
    this.ctx.fillRect(528, 96, 192, 48); // Clear the heart area
    for (let i = 0; i < this.maxHPCount / 2; i++) {
      // Loop through half the max HP count
      this.ctx.drawImage(
        this.hearts,
        i < hpCount ? 24 : 72, // Draw filled, half heart or empty heart based on hpCount
        0,
        24,
        24,
        528 + 24 * i, // Position the hearts vertically
        96,
        26,
        24
      ); // Draw hearts
    }
  }

  updateMinimap(mapPos) {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(48, 24, 192, 48);
    this.ctx.fillStyle = "gray";
    this.ctx.fillRect(48, 48, 192, 96);
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
