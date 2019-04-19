/* eslint-disable no-unused-vars, no-undef */
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { match as RMatch } from 'react-router';
import ODCEmptyState from '../shared/components/EmptyState/EmptyState';
import { Firehose, StatusBox } from '../../../components/utils';
import { K8sResourceKind } from '../../../module/k8s/index';
import TopologyDataController from '../components/topology/TopologyDataController';
import TopologyLayout from '../components/topology/TopologyLayout';
import { PageHeading } from '../../../components/utils';
import Topology from '../components/topology/Topology';

type FirehoseList = {
  data?: K8sResourceKind[];
  [key: string]: any;
};

export interface TopologyPageContentProps {
  deploymentConfigs?: FirehoseList;
  loaded?: boolean;
  loadError?: string;
}

export interface TopologyPageProps {
  match: RMatch<{
    ns?: string;
  }>;
}

const EmptyMsg = () => <ODCEmptyState title="Topology" />

export const TopologyPageContent: React.FunctionComponent<TopologyPageContentProps> = (
  props: TopologyPageContentProps,
) => {
  return (
    <StatusBox
      data={props.deploymentConfigs.data}
      label="Topology"
      loaded={props.loaded}
      loadError={props.loadError}
      EmptyMsg={EmptyMsg}
    >
      <Topology />

      <TopologyDataController
        namespace={props.namespace}
        render={({topologyGraphData}) => <Topology graphData={topologyGraphData} />}
      />
    </StatusBox>
  );
};

const TopologyPage: React.FC<TopologyPageProps> = ({ match }) => {
  const namespace = match.params.ns;
  const resources = [
    {
      isList: true,
      kind: 'DeploymentConfig',
      namespace,
      prop: 'deploymentConfigs',
    },
    {
      isList: true,
      kind: 'Deployment',
      namespace,
      prop: 'deployments',
    },
    {
      isList: true,
      kind: 'Pod',
      namespace,
      prop: 'pods',
    },
    {
      isList: true,
      kind: 'ReplicationController',
      namespace,
      prop: 'replicationControllers',
    },
    {
      isList: true,
      kind: 'Route',
      namespace,
      prop: 'routes',
    },
    {
      isList: true,
      kind: 'Service',
      namespace,
      prop: 'services',
    },
    {
      isList: true,
      kind: 'ReplicaSet',
      namespace,
      prop: 'replicasets',
    },
  ];

  return (
    <React.Fragment>
      <Helmet>
        <title>Topology</title>
      </Helmet>
      {namespace ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
          }}
        >
          <div style={{ flexGrow: 0, flexShrink: 0 }}>
            <PageHeading title="Topology" />
          </div>
          <Firehose resources={resources} forceUpdate>
            <TopologyPageContent />
          </Firehose>
        </div>
      ) : (
        <React.Fragment>
          <PageHeading title="Topology" />
          <ODCEmptyState />
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default TopologyPage;
