import { isEqual, sum } from "lodash-es";
import fs from "node:fs/promises";

const data = await fs.readFile("./13.in", "utf8");

const ensureArray = (v) => (Array.isArray(v) ? v : [v]);

const compare = (left, right) => {
  let lindex = 0;
  let rindex = 0;
  for (; lindex < left.length && rindex < right.length; ++lindex, ++rindex) {
    const lval = left[lindex];
    const rval = right[rindex];

    const lvalNumber = typeof lval == "number";
    const rvalNumber = typeof rval == "number";
    if (lvalNumber && rvalNumber) {
      if (lval < rval) {
        return -1;
      } else if (lval > rval) {
        return 1;
      }
    } else {
      const result = compare(ensureArray(lval), ensureArray(rval));
      if (result !== 0) {
        return result;
      }
    }
  }

  if (lindex == left.length && rindex == right.length) {
    return 0;
  } else if (lindex == left.length) {
    return -1;
  } else {
    return 1;
  }
};

// Part 1
console.log(
  data.split("\n---\n").map((scenario) => {
    return sum(
      scenario.split("\n\n").map((pair, index) => {
        const [left, right] = pair.split("\n").map((v) => eval(v)); // thank you, eval ((((:
        return compare(left, right) == -1 ? index + 1 : 0;
      })
    );
  })
);

// Part 2
console.log(
  data.split("\n---\n").map((scenario) => {
    const pairs = scenario.split("\n\n").flatMap((pair, index) => {
      return pair.split("\n").map((v) => eval(v));
    });

    const a = [[2]];
    const b = [[6]];
    const packets = [a, b, ...pairs];
    packets.sort(compare);
    return (packets.findIndex((v) => isEqual(a, v)) + 1) * (packets.findIndex((v) => isEqual(b, v)) + 1);
  })
);
