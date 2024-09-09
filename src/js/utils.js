export function calcTileType(index, boardSize) {
  if (!index) {
    return 'top-left';
  }
  if (index === boardSize - 1) {
    return 'top-right';
  }
  if (!Math.floor(index / (boardSize - 1))) {
    return 'top';
  }
  if (index === boardSize * boardSize - boardSize) {
    return 'bottom-left';
  }
  if (index === boardSize * boardSize - 1) {
    return 'bottom-right';
  }
  if (!(index % boardSize)) {
    return 'left';
  }
  if (!((index + 1) % boardSize)) {
    return 'right';
  }
  if (Math.floor(index / (boardSize * boardSize - boardSize))) {
    return 'bottom';
  }
  return 'center';
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}

export function randomFromRange(from, to) {
  const rangeLength = to - from + 1;

  return Math.floor(Math.random() * rangeLength) + from;
}
