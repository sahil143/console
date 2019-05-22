/* eslint-disable no-unused-vars, no-undef */
import * as _ from 'lodash-es';
import { LabelSelector } from '../../../../module/k8s/label-selector';
import { getRouteWebURL } from '../../../../components/routes';
import {
  TopologyDataResources,
  ResourceProps,
  TopologyDataModel,
  TopologyDataObject,
  WorkloadData,
} from './topology-types';
import {} from 'moment';

export const podColor = {
  Running: '#0066CC',
  'Not Ready': '#519DE9',
  Warning: '#F0AB00',
  Empty: '#FFFFFF',
  Failed: '#CC0000',
  Pending: '#8BC1F7',
  Succceeded: '#519149',
  Terminating: '#002F5D',
  Unknown: '#A18FFF',
};

export const podStatus = Object.keys(podColor);

function isReady(pod) {
  var numReady = numContainersReadyFilter(pod);
  var total = _.size(pod.spec.containers);

  return numReady === total;
}

function numContainersReadyFilter(pod) {
  var numReady = 0;
  _.forEach(pod.status.containerStatuses, function(status) {
    if (status.ready) {
      numReady++;
    }
  });
  return numReady;
}

export function getPodStatus(pod) {
  if(_.has(pod, 'metadata.deletionTimestamp')) return 'Terminating';
  var warning = podWarnings(pod);
  if (warning !== null) return warning;
  if(pod.status.phase === 'Running' && !isReady(pod)) return 'Not Ready';
  return _.get(pod, 'status.phase', 'Unknown');
}

function isContainerFailedFilter(containerStatus) {
  return containerStatus.state.terminated && containerStatus.state.terminated.exitCode !== 0;
}

function isContainerLoopingFilter(containerStatus) {
  return containerStatus.state.waiting && containerStatus.state.waiting.reason === 'CrashLoopBackOff';
}

function podWarnings(pod) {
  if (pod.status.phase === 'Running' && pod.status.containerStatuses) {
    _.each(pod.status.containerStatuses, function(containerStatus) {
      if (!containerStatus.state) {
        return null;
      }

      if (isContainerFailedFilter(containerStatus)) {
        if (_.has(pod, 'metadata.deletionTimestamp')) {
         return 'Failed'
        } else {
         return 'Warning'
        }
      }
      if (isContainerLoopingFilter(containerStatus)) {
        return 'Failed'
      }
    });
  }
  return null;
}

export class TransformTopologyData {
  private _topologyData: TopologyDataModel = {
    graph: { nodes: [], edges: [], groups: [] },
    topology: {},
  };

  private _deploymentKindMap = {
    deployments: { dcKind: 'Deployment', rcKind: 'ReplicaSet', rController: 'replicasets' },
    deploymentConfigs: {
      dcKind: 'DeploymentConfig',
      rcKind: 'ReplicationController',
      rController: 'replicationControllers',
    },
  };

  private _selectorsByService;
  private _allServices;

  constructor(public resources: TopologyDataResources) {
    this._allServices = _.keyBy(this.resources.services.data, 'metadata.name');
    this._selectorsByService = this.getSelectorsByService();
  }

