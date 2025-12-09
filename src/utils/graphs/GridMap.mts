import {
  cardinalDirections,
  type Coordinate,
  dumpMapData,
  type Graph,
  type NeighbourFunction,
  withinBounds,
} from "./index.mts";

/**
 * A map backed by a two-dimensional array.
 *
 * By default,
 */
export class GridMap<T> implements Graph<T, Coordinate, number> {
  /** The map data */
  readonly data: T[][];

  /** The function to use to get the neighbours of a given coordinate */
  readonly neighbourFunction: NeighbourFunction<Coordinate>;

  constructor(data: T[][], neighbourFunction: NeighbourFunction<Coordinate> = cardinalDirections) {
    this.data = data;
    this.neighbourFunction = neighbourFunction;
  }

  // IMap implementation
  valueAt(coord: Coordinate): T {
    return this.data[coord[0]]?.[coord[1]];
  }

  setValueAt(coord: Coordinate, value: T): void {
    this.data[coord[0]][coord[1]] = value;
  }

  keyFor(coord: Coordinate): number {
    return this.data[0].length * coord[0] + coord[1];
  }

  nodeFor(key: number): Coordinate {
    const col = key % this.data[0].length;
    return [(key - col) / this.data[0].length, col];
  }

  edgeWeight(a: Coordinate, b: Coordinate): number {
    const dist = Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
    if (dist > 1 || !this.validCoord(a) || !this.validCoord(b)) {
      return Infinity;
    }
    return dist;
  }

  neighbours(coord: Coordinate): Coordinate[] {
    return this.neighbourFunction(coord).filter((c) => this.validCoord(c));
  }

  // GridMap-specific methods

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

  [Symbol.iterator]() {
    return this.nodesAndValues();
  }

  *nodes() {
    const height = this.data.length;
    const width = this.data[0].length;
    for (let row = 0; row < height; ++row) {
      for (let col = 0; col < width; ++col) {
        yield [row, col] as Coordinate;
      }
    }
  }

  nodesAndValues() {
    return this.nodes().map((node) => [node, this.valueAt(node)] as const);
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
