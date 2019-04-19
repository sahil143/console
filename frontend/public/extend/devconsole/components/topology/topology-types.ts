import { ComponentType } from 'react';
import { ObjectMetadata } from 'public/module/k8s';
import { K8sResourceKind } from 'public/module/k8s';

export interface ResourceProps {
  kind: string;
  metadata: ObjectMetadata[];
  status: {};
  spec: {
    selector?: {};
  };
}
export interface Resource {
  data: ResourceProps[];
}
export interface TopologyDataResources {
  replicationControllers: Resource;
  pods: Resource;
  deploymentConfigs: Resource;
  services: Resource;
  routes: Resource;
  deployments: Resource;
  replicasets: Resource;
}

export interface Node {
  id?: string;
  type?: string;
  name?: string;
}

export interface Edge {
  id?: string;
  type?: string;
  source: string;
  target: string;
}

export interface Group {
  id?: string;
  name: string;
  nodes: string[];
}

export interface TopologyDataModel {
  graph: {
    nodes: Node[];
    edges: Edge[];
    groups: Group[];
  };
  topology: {
    [key: string]: TopologyNodeObject;
  };
}
export interface Pod {
  id: string;
  name: string;
  kind: string;
  metadata: {};
  status: {};
}
export interface TopologyNodeObject {
  id: string;
  name: string;
  type: string;
  resources: Resource[];
  data: {
    url: string;
    editUrl: string;
    builderImage: string;
    donutStatus: {
      pods: Pod[];
    };
  };
}

export interface GraphModel {
  nodes: Node[];
  edges: Edge[];
  groups: Group[];
}

export interface GraphApi {
  zoomIn(): void;
  zoomOut(): void;
  resetView(): void;
}

export interface Selectable {
  selected?: boolean;
  onSelect?(): void;
}

export interface ViewGraphData {
  nodes: ViewNode[];
  edges: ViewEdge[];
  groups: ViewGroup[];
}

export type ViewNode = Node & {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

export type ViewEdge = Edge & {
  source: ViewNode;
  target: ViewNode;
};

export type ViewGroup = Group;

export type NodeProps = ViewNode &
  Selectable & {
    data?: TopologyDataModel;
  };
export type EdgeProps = ViewEdge & {
  data?: TopologyDataModel;
};

export interface TopologyDataModel<D = {}> {
  id: string;
  type: string;
  name: string;
  resources: K8sResourceKind[];
  data: D;
}

export interface TopologyDataMap {
  [id: string]: TopologyDataModel;
}

export interface TopologyModel {
  graph: GraphModel;
  topology: TopologyDataMap;
}

export interface NodeProvider {
  (ViewNode, {}): ComponentType<NodeProps>;
}

export interface EdgeProvider {
  (ViewNode, {}): ComponentType<EdgeProps>;
}
