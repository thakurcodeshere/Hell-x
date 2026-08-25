/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Dependency DAG Engine & Parallel Execution Schedulability
 */

import { GraphNode, GraphEdge, ExecutionTier } from "./types.js";
import { HellxError } from "../core/errors.js";

export class DAGEngine {
  private nodes: Map<string, GraphNode> = new Map(); // id -> node
  private codeIndex: Map<string, string> = new Map(); // code -> id
  private edges: GraphEdge[] = [];
  private adjacencyList: Map<string, Set<string>> = new Map(); // sourceId -> Set<targetId>
  private reverseAdjacencyList: Map<string, Set<string>> = new Map(); // targetId -> Set<sourceId>

  public addNode(node: GraphNode): void {
    this.nodes.set(node.id, node);
    this.codeIndex.set(node.code, node.id);
    if (!this.adjacencyList.has(node.id)) {
      this.adjacencyList.set(node.id, new Set());
    }
    if (!this.reverseAdjacencyList.has(node.id)) {
      this.reverseAdjacencyList.set(node.id, new Set());
    }
  }

  public addEdge(edge: GraphEdge): void {
    if (!this.nodes.has(edge.sourceId)) {
      throw new HellxError(`Source node '${edge.sourceId}' does not exist in graph.`, "GRAPH_NODE_NOT_FOUND");
    }
    if (!this.nodes.has(edge.targetId)) {
      throw new HellxError(`Target node '${edge.targetId}' does not exist in graph.`, "GRAPH_NODE_NOT_FOUND");
    }

    this.edges.push(edge);
    this.adjacencyList.get(edge.sourceId)!.add(edge.targetId);
    this.reverseAdjacencyList.get(edge.targetId)!.add(edge.sourceId);

    // Cycle check
    if (this.hasCycle()) {
      // rollback edge
      this.edges.pop();
      this.adjacencyList.get(edge.sourceId)!.delete(edge.targetId);
      this.reverseAdjacencyList.get(edge.targetId)!.delete(edge.sourceId);
      throw new HellxError(
        `Adding edge from '${edge.sourceId}' to '${edge.targetId}' introduces a circular dependency in the Engineering DAG.`,
        "CYCLIC_DEPENDENCY_ERROR"
      );
    }
  }

  public hasCycle(): boolean {
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      recStack.add(nodeId);

      const neighbors = this.adjacencyList.get(nodeId) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true;
        } else if (recStack.has(neighbor)) {
          return true;
        }
      }

      recStack.delete(nodeId);
      return false;
    };

    for (const nodeId of this.nodes.keys()) {
      if (!visited.has(nodeId)) {
        if (dfs(nodeId)) return true;
      }
    }

    return false;
  }

  public getTopologicalOrder(): GraphNode[] {
    if (this.hasCycle()) {
      throw new HellxError("Cannot topologically sort graph containing circular dependencies.", "CYCLIC_DAG");
    }

    const inDegree = new Map<string, number>();
    for (const nodeId of this.nodes.keys()) {
      inDegree.set(nodeId, (this.reverseAdjacencyList.get(nodeId) || new Set()).size);
    }

    const queue: string[] = [];
    for (const [nodeId, deg] of inDegree.entries()) {
      if (deg === 0) queue.push(nodeId);
    }

    const result: GraphNode[] = [];
    while (queue.length > 0) {
      const curr = queue.shift()!;
      result.push(this.nodes.get(curr)!);

      const neighbors = this.adjacencyList.get(curr) || new Set();
      for (const neighbor of neighbors) {
        const nextDeg = inDegree.get(neighbor)! - 1;
        inDegree.set(neighbor, nextDeg);
        if (nextDeg === 0) {
          queue.push(neighbor);
        }
      }
    }

    return result;
  }

  /**
   * Calculates parallel execution tiers where all nodes in a tier can execute concurrently
   */
  public getParallelExecutionTiers(): ExecutionTier[] {
    const inDegree = new Map<string, number>();
    for (const nodeId of this.nodes.keys()) {
      inDegree.set(nodeId, (this.reverseAdjacencyList.get(nodeId) || new Set()).size);
    }

    const tiers: ExecutionTier[] = [];
    let currentBatch: string[] = [];

    for (const [nodeId, deg] of inDegree.entries()) {
      if (deg === 0) currentBatch.push(nodeId);
    }

    let tierIndex = 0;
    while (currentBatch.length > 0) {
      tiers.push({
        tierNumber: tierIndex++,
        parallelExecutableNodes: currentBatch.map((id) => this.nodes.get(id)!),
      });

      const nextBatch: string[] = [];
      for (const nodeId of currentBatch) {
        const neighbors = this.adjacencyList.get(nodeId) || new Set();
        for (const neighbor of neighbors) {
          const nextDeg = inDegree.get(neighbor)! - 1;
          inDegree.set(neighbor, nextDeg);
          if (nextDeg === 0) {
            nextBatch.push(neighbor);
          }
        }
      }

      currentBatch = nextBatch;
    }

    return tiers;
  }

  public getNode(idOrCode: string): GraphNode | undefined {
    if (this.nodes.has(idOrCode)) return this.nodes.get(idOrCode);
    const id = this.codeIndex.get(idOrCode);
    return id ? this.nodes.get(id) : undefined;
  }

  public getDirectDownstream(nodeId: string): GraphNode[] {
    const targets = this.adjacencyList.get(nodeId) || new Set();
    return Array.from(targets).map((id) => this.nodes.get(id)!);
  }

  public getTransitiveDownstream(nodeId: string): GraphNode[] {
    const visited = new Set<string>();
    const queue = [nodeId];

    while (queue.length > 0) {
      const curr = queue.shift()!;
      const neighbors = this.adjacencyList.get(curr) || new Set();
      for (const n of neighbors) {
        if (!visited.has(n)) {
          visited.add(n);
          queue.push(n);
        }
      }
    }

    return Array.from(visited).map((id) => this.nodes.get(id)!);
  }

  public getAllNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  public getAllEdges(): GraphEdge[] {
    return this.edges;
  }
}
