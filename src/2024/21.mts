import { cartesianProduct, range, sumOf } from "../utils/collections.mts";
import { dijkstra } from "../utils/graphs/dijkstra.mts";
import { GridMap } from "../utils/graphs/GridMap.mts";
import { type Coordinate, type Graph } from "../utils/graphs/index.mts";
import { id } from "../utils/utility.mts";

export const inputMapper = (data: string) => {
  return data.split("\n");
};

type KeyPadNode = Digit | "A" | " ";

class KeyPad extends GridMap<KeyPadNode> {
  constructor() {
    super([
      ["7", "8", "9"],
      ["4", "5", "6"],
      ["1", "2", "3"],
      [" ", "0", "A"],
    ]);
  }

  override validCoord(coord: Coordinate): boolean {
    return super.validCoord(coord) && this.valueAt(coord) !== " ";
  }
}

type DirectionNode = Direction | "A" | " ";

class DirectionalPad extends GridMap<DirectionNode> {
  constructor() {
    super([
      [" ", "^", "A"],
      ["<", "v", ">"],
    ]);
  }

  override validCoord(coord: Coordinate): boolean {
    return super.validCoord(coord) && this.valueAt(coord) !== " ";
  }
}

// Nodes on this graph are composed of all of the robot-controlled pads
// The human-controlled pad acts more as an edge.
//
// For example, let's say we're in the starting position of `AAA` and we press `<` on the
// human-controlled pad. We are now in state `AA^`.
//
// A more interesting example would be if dirpad 2 is on `A`. In that scenario, dirpad 1 will do
// its action. Some example transitions if we press `A` on the human-controlled dirpad:
//   1. `A<A` -> `0<A` (dirpad 1 moves the keypad to the left)
//   1. `5^A` -> `8^A` (dirpad 1 moves itself to the left)
//
// In other words, we have a "hypergraph", composed of multiple underlying graphs, and the edges
// between them are labeled with action taken on the human-controlled pad.
//
type SystemNode = [keypad: Coordinate, ...Coordinate[]];

class System implements Graph<string, SystemNode, bigint, number> {
  readonly keypad = new KeyPad();
  readonly directions = new DirectionalPad();

  private readonly numDirPads: number;

  constructor(numDirPads: number) {
    this.numDirPads = numDirPads;
  }

  nodes(): SystemNode[] {
    const keyNodes = this.keypad.nodes();
    const dirNodes = this.directions.nodes();
    // TODO infer tuple type from number of args, to avoid having to do this cast
    return cartesianProduct(keyNodes, dirNodes, dirNodes).toArray() as SystemNode[];
  }

  keyFor(node: SystemNode): bigint {
    // 11 nodes for keypad = 4 bits
    // 5 nodes for directions = 3 bits
    return node.reduce((key, value, index) => {
      if (index == 0) {
        return BigInt(this.keypad.keyFor(value));
      }
      return (key << 3n) | BigInt(this.directions.keyFor(value));
    }, 0n);
  }

  valueAt(node: SystemNode): string {
    return this.keypad.valueAt(node[0]) + this.directions.valueAt(node[1]) + this.directions.valueAt(node[2]);
  }

  nodeFor(key: bigint): SystemNode {
    const result = new Array<Coordinate>(this.numDirPads + 1) as SystemNode;
    for (let i = this.numDirPads; i > 0; --i) {
      result[i] = this.directions.nodeFor(Number(key & 0b111n));
      key >>= 3n;
    }
    result[0] = this.keypad.nodeFor(Number(key));
    return result;
  }

  /**
   * Find the key that was pressed to take us from node a to node b.
   */
  keypress(a: SystemNode, b: SystemNode): Direction | "A" | null {
    const akeys = a.map((v, index) => (index == 0 ? this.keypad.keyFor(v) : this.directions.keyFor(v)));
    const bkeys = b.map((v, index) => (index == 0 ? this.keypad.keyFor(v) : this.directions.keyFor(v)));

    const diffs = akeys.map((v, index) => v !== bkeys[index]);
    const numDifferences = diffs.filter((x) => x).length;

    if (numDifferences > 1) {
      // We have edges between two types of nodes
      //   1. The keypad moves, in which case all dpads should stay the same.
      //   2. A dpad moves, in which case we should see a difference in just one dpad.
      //
      // If more than one thing changes, it's an impossible move, so we return an infinite edge weight.
      return null;
    }

    if (numDifferences === 0 || !diffs[diffs.length - 1]) {
      return "A";
    }

    return movement(a[a.length - 1], b[b.length - 1]);
  }

