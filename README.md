# geo-split

`geo-split` is a small set of utilities to split GeoJSON geometries given in geographic coordinates.
This includes handling for discontinuities at -180,180 degrees longitude.

<img src="https://github.com/kachark/geo-split/blob/main/static/polygon_split.png" width="533" height="400">

Most GeoJSON renderers cannot distinguish the user intent for polygons with coordinates 
that cross -180/180 degrees longitude. Due to this, renderers will often opt to wrap the polygon around the world,
producing unintended visual artifacts. `geo-split` fixes this by splitting polygons around these discontinuities.

## Installation
```
npm i geo-split
```

## Example
Consider the polygon which crosses the antimeridian:

```
const polygon = {
  geometry: {
    coordinates: [
      [
        [170, 2],
        [175, 4],
        [-178, 8],
        [173, 7],
        [170, 2]
      ]
    ],
    type: "Polygon"
  },
  type: "Feature"
};

```

The split polygon now straddles the antimeridian:
```
const split = splitPolygonAntimeridian(polygon);

{
  geometry: {
    coordinates: [
      [
        [
          [170, 2],
          [175, 4],
          [180, 6.857142857142858],
          [180, 7.777777777777778],
          [173, 7],
          [170, 2],
        ],
      ],
      [
        [
          [-180, 6.857142857142858],
          [-178, 8],
          [-180, 7.777777777777778],
          [-180, 6.857142857142858],
        ],
      ],
    ],
    type: "MultiPolygon"
  },
  type: "Feature"
}
```

## Dependencies
* @turf/bbox-clip,
* @turf/helpers
* @turf/line-split
