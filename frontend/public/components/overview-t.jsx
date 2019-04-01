import * as React from 'react';
import { Helmet } from 'react-helmet';
import { PageHeading, Firehose } from './utils';
import { AppTopology } from './app-topology/app-topology';
import {namespaceProptype} from "../propTypes";

export const OverviewT = ({namespace, ...props}) => {
  if (namespace) {
    const resources = [
      {
        isList: true,
        kind: "Pod",
        namespace: namespace,
        prop: 'pods'
      },
      {
        isList: true,
        kind: "ReplicationController",
        namespace: namespace,
        prop: 'replicationControllers'
      },
      {
        isList: true,
        kind: "DeploymentConfig",
        namespace: namespace,
        prop: 'deploymentConfigs'
      },
      {
        isList: true,
        kind: "Route",
        namespace: namespace,
        prop: 'routes'
      },
      {
        isList: true,
        kind: "Service",
        namespace: namespace,
        prop: 'services'
      }
    ];

    return (
      <div className="overview-page">
        <Helmet>
          <title>Overview</title>
        </Helmet>
        <PageHeading detail={true} title={`Overview of ${namespace}`}/>
        <Firehose resources={resources} className="app-topology-container">
          <AppTopology namespace={namespace} {...props} />
        </Firehose>
      </div>
    );
  }

  return (
    <div className="overview-page">
      <Helmet>
        <title>Overview</title>
      </Helmet>
    {/*<PageHeading detail={true} title="Cluster Overview"/>*/}
    </div>
  );
};

OverviewT.defaultProps = {
};

OverviewT.propTypes = {
  namespace: namespaceProptype
};
