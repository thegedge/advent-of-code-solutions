import { chunk, intersection, sum } from "lodash-es";
import fs from "node:fs/promises";

const code = (s) => s.charCodeAt(0);
const codeLowerA = code("a");
const codeUpperA = code("A");
const isLower = (s) => s == s.toLowerCase();
const priority = (x) => 1 + code(x) + (isLower(x) ? -codeLowerA : 26 - codeUpperA);

const data = await fs.readFile("./3.in", "utf8");

// Part 1
console.log(
  data.split("\n\n").map((group) =>
    sum(
      group.split("\n").map((line) => {
        const n = line.length;
        const overlap = intersection(line.substring(0, n / 2).split(""), line.substring(n / 2).split(""));
        return priority(overlap[0]);
      })
    )
  )
);

// Part 2
console.log(
  data.split("\n\n").map((group) =>
    sum(
      chunk(group.split("\n"), 3).map(([a, b, c]) => {
        const overlap = intersection(a.split(""), b.split(""), c.split(""));
        return priority(overlap[0]);
      })
    )
  )
);
