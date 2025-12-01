import { identity, max, orderBy, sum, take } from "lodash-es";
import fs from "node:fs/promises";

const data = await fs.readFile("./1.in", "utf8");
const elfAmounts = data.split("\n\n").map((group) => {
  return sum(group.split("\n").map((line) => Number(line)));
});

console.log(max(elfAmounts));
console.log(sum(take(orderBy(elfAmounts, identity, "desc"), 3)));
