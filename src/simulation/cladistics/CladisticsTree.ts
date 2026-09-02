export interface CladoNode {
  id: string;
  parentId?: string;
  synapomorphies: string[];
  depth: number;
  traitMean: number;
}

export class CladisticsTree {
  public nodes: Map<string, CladoNode> = new Map();

  constructor() {
    this.nodes.set('root-ancestor', {
      id: 'root-ancestor',
      synapomorphies: ['BASAL_METABOLISM'],
      depth: 0,
      traitMean: 1.0
    });
  }

  public registerClade(id: string, parentId: string, synapomorphy: string, traitVal: number): CladoNode {
    const parent = this.nodes.get(parentId) || this.nodes.get('root-ancestor')!;
    const node: CladoNode = {
      id,
      parentId: parent.id,
      synapomorphies: [...parent.synapomorphies, synapomorphy],
      depth: parent.depth + 1,
      traitMean: (parent.traitMean + traitVal) * 0.5
    };
    this.nodes.set(id, node);
    return node;
  }

  public reconstructAncestralState(nodeId: string): string[] {
    const node = this.nodes.get(nodeId);
    return node ? node.synapomorphies : ['BASAL_METABOLISM'];
  }
}