  private getSelectorsByService() {
    const allServices = _.keyBy(this.resources.services.data, 'metadata.name');
    const selectorsByService = _.mapValues(allServices, (service) => {
      return new LabelSelector(service.spec.selector);
    });
    return selectorsByService;
  }
  /**
   * get the topology data
   */
  getTopologyData() {
    return this._topologyData;
  }
  /**
   * Tranforms the k8s resources objects into topology data
   * @param targetDeployment
   */
  transformDataBy(targetDeployment = 'deployments'): TransformTopologyData {
    if (!this._deploymentKindMap[targetDeployment]) {
      throw new Error(`Invalid target deployment resource: (${targetDeployment})`);
    }
    if (_.isEmpty(this.resources[targetDeployment].data)) {
      return this;
    }
    const targetDeploymentsKind = this._deploymentKindMap[targetDeployment].dcKind;

    _.forEach(this.resources[targetDeployment].data, (deploymentConfig) => {
      deploymentConfig.kind = targetDeploymentsKind;
      const dcUID = _.get(deploymentConfig, 'metadata.uid');

      const replicationController = this.getReplicationController(
        deploymentConfig,
        targetDeployment,
      );
      const dcPods = this.getPods(replicationController);
      const service = this.getService(deploymentConfig);
      const route = this.getRoute(service);
      const buildConfigs = this.getBuildConfigs(deploymentConfig);
      // list of resources in the
      const nodeResources = [deploymentConfig, replicationController, service, route, buildConfigs];
      // populate the graph Data
      this.createGraphData(deploymentConfig);
      // add the lookup object
      const deploymentsLabels = _.get(deploymentConfig, 'metadata.labels') || {};
      const deploymentsAnnotations = _.get(deploymentConfig, 'metadata.annotations') || {};
      this._topologyData.topology[dcUID] = {
        id: dcUID,
        name:
          deploymentsLabels['app.kubernetes.io/instance'] ||
          _.get(deploymentConfig, 'metadata.name'),

        type: 'workload',
        resources: _.map(nodeResources, (resource) => {
          resource.name = _.get(resource, 'metadata.name');
          return resource;
        }),
        data: {
          url: !_.isEmpty(route.spec) ? getRouteWebURL(route): null,
          editUrl: deploymentsAnnotations['app.openshift.io/edit-url'],
          builderImage: deploymentsLabels['app.kubernetes.io/name'],
          donutStatus: {
            pods: _.map(dcPods, (pod) =>
              _.merge(_.pick(pod, 'metadata', 'status', 'spec.containers'), {
                id: _.get(pod, 'metadata.uid'),
                name: _.get(pod, 'metadata.name'),
                kind: 'Pod',
              }),
            ),
          },
        },
      } as TopologyDataObject<WorkloadData>;
    });
    return this;
  }

