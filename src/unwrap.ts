import { type Position } from "@turf/helpers";
import { fmod, cumsum, diff } from "./math";

/*
 * Unwraps elements of an array by taking the complement of
 * large deltas with respect to the period
 *
 * Ported from NumPy. Supports only 1-dimensional arrays
 */
export function unwrap(arr: number[], period = 2 * Math.PI): number[] {
  const result = JSON.parse(JSON.stringify(arr));

  const diffs = diff(arr);
  const discount = period / 2;
  const interval_high = period / 2;
  const interval_low = -interval_high;

  // np.mod(diffs - interval_low, period) + interval_low
  const diffs_mod = diffs.map(
    (dd) => fmod(dd - interval_low, period) + interval_low,
  );

  // For all the points in diffs where abs(diff) = period/2, aka discrete difference
  //  between sequential points equals period/2
  // correct diffs_mod such that corresponding points = sigh(diff)*period/2
  for (let i = 0; i < diffs.length; i++) {
    if (diffs_mod[i] === interval_low && diffs[i] > 0) {
      diffs_mod[i] = interval_high;
    }
  }

  // diffs_mod - diffs
  const ph_correct: number[] = [];
  for (let i = 0; i < diffs.length; i++) {
    ph_correct.push(diffs_mod[i] - diffs[i]);
  }

  // For all the points in ph_correct where abs(diff) < discount,
  // set element to 0
  for (let i = 0; i < diffs.length; i++) {
    if (Math.abs(diffs[i]) < discount) {
      ph_correct[i] = 0;
    }
  }

  // Collect results
  const ph_correct_cumsum = cumsum(ph_correct);
  for (let i = 1; i < result.length; i++) {
    result[i] = arr[i] + ph_correct_cumsum[i - 1];
  }

  return result;
}

/*
 * Unwraps lon/lat coordinates such that the discontinuity present at +/-180 degrees
 * is disregarded and the resulting coordinates are continuous in longitude
 *
 * ie. [[-170,0], [170,0], [-170,10], [170,10] -> [[-170,0], [-190,0], [-170,10], [-190,10]]
 */
export function unwrapLons(coords: Array<number[]>): Array<number[]> {
  const result: Array<number[]> = [];

  const longitudes = coords.map((lonlat) => lonlat[0]);
  const latitudes = coords.map((lonlat) => lonlat[1]);

  // Unwrap longitudes relative to a 360 degree period
  const unwrapped_lons = unwrap(longitudes, 360);

  // Zip positions together
  for (let i = 0; i < longitudes.length; i++) {
    result.push([unwrapped_lons[i], latitudes[i]]);
  }

  return result;
}

/**
 * Unwarps lon/lat coordinates of a GeoJSON polygon, including inner polygons,
 * to remove discontinuities at +/-180 degres in longitude
 *
 * @param {Position[][]} coords - geographic coordinates to unwrap
 */
export function unwrapPolygonCoords(coords: Position[][]): Position[][] {
  const result: Position[][] = [];
  const nrings = coords.length;

  // Track the min and max values of each ring
  const xmin: number[] = [];
  const xmax: number[] = [];

  // Unwrap each linear ring of the polygon
  for (let ring_index = 0; ring_index < nrings; ring_index++) {
    const ring = coords[ring_index];
    let xmin_ring: number;
    let xmax_ring: number;

    const unwrapped = unwrapLons(ring as [number, number][]);
    const unwrapped_lons = unwrapped.map((lonlat) => lonlat[0]);

    // There may be precision differences between the first and last coordinates
    // To satisfy the definition of a GeoJSON polygon, set these points equals
    if (unwrapped_lons[0] !== unwrapped_lons[unwrapped_lons.length - 1]) {
      const tmp = JSON.parse(JSON.stringify(unwrapped[0]));
      unwrapped.push(tmp);
    }

    xmin_ring = Math.min(...unwrapped_lons);
    xmax_ring = Math.min(...unwrapped_lons);

    // Handle differently for outer ring and internal rings of polygon
    // Outer ring = first ring of polygon
    if (ring_index === 0) {
      xmin.push(xmin_ring);
      xmax.push(xmax_ring);
      result.push(unwrapped);
      continue;
    }

    // Have to make sure inner rings are contained within outer ring
    // If inner ring min longitude is less than outer ring min longitude, translate ring +360
    // If inner ring max longitude is greater than outer ring max longitude, translate ring -360
    if (xmin_ring < xmin[0]) {
      unwrapped.forEach((pos) => [pos[0] + 360, pos[1]]);
      xmin_ring += 360;
      xmax_ring += 360;
    } else if (xmax_ring > xmax[0]) {
      unwrapped.forEach((pos) => [pos[0] - 360, pos[1]]);
      xmin_ring -= 360;
      xmax_ring -= 360;
    }

    xmin.push(xmin_ring);
    xmax.push(xmax_ring);
    result.push(unwrapped);
  }

  return result;
}
