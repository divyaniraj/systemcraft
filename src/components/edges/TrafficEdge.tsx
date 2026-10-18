import React from 'react';
import { BaseEdge, getBezierPath } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';

export const TrafficEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      {/* Background wire */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: '#334155',
          strokeWidth: 3,
          ...style,
        }}
        markerEnd={markerEnd}
      />

      {/* Animated glowing packet overlay */}
      <path
        d={edgePath}
        fill="none"
        stroke="#38bdf8"
        strokeWidth={2.5}
        className="flow-packet-normal"
      />
    </>
  );
};
