import { memoize } from "../utility.mts";

export type Coordinate = readonly [row: number, col: number];
export type Primitive = string | number | boolean | bigint | boolean | symbol | null | undefined;
export type NeighbourFunction<T> = (coord: T) => T[];

/**
 * A map interface for pathfinding algorithms.
 *
 * @template ValueT the type of value stored in the map for a given node.
 * @template NodeT the type for identifying a node
 * @template DistanceT the type representing the distance between two nodes
 */
export interface Graph<ValueT, NodeT, KeyT extends Primitive = Primitive, DistanceT = number> {
  /**
   * Get the valid neighbours for a given node
   */
  valueAt(node: NodeT): ValueT;

  /**
   * Convert the node into a representation that can be stored in a {@linkcode Map}
   */
  keyFor(node: NodeT): KeyT;

  /**
   * Convert the key representation back into a `NodeT`
   */
  nodeFor(key: KeyT): NodeT;

  /**
   * Get the weight of the edge between two nodes.
   */
  edgeWeight(a: NodeT, b: NodeT): DistanceT;

  /**
   * Get the valid neighbours for a given node
   */
  neighbours(node: NodeT): NodeT[];
}

export const NORTH = 0;
export const EAST = 1;
export const SOUTH = 2;
export const WEST = 3;
export type Direction = typeof NORTH | typeof EAST | typeof SOUTH | typeof WEST;

export const DIRECTIONS: Direction[] = [NORTH, EAST, SOUTH, WEST];

/**
 * Return a row/column delta for the given direction.
 */
export const directionDelta = (direction: Direction): Coordinate => {
  switch (direction) {
    case NORTH:
      return [-1, 0];
    case EAST:
      return [0, 1];
    case SOUTH:
      return [1, 0];
    case WEST:
      return [0, -1];
  }
};

/**
 * Return the direction clockwise from a given direction.
 */
export const clockwise = (direction: Direction): Direction => {
  switch (direction) {
    case NORTH:
      return EAST;
    case EAST:
      return SOUTH;
    case SOUTH:
      return WEST;
    case WEST:
      return NORTH;
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
    case NORTH:
      return WEST;
    case WEST:
      return SOUTH;
    case SOUTH:
      return EAST;
    case EAST:
      return NORTH;
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
export const dumpMapData = <T,>(
  data: T[][],
  options?: { columnSeparator?: string; empty?: string; stringify?: (v: T) => string }
) => {
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
