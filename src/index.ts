import {
  type Feature,
  type Polygon,
  type MultiPolygon,
  type Position,
  type LineString,
  type MultiLineString,
  multiPolygon,
  lineString,
  multiLineString,
  Properties,
  polygon,
} from "@turf/helpers";
import bboxClip from "@turf/bbox-clip";
import lineSplit from "@turf/line-split";
import { diff } from "./math";
import { translateX } from "./ops";
import { unwrapLons, unwrapPolygonCoords } from "./unwrap";
import {
  isLineString,
  isMultiLineString,
  isMultiPolygon,
  isPolygon,
} from "./guards";

/*
 * Splits a geoJSON LineString by a vertical line defined by a value on the x-axis
 * and returns a MultiLineString. If no split is possible, returns the LineString
 *
 * @param {Feature<LineString>} line - line to split
 * @param {number} x - vertical line defined on the x-axis to act as the splitting line
 *
 * @example
 *
 *
 */
export function splitLineString<P = Properties>(
  line: Feature<LineString, P>,
  x: number,
): Feature<LineString, P> | Feature<MultiLineString, P> {
  if (!isLineString(line)) {
    return undefined;
  }

  let result = undefined;
  const splitter = lineString([
    [x, Number.MIN_SAFE_INTEGER],
    [x, Number.MAX_SAFE_INTEGER],
  ]);

  // Split is a FeatureCollection of LineStrings
  const split = lineSplit(line, splitter);

  // Convert FeatureCollection to MultiLineString
  if (split.features.length > 0) {
    const lines = [];
    for (const feature of split.features) {
      lines.push(feature.geometry.coordinates);
    }
    result = multiLineString(lines, line.properties);
  }

  if (split.features.length === 0) {
    result = line;
  }

  return result;
}

/**
 * Splits a geoJSON polygon by a vertical line defined by a value on the x-axis
 * and returns a MultiPolygon. If no split is possible, returns the original polygon
 *
 * Splitting is done by constructing two bounding boxes defined on either
 * side of the vertical line defined by x, clipping the given polygon with them,
 * and taking the clipped portions and placing them into a MultiPolygon
 *
 * @param {Feature<Polygon>} poly - polygon to split
 * @param {number} x - vertical line defined on the x-axis to act as the splitting line
 *
 * @example
 *
 *
 */
export function splitPolygon<P = Properties>(
  poly: Feature<Polygon, P>,
  x: number,
): Feature<Polygon, P> | Feature<MultiPolygon, P> {
  if (!isPolygon(poly)) {
    return undefined;
  }

  let result = undefined;

  // Define bounding box from (MinNumber, x) in the x-direction and (MinNumber, MaxNumber) in the y-direction
  const bbox_left: [number, number, number, number] = [
    Number.MIN_SAFE_INTEGER,
    Number.MIN_SAFE_INTEGER,
    x,
    Number.MAX_SAFE_INTEGER,
  ];
  // Define bounding box from (x, MaxNumber) in the x-direction and (MinNumber, MaxNumber) in the y-direction
  const bbox_right: [number, number, number, number] = [
    x,
    Number.MIN_SAFE_INTEGER,
    Number.MAX_SAFE_INTEGER,
    Number.MAX_SAFE_INTEGER,
  ];

  // Clip parts of polygon that are not contained by bounding boxes and returns the contained portions
  const left_split = bboxClip(poly, bbox_left);
  const right_split = bboxClip(poly, bbox_right);

  if (
    right_split.geometry.coordinates.length > 0 &&
    left_split.geometry.coordinates.length > 0
  ) {
    result = multiPolygon(
      [
        left_split.geometry.coordinates as Position[][],
        right_split.geometry.coordinates as Position[][],
      ],
      poly.properties,
    );
  }

  if (
    right_split.geometry.coordinates.length === 0 &&
    left_split.geometry.coordinates.length === 0
  ) {
    result = poly;
  }

  return result;
}

/**
 * Splits a Polygon along the antimeridian (+/-180 degrees).
 * If no split needed, returns the polygon
 *
 * Algorithm:
 * - remove discontinuities in longitude by unwrapping coordinates (ie. transform to cartesian)
 *   - split unwrapped polygons at either +/-180 in the horizontal axis
 *   - rewrap split polygon (ie. transform back to geographic coordinates)
 *
 * @param {Feature<Polygon>} poly - GeoJSON polygon given in geographic coordinates
 *
 */