  /**
   * get the route information from the service
   * @param service
   */
  private getRoute(service: ResourceProps): ResourceProps {
    // get the route
    const route = {
      kind: 'Route',
      metadata: {},
      status: {},
      spec: {},
    };
    _.forEach(this.resources.routes.data, (routeConfig) => {
      if (_.get(service, 'metadata.name') === _.get(routeConfig, 'spec.to.name')) {
        _.merge(route, routeConfig);
      }
    });
    return route;
  }
  private getBuildConfigs(deploymentConfig: ResourceProps): ResourceProps {
    const buildConfig = {
      kind: 'BuildConfig',
      metadata: {},
      status: {},
      spec: {},
    };

    const bconfig = _.find(this.resources.buildconfigs.data, [
      'metadata.labels["app.kubernetes.io/instance"]',
      _.get(deploymentConfig, 'metadata.labels["app.kubernetes.io/instance"]'),
    ]);
    return bconfig ? _.merge(buildConfig, bconfig) : buildConfig;
  }
  /**
   * fetches the service from the deploymentconfig
   * @param deploymentConfig
   */
  private getService(deploymentConfig: ResourceProps): ResourceProps {
    const service = {
      kind: 'Service',
      metadata: {},
      status: {},
      spec: {},
    };
    const configTemplate = _.get(deploymentConfig, 'spec.template');
    _.each(this._selectorsByService, (selector, serviceName) => {
      if (selector.matches(configTemplate)) {
        _.merge(service, this._allServices[serviceName]);
      }
    });
    return service;
  }
  /**
   * Get all the pods from a replication controller or a replicaset.
   * @param replicationController
   */
  private getPods(replicationController: ResourceProps) {
    return _.filter(this.resources.pods.data, (pod) => {
      return _.some(_.get(pod, 'metadata.ownerReferences'), {
        uid: _.get(replicationController, 'metadata.uid'),
        controller: true,
      });
    });
  }
  /**
   * fetches all the replication controllers from the deployment
   * @param deploymentConfig
   * @param targetDeployment 'deployments' || 'deploymentConfigs'
   */
  private getReplicationController(
    deploymentConfig: ResourceProps,
    targetDeployment: string,
  ): ResourceProps {
    // Get the current replication controller or replicaset
    const targetReplicationControllersKind = this._deploymentKindMap[targetDeployment].rcKind;
    const replicationControllers = this._deploymentKindMap[targetDeployment].rController;
    const dcUID = _.get(deploymentConfig, 'metadata.uid');

    const rControllers = _.filter(
      this.resources[replicationControllers].data,
      (replicationController) => {
        return _.some(_.get(replicationController, 'metadata.ownerReferences'), {
          uid: dcUID,
          controller: true,
        });
      },
    );
    const sortedControllers = this.sortByDeploymentVersion(rControllers, true);
    return _.merge(_.head(sortedControllers), {
      kind: targetReplicationControllersKind,
    });
  }
  /**
   * create graph data from the deploymentconfig.
   * @param deploymentConfig
   */
  private createGraphData(deploymentConfig) {
    // Current Node data
    const { metadata } = deploymentConfig;
    const currentNode = {
      id: metadata.uid,
      type: 'workload',
      name: (metadata.labels && metadata.labels['app.openshift.io/instance']) || metadata.name,
    };

    if (!_.some(this._topologyData.graph.nodes, { id: currentNode.id })) {
      // add the node to graph
      this._topologyData.graph.nodes.push(currentNode);
      const labels = _.get(deploymentConfig, 'metadata.labels');
      const annotations = _.get(deploymentConfig, 'metadata.annotations');
      let edges = [];
      const totalDeployments = _.cloneDeep(
        _.concat(this.resources.deploymentConfigs.data, this.resources.deployments.data),
      );
      // find and add the edges for a node
      if (_.has(annotations, 'app.openshift.io/connects-to')) {
        try {
          edges = JSON.parse(annotations['app.openshift.io/connects-to']);
        } catch (e) {
          // connects-to annotation should hold a JSON string value but failed to parse
          // treat value as a comma separated list of strings
          edges = annotations['app.openshift.io/connects-to'].split(',').map((v) => v.trim());
        }
        _.map(edges, (edge) => {
          //handles multiple edges
          const targetNode = _.get(
            _.find(totalDeployments, ['metadata.labels["app.kubernetes.io/instance"]', edge]),
            'metadata.uid',
          );
          if (targetNode) {
            this._topologyData.graph.edges.push({
              id: `${currentNode.id}_${targetNode}`,
              source: currentNode.id,
              target: targetNode,
            });
          }
        });
      }

      _.forEach(labels, (label, key) => {
        if (key !== 'app.kubernetes.io/part-of') {
          return;
        }
        // find and add the groups
        const groupExists = _.some(this._topologyData.graph.groups, {
          name: label,
        });
        if (!groupExists) {
          this._topologyData.graph.groups.push({
            id: `group:${label}`,
            name: label,
            nodes: [currentNode.id],
          });
        } else {
          const gIndex = _.findIndex(this._topologyData.graph.groups, { name: label });
          this._topologyData.graph.groups[gIndex].nodes.push(currentNode.id);
        }
      });
    }
  }

  /**
   * sort the deployement version
   */
  private sortByDeploymentVersion = (
    replicationControllers: ResourceProps[],
    descending: boolean,
  ) => {
    const version = 'openshift.io/deployment-config.latest-version';
    const compareDeployments = (left, right) => {
      const leftVersion = parseInt(_.get(left, version), 10);
      const rightVersion = parseInt(_.get(right, version), 10);

      // Fall back to sorting by name if right Name no deployment versions.
      let leftName, rightName;
      if (!_.isFinite(leftVersion) && !_.isFinite(rightVersion)) {
        leftName = _.get(left, 'metadata.name', '');
        rightName = _.get(right, 'metadata.name', '');
        if (descending) {
          return rightName.localeCompare(leftName);
        }
        return leftName.localeCompare(rightName);
      }

      if (!leftVersion) {
        return descending ? 1 : -1;
      }

      if (!rightVersion) {
        return descending ? -1 : 1;
      }

      if (descending) {
        return rightVersion - leftVersion;
      }
      return leftVersion - rightVersion;
    };

    return _.toArray(replicationControllers).sort(compareDeployments);
  };
}
