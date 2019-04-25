/* eslint-disable no-unused-vars, no-undef */
import * as React from 'react';
import { Button } from 'patternfly-react';
import { MinusIcon, PlusIcon, ExpandIcon } from '@patternfly/react-icons';
import { nodeProvider, edgeProvider } from './shape-providers';
import Graph from './Graph';
import GraphToolbar from './GraphToolbar';
import { GraphApi, Node, TopologyDataModel } from './topology-types';

type State = {
  selected?: string;
};

export interface TopologyProps {
  data: TopologyDataModel;
}

export default class Topology extends React.Component<TopologyProps, State> {
  state: State = {
    selected: null,
  };

  onSelect = (node: Node) => {
    this.setState(({ selected }) => {
      return { selected: node ? (selected === node.id ? null : node.id) : null };
    });
  };

  render() {
    return (
      <Graph
        graph={this.props.data.graph}
        topology={this.props.data.topology}
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
          </GraphToolbar>
        )}
      </Graph>
    );
  }
}