export function splitPolygonAntimeridian<P = Properties>(
  poly: Feature<Polygon, P>,
): Feature<Polygon, P> | Feature<MultiPolygon, P> {
  if (!isPolygon(poly)) {
    return undefined;
  }

  // NOTE: for now consider the outer ring only
  const lons = poly.geometry.coordinates[0].map((lonlat) => lonlat[0]);

  // Identify if wrapping of polygon coords exist
  // Compute differences between longitudes
  const diffs = diff(lons);

  // NOTE: this is a naive approach. It may be better to check the concavity of the polygon

  // If any diffs between longitudes are greater than 180, +/-180 deg has been crossed
  let first_cross_ind = undefined;
  const crossed_antimeridian = diffs.some((d, ind) => {
    const crossed = Math.abs(d) > 180;
    if (crossed) {
      first_cross_ind = ind;
    }
    return crossed;
  });

  if (!crossed_antimeridian) {
    return poly;
  }

  // Get direction of wrapping
  // NOTE: assume only convex polygons and clockwise winding

  // For a convex CW wound polygon straddling 180 degrees,
  // there will be exactly two points where the coordinates wrap.
  // if coords cross +180 first and then -180 -> wrap occurs at +180 -> split at +180
  // if coords cross -180 first and then +180 -> wrap occurs at -180 -> split at +180
  let splitter = 180;
  if (diffs[first_cross_ind] > 180) {
    splitter = -180;
  }

  // Transform to cartesian coordinates
  const unwrapped = unwrapPolygonCoords(poly.geometry.coordinates);
  const unwrapped_poly = polygon(unwrapped, poly.properties);

  // Split polygon, return if polygon cannot be split
  const split = splitPolygon(unwrapped_poly, splitter);
  if (!isMultiPolygon(split)) {
    return poly;
  }

  // Translate polygons back o geographic coordinates
  for (
    let poly_ind = 0;
    poly_ind < split.geometry.coordinates.length;
    poly_ind++
  ) {
    for (
      let ring_ind = 0;
      ring_ind < split.geometry.coordinates[poly_ind].length;
      ring_ind++
    ) {
      const tmp = split.geometry.coordinates[poly_ind][ring_ind];
      const x_arr = tmp.map((pt) => pt[0]);
      const x_min = Math.min(...x_arr);
      const x_max = Math.max(...x_arr);

      if (x_min < -180) {
        split.geometry.coordinates[poly_ind][ring_ind] = translateX(
          split.geometry.coordinates[poly_ind][ring_ind],
          360,
        );
      } else if (x_max > 180) {
        split.geometry.coordinates[poly_ind][ring_ind] = translateX(
          split.geometry.coordinates[poly_ind][ring_ind],
          -360,
        );
      }
    }
  }

  return multiPolygon(split.geometry.coordinates, split.properties);
}

/**
 * Splits a LineString along the antimeridian (+/-180 degrees).
 * If no split needed, returns the LineString
 *
 * Algorithm:
 * - remove discontinuities in longitude by unwrapping coordinates (ie. transform to cartesian)
 *   - split unwrapped linestring at either +/-180 in the horizontal axis
 *   - rewrap split linestring (ie. transform back to geographic coordinates)
 *
 * @param {Feature<LineString>} line - GeoJSON linestring given in geographic coordinates
 *
 */
export function splitLineStringAntimeridian<P = Properties>(
  line: Feature<LineString, P>,
): Feature<LineString, P> | Feature<MultiLineString, P> {
  if (!isLineString(line)) {
    return undefined;
  }

  const lons = line.geometry.coordinates.map((lonlat) => lonlat[0]);

  // Identify if wrapping of coords exist
  // Compute differences between longitudes
  const diffs = diff(lons);

  // NOTE: this is a naive approach. It may be better to check the concavity of the polygon

  // If any diffs between longitudes are greater than 180, +/-180 deg has been crossed
  let first_cross_ind = undefined;
  const crossed_antimeridian = diffs.some((d, ind) => {
    const crossed = Math.abs(d) > 180;
    if (crossed) {
      first_cross_ind = ind;
    }
    return crossed;
  });

  if (!crossed_antimeridian) {
    return line;
  }

  // Get direction of wrapping
  // if coords cross +180 first and then -180 -> wrap occurs at +180 -> split at +180
  // if coords cross -180 first and then +180 -> wrap occurs at -180 -> split at +180
  let splitter = 180;
  if (diffs[first_cross_ind] > 180) {
    splitter = -180;
  }

  // Transform to cartesian coordinates
  const unwrapped = unwrapLons(
    line.geometry.coordinates as Array<[number, number]>,
  );
  const unwrapped_line = lineString(unwrapped, line.properties);

  // Split line
  const split = splitLineString(unwrapped_line, splitter);
  if (!isMultiLineString(split)) {
    return line;
  }

  // Translate line back o geographic coordinates
  for (
    let line_ind = 0;
    line_ind < split.geometry.coordinates.length;
    line_ind++
  ) {
    const tmp = split.geometry.coordinates[line_ind];
    const x_arr = tmp.map((pt) => pt[0]);
    const x_min = Math.min(...x_arr);
    const x_max = Math.max(...x_arr);

    if (x_min < -180) {
      split.geometry.coordinates[line_ind] = translateX(
        split.geometry.coordinates[line_ind],
        360,
      );
    } else if (x_max > 180) {
      split.geometry.coordinates[line_ind] = translateX(
        split.geometry.coordinates[line_ind],
        -360,
      );
    }
  }

  return multiLineString(split.geometry.coordinates, split.properties);
}
