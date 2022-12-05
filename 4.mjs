import { sum } from "lodash-es";
import fs from "node:fs/promises";

const data = await fs.readFile("./4.in", "utf8");
const contains = (a, b, c, d) => (a >= c && b <= d) || (c >= a && d <= b);
const overlaps = (a, b, c, d) => (a >= c && a <= d) || (b >= c && b <= d) || (c >= a && c <= b) || (d >= a && d <= b);

// Part 1
console.log(
  data.split("\n\n").map((group) =>
    sum(
      group.split("\n").map((line) => {
        const [a, b, c, d] = line.split(/[-,]/).map(Number);
        return contains(a, b, c, d) ? 1 : 0;
      })
    )
  )
);

// Part 2
console.log(
  data.split("\n\n").map((group) =>
    sum(
      group.split("\n").map((line) => {
        const [a, b, c, d] = line.split(/[-,]/).map(Number);
        return overlaps(a, b, c, d) ? 1 : 0;
      })
    )
  )
);
