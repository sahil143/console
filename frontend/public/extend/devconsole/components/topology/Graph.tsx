import * as React from 'react';
import ReactMeasure from 'react-measure';
import { debounce } from 'lodash-es';
import Renderer from './D3ForceDirectedRenderer';
import {
  GraphApi,
  EdgeProvider,
  NodeProvider,
  GraphModel,
  ViewGraphData,
  TopologyDataMap,
} from './topology-types';
import './Graph.scss';

interface State {
  dimensions?: {
    width: number;
    height: number;
  };
  graphApi?: GraphApi;
}

export interface GraphProps {
  nodeProvider: NodeProvider;
  edgeProvider: EdgeProvider;
  graph: GraphModel;
  topology: TopologyDataMap;
  children?(GraphApi): React.ReactNode;
  selected?: string;
  onSelect?(Node): void;
}

export default class Graph extends React.Component<GraphProps, State> {
  state = {
    dimensions: null,
    graphApi: null,
  };

  onMeasure = debounce((contentRect) => {
    this.setState({
      dimensions: {
        width: contentRect.client.width,
        height: contentRect.client.height,
      },
    });
  }, 100);

  captureApiRef = (r) => {
    this.setState({ graphApi: r ? r.api() : null });
  };

  render() {
    const {
      children,
      graph,
      nodeProvider,
      edgeProvider,
      onSelect,
      selected,
      topology,
    } = this.props;
    const { dimensions, graphApi } = this.state;

    return (
      <ReactMeasure client onResize={this.onMeasure}>
        {({ measureRef }) => (
          <div ref={measureRef} className="odc-graph">
            {dimensions && (
              <Renderer
                nodeRadius={100}
                height={dimensions.height}
                width={dimensions.width}
                // TODO transform instead of blind cast
                graph={graph as ViewGraphData}
                topology={topology}
                nodeProvider={nodeProvider}
                edgeProvider={edgeProvider}
                ref={this.captureApiRef}
                onSelect={onSelect}
                selected={selected}
              />
            )}
            {children && graphApi && children(graphApi)}
          </div>
        )}
      </ReactMeasure>
    );
  }
}
