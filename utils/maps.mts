import { BinaryHeap } from "https://deno.land/std@0.177.0/collections/binary_heap.ts";
import { memoize } from "./utility.mts";

export type Coordinate = readonly [row: number, col: number];
export type Primitive = string | number | boolean | bigint | boolean | symbol | null | undefined;

/**
 * A map interface for pathfinding algorithms.
 *
 * @template ValueT the type of value stored in the map for a given node.
 * @template NodeT the type for identifying a node
 * @template DistanceT the type representing the distance between two nodes
 */
export interface Graph<ValueT, NodeT, KeyT extends Primitive, DistanceT = number> {
  /**
   * Return all nodes in this map.
   */
  nodes(): NodeT[];

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

/**
 * A map backed by a two-dimensional array.
 *
 * By default,
 */
export class GridMap<T> implements Graph<T, Coordinate, number> {
  /** The map data */
  constructor(readonly data: T[][]) {}

  // IMap implementation

  nodes(): Coordinate[] {
    return this.data.flatMap((row, rowIndex) => row.map((_, colIndex) => [rowIndex, colIndex] as const));
  }

  valueAt(coord: Coordinate): T {
    return this.data[coord[0]][coord[1]];
  }

  keyFor(coord: Coordinate): number {
    return this.data[0].length * coord[0] + coord[1];
  }

  nodeFor(key: number): Coordinate {
    return [Math.floor(key / this.data.length), key % this.data.length];
  }

  distance(a: Coordinate, b: Coordinate): number {
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
  }

