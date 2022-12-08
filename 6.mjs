import { range, uniq } from "lodash-es";
import fs from "node:fs/promises";

const isMarker = (s) => uniq(s).length == s.length;
const firstMarker = (group, len) => range(group.length - len).find((i) => isMarker(group.substring(i, i + len))) + len;

const data = await fs.readFile("./6.in", "utf8");

// Part 1
console.log(data.split("\n").map((group) => firstMarker(group, 4)));

// Part 2
console.log(data.split("\n").map((group) => firstMarker(group, 14)));
