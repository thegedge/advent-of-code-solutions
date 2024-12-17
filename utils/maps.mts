export type Coordinate = [number, number];
export type Primitive = string | number | boolean | bigint | boolean | symbol | null | undefined;

/**
 * A map interface for pathfinding algorithms.
 *
 * @template ValueT the type of value stored in the map for a given node.
 * @template NodeT the type for identifying a node
 * @template DistanceT the type representing the distance between two nodes
 */
export interface IMap<ValueT, NodeT, KeyT extends Primitive, DistanceT = number> {
  /**
   * Get the valid neighbours for a given node
   */
  valueAt(node: NodeT): ValueT;

  /**
   * Convert the node into a representation that can be stored in a {@linkcode Map}
   */
  keyFor(node: NodeT): KeyT;

  /**
   * Convert the key-ified representation back into a `NodeT`
   */
  nodeFor(key: KeyT): NodeT;

  /**
   * Get the distance between two nodes.
   */
  distance(a: NodeT, b: NodeT): DistanceT;

  /**
   * Get the valid neighbours for a given node
   */
  neighbours(node: NodeT): NodeT[];
}

export class GridMap<T> implements IMap<T, Coordinate, number> {
  /** The map data */
  constructor(readonly data: T[][]) {}

  // IMap implementation

  valueAt(coord: Coordinate): T {
    return this.data[coord[0]][coord[1]];
  }

  keyFor(coord: Coordinate): number {
    return this.data.length * coord[0] + coord[1];
  }

  nodeFor(key: number): Coordinate {
    return [Math.floor(key / this.data.length), key % this.data.length];
  }

  distance(a: Coordinate, b: Coordinate): number {
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
  }

  neighbours(coord: Coordinate): Coordinate[] {
    return cardinalDirections(coord).filter((coord) => this.withinBounds(coord));
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
   * Run a function for each value in this map.
   */
  forEach(callback: (value: T, coord: Coordinate) => void) {
    for (let row = 0; row < this.data.length; ++row) {
      for (let col = 0; col < this.data[row].length; ++col) {
        callback(this.data[row][col], [row, col]);
      }
    }
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

/** Returns an array of coordinates in the cardinal directions of the given coordinate.
 *
 * The returned coordinates are ordered North, East, South, and West.
 */
export const cardinalDirections = ([row, col]: Coordinate): Coordinate[] => {
  return [
    [row - 1, col],
    [row, col + 1],
    [row + 1, col],
    [row, col - 1],
  ];
};

/**
 * Returns an array of coordinates that surround the given coordinate.
 *
 * The returned coordinates start at the topleft and proceed clockwise.
 */
export const surroundingDirections = ([row, col]: Coordinate): Coordinate[] => {
  return [
    [row - 1, col - 1],
    [row - 1, col],
    [row - 1, col + 1],
    [row, col - 1],
    [row, col + 1],
    [row + 1, col - 1],
    [row + 1, col],
    [row + 1, col + 1],
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

type Run = [start: number, length: number];

/**
 * Find horizontal runs in a grid.
 *
 * A run is any sequence of adjacent cells that have a truthy.
 *
 * @returns a mapping from the center of the run to its half-length
 */
export const findHorizontalRuns = (data: unknown[]): Run[] => {
  const runs: Run[] = [];
  let runStart: number | null = null;
  for (let index = 0; index < data.length; ++index) {
    if (data[index]) {
      runStart ??= index;
    } else if (runStart !== null) {
      const length = index - runStart;
      runs.push([runStart, length]);
      runStart = null;
    }
  }
  return runs;
};

/**
 * Breadth-first search
 *
 * Good general purpose search algorithm.
 *
 * Can be used to find the shortest path between two points if the distance between nodes
 * is always 1. In theory, capable of doing so otherwise, but hasn't been built for that.
 *
 * @returns a mapping from the node to the shortest distance to that node
 */
export function bfs<ValueT, NodeT, KeyT extends Primitive>(
  map: IMap<ValueT, NodeT, KeyT, number>,
  options: {
    /** The nodes to start expanding from */
    startingNodes: NodeT[];

    /** Callback function for when we visit a node */
    process?: (map: IMap<ValueT, NodeT, KeyT, number>, node: NodeT, distance: number) => void;

    /**
     * If `true`, keep visiting nodes regardless of whether or not they were previously visited.
     *
     * **DANGER** only set to `true` if the map is acyclic, otherwise you'll get an infinite loop.
     *
     * @default false
     */
    ignoreVisited?: boolean;
  },
): Map<KeyT, number> {
  const { process, startingNodes, ignoreVisited = false } = options;

  const visited = new Map<KeyT, number>();
  const queue: [NodeT, number][] = startingNodes.map((n) => [n, 0]);

  while (queue.length > 0) {
    queue.splice(0, queue.length).forEach(([node, distance]) => {
      const key = map.keyFor(node);
      const currentDistance = visited.get(key);
      if (!ignoreVisited && currentDistance !== undefined) {
        visited.set(key, Math.min(currentDistance, distance));
        return;
      }

      visited.set(key, distance);
      process?.(map, node, distance);

      const next = map.neighbours(node);
      queue.push(...next.map((neighbour): [NodeT, number] => {
        return [neighbour, distance + map.distance(node, neighbour)];
      }));
    });
  }

  return visited;
}
