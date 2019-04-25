/* eslint-disable no-unused-vars, no-undef */
import * as React from 'react';
import { PenIcon } from '@patternfly/react-icons';
import Decorator from './Decorator';
import BaseNode from './BaseNode';
import WorkloadNode from './WorkloadNode';
import { NodeProps, WorkloadData } from '../topology-types';

const NodeWrapper: React.FC<NodeProps<WorkloadData>> = ({
  id,
  data,
  x,
  y,
  size,
  selected,
  onSelect,
}) => {
  const radius = size / 2;
  const strokeWidth = radius * 0.15;
  const whiteSpaceBWPodAndOuterRadius = strokeWidth / 2;
  const whiteSpaceBWPodAndInnerRadius = strokeWidth;
  const innerCircleRadius =
    radius - strokeWidth - whiteSpaceBWPodAndInnerRadius - whiteSpaceBWPodAndOuterRadius;
  const workloadNodeInnerRadius = innerCircleRadius + whiteSpaceBWPodAndInnerRadius;
  const workloadNodeOuterRadius = innerCircleRadius + whiteSpaceBWPodAndInnerRadius + strokeWidth;
  const decoratorRadius = radius * 0.25;
  return (
    <g transform={`translate(${x},${y})`}>
      <BaseNode
        outerRadius={radius}
        innerRadius={innerCircleRadius}
        icon={data.data.builderImage}
        label={data.name}
        selected={selected}
        onSelect={onSelect}
      />
      <WorkloadNode
        innerRadius={workloadNodeInnerRadius}
        outerRadius={workloadNodeOuterRadius}
        data={data.data.donutStatus.pods}
      />
      {data.data.editUrl && (
        /*
          // @ts-ignore */
        <a xlinkHref={data.data.editUrl} target="_blank">
          <Decorator
            x={radius - decoratorRadius}
            y={radius - decoratorRadius}
            radius={decoratorRadius}
          >
            <g transform={`translate(-${decoratorRadius / 2}, -${decoratorRadius / 2})`}>
              <PenIcon style={{ fontSize: decoratorRadius }} />
            </g>
          </Decorator>
        </a>
      )}
    </g>
  );
};

export default NodeWrapper;
