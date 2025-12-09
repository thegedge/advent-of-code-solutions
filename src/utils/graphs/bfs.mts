import type { Graph, Primitive } from "./index.mts";

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

    /**
     * Stop searching after reaching this distance.
     *
     * @default Infinity
     */
    maxDistance?: number;

    /** Callback function for when we visit a node */
    process: (
      map: Graph<ValueT, NodeT, KeyT, number>,
      node: NodeT,
      distance: number,
      alreadyVisited: boolean
    ) => boolean | void;
  }
): Map<KeyT, number> {
  const { process, startingNodes, maxDistance = Infinity } = options;

  const visited = new Map<KeyT, number>();
  const queue: [NodeT, number][] = startingNodes.map((n) => [n, 0]);

  while (queue.length > 0) {
    const distance = queue[0][1];
    if (distance >= maxDistance) {
      break;
    }

    queue.splice(0, queue.length).forEach(([node, distance]) => {
      const key = map.keyFor(node);
      const currentDistance = visited.get(key);
      const processValue = process(map, node, distance, currentDistance !== undefined);
      if (processValue !== true && currentDistance !== undefined) {
        visited.set(key, Math.min(currentDistance, distance));
        return;
      }

      visited.set(key, distance);

      const next = map.neighbours(node);
      queue.push(
        ...next.map((neighbour): [NodeT, number] => {
          return [neighbour, distance + map.edgeWeight(node, neighbour)];
        })
      );
    });
  }

  return visited;
}
