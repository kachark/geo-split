import { Position } from "@turf/helpers";

/**
 * Translates a list of Positions in the first dimension
 *
 * @param {Position[]} coords - list of coordinates
 * @param {number} x - distance to translate the first coordinate of each element in `coords`
 */
export function translateX(coords: Position[], x: number): Position[] {
  if (x === 0) {
    return coords;
  }

  const result = JSON.parse(JSON.stringify(coords));

  for (let i = 0; i < result.length; i++) {
    result[i][0] += x;
  }

  return result;
}
