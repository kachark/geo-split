/**
 * Returns the discrete differences between elements in a given number array
 * @name along
 * @param {number[]} arr - source array
 * @example
 *
 *
 */
export function diff(arr: number[]): number[] {
  const result = [];
  for (let i = 1; i < arr.length; i++) {
    result.push(arr[i] - arr[i - 1]);
  }
  return result;
}

/**
 * Returns the cumulative sum of elements in an array
 * @param {number[]} arr - source array
 * @returns {number[]} cumulative sum of elements in the array
 * @example
 *
 *
 */
export function cumsum(arr: number[]): number[] {
  if (arr.length === 0) {
    return [];
  }

  const result = [arr[0]];

  for (let i = 1; i < arr.length; ++i) {
    result.push(arr[i] + result[i - 1]);
  }

  return result;
}

/**
 * Returns the remainder of a floating point division
 * @param {number} a - dividend
 * @param {number} b - divisor
 */
export function fmod(a: number, b: number): number {
  return Number((a - Math.floor(a / b) * b).toPrecision(8));
}
