import type { Puzzle } from "../../runner.mts";
import { PriorityQueue } from "../utils/PriorityQueue.mts";
import { pairs } from "../utils/collections.mts";

type Coordinate = [x: number, y: number, z: number];

export const inputMapper = (input: string) => {
  return input.split("\n").map((line) => ({
    string: line,
    coords: line.split(",").map(Number) as Coordinate,
  }));
};

const distance = (a: Coordinate, b: Coordinate) => {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
};

const solve = <T,>(
  coordinateDescriptors: ReturnType<typeof inputMapper>,
  fn: (circuits: Map<number, number>, selectedCircuits: [Coordinate, Coordinate], iteration: number) => T
): T | undefined => {
  const heap = new PriorityQueue(
    pairs(coordinateDescriptors).map(([a, b]) => ({
      distance: distance(a.coords, b.coords),
      coordinates: [a, b],
    })),
    (a, b) => b.distance - a.distance // reverse the comparison so we pop smaller values first
  );

  let circuitId = 0;
  const coordToCircuit = new Map<string, number>(); // coordinate -> circuit id
  const circuits = new Map<number, number>(); // circuit id -> size

  for (const { string: coord } of coordinateDescriptors) {
    coordToCircuit.set(coord, circuitId);
    circuits.set(circuitId, 1);
    ++circuitId;
  }

  for (let iteration = 0; heap.length > 0; ++iteration) {
    const {
      coordinates: [a, b],
    } = heap.pop()!;

    const circuitA = coordToCircuit.get(a.string)!;
    const circuitB = coordToCircuit.get(b.string)!;

    if (circuitA === circuitB) {
      // Already in same circuit, nothing to do
      continue;
    }

    // Join together two distinct circuits.
    // We maintain the circuit identifier as `circuitA` to simplify the code below
    circuits.set(circuitA, circuits.get(circuitA)! + circuits.get(circuitB)!);

    // Delete the old circuits
    circuits.delete(circuitB);

    // Update all other coordinates pointing to the old circuits to point to the new circuit
    for (const coord of coordToCircuit.keys()) {
      if (coordToCircuit.get(coord) === circuitB) {
        coordToCircuit.set(coord, circuitA);
      }
    }

    const result = fn(circuits, [a.coords, b.coords], iteration + 1);
    if (result !== undefined) {
      return result;
    }
  }

  return undefined;
};

export const solvePart1 = (input: ReturnType<typeof inputMapper>, name: Puzzle["name"]) => {
  // return;
  const maxIterations = name == "Main input" ? 1000 : 10;
  return solve(input, (circuits, _, iteration) => {
    if (iteration < maxIterations) {
      return;
    }

    const circuitSizes = Array.from(circuits.values()).sort((a, b) => b - a);
    return circuitSizes.at(0)! * circuitSizes.at(1)! * circuitSizes.at(2)!;
  });
};

export const solvePart2 = (input: ReturnType<typeof inputMapper>, name: Puzzle["name"]) => {
  return solve(input, (circuits, selectedCircuits) => {
    if (circuits.size > 1) {
      return undefined;
    }

    // We just joined the two circuits we cared about
    return BigInt(selectedCircuits[0][0]) * BigInt(selectedCircuits[1][0]);
  });
};
