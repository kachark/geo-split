import { test } from "@japa/runner";
import {
  splitLineString,
  splitPolygon,
  splitLineStringAntimeridian,
  splitPolygonAntimeridian,
} from "../src/index";
import { lineString, polygon } from "@turf/helpers";

test("splitLineString()", ({ assert }) => {
  // split at 0
  const test1 = lineString(
    [
      [-10, -10],
      [-10, 10],
      [10, 10],
      [10, -10],
      [-10, -10],
    ],
    { name: "test1" },
  );

  const ans1 = [
    [
      [-10, -10],
      [-10, 10],
      [0, 10],
    ],
    [
      [0, 10],
      [10, 10],
      [10, -10],
      [0, -10],
    ],
    [
      [0, -10],
      [-10, -10],
    ],
  ];

  // split at +180
  const test2 = lineString([
    [170, 2],
    [175, 4],
    [182, 8],
    [173, 7],
    [170, 2],
  ]);

  const ans2 = [
    [
      [170, 2],
      [175, 4],
      [180, 6.857142857142858],
    ],
    [
      [180, 6.857142857142858],
      [182, 8],
      [180, 7.777777777777778],
    ],
    [
      [180, 7.777777777777778],
      [173, 7],
      [170, 2],
    ],
  ];

  // split at -180
  const test3 = lineString([
    [-170, 2],
    [-175, 4],
    [-182, 8],
    [-173, 7],
    [-170, 2],
  ]);

  const ans3 = [
    [
      [-170, 2],
      [-175, 4],
      [-180, 6.857142857142858],
    ],
    [
      [-180, 6.857142857142858],
      [-182, 8],
      [-180, 7.777777777777778],
    ],
    [
      [-180, 7.777777777777778],
      [-173, 7],
      [-170, 2],
    ],
  ];

  assert.deepEqual(splitLineString(test1, 0).geometry.coordinates, ans1);
  assert.deepEqual(splitLineString(test2, 180).geometry.coordinates, ans2);
  assert.deepEqual(splitLineString(test3, -180).geometry.coordinates, ans3);
});

test("splitPolygon()", ({ assert }) => {
  // split at 0
  const test1 = polygon(
    [
      [
        [-10, -10],
        [-10, 10],
        [10, 10],
        [10, -10],
        [-10, -10],
      ],
    ],
    { name: "test1" },
  );

  const ans1 = [
    [
      [
        [-10, -10],
        [-10, 10],
        [0, 10],
        [0, -10],
        [-10, -10],
      ],
    ],
    [
      [
        [0, 10],
        [10, 10],
        [10, -10],
        [0, -10],
        [0, 10],
      ],
    ],
  ];

  // split at +180
  const test2 = polygon(
    [
      [
        [170, 2],
        [175, 4],
        [182, 8],
        [173, 7],
        [170, 2],
      ],
    ],
    { name: "test2" },
  );

  const ans2 = [
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
        [180, 6.857142857142858],
        [182, 8],
        [180, 7.777777777777778],
        [180, 6.857142857142858],
      ],
    ],
  ];

  // split at -180
  const test3 = polygon(
    [
      [
        [-170, 2],
        [-175, 4],
        [-182, 8],
        [-173, 7],
        [-170, 2],
      ],
    ],
    { name: "test3" },
  );

  const ans3 = [
    [
      [
        [-180, 6.857142857142858],
        [-182, 8],
        [-180, 7.777777777777778],
        [-180, 6.857142857142858],
      ],
    ],
    [
      [
        [-170, 2],
        [-175, 4],
        [-180, 6.857142857142858],
        [-180, 7.777777777777778],
        [-173, 7],
        [-170, 2],
      ],
    ],
  ];

  assert.deepEqual(splitPolygon(test1, 0).geometry.coordinates, ans1);
  assert.deepEqual(splitPolygon(test1, 0).properties.name, "test1");
  assert.deepEqual(splitPolygon(test2, 180).geometry.coordinates, ans2);
  assert.deepEqual(splitPolygon(test2, 180).properties.name, "test2");
  assert.deepEqual(splitPolygon(test3, -180).geometry.coordinates, ans3);
  assert.deepEqual(splitPolygon(test3, -180).properties.name, "test3");
});

test("splitPolygonAntimeridian()", ({ assert }) => {
  // Cross +180 and wrap
  const test1 = polygon(
    [
      [
        [170, 2],
        [175, 4],
        [-178, 8],
        [173, 7],
        [170, 2],
      ],
    ],
    { name: "test1" },
  );

  const ans1 = [
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
  ];

  // Cross -180 and wrap
  const test2 = polygon(
    [
      [
        [-170, 2],
        [-175, 4],
        [178, 8],
        [-173, 7],
        [-170, 2],
      ],
    ],
    { name: "test2" },
  );

  const ans2 = [
    [
      [
        [180, 6.857142857142858],
        [178, 8],
        [180, 7.777777777777778],
        [180, 6.857142857142858],
      ],
    ],
    [
      [
        [-170, 2],
        [-175, 4],
        [-180, 6.857142857142858],
        [-180, 7.777777777777778],
        [-173, 7],
        [-170, 2],
      ],
    ],
  ];

  assert.deepEqual(splitPolygonAntimeridian(test1).geometry.coordinates, ans1);
  assert.deepEqual(splitPolygonAntimeridian(test1).properties.name, "test1");
  assert.deepEqual(splitPolygonAntimeridian(test2).geometry.coordinates, ans2);
  assert.deepEqual(splitPolygonAntimeridian(test2).properties.name, "test2");
});

test("splitLineStringAntimeridian()", ({ assert }) => {
  // Cross +180 and wrap
  const test1 = lineString(
    [
      [170, 2],
      [175, 4],
      [-178, 8],
      [173, 7],
      [170, 2],
    ],
    { name: "test1" },
  );

  const ans1 = [
    [
      [170, 2],
      [175, 4],
      [180, 6.857142857142858],
    ],
    [
      [-180, 6.857142857142858],
      [-178, 8],
      [-180, 7.777777777777778],
    ],
    [
      [180, 7.777777777777778],
      [173, 7],
      [170, 2],
    ],
  ];

  // Cross -180 and wrap
  const test2 = lineString(
    [
      [-170, 2],
      [-175, 4],
      [178, 8],
      [-173, 7],
      [-170, 2],
    ],
    { name: "test2" },
  );

  const ans2 = [
    [
      [-170, 2],
      [-175, 4],
      [-180, 6.857142857142858],
    ],
    [
      [180, 6.857142857142858],
      [178, 8],
      [180, 7.777777777777778],
    ],
    [
      [-180, 7.777777777777778],
      [-173, 7],
      [-170, 2],
    ],
  ];

  const test3 = lineString(
    [
      [-45, 2],
      [-60, 2],
    ],
    { name: "test3" },
  );

  const ans3 = [
    [-45, 2],
    [-60, 2],
  ];

  assert.deepEqual(
    splitLineStringAntimeridian(test1).geometry.coordinates,
    ans1,
  );
  assert.deepEqual(splitLineStringAntimeridian(test1).properties.name, "test1");
  assert.deepEqual(
    splitLineStringAntimeridian(test2).geometry.coordinates,
    ans2,
  );
  assert.deepEqual(splitLineStringAntimeridian(test2).properties.name, "test2");
  assert.deepEqual(
    splitLineStringAntimeridian(test3).geometry.coordinates,
    ans3,
  );
  assert.deepEqual(splitLineStringAntimeridian(test3).properties.name, "test3");
});
