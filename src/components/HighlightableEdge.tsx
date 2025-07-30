import React, { useState } from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from 'reactflow';

const HighlightableEdge = ({ id, sourceX, sourceY, targetX, targetY, selected, data, style }: EdgeProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const isDashed = data?.style === 'dashed';

  const [edgePath] = getBezierPath({ sourceX, sourceY, targetX, targetY });

  const toggleStyle = () => {
    if (data?.onStyleChange) {
      data.onStyleChange(id, isDashed ? 'solid' : 'dashed');
    }
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd="url(#reactflow__arrowclosed)"
        style={{
          stroke: selected ? '#facc15' : '#64748b',
          strokeWidth: selected ? 3 : 2,
          strokeDasharray: isDashed ? '6 4' : 'none',
          filter: selected ? 'drop-shadow(0 0 4px #facc15)' : 'none',
          transition: 'stroke 0.2s, filter 0.2s',
          ...style,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      {isHovered && (
        <EdgeLabelRenderer>
          <div
            onClick={toggleStyle}
            style={{
              position: 'absolute',
              background: 'white',
              padding: '4px 8px',
              borderRadius: 6,
              border: '1px solid #ccc',
              fontSize: 12,
              cursor: 'pointer',
              userSelect: 'none',
              transform: `translate(calc(${(sourceX + targetX) / 2}px - 50%), calc(${(sourceY + targetY) / 2}px - 50%))`,
              whiteSpace: 'nowrap',
              zIndex: 10,
            }}
          >
            {isDashed ? 'Make Solid' : 'Make Dashed'}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default HighlightableEdge;
