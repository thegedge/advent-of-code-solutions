export type Coords = [number, number];
export type Map<T> = {
  /** The map data */
  data: T[][];

  /**
   * A function to compute the neighbours at the given position
   *
   * The function can produce invalid coordinates (i.e., outside the map bounds). The underlying map functions
   * will ensure only valid coordinates are used.
   *
   * If coordinates need to wrap around edges, this should be done within the function.
   */
  neighbours: (map: Map<T>, row: number, col: number) => Coords[];
};

export const dumpMapData = <T,>(map: T[][], options?: { sep?: string; empty?: string; stringify?: (v: T) => string }) => {
  const { sep = " ", empty = ".", stringify = String } = options ?? {};
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

export const findAllCoords = function* <T>(map: Map<T>, value: T): Generator<Coords> {
  for (let row = 0; row < map.data.length; ++row) {
    for (let col = 0; col < map.data[row].length; ++col) {
      if (map.data[row][col] === value) {
        yield [row, col];
      }
    }
  }
};

export const withinBounds = (data: unknown[][], row: number, col: number) => {
  return row >= 0 && col >= 0 && row < data.length && col < data[row].length;
};

export const validCoords = <T,>(map: Map<T>, coords: Coords[]) => {
  return coords.filter(([row, col]) => withinBounds(map.data, row, col));
};

/**
 * Breadth-first search
 *
 * Good general purpose search algorithm. Can be used to find the shortest path between two points,
 * inefficiently for long paths though.
 */
export const bfs = <T, R>(
  map: Map<T>,
  options: {
    process: (map: Map<T>, row: number, col: number, distance: number, processed: (R | null)[][]) => R;
    startingCoords: Coords[];
  },
): (R | null)[][] => {
  const { process, startingCoords } = options;

  const visited = new Set<string>();
  const queue: [number, number][] = [...startingCoords];
  const processed: (R | null)[][] = map.data.map((row) => row.map(() => null));

  for (let distance = 0; queue.length > 0; ++distance) {
    queue.splice(0, queue.length).forEach(([row, col]) => {
      const key = `${row},${col}`;
      if (visited.has(key)) {
        return;
      }
      visited.add(key);

      processed[row][col] = process(map, row, col, distance, processed);

      const next = map.neighbours(map, row, col);
      queue.push(...validCoords(map, next));
    });
  }

  return processed;
};

/**
 * Depth-first search.
 *
 * Useful for computing multiple distinct paths by backtracking, since the Nth path to some node will
 * have access to the computations of the (N-1) previous paths to reach a node.
 */
export const dfs = <T, R>(
  map: Map<T>,
  options: {
    process: (map: Map<T>, row: number, col: number, distance: number, processed: (R | null)[][]) => R;
    startingCoords: Coords[];
  },
): (R | null)[][] => {
  const { process, startingCoords } = options;

  const visited = new Set<string>();
  const queue: [number, number][] = [...startingCoords];
  const toVisit: [number, number][][] = [];
  const processed: (R | null)[][] = map.data.map((row) => row.map(() => null));

  while (queue.length > 0) {
    const nodes = queue.splice(
      0,
      queue.length,
      ...queue.filter(([row, col]) => {
        const key = `${row},${col}`;
        if (visited.has(key)) {
          return false;
        }

        visited.add(key);
        return true;
      }).flatMap(([row, col]) => {
        const next = map.neighbours(map, row, col);
        return validCoords(map, next);
      }),
    );
    toVisit.push(nodes);
  }

  for (let distance = toVisit.length - 1; distance >= 0; --distance) {
    for (const [row, col] of toVisit[distance]) {
      processed[row][col] = process(map, row, col, distance, processed);
    }
  }

  return processed;
};
