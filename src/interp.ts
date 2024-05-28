import { unwrapLons } from "./unwrap";

/**
 * Returns the linearly interpolated value for two
 * monotonically increasing sample points, evaluated at x
 *
 * @param {number} x - x-coordinate to evaluate the interpolant
 * @param {number[]} xp - x-coordinates of the sample points, must be increasing
 * @param {number[]} fp - y-coordinates of the sample points
 *
 * @example
 *
 */
export function interp(
  x: number,
  xp: number[],
  fp: number[],
): number | undefined {
  if (xp.length !== 2 || fp.length !== 2) {
    return undefined;
  }

  if (xp[0] === x[1]) {
    return undefined;
  }

  const x0 = xp[0];
  const y0 = fp[0];
  const x1 = xp[1];
  const y1 = fp[1];

  if (x1 === x0 && y1 === y0) {
    return y0;
  }

  const slope = (y1 - y0) / (x1 - x0);
  const y = slope * (x - x0) + y0;
  return y;
}

/**
 * Returns the linearly interpolated latitude/longitude coordinates for two
 * sample latitude/longitude coordinates, evaluated at time t
 *
 * @param {number} t - evaluation time
 * @param {[number, number]} tp - discrete sample times
 * @param {[number, number]} coords_p - lat/lon coodinate samples cooresponding to each sample time
 *
 * @example
 *
 */
export function interpLonLat(
  t: number,
  tp: number[],
  coords_p: Array<number[]>,
): number[] | undefined {
  let lon = undefined;
  const t0 = tp[0];
  const coords0 = coords_p[0];
  const lat0 = coords0[1];
  const t1 = tp[1];
  const coords1 = coords_p[1];
  const lat1 = coords1[1];

  if (t0 === t1) {
    return undefined;
  }

  // Unwrap coordinates to remove discontinuities at [-180, 180]
  const unwrapped = unwrapLons([coords0, coords1]);
  const unwrapped_lon0 = unwrapped[0][0];
  const unwrapped_lon1 = unwrapped[1][0];

  // Interpolate longitude wrt time t
  lon = interp(t, [t0, t1], [unwrapped_lon0, unwrapped_lon1]);

  // Wrap longitude back to geographic coordinates
  if (lon < -180) {
    lon += 360;
  } else if (lon > 180) {
    lon -= 360;
  }

  // Interpolate latitude wrt time t
  const lat = interp(t, [t0, t1], [lat0, lat1]);

  if (lat === undefined || lon === undefined) {
    return undefined;
  }

  return [lon, lat];
}

/**
 * Returns the linearly interpolated latitude/longitude coordinates for a collection
 * of latitude/longitude coordinates, evaluated at time t
 *
 * @param {number} t - evaluation time
 * @param {[number, number]} tp - discrete sample times
 * @param {[number, number]} coords_p - lat/lon coodinate samples cooresponding to each sample time
 *
 * @example
 *
 */
export function interpLonLatBatch(
  t: number,
  tp: [number, number],
  coords_p: Array<Array<[number, number]>>,
): Array<[number, number]> {
  const result = [];

  if (tp.length !== coords_p.length) {
    return undefined;
  }

  if (tp[0] === tp[1]) {
    return undefined;
  }

  const coords_t0 = coords_p[0];
  const coords_t1 = coords_p[1];

  if (coords_t0.length !== coords_t1.length) {
    return undefined;
  }

  for (let k = 0; k < coords_t0.length; ++k) {
    const lonlat_k_t0 = coords_t0[k];
    const lonlat_k_t1 = coords_t1[k];
    const lonlat_k_t = interpLonLat(t, tp, [lonlat_k_t0, lonlat_k_t1]);
    if (lonlat_k_t === undefined) {
      return undefined;
    }
    result.push(lonlat_k_t);
  }

  return result;
}
