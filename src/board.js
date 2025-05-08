class Board {
  constructor(worldCtx, collisionCtx) {
    this.worldCtx = worldCtx; // Context for the world map
    this.collisionCtx = collisionCtx; // Context for the collision map
    this.overworld = new Image(); // Image for the world map
    this.overworld.src = "./dist/images/maps/overworld2.png";
    this.collisionMap = new Image(); // Image for the collision map
    this.collisionMap.src = "./dist/images/maps/overworld-collision2.png";

    this.pos = { x: 5376, y: 3528 }; // Initial position of the world map
  }

  setLocation(playerPos, worldPos, map, collisionMap) {
    // Set the location of the player and the world map
  }

  scroll(direction) {
    // Scroll the world map based on the direction
  }

  getMapPos() {
    return { x: this.pos.x / 768, y: (this.pos.y + 168) / 528 }; // Get the current map position
  }

  render() {
    this.drawWorld(); // Draw the world map
    this.drawCollisionMap(); // Draw the collision map
  }

  drawWorld() {
    this.worldCtx.drawImage(
      this.overworld,
      this.pos.x, // x axis anchor point
      this.pos.y, // y axis anchor point
      768, // width of the image to draw
      696, // height of the image to draw
      0, // x axis position on the canvas
      0, // y axis position on the canvas
      768, // width of the canvas
      696 // height of the canvas
    );
  }

  drawCollisionMap() {
    this.collisionCtx.drawImage(
      this.collisionMap,
      this.pos.x,
      this.pos.y,
      768,
      696,
      0,
      0,
      768,
      696
    );
  }
}

export default Board;