  edgeWeight(a: SystemNode, b: SystemNode): number {
    const akeys = a.map((v, index) => (index == 0 ? this.keypad.keyFor(v) : this.directions.keyFor(v)));
    const bkeys = b.map((v, index) => (index == 0 ? this.keypad.keyFor(v) : this.directions.keyFor(v)));

    const diffs = akeys.map((v, index) => v !== bkeys[index]);
    const numDifferences = diffs.filter((x) => x).length;

    if (numDifferences > 1) {
      // We have edges between two types of nodes
      //   1. The keypad moves, in which case all dpads should stay the same.
      //   2. A dpad moves, in which case we should see a difference in just one dpad.
      //
      // If more than one thing changes, it's an impossible move, so we return an infinite edge weight.
      return Infinity;
    }

    const indexWithDiff = diffs.findIndex(id);
    if (indexWithDiff >= 0 && indexWithDiff < a.length - 1) {
      const delta = movement(a[indexWithDiff], b[indexWithDiff]);
      return delta === this.directions.valueAt(a[indexWithDiff + 1]) ? 1 : Infinity;
    }

    // No difference, or difference on the last keypad, which was human controlled and requires one button press.
    // We don't check edge validity though (so this would be wrong if we moved from "A" to "<").
    return 1;
  }

  neighbours(node: SystemNode): SystemNode[] {
    const neighbours: SystemNode[] = [];

    // Simulate what happens if the human presses activate
    const firstNonActivate = node.findLastIndex(
      (v, index) => (index == 0 ? this.keypad : this.directions).valueAt(v) !== "A"
    );
    if (firstNonActivate == 1) {
      // The human pressing "activate" will touch activate on all dpads except the last one before the keypad,
      // so we need to move the keypad accordinly
      const movement = nodeForMovement(node[0], this.directions.valueAt(node[1]));
      if (movement && this.keypad.validCoord(movement)) {
        neighbours.push([movement, ...node.slice(1)]);
      }
    } else if (firstNonActivate > 1) {
      // The human pressing "activate" will activate all dpads up to the one we found that isn't over "activate"
      // so we need to move the dpad before it accordingly
      const movement = nodeForMovement(node[firstNonActivate - 1], this.directions.valueAt(node[firstNonActivate]));
      if (movement && this.directions.validCoord(movement)) {
        neighbours.push([node[0], ...node.slice(1, firstNonActivate - 1), movement, ...node.slice(firstNonActivate)]);
      }
    }

    // Otherwise, the human presses a direction,
    for (const direction of DIRECTIONS) {
      const movement = nodeForMovement(node[node.length - 1], direction);
      if (movement && this.directions.validCoord(movement)) {
        neighbours.push([...node.slice(0, node.length - 1), movement] as unknown as SystemNode);
      }
    }

    // console.log({
    //   node: this.valueAt(node),
    //   firstNonActivate,
    //   neighbours: neighbours.map((n) => this.valueAt(n)),
    // });

    return neighbours;
  }

  nodeForString(node: string): SystemNode {
    const keyStart = this.keypad.findCoords(node[0] as KeyPadNode)[0];
    const dirPadStarts = node
      .slice(1)
      .split("")
      .map((c) => this.directions.findCoords(c as DirectionNode)[0]);
    return [keyStart, ...dirPadStarts];
  }
}

type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
type Direction = "<" | ">" | "^" | "v";

const DIRECTIONS: Direction[] = ["<", ">", "^", "v"];

const nodeForMovement = (node: Coordinate, movement: Direction | "A" | " "): Coordinate | null => {
  switch (movement) {
    case "v":
      return [node[0] + 1, node[1]];
    case "^":
      return [node[0] - 1, node[1]];
    case ">":
      return [node[0], node[1] + 1];
    case "<":
      return [node[0], node[1] - 1];
    default:
      return null;
  }
};

const movement = (from: Coordinate, to: Coordinate): Direction | null => {
  if (from[0] - to[0] == -1) return "v";
  if (from[0] - to[0] == 1) return "^";
  if (from[1] - to[1] == -1) return ">";
  if (from[1] - to[1] == 1) return "<";
  return null;
};

export const solvePart1 = (data: ReturnType<typeof inputMapper>) => {
  const graph = new System(2);

  return sumOf(data, (line) => {
    const totalDistance = sumOf(range(line.length), (index) => {
      const distanceBetweenKeypadDigits = dijkstra(graph, {
        source: graph.nodeForString(`${index == 0 ? "A" : line[index - 1]}AA` as any),
        destination: graph.nodeForString(`${line[index]}AA` as any),
      });

      // + 1 because the above only gets us to the state we need to be in to press the right key on
      // the keypad, but we still need to have the human press the activate button to log it.
      return BigInt(distanceBetweenKeypadDigits + 1);
    });

    // console.log(line, totalDistance, totalDistance * BigInt(parseInt(line)));
    return totalDistance * BigInt(parseInt(line));
  });
};

export const solvePart2 = (data: ReturnType<typeof inputMapper>) => {
  const graph = new System(3);
  const suffix = "A".repeat(3);

  return sumOf(data, (line) => {
    const totalDistance = sumOf(range(line.length), (index) => {
      const distanceBetweenKeypadDigits = dijkstra(graph, {
        source: graph.nodeForString(`${index == 0 ? "A" : line[index - 1]}${suffix}` as any),
        destination: graph.nodeForString(`${line[index]}${suffix}` as any),
      });

      // + 1 because the above only gets us to the state we need to be in to press the right key on
      // the keypad, but we still need to have the human press the activate button to log it.
      return BigInt(distanceBetweenKeypadDigits + 1);
    });

    // console.log(line, totalDistance, totalDistance * BigInt(parseInt(line)));
    return totalDistance * BigInt(parseInt(line));
  });
};
