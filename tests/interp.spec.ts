import { test } from "@japa/runner";
import { interp, interpLonLat, interpLonLatBatch } from "../src/interp";

test("interp()", ({ assert }) => {
  const test1_x = 2;
  const test1_xp = [0, 4];
  const test1_fp = [0, 4];

  const test2_x = 9;
  const test2_xp = [2, 10];
  const test2_fp = [8, 3];

  const test3_x = 5;
  const test3_xp = [0, 10];
  const test3_fp = [-315, 360];

  assert.equal(interp(test1_x, test1_xp, test1_fp), 2); // (2, 2)
  assert.equal(interp(test2_x, test2_xp, test2_fp), 3.625); // (9, 3.65)
  assert.equal(interp(test3_x, test3_xp, test3_fp), 22.5); // (5, 22.5)
});

test("interpLonLat()", ({ assert }) => {
  const test1_t = 5;
  const test1_tp = [0, 10];
  const test1_coords: Array<[number, number]> = [
    [45.0, 45.0],
    [90.0, 90.0],
  ];

  const test2_t = 5;
  const test2_tp = [0, 10];
  const test2_coords: Array<[number, number]> = [
    [45.0, 45.0],
    [180.0, 90.0],
  ];

  const test3_t = 5;
  const test3_tp = [0, 10];
  const test3_coords: Array<[number, number]> = [
    [-45.0, 45.0],
    [180.0, 90.0],
  ];

  const test4_t = 5;
  const test4_tp = [0, 10];
  const test4_coords: Array<[number, number]> = [
    [-178.0, 45.0],
    [178.0, 45.0],
  ];

  const test5_t = 5;
  const test5_tp = [0, 10];
  const test5_coords: Array<[number, number]> = [
    [178.0, 45.0],
    [-178.0, 45.0],
  ];

  const test6_t = 5;
  const test6_tp = [0, 10];
  const test6_coords: Array<[number, number]> = [
    [179.0, 18.0],
    [-170.0, 23.0],
  ];

  assert.deepEqual(interpLonLat(test1_t, test1_tp, test1_coords), [67.5, 67.5]);
  assert.deepEqual(
    interpLonLat(test2_t, test2_tp, test2_coords),
    [112.5, 67.5],
  );
  assert.deepEqual(
    interpLonLat(test3_t, test3_tp, test3_coords),
    [-112.5, 67.5],
  );
  assert.deepEqual(interpLonLat(test3_t, test4_tp, test4_coords), [-180, 45.0]);
  assert.deepEqual(interpLonLat(test5_t, test5_tp, test5_coords), [180, 45.0]);
  assert.deepEqual(
    interpLonLat(test6_t, test6_tp, test6_coords),
    [-175.5, 20.5],
  );
});

test("interpLonLatBatch()", ({ assert }) => {
  const test1_t = 5;
  const test1_tp: [number, number] = [0, 10];
  const test1_coords_t0: Array<[number, number]> = [
    [45.0, 45.0],
    [45.0, 45.0],
    [180.0, 0.0],
    [45.0, -45.0],
  ];
  const test1_coords_t1: Array<[number, number]> = [
    [90.0, 90.0],
    [360.0, 90.0],
    [90.0, 90.0],
    [360.0, 90.0],
  ];
  const test1_coords_list = [test1_coords_t0, test1_coords_t1];
  const test1_correct = [
    [67.5, 67.5],
    [22.5, 67.5],
    [135, 45],
    [22.5, 22.5],
  ];

  const test2_t = 1686842399267;
  const test2_tp: [number, number] = [1686842378284, 1686842408284];
  const test2_coords_t0: Array<[number, number]> = [[179, 18]];
  const test2_coords_t1: Array<[number, number]> = [[-179, 23]];
  const test2_coords_list = [test2_coords_t0, test2_coords_t1];
  const test2_correct = [[-179.60113333333334, 21.497166666666665]];

  assert.deepEqual(
    interpLonLatBatch(test1_t, test1_tp, test1_coords_list),
    test1_correct,
  );
  assert.deepEqual(
    interpLonLatBatch(test2_t, test2_tp, test2_coords_list),
    test2_correct,
  );
});
