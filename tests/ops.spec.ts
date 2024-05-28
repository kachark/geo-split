import { test } from "@japa/runner";
import { translateX } from "../src/ops";

test("translateX()", ({ assert }) => {
  // shift +20
  const test1 = [
    [170, 2],
    [175, 4],
    [-178, 8],
    [173, 7],
    [170, 2],
  ];

  const ans1 = [
    [190, 2],
    [195, 4],
    [-158, 8],
    [193, 7],
    [190, 2],
  ];

  // shift -20
  const test2 = [
    [170, 2],
    [175, 4],
    [-178, 8],
    [173, 7],
    [170, 2],
  ];

  const ans2 = [
    [150, 2],
    [155, 4],
    [-198, 8],
    [153, 7],
    [150, 2],
  ];

  assert.deepEqual(translateX(test1, 20), ans1);
  assert.deepEqual(translateX(test2, -20), ans2);
});
