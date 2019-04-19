import * as React from 'react';
import { Button } from 'patternfly-react';
import { MinusIcon, PlusIcon, ExpandIcon } from '@patternfly/react-icons';
import { nodeProvider, edgeProvider } from './shape-providers';
import Graph from './Graph';
import GraphToolbar from './GraphToolbar';
import { GraphApi, Node, TopologyModel } from './topology-types';

const testData = {
  nodes: [
    { id: 'a', type: 'rect' },
    { id: 'b', type: 'workload' },
    { id: 'c', type: 'workload' },
    { id: 'd', type: 'rect' },
    { id: 'e', type: 'workload' },
    { id: 'f', type: 'meh' },
    { id: 'g', type: 'workload' },
    { id: 'h', type: 'rect' },
  ],
  edges: [
    { source: 'a', target: 'b' },
    { source: 'd', target: 'h' },
    { source: 'd', target: 'c' },
    { source: 'g', target: 'a' },
    { source: 'b', target: 'f' },
    { source: 'e', target: 'b' },
    { source: 'a', target: 'c' },
  ],
  groups: [],
};

let nodeCounter = 0;

type State = TopologyModel & {
  selected?: string;
};

export default class Topology extends React.Component<{}, State> {
  state: State = {
    graph: {
      nodes: [], // { id, type}
      edges: [], // { source, target}
      groups: [],
    },
    topology: {},
    selected: null,
  };

  constructor(props) {
    super(props);
    this.state.graph = testData;
  }

  addNode = () => {
    const id = `add_${nodeCounter++}`;
    this.setState({
      graph: {
        nodes: [
          ...this.state.graph.nodes,
          {
            id,
            type: 'workload',
            // x: 0,
            // y: 0,
          },
        ],
        edges: [...this.state.graph.edges, { source: 'a', target: id }],
        groups: this.state.graph.groups,
      },
    });
  };

  onSelect = (node: Node) => {
    this.setState(({ selected }) => {
      return { selected: node ? (selected === node.id ? null : node.id) : null };
    });
  };

  render() {
    return (
      <Graph
        graph={this.state.graph}
        topology={this.state.topology}
        nodeProvider={nodeProvider}
        edgeProvider={edgeProvider}
        selected={this.state.selected}
        onSelect={this.onSelect}
      >
        {(graphApi: GraphApi) => (
          <GraphToolbar>
            <Button onClick={graphApi.zoomOut} title="Zoom Out" aria-label="Zoom Out">
              <MinusIcon />
            </Button>
            <Button onClick={graphApi.zoomIn} title="Zoom In" aria-label="Zoom In">
              <PlusIcon />
            </Button>
            <Button onClick={graphApi.resetView} title="Reset Zoom" aria-label="Reset Zoom">
              <ExpandIcon />
            </Button>
            <Button onClick={this.addNode}>Add Node</Button>
          </GraphToolbar>
        )}
      </Graph>
    );
  }
}
