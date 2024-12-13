export type Coordinate = [number, number];

export abstract class Map<T> {
  /** The map data */
  constructor(readonly data: T[][]) {}

  /**
   * A function to compute the neighbours at the given position
   *
   * The function can produce invalid coordinates (i.e., outside the map bounds). The underlying map functions
   * will ensure only valid coordinates are used.
   *
   * If coordinates need to wrap around edges, this should be done within the function.
   */
  protected abstract neighboursFor(coord: Coordinate): Coordinate[];

  /**
   * Filters the given set of coordinates to only those that are valid.
   */
  neighbours(coord: Coordinate) {
    return this.validCoords(this.neighboursFor(coord));
  }

  /**
   * Finds the coordinates in this map with the given value.
   */
  findCoords(value: T): Coordinate[] {
    const coordinates: Coordinate[] = [];
    for (let row = 0; row < this.data.length; ++row) {
      for (let col = 0; col < this.data[row].length; ++col) {
        if (this.data[row][col] === value) {
          coordinates.push([row, col]);
        }
      }
    }

    return coordinates;
  }

  /**
   * Returns whether or not the given row/column are within the bounds of this map's data.
   */
  withinBounds(coord: Coordinate) {
    return withinBounds(this.data, coord);
  }

  /**
   * Filters the given set of coordinates to only those that are valid.
   */
  validCoords(coords: Coordinate[]) {
    return coords.filter((coord) => this.withinBounds(coord));
  }

  /**
   * Dumps this map to a string (for debugging)
   */
  dump(options?: { sep?: string; empty?: string; stringify?: (v: T) => string }) {
    return dumpMapData(this.data, options);
  }
}

/** Returns an array of coordinates that are North, East, South, and West (that order) of the given coordinate */
export const cardinalDirections = ([row, col]: Coordinate): Coordinate[] => {
  return [
    [row + 1, col],
    [row, col + 1],
    [row - 1, col],
    [row, col - 1],
  ];
};

/**
 * Returns whether or not the given row/column are within the bounds of a given 2d array.
 */
export const withinBounds = (data: unknown[][], [row, col]: Coordinate) => {
  return row >= 0 && col >= 0 && row < data.length && col < data[row].length;
};

/**
 * Dump a map to a string (for debugging)
 */
export const dumpMapData = <T,>(data: T[][], options?: { columnSeparator?: string; empty?: string; stringify?: (v: T) => string }) => {
  const { columnSeparator = "", empty = ".", stringify = String } = options ?? {};
  return data.map((row) => row.map((v) => (v == null ? empty : stringify(v))).join(columnSeparator)).join("\n");
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
    startingCoords: Coordinate[];
  },
): (R | null)[][] => {
  const { process, startingCoords } = options;

  const visited = new Set<string>();
  const queue: [number, number][] = [...startingCoords];
  const processed: (R | null)[][] = map.data.map((row) => row.map(() => null));

  for (let distance = 0; queue.length > 0; ++distance) {
    queue.splice(0, queue.length).forEach((coord) => {
      const [row, col] = coord;
      const key = `${row},${col}`;
      if (visited.has(key)) {
        return;
      }
      visited.add(key);

      processed[row][col] = process(map, row, col, distance, processed);

      const next = map.neighbours(coord);
      queue.push(...next);
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
    startingCoords: Coordinate[];
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
      }).flatMap((coord) => {
        const next = map.neighbours(coord);
        return map.validCoords(next);
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
