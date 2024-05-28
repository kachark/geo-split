import { test } from "@japa/runner";
import { unwrap, unwrapLons, unwrapPolygonCoords } from "../src/unwrap";

test("unwrap()", ({ assert }) => {
  const test1 = [179, -179, -179, 179, 179];
  const test1_period = 360;

  const test2 = [177, 175, 172, -179, -45, 177];
  const test2_period = 360;

  const test3 = [0, 1, 2, -1, 0];
  const test3_period = 4;

  const test4 = [1, 2, 3, 4, 5, 6, 1, 2, 3];
  const test4_period = 6;

  const test5 = [2, 3, 4, 5, 2, 3, 4, 5];
  const test5_period = 4;

  const test6 = [
    -180, -140, -100, -60, -20, 20, 60, 100, 140, -180, -140, -100, -60, -20,
    20, 60, 100, 140, -180,
  ];
  const test6_period = 360;

  assert.deepEqual(unwrap(test1, test1_period), [179, 181, 181, 179, 179]);
  assert.deepEqual(unwrap(test2, test2_period), [177, 175, 172, 181, 315, 177]);
  assert.deepEqual(unwrap(test3, test3_period), [0, 1, 2, 3, 4]);
  assert.deepEqual(unwrap(test4, test4_period), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.deepEqual(unwrap(test5, test5_period), [2, 3, 4, 5, 6, 7, 8, 9]);
  assert.deepEqual(
    unwrap(test6, test6_period),
    [
      -180, -140, -100, -60, -20, 20, 60, 100, 140, 180, 220, 260, 300, 340,
      380, 420, 460, 500, 540,
    ],
  );
});

test("unwrapLons()", ({ assert }) => {
  const test1: number[][] = [
    [179, 0],
    [-179, 0],
    [-179, 1],
    [179, 1],
    [179, 0],
  ];

  const ans1 = [
    [179, 0],
    [181, 0],
    [181, 1],
    [179, 1],
    [179, 0],
  ];

  const test2: number[][] = [
    [-180, 0],
    [-140, 0],
    [-100, 0],
    [-60, 0],
    [-20, 0],
    [20, 0],
    [60, 0],
    [100, 0],
    [140, 0],
    [-180, 0],
    [-140, 0],
    [-100, 0],
    [-60, 0],
    [-20, 0],
    [20, 0],
    [60, 0],
    [100, 0],
    [140, 0],
    [-180, 0],
  ];

  const ans2: number[][] = [
    [-180, 0],
    [-140, 0],
    [-100, 0],
    [-60, 0],
    [-20, 0],
    [20, 0],
    [60, 0],
    [100, 0],
    [140, 0],
    [180, 0],
    [220, 0],
    [260, 0],
    [300, 0],
    [340, 0],
    [380, 0],
    [420, 0],
    [460, 0],
    [500, 0],
    [540, 0],
  ];

  assert.deepEqual(unwrapLons(test1), ans1);
  assert.deepEqual(unwrapLons(test2), ans2);
});

test("unwrapPolygonCoords()", ({ assert }) => {
  const test1: number[][][] = [
    [
      [-170, 0],
      [170, 0],
      [-170, 10],
      [170, 10],
    ],
    [
      [-175, 0],
      [175, 0],
      [-175, 10],
      [175, 10],
    ],
  ];

  const ans1 = [
    [
      [-170, 0],
      [-190, 0],
      [-170, 10],
      [-190, 10],
      [-170, 0],
    ],
    [
      [-175, 0],
      [-185, 0],
      [-175, 10],
      [-185, 10],
      [-175, 0],
    ],
  ];

  const test2: number[][][] = [
    [
      [-170, 0],
      [170, 0],
      [-170, 10],
      [170, 10],
    ],
    [
      [-175, 0],
      [175, 0],
      [-175, 10],
      [175, 10],
    ],
    [
      [-177, 0],
      [-179, 0],
      [-177, 10],
      [-179, 10],
    ],
  ];

  const ans2 = [
    [
      [-170, 0],
      [-190, 0],
      [-170, 10],
      [-190, 10],
      [-170, 0],
    ],
    [
      [-175, 0],
      [-185, 0],
      [-175, 10],
      [-185, 10],
      [-175, 0],
    ],
    [
      [-177, 0],
      [-179, 0],
      [-177, 10],
      [-179, 10],
      [-177, 0],
    ],
  ];

  assert.deepEqual(unwrapPolygonCoords(test1), ans1);
  assert.deepEqual(unwrapPolygonCoords(test2), ans2);
});
