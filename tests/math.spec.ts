import { test } from "@japa/runner";
import { diff, cumsum } from "../src/math";

test("diff()", ({ assert }) => {
  assert.deepEqual(diff([0, 1, 2, 3]), [1, 1, 1]);
  assert.deepEqual(diff([179, -179, -179, 179, 179]), [-358, 0, 358, 0]);
  assert.deepEqual(diff([-10, -9, -1, 0]), [1, 8, 1]);
  assert.deepEqual(diff([]), []);
  assert.deepEqual(diff([0, 0, 0, 0, 1, 0]), [0, 0, 0, 1, -1]);
});

test("cumsum()", ({ assert }) => {
  assert.deepEqual(cumsum([0, 1, 2, 3]), [0, 1, 3, 6]);
  assert.deepEqual(cumsum([0, 0, 0, 0]), [0, 0, 0, 0]);
  assert.deepEqual(cumsum([-3, -2, -1, 0]), [-3, -5, -6, -6]);
});
