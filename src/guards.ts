import {
  Feature,
  LineString,
  MultiLineString,
  MultiPolygon,
  Polygon,
} from "@turf/helpers";

export function isPolygon(
  poly: Feature<Polygon> | Feature<MultiPolygon>,
): poly is Feature<Polygon> {
  return (poly as Feature<Polygon>).geometry.type === "Polygon";
}

export function isMultiPolygon(
  poly: Feature<Polygon> | Feature<MultiPolygon>,
): poly is Feature<MultiPolygon> {
  return (poly as Feature<MultiPolygon>).geometry.type === "MultiPolygon";
}

export function isLineString(
  line: Feature<LineString> | Feature<MultiLineString>,
): line is Feature<LineString> {
  return (line as Feature<LineString>).geometry.type === "LineString";
}

export function isMultiLineString(
  line: Feature<LineString> | Feature<MultiLineString>,
): line is Feature<MultiLineString> {
  return (line as Feature<MultiLineString>).geometry.type === "MultiLineString";
}
