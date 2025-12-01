export const inputMapper = (data: string) => {
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

export const solvePart1 = (data: ReturnType<typeof inputMapper>) => {
  const XMAS = ["X", "M", "A", "S"];
  const XMAS_DIRECTIONS = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
    [-1, 0],
    [0, -1],
  ];

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

  return countAllXmas(data);
};

export const solvePart2 = (data: ReturnType<typeof inputMapper>) => {
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

  return countAllMas(data);
};
