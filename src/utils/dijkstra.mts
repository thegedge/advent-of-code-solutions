import { PriorityQueue } from "./PriorityQueue.mts";
import type { Graph, Primitive } from "./graphs.mts";

export function dijkstra<ValueT, NodeT, KeyT extends Primitive>(
  map: Graph<ValueT, NodeT, KeyT, number>,
  options: {
    source: NodeT;
    destination: NodeT;
    paths?: undefined;
  }
): number;
export function dijkstra<ValueT, NodeT, KeyT extends Primitive>(
  map: Graph<ValueT, NodeT, KeyT, number>,
  options: {
    source: NodeT;
    destination: NodeT;
    paths: "all";
  }
): [number, NodeT[][]];
export function dijkstra<ValueT, NodeT, KeyT extends Primitive>(
  map: Graph<ValueT, NodeT, KeyT, number>,
  options: {
    source: NodeT;
    destination: NodeT;
    paths: "any";
  }
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

    /** The node considered a destination */
    destination: NodeT;

    /**
     * Whether or not to also find paths.
     *
     * If `any`, find and return any shortest path between the source and destination.
     * If `all`, find and return all shortest path between the source and destination.
     */
    paths?: "any" | "all";
  }
): number | [number, NodeT[] | NodeT[][]] {
  const queue = new PriorityQueue((a: [NodeT, number], b: [NodeT, number]) => {
    return a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0;
  });
  const distances = new Map<KeyT, number>();
  const previous = new Map<KeyT, KeyT[]>();
  const sourceKey = map.keyFor(options.source);

  const allPaths = options.paths === "all";
  const destinationKey = map.keyFor(options.destination);

  queue.push([options.source, 0]);
  distances.set(sourceKey, 0);

  while (queue.length > 0) {
    const [node, distance] = queue.pop()!;
    const nodeKey = map.keyFor(node);
    if (nodeKey == destinationKey) {
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
          if (allPaths) {
            previousNodes.push(nodeKey);
          }
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

  const shortestDistance = distances.get(destinationKey!) ?? Infinity;
  if (!options.paths) {
    return shortestDistance;
  }

  const paths: NodeT[][] = [];
  const currentPaths: NodeT[][] = [[]];
  const currentHeads: NodeT[] = [options.destination];
  const currentHeadKeys: KeyT[] = [destinationKey!];
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
      if (!nextNodeKeys) {
        return;
      }

      for (const headKey of nextNodeKeys) {
        currentPaths.push([...pathsCopy[index], headsCopy[index]]);
        currentHeads.push(map.nodeFor(headKey));
        currentHeadKeys.push(headKey);
      }
    });
  }

  // There may be values in the previous map that aren't on the shortest path, so filter them out
  const shortestPaths = paths
    .filter((p) => {
      const pathLength = p.reduce((acc, node, index) => {
        if (index === 0) {
          return acc;
        }
        return acc + map.edgeWeight(node, p[index - 1]);
      }, 0);
      return pathLength === shortestDistance;
    })
    .map((p) => p.reverse());

  return [shortestDistance, allPaths ? shortestPaths : (shortestPaths[0] ?? [])];
}
