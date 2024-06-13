# geo-split

`geo-split` is a small set of utilities to split GeoJSON geometries given in geographic coordinates.
This includes handling for discontinuities at -180,180 degrees longitude.

## Example
### Before
Consider the polygon which crosses the antimeridian:

```
{
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
}
```

Most GeoJSON renderers cannot distinguish the intent for this polygon to cross the antimeridian and will
typically be rendered as follows, wrapping around the world:
![Before](https://github.com/kachark/geo-split/blob/main/static/polygon.png?raw=true)

### After
`geo-split` can split the polygon and return consituent polygons which straddle the antimeridian.
The resulting geometry is now:

```
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


![After](https://github.com/kachark/geo-split/blob/main/static/split_polygon_antimeridian.png?raw=true)

## Dependencies
* @turf/bbox-clip,
* @turf/helpers
* @turf/line-split
