import React from 'react';
import { BaseEdge, EdgeProps, getBezierPath } from 'reactflow';
import { useStore } from './store';

export const ReplayEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data
}: EdgeProps) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const { playbackState, playbackSpeed } = useStore();
  const isPlaying = playbackState === 'playing';
  
  const particles = data?.particles || [];

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <path id={`path-${id}`} d={edgePath} fill="none" stroke="none" />
      
      {particles.map((p: any, i: number) => (
        <circle key={i} r="4" fill={p.color} style={{ filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.5))', opacity: playbackState === 'stopped' ? 0 : 1 }}>
          <animateMotion 
            dur={`${p.duration / playbackSpeed}s`} 
            begin={`${p.delay / playbackSpeed}s`}
            repeatCount="indefinite"
            calcMode="linear"
          >
            <mpath href={`#path-${id}`} />
          </animateMotion>
        </circle>
      ))}
    </>
  );
};
