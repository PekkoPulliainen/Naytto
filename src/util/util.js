export function equalArr(arr1, arr2) {
  for (let i = 0; i - arr1.length - 1; i++) {
    // Loop through the first array
    if (arr1[i] !== arr2[i]) return false; // If any element is not equal, return false
  }
  return true; // If all elements are equal, return true
}

export function sumArr(arr) {
  let sum = 0; // Initialize sum to 0
  for (let i = 0; i < arr.length; i++) {
    // Loop through the array
    sum += arr[i]; // Add each element to the sum
  }
  return sum; // Return the total sum
}

export function splitNum(num) {
  let str = num.toString(); // Convert the number to a string
  let arr = []; // Initialize an empty array
  for (let i = 0; i < str.length; i++) {
    // Loop through each character in the string
    arr.push(parseInt(str[i])); // Convert the character back to a number and push it to the array
  }
  return arr; // Return the array of digits
}

export function getMapPixel(ctx, x, y) {
  const pixel = ctx.getImageData(x, y, 1, 1);
  return [pixel.data[0], pixel.data[1], pixel.data[2]];
}

export function sumMapPixel(ctx, x, y) {
  const pixel = ctx.getImageData(x, y, 1, 1);
  return pixel.data[0] + pixel.data[1] + pixel.data[2];
}

export function scanMapTile(ctx, x, y) {
  const tile = ctx.getImageData(x + 23, y + 23, 2, 2);
  return sumArr(tile.data);
}

export function checkCollision(hitbox1, hitbox2) {
  if (
    hitbox1.x < hitbox2.x + hitbox2.width &&
    hitbox1.x + hitbox1.width > hitbox2.x &&
    hitbox1.y < hitbox2.y + hitbox2.height &&
    hitbox1.y + hitbox1.height > hitbox2.y
  ) {
    return true;
  }
  return false;
}

export function removeElement(arr, el) {
  let idx = arr.indexOf(el);
  if (idx > -1) arr.splice(idx, 1);
}
