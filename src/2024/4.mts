import { readFile } from "node:fs/promises";

const groups = (await readFile(new URL("", import.meta.url.replace(".mts", ".in")).pathname, "utf-8")).split("\n\n");
const readData = (data: string) => {
  return data.split("\n");
};

const search = (data: string[], x: number, y: number, deltaX: number, deltaY: number, chars: string[]) => {
  for (const char of chars) {
    if (x < 0 || x >= data[0].length || y < 0 || y >= data.length) {
      return false;
    }

    if (data[y][x] !== char) {
      return false;
    }

    x += deltaX;
    y += deltaY;
  }

  return true;
};

const solvePart1 = () => {
  const XMAS = ["X", "M", "A", "S"];
  const XMAS_DIRECTIONS = [[1, 0], [0, 1], [1, 1], [1, -1], [-1, 1], [-1, -1], [-1, 0], [0, -1]];

  const countAllXmas = (data: string[]) => {
    let count = 0;

    for (let y = 0; y < data.length; y++) {
      for (let x = 0; x < data[y].length; x++) {
        for (const [deltaX, deltaY] of XMAS_DIRECTIONS) {
          if (search(data, x, y, deltaX, deltaY, XMAS)) {
            count++;
          }
        }
      }
    }

    return count;
  };

  const results = groups.map(readData).map((group) => {
    return countAllXmas(group);
  });

  console.log(results);
};

const solvePart2 = () => {
  const MAS = ["M", "A", "S"];

  const countAllMas = (data: string[]) => {
    let count = 0;

    for (let y = 0; y < data.length - 2; y++) {
      for (let x = 0; x < data[y].length - 2; x++) {
        const a = search(data, x, y, 1, 1, MAS) ? 1 : 0;
        const b = search(data, x + 2, y, -1, 1, MAS) ? 1 : 0;
        const c = search(data, x, y + 2, 1, -1, MAS) ? 1 : 0;
        const d = search(data, x + 2, y + 2, -1, -1, MAS) ? 1 : 0;

        if (a + b + c + d === 2) {
          count++;
        }
      }
    }

    return count;
  };

  const results = groups.map(readData).map((group) => {
    return countAllMas(group);
  });

  console.log(results);
};

solvePart1();
solvePart2();
