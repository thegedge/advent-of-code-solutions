type LAN = {
  edges: Map<string, Set<string>>;
  nodes: string[];
};

export const inputMapper = (data: string): LAN => {
  const edges = new Map<string, Set<string>>();
  for (const line of data.split("\n")) {
    const [a, b] = line.split("-");

    if (!edges.has(a)) {
      edges.set(a, new Set());
    }

    if (!edges.has(b)) {
      edges.set(b, new Set());
    }

    edges.get(a)!.add(b);
    edges.get(b)!.add(a);
  }

  return {
    edges,
    nodes: Array.from(edges.keys()).sort(),
  };
};

const findAllThreeCliques = ({ nodes, edges }: LAN) => {
  const cliques: string[][] = [];
  for (const nodeA of nodes) {
    for (const nodeB of nodes) {
      if (nodeB <= nodeA) continue;
      for (const nodeC of nodes) {
        if (nodeC <= nodeB) continue;
        if (edges.get(nodeA)!.has(nodeB) && edges.get(nodeA)!.has(nodeC) && edges.get(nodeB)!.has(nodeC)) {
          cliques.push([nodeA, nodeB, nodeC]);
        }
      }
    }
  }
  return cliques;
};

const expandCliques = ({ nodes, edges }: LAN, cliques: string[][]): string[][] => {
  const newCliques: string[][] = [];
  for (const clique of cliques) {
    for (const node of nodes) {
      // One CRITICAL implementation detail is that we've ordered the cliques to avoid a combinatorial
      // explosion. At each iteration of the loop, we only add the next smallest node to an existing clique
      // that applies (i.e., connects to all other nodes in the clique).
      //
      // This dramatically reduces the number of cliques we produce at each step.
      if (node < clique[clique.length - 1]) continue;

      if (clique.every((n) => edges.get(n)!.has(node))) {
        newCliques.push([...clique, node]);
      }
    }
  }
  return newCliques;
};

export const solvePart1 = ({ edges, nodes }: ReturnType<typeof inputMapper>) => {
  return findAllThreeCliques({ edges, nodes }).filter(([nodeA, nodeB, nodeC]) => {
    return nodeA.startsWith("t") || nodeB.startsWith("t") || nodeC.startsWith("t");
  }).length;
};

export const solvePart2 = ({ edges, nodes }: ReturnType<typeof inputMapper>) => {
  let cliques = findAllThreeCliques({ edges, nodes });
  while (cliques.length > 0) {
    // Take all the three cliques, and repeatedly expand them by one node until there's no larger clique
    const newCliques = expandCliques({ edges, nodes }, cliques);
    if (newCliques.length == 0) {
      return cliques[0].join(",");
    }
    cliques = newCliques;
  }
};
