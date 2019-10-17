import * as _ from 'lodash';
import { referenceForModel, K8sResourceKind } from '@console/internal/module/k8s';
import { FirehoseResource } from '@console/internal/components/utils';
import { PipelineOverviewItem } from '@console/shared';
import { PipelineRunModel, PipelineModel } from '../models';
import { Pipeline, PipelineRun } from './pipeline-augment';

// label to get the pipelines
export const PIPELINE_REF = 'app.openshift.io/pipeline-ref';

export const tknPipelineAndPipelineRunsResources = (namespace: string): FirehoseResource[] => {
  const resources = [
    {
      isList: true,
      kind: referenceForModel(PipelineRunModel),
      namespace,
      prop: 'pipelineRuns',
      optional: true,
    },
    {
      isList: true,
      kind: referenceForModel(PipelineModel),
      namespace,
      prop: 'pipelines',
      optional: true,
    },
  ];
  return resources;
};

const getPipelineRunsForPipeline = (pipeline: Pipeline, props): PipelineRun[] => {
  if (!props && !props.pipelineRuns) return undefined;
  const pipelineRunsData = props.pipelineRuns.data;
  const PIPELINE_RUN_LABEL = 'tekton.dev/pipeline';
  const pipelineName = pipeline.metadata.name;
  return pipelineRunsData.filter((pr: PipelineRun) => {
    return (
      pipelineName ===
      (_.get(pr, ['spec', 'pipelineRef', 'name'], null) ||
        _.get(pr, ['metadata', 'labels', PIPELINE_RUN_LABEL], null))
    );
  });
};

export const getPipelinesAndPipelineRunsForResource = (
  resource: K8sResourceKind,
  props,
): { pipelines: PipelineOverviewItem } => {
  if (!props && !props.pipelines) return undefined;
  const pipelinesData = props.pipelines.data;
  const pipelineName = _.get(resource, ['metadata', 'labels', PIPELINE_REF], null);
  if (!pipelineName) return null;
  const resourcePipeline = pipelinesData.find((pl) => pl.metadata.name === pipelineName);
  const pipelines = {
    obj: resourcePipeline,
    pipelineRuns: getPipelineRunsForPipeline(resourcePipeline, props),
  };
  return { pipelines };
};
