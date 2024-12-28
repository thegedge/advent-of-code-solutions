import { BinaryHeap } from "https://deno.land/std@0.177.0/collections/binary_heap.ts";
import type { Graph, Primitive } from "./graphs.mts";

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
  const previous = new Map<KeyT, KeyT[]>();
  const sourceKey = map.keyFor(options.source);
  const destinationKey = map.keyFor(options.destination);

  queue.push([options.source, 0]);
  distances.set(sourceKey, 0);

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
      const newDistance = distance + map.edgeWeight(node, neighbour);
      const currentDistance = distances.get(neighbourKey) ?? Infinity;
      if (newDistance <= currentDistance) {
        const previousNodes = previous.has(neighbourKey) ? previous.get(neighbourKey) : undefined;
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
    console.log(currentHeads.length);
    const headsCopy = currentHeads.splice(0);
    const keysCopy = currentHeadKeys.splice(0);
    const pathsCopy = currentPaths.splice(0);
    keysCopy.forEach((key, index) => {
      if (key == sourceKey) {
        paths.push([...pathsCopy[index], options.source]);
        return;
      }

      const nextNodeKeys = previous.get(key);
      if (!nextNodeKeys) {
        return;
      }

      currentPaths.push([...pathsCopy[index], headsCopy[index]]);
      currentHeads.push(map.nodeFor(nextNodeKeys[0]));
      currentHeadKeys.push(nextNodeKeys[0]);
      if (allPaths) {
        for (const headKey of nextNodeKeys.slice(1)) {
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

      return acc + map.edgeWeight(p[index - 1], node);
    }, 0);
    return pathLength === shortestDistance;
  }).map((p) => p.reverse());

  return [distances.get(destinationKey) ?? Infinity, allPaths ? shortestPaths : (shortestPaths[0] ?? [])];
}
