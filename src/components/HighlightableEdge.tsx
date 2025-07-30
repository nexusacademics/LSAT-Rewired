import React, { useState } from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath, getSmoothStepPath } from 'reactflow';

const HighlightableEdge = ({ id, sourceX, sourceY, targetX, targetY, selected, data, style }: EdgeProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const isDashed = data?.style === 'dashed';
  
  // How far back from the target handle the arrow tip should be placed
  const HANDLE_RADIUS = 5;
  
  // Compute vector from source to target
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const length = Math.sqrt(dx * dx + dy * dy);
  
  // Calculate unit vector (avoid division by zero)
  const unitX = length === 0 ? 0 : dx / length;
  const unitY = length === 0 ? 0 : dy / length;
  
  // Calculate rotation angle in degrees
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  
  // Adjust target point to be just before the handle edge
  const adjustedTargetX = targetX - unitX * HANDLE_RADIUS;
  const adjustedTargetY = targetY - unitY * HANDLE_RADIUS;
  
  // Generate the path with the adjusted target coordinates
  const [edgePath] = getSmoothStepPath({ 
    sourceX, 
    sourceY, 
    targetX: adjustedTargetX, 
    targetY: adjustedTargetY 
  });
  
  const toggleStyle = () => {
    if (data?.onStyleChange) {
      data.onStyleChange(id, isDashed ? 'solid' : 'dashed');
    }
  };
  
  const edgeColor = selected ? '#facc15' : '#64748b';
  // Create unique marker IDs for each edge with its angle
  const markerId = `arrow-${id}-${selected ? 'selected' : 'unselected'}`;
  
  return (
    <>
     
      
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={`url(#${markerId})`}
        style={{
          stroke: edgeColor,
          strokeWidth: selected ? 5 : 2,
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