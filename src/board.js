class Board {
  constructor(worldCtx, collisionCtx) {
    this.worldCtx = worldCtx; // Context for the world map
    this.collisionCtx = collisionCtx; // Context for the collision map
    this.overworld = new Image(); // Image for the world map
    this.overworld.src = "./dist/images/maps/overworld.png";
    this.collisionMap = new Image(); // Image for the collision map
    this.collisionMap.src = "./dist/images/maps/overworld-collision.png";

    this.caveMap = new Image();
    this.caveMap.src = "./dist/images/maps/luola2.png";

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

changeMap() {
  // Clear both the world and collision canvases
  this.worldCtx.clearRect(0, 0, this.worldCtx.canvas.width, this.worldCtx.canvas.height);
  this.collisionCtx.clearRect(0, 0, this.collisionCtx.canvas.width, this.collisionCtx.canvas.height);

  // Draw the cave map luola2.png to fit the canvas
  this.worldCtx.drawImage(
      this.caveMap,
      0, // Source x start of the image
      0, // Source y start of the image
      this.caveMap.width, // Source width entire image width
      this.caveMap.height, // Source height entire image height
      0, // Destination x start on canvas
      0, // Destination y start on canvas
      this.worldCtx.canvas.width, // Destination width fit canvas width
      this.worldCtx.canvas.height // Destination height fit canvas height
  );

  console.log("Changed map");
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
