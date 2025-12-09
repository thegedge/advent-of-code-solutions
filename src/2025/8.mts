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

export const solvePart1 = (input: ReturnType<typeof inputMapper>, name: Puzzle["name"]) => {
  const heap = new PriorityQueue(
    pairs(input).map(([a, b]) => ({
      distance: Math.hypot(a.coords[0] - b.coords[0], a.coords[1] - b.coords[1], a.coords[2] - b.coords[2]),
      coordinates: [a, b],
    })),
    (a, b) => b.distance - a.distance // reverse the comparison so we pop smaller values first
  );

  let circuitId = 0;
  const coordToCircuit = new Map<string, number>(); // coordinate -> circuit id
  const circuits = new Map<number, number>(); // circuit id -> size
  const maxIterations = name == "Main input" ? 1000 : 10;

  for (let iteration = 0; heap.length > 0 && iteration < maxIterations; ++iteration) {
    const {
      coordinates: [a, b],
    } = heap.pop()!;

    const circuitA = coordToCircuit.get(a.string);
    const circuitB = coordToCircuit.get(b.string);
    if (circuitA && circuitB) {
      if (circuitA === circuitB) {
        // Already in same circuit, nothing to do
      } else {
        // Join together two distinct circuits
        const id = ++circuitId;
        circuits.set(id, circuits.get(circuitA)! + circuits.get(circuitB)!);

        // Delete the old circuits
        circuits.delete(circuitA);
        circuits.delete(circuitB);

        // Update all other coordinates pointing to the old circuits to point to the new circuit
        for (const coord of coordToCircuit.keys()) {
          if (coordToCircuit.get(coord) === circuitA || coordToCircuit.get(coord) === circuitB) {
            coordToCircuit.set(coord, id);
          }
        }
      }
      continue;
    }

    if (circuitA) {
      coordToCircuit.set(b.string, circuitA);
      circuits.set(circuitA, circuits.get(circuitA)! + 1);
    } else if (circuitB) {
      coordToCircuit.set(a.string, circuitB);
      circuits.set(circuitB, circuits.get(circuitB)! + 1);
    } else {
      const id = ++circuitId;
      circuits.set(id, 2);
      coordToCircuit.set(a.string, id);
      coordToCircuit.set(b.string, id);
    }
  }

  const circuitSizes = Array.from(circuits.values()).sort((a, b) => b - a);
  return circuitSizes.at(0)! * circuitSizes.at(1)! * circuitSizes.at(2)!;
};

export const solvePart2 = (input: ReturnType<typeof inputMapper>) => {
  // Solve me
};
