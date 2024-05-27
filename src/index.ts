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
  Properties
} from '@turf/helpers';
import bboxClip from '@turf/bbox-clip';
import lineSplit from '@turf/line-split';

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
  x: number
): Feature<LineString, P> | Feature<MultiLineString, P> {
  let result = undefined;
  const splitter = lineString([
    [x, Number.MIN_SAFE_INTEGER],
    [x, Number.MAX_SAFE_INTEGER]
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
  x: number
): Feature<Polygon, P> | Feature<MultiPolygon, P> {
  let result = undefined;

  // Define bounding box from (MinNumber, x) in the x-direction and (MinNumber, MaxNumber) in the y-direction
  const bbox_left: [number, number, number, number] = [
    Number.MIN_SAFE_INTEGER,
    Number.MIN_SAFE_INTEGER,
    x,
    Number.MAX_SAFE_INTEGER
  ];
  // Define bounding box from (x, MaxNumber) in the x-direction and (MinNumber, MaxNumber) in the y-direction
  const bbox_right: [number, number, number, number] = [
    x,
    Number.MIN_SAFE_INTEGER,
    Number.MAX_SAFE_INTEGER,
    Number.MAX_SAFE_INTEGER
  ];

  // Clip parts of polygon that are not contained by bounding boxes and returns the contained portions
  const left_split = bboxClip(poly, bbox_left);
  const right_split = bboxClip(poly, bbox_right);

  if (right_split.geometry.coordinates.length > 0 && left_split.geometry.coordinates.length > 0) {
    result = multiPolygon(
      [
        left_split.geometry.coordinates as Position[][],
        right_split.geometry.coordinates as Position[][]
      ],
      poly.properties
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


