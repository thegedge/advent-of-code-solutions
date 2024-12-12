export type Coords = [number, number];
export type Map<T> = {
  data: T[][];
  neighbours: (map: Map<T>, row: number, col: number) => Coords[];
};

export const dumpMapData = <T,>(map: T[][], options: { sep?: string; empty?: string; stringify?: (v: T) => string }) => {
  const { sep = " ", empty = ".", stringify = String } = options;
  return map.map((row) => row.map((v) => (v == null ? empty : stringify(v))).join(sep)).join("\n");
};

export const findCoords = <T,>(map: Map<T>, value: T): Coords | null => {
  for (let row = 0; row < map.data.length; ++row) {
    for (let col = 0; col < map.data[row].length; ++col) {
      if (map.data[row][col] === value) {
        return [row, col];
      }
    }
  }

  return null;
};

export const validCoords = <T,>(map: Map<T>, coords: Coords[]) => {
  return coords.filter(([row, col]) => row >= 0 && col >= 0 && row < map.data.length && col < map.data[row].length);
};

/** Breadth-first search */
export const bfs = <T, R>(
  map: Map<T>,
  options: {
    process: (map: Map<T>, row: number, col: number, distance: number) => R;
    startingCoords: Coords;
  },
): (R | null)[][] => {
  const { process, startingCoords } = options;

  const visited = new Set<string>();
  const queue: [number, number][] = [startingCoords];
  const processed: (R | null)[][] = map.data.map((row) => row.map(() => null));

  for (let distance = 0; queue.length > 0; ++distance) {
    queue.splice(0, queue.length).forEach(([row, col]) => {
      const key = `${row},${col}`;
      if (visited.has(key)) {
        return;
      }
      visited.add(key);

      processed[row][col] = process(map, row, col, distance);

      const next = map.neighbours(map, row, col);
      queue.push(...validCoords(map, next));
    });
  }

  return processed;
};
