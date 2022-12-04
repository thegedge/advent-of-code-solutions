import { sum } from "lodash-es";
import fs from "node:fs/promises";

// (me - them) % 3 == 1
// 1 2 W
// 2 3 W
// 3 1 W

// (me - them) % 3 == 2
// 1 3 L
// 2 1 L
// 3 2 L

// (me - them) % 3 == 0
// 1 1 D
// 2 2 D
// 3 3 D

const CHOICE = { X: 1, Y: 2, Z: 3, A: 1, B: 2, C: 3 };
const data = await fs.readFile("./2.in", "utf8");
console.log(
  sum(
    data.split("\n").map((group) => {
      const [them, me] = group.split(" ").map((v) => CHOICE[v]);
      return me + 3 * ((me - them + 4) % 3);
    })
  )
);

console.log(
  sum(
    data.split("\n").map((group) => {
      const [them, me] = group.split(" ").map((v) => CHOICE[v]);
      return 3 * (me - 1) + ((them + me) % 3) + 1;
    })
  )
);
