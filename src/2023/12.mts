import { readFile } from "node:fs/promises";

const groups = (await readFile(new URL("", import.meta.url.replace(".mts", ".in")).pathname, "utf-8")).split("\n\n");

const readData = (data: string) => {
  return data.split("\n").map((line) => {
    //
  });
};

const solvePart1 = () => {
  const results = groups.map(readData).map((hands) => {
    //
  });

  console.log(results);
};

const solvePart2 = () => {
  const results = groups.map(readData).map((hands) => {
    //
  });

  console.log(results);
};

solvePart1();
solvePart2();
