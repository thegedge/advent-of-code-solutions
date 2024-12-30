import { cartesianProduct, range, sumOf } from "../utils/collections.mts";
import { dijkstra } from "../utils/dijkstra.mts";
import { type Coordinate, type Graph } from "../utils/graphs.mts";
import { GridMap } from "../utils/GridMap.mts";

const groups = (await Deno.readTextFile(new URL("", import.meta.url.replace(".mts", ".in")).pathname)).split("\n\n");

const readData = (data: string) => {
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
type SystemNode = [keypad: Coordinate, dir1: Coordinate, dir2: Coordinate];

class System implements Graph<string, SystemNode, number, number> {
  readonly keypad = new KeyPad();
  readonly directions = new DirectionalPad();

  nodes(): SystemNode[] {
    const keyNodes = this.keypad.nodes();
    const dirNodes = this.directions.nodes();
    return cartesianProduct(keyNodes, dirNodes, dirNodes).toArray();
  }

  keyFor(node: SystemNode): number {
    // 11 nodes for keypad = 4 bits
    // 5 nodes for directions = 3 bits
    return (this.keypad.keyFor(node[0]) << 6) |
      (this.directions.keyFor(node[1]) << 3) |
      (this.directions.keyFor(node[2]));
  }

  valueAt(node: SystemNode): string {
    return this.keypad.valueAt(node[0]) +
      this.directions.valueAt(node[1]) +
      this.directions.valueAt(node[2]);
  }

  nodeFor(key: number): SystemNode {
    return [
      this.keypad.nodeFor((key >> 6) & 0b1111),
      this.directions.nodeFor((key >> 3) & 0b111),
      this.directions.nodeFor(key & 0b111),
    ];
  }

  /**
   * Find the key that was pressed to take us from node a to node b.
   */
  keypress(a: SystemNode, b: SystemNode): Direction | "A" | null {
    const a1key = this.keypad.keyFor(a[0]);
    const a2key = this.directions.keyFor(a[1]);
    const a3key = this.directions.keyFor(a[2]);

    const b1key = this.keypad.keyFor(b[0]);
    const b2key = this.directions.keyFor(b[1]);
    const b3key = this.directions.keyFor(b[2]);

    const diffs = [a1key !== b1key, a2key !== b2key, a3key !== b3key];
    const numDifferences = diffs.filter((x) => x).length;

    if (numDifferences > 1) {
      // We have edges between two types of nodes
      //   1. The keypad moves, in which case all dpads should stay the same.
      //   2. A dpad moves, in which case we should see a difference in just one dpad.
      //
      // If more than one thing changes, it's an impossible move, so we return an infinite edge weight.
      return null;
    }

    if (numDifferences === 0 || !diffs[2]) {
      return "A";
    }

    return movement(a[2], b[2]);
  }

  edgeWeight(a: SystemNode, b: SystemNode): number {
    const a1key = this.keypad.keyFor(a[0]);
    const a2key = this.directions.keyFor(a[1]);
    const a3key = this.directions.keyFor(a[2]);

    const b1key = this.keypad.keyFor(b[0]);
    const b2key = this.directions.keyFor(b[1]);
    const b3key = this.directions.keyFor(b[2]);

    const diffs = [a1key !== b1key, a2key !== b2key, a3key !== b3key];
    const numDifferences = diffs.filter((x) => x).length;

    // if (log) {
    //   console.log(
    //     `${this.keypad.valueAt(a[0])}${this.directions.valueAt(a[1])}${this.directions.valueAt(a[2])}`,
    //     "->",
    //     `${this.keypad.valueAt(b[0])}${this.directions.valueAt(b[1])}${this.directions.valueAt(b[2])}`,
    //     numDifferences,
    //   );
    // }

    if (numDifferences > 1) {
      // We have edges between two types of nodes
      //   1. The keypad moves, in which case all dpads should stay the same.
      //   2. A dpad moves, in which case we should see a difference in just one dpad.
      //
      // If more than one thing changes, it's an impossible move, so we return an infinite edge weight.
      return Infinity;
    }

    if (diffs[0]) {
      // This is a keypad movement, so we need to check two things:
      //   1. Is the keypad movement itself valid?
      //   2. Is the dpad direction the direction that will take us from a to b
      const delta = movement(a[0], b[0]);
      return delta === this.directions.valueAt(a[1]) ? 1 : Infinity;
    }

    // Okay, this is a dpad movement. Find which dpad moved, and similar to above verify that the
    // movement is valid.
    if (diffs[1]) {
      const delta = movement(a[1], b[1]);
      return delta === this.directions.valueAt(a[2]) ? 1 : Infinity;
    }

    // This is the human-controlled dpad, so button presses are instant
    return 1;
  }

  neighbours(node: SystemNode): SystemNode[] {
    const neighbours: SystemNode[] = [];

    const dpad1IsActivate = this.directions.valueAt(node[1]) === "A";
    const dpad2IsActivate = this.directions.valueAt(node[2]) === "A";

    if (dpad2IsActivate) {
      if (dpad1IsActivate) {
        // Both dpads on activate, so we can move to the same node. There's no movement, but this
        // edge in a path indicates pressing a button on the keypad.
        neighbours.push(node);
      } else {
        // dpad 1 is on a direction, so we can move the keypad in that direction.
        const key = nodeForMovement(node[0], this.directions.valueAt(node[1]));
        if (key && this.keypad.validCoord(key)) {
          neighbours.push([key, node[1], node[2]]);
        }
      }
    } else {
      // Dpad 2 is on a movement key, so we can move the dpad 1 in that direction.
      const dpad1 = nodeForMovement(node[1], this.directions.valueAt(node[2]));
      if (dpad1 && this.directions.validCoord(dpad1)) {
        neighbours.push([node[0], dpad1, node[2]]);
      }
    }

    // Dpad 2 is moved by the human-controlled dpad, so we can move it in any direction
    for (const direction of DIRECTIONS) {
      const movement = nodeForMovement(node[2], direction);
      if (movement && this.directions.validCoord(movement)) {
        neighbours.push([node[0], node[1], movement]);
      }
    }

    // console.log({
    //   node: this.valueAt(node),
    //   neighbours: neighbours.map((n) => this.valueAt(n)),
    // });

    return neighbours;
  }

  nodeForString(node: `${KeyPadNode}${DirectionNode}${DirectionNode}`): SystemNode {
    const keyStart = this.keypad.findCoords(node[0] as KeyPadNode)[0];
    const dir1Start = this.directions.findCoords(node[1] as DirectionNode)[0];
    const dir2Start = this.directions.findCoords(node[2] as DirectionNode)[0];
    return [keyStart, dir1Start, dir2Start];
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

const solvePart1 = () => {
  const results = groups.map(readData).map((group) => {
    const graph = new System();

    return sumOf(group, (line) => {
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
  });

  console.log(results);
};

const solvePart2 = () => {
  const results = groups.map(readData).map((group) => {
    //
  });

  console.log(results);
};

solvePart1();
solvePart2();