  neighbours(coord: Coordinate): Coordinate[] {
    return cardinalDirections(coord).filter((c) => this.validCoord(c));
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
  validCoord(coord: Coordinate) {
    return this.withinBounds(coord);
  }

  /**
   * Dumps this map to a string (for debugging)
   */
  dump(options?: { sep?: string; empty?: string; stringify?: (v: T) => string }) {
    return dumpMapData(this.data, options);
  }
}

export const enum Direction {
  North = 0,
  East,
  South,
  West,
}

export const DIRECTIONS = [Direction.North, Direction.East, Direction.South, Direction.West];

/**
 * Return a row/column delta for the given direction.
 */
export const directionDelta = (direction: Direction): Coordinate => {
  switch (direction) {
    case Direction.North:
      return [-1, 0];
    case Direction.East:
      return [0, 1];
    case Direction.South:
      return [1, 0];
    case Direction.West:
      return [0, -1];
  }
};

/**
 * Return the direction clockwise from a given direction.
 */
export const clockwise = (direction: Direction): Direction => {
  switch (direction) {
    case Direction.North:
      return Direction.East;
    case Direction.East:
      return Direction.South;
    case Direction.South:
      return Direction.West;
    case Direction.West:
      return Direction.North;
  }
};

export const numTurns = memoize((from: Direction, to: Direction): number => {
  let numTurns = 0;
  let dir1 = from;
  let dir2 = from;
  while (dir1 !== to && dir2 !== to) {
    dir1 = clockwise(dir1);
    dir2 = counterClockwise(dir2);
    numTurns += 1;
  }
  return numTurns;
});

/**
 * Return the direction counterclockwise from a given direction.
 */
export const counterClockwise = (direction: Direction): Direction => {
  switch (direction) {
    case Direction.North:
      return Direction.West;
    case Direction.West:
      return Direction.South;
    case Direction.South:
      return Direction.East;
    case Direction.East:
      return Direction.North;
  }
};

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
  map: Graph<ValueT, NodeT, KeyT, number>,
  options: {
    /** The nodes to start expanding from */
    startingNodes: NodeT[];

    /** Callback function for when we visit a node */
    process?: (map: Graph<ValueT, NodeT, KeyT, number>, node: NodeT, distance: number) => void;

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

const UNVISITED = Symbol("UNVISITED");

export function dijkstra<ValueT, NodeT, KeyT extends Primitive>(
  map: Graph<ValueT, NodeT, KeyT, number>,
  options: {
    source: NodeT;
    destination: NodeT;
    paths?: undefined;
  },
): number;
export function dijkstra<ValueT, NodeT, KeyT extends Primitive>(
  map: Graph<ValueT, NodeT, KeyT, number>,
  options: {
    source: NodeT;
    destination: NodeT;
    paths: "all";
  },
): [number, NodeT[][]];
export function dijkstra<ValueT, NodeT, KeyT extends Primitive>(
  map: Graph<ValueT, NodeT, KeyT, number>,
  options: {
    source: NodeT;
    destination: NodeT;
    paths: "any";
  },
): [number, NodeT[]];
/**
 * Dijkstra's algorithm to compute the shortest path between two nodes in a graph.
 *
 * Finds the shortest path between two nodes in a graph.
 *
 * @returns the shortest distance between the source and destination nodes, and the path to get there.
 *   Order in this array is the same as the order of the destinations in the input.
 */
export function dijkstra<ValueT, NodeT, KeyT extends Primitive>(
  map: Graph<ValueT, NodeT, KeyT, number>,
  options: {
    /** The node to start from */
    source: NodeT;

    /** The nodes considered a destination */
    destination: NodeT;

    /**
     * Whether or not to also find paths.
     *
     * If `any`, find and return any shortest path between the source and destination.
     * If `all`, find and return all shortest path between the source and destination.
     */
    paths?: "any" | "all";
  },
): number | [number, NodeT[] | NodeT[][]] {
  const queue = new BinaryHeap((a: [NodeT, number], b: [NodeT, number]) => {
    return a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0;
  });
  const distances = new Map<KeyT, number>();
  const previous = new Map<KeyT, KeyT[] | typeof UNVISITED>();
  const sourceKey = map.keyFor(options.source);
  const destinationKey = map.keyFor(options.destination);

  queue.push([options.source, 0]);

  for (const node of map.nodes()) {
    const nodeKey = map.keyFor(node);
    previous.set(nodeKey, UNVISITED);
    distances.set(nodeKey, nodeKey === sourceKey ? 0 : Infinity);
  }

  let shortestDistance = Infinity;
  while (queue.length > 0) {
    const [node, distance] = queue.pop()!;
    const nodeKey = map.keyFor(node);
    if (destinationKey == nodeKey) {
      shortestDistance = Math.min(shortestDistance, distance);
      continue;
    }

    const currentDistance = distances.get(nodeKey)!;
    if (distance > currentDistance) {
      continue;
    }

    for (const neighbour of map.neighbours(node)) {
      const neighbourKey = map.keyFor(neighbour);
      const newDistance = distance + map.distance(node, neighbour);
      const currentDistance = distances.get(neighbourKey)!;
      if (newDistance <= currentDistance) {
        const previousNodes = previous.get(neighbourKey);
        if (Array.isArray(previousNodes)) {
          previousNodes.push(nodeKey);
        } else {
          previous.set(neighbourKey, [nodeKey]);
        }

        if (newDistance < currentDistance) {
          distances.set(neighbourKey, newDistance);
          queue.push([neighbour, newDistance]);
        }
      }
    }
  }

  if (!options.paths) {
    return distances.get(destinationKey) ?? Infinity;
  }

  const allPaths = options.paths === "all";
  const paths: NodeT[][] = [];
  const currentPaths: NodeT[][] = [[]];
  const currentHeads = [options.destination];
  const currentHeadKeys = [destinationKey];
  while (currentHeads.length > 0) {
    const headsCopy = currentHeads.splice(0);
    const keysCopy = currentHeadKeys.splice(0);
    const pathsCopy = currentPaths.splice(0);
    keysCopy.forEach((key, index) => {
      if (key == sourceKey) {
        paths.push([...pathsCopy[index], options.source]);
        return;
      }

      const nextNodeKeys = previous.get(key);
      if (!nextNodeKeys || nextNodeKeys === UNVISITED) {
        return;
      }

      currentPaths.push([...pathsCopy[index], headsCopy[index]]);
      currentHeads.push(map.nodeFor(nextNodeKeys[0]));
      currentHeadKeys.push(nextNodeKeys[0]);
      if (allPaths) {
        for (const headKey of nextNodeKeys.slice(1)) {
          // console.log(map.nodeFor(key), map.nodeFor(headKey));
          currentPaths.push([...pathsCopy[index], headsCopy[index]]);
          currentHeads.push(map.nodeFor(headKey));
          currentHeadKeys.push(headKey);
        }
      }
    });
  }

  // There may be values in the previous map that aren't on the shortest path, so filter them out
  const shortestPaths = paths.filter((p) => {
    const pathLength = p.reduce((acc, node, index) => {
      if (index === 0) {
        return acc;
      }

      return acc + map.distance(p[index - 1], node);
    }, 0);
    return pathLength === shortestDistance;
  }).map((p) => p.reverse());

  return [distances.get(destinationKey) ?? Infinity, allPaths ? shortestPaths : (shortestPaths[0] ?? [])];
}
