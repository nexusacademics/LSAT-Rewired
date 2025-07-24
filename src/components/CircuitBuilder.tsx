import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Save, RotateCcw, Info } from 'lucide-react'; // Added Info icon
import { DiagramNode, Circuit, ProcessedQuestion, TestSession } from '../App'; // Import ProcessedQuestion and TestSession

interface CircuitBuilderProps {
  onBack: () => void;
  onSaveCircuit: (circuit: Circuit) => void;
  questionData: ProcessedQuestion;
  session: TestSession; // Added session prop
  existingCircuit: Circuit | undefined; // NEW PROP: Pass existing circuit data
}

type SelectedElement =
  | { type: 'node'; id: string }
  | { type: 'connection'; from: string; to: string };

const CircuitBuilder: React.FC<CircuitBuilderProps> = ({ onBack, onSaveCircuit, questionData, session, existingCircuit }) => {
  // Initialize nodes from existingCircuit or an empty array
  const [nodes, setNodes] = useState<DiagramNode[]>(existingCircuit ? existingCircuit.diagram : []);
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null); // Changed to selectedElement
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [newNodeType, setNewNodeType] = useState<DiagramNode['type']>('conclusion-subject'); // Changed default to a valid type
  const [analysisScore, setAnalysisScore] = useState(existingCircuit ? existingCircuit.analysisQuality : 0); // Initialize score
  const [connectionMode, setConnectionMode] = useState(false);
  const [connectionStartNodeId, setConnectionStartNodeId] = useState<string | null>(null);
  const [tempLineCoords, setTempLineCoords] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [showInstructions, setShowInstructions] = useState(false); // State for instructions popup
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle'); // NEW: Save status
  const [resizingNode, setResizingNode] = useState<{ nodeId: string; handle: string } | null>(null);
  const [resizeStartData, setResizeStartData] = useState<{ x: number; y: number; width: number; height: number; nodeX: number; nodeY: number } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<{ [key: string]: HTMLDivElement }>({});
  const textareaRefs = useRef<{ [key: string]: HTMLTextAreaElement }>({}); // Keep for other nodes

  // Effect to update nodes when existingCircuit prop changes (e.g., when re-entering builder)
  useEffect(() => {
    setNodes(existingCircuit ? existingCircuit.diagram : []);
    setAnalysisScore(existingCircuit ? existingCircuit.analysisQuality : 0);
  }, [existingCircuit]);

  // Get base minimum size for a node type (before any text)
  const getBaseMinimumSize = (nodeType: DiagramNode['type']) => {
    switch (nodeType) {
      case 'assumption':
        return { width: 280, height: 100 };
      default:
        return { width: 120, height: 70 };
    }
  };

  // Helper function to measure text dimensions
  const measureText = (text: string, nodeType: DiagramNode['type']): { width: number; height: number } => {
    // Create a temporary element to measure text
    const tempElement = document.createElement('div');
    tempElement.style.position = 'absolute';
    tempElement.style.visibility = 'hidden';
    tempElement.style.whiteSpace = 'pre-wrap';
    tempElement.style.wordWrap = 'break-word';
    tempElement.style.fontSize = '12px'; // text-xs
    tempElement.style.lineHeight = '1.25'; // leading-tight
    tempElement.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    tempElement.style.padding = '12px'; // p-3
    
    // Set a reasonable max width for text wrapping
    const maxWidth = nodeType === 'assumption' ? 280 : 200;
    tempElement.style.maxWidth = `${maxWidth}px`;
    
    // Add the label text
    const config = getNodeTypeConfig(nodeType);
    const labelText = config.label + '\n';
    
    if (nodeType === 'assumption') {
      try {
        const assumptionContent: string[] = JSON.parse(text);
        tempElement.textContent = labelText + 
          'The author assumes that ' + assumptionContent[0] + 
          ' and overlooks the possibility that ' + assumptionContent[1];
      } catch (e) {
        tempElement.textContent = labelText + 
          'The author assumes that  and overlooks the possibility that ';
      }
    } else {
      tempElement.textContent = labelText + text;
    }
    
    document.body.appendChild(tempElement);
    const rect = tempElement.getBoundingClientRect();
    document.body.removeChild(tempElement);
    
    // Add some padding and minimum dimensions
    const minWidth = nodeType === 'assumption' ? 280 : 120;
    const minHeight = nodeType === 'assumption' ? 100 : 70;
    
    return {
      width: Math.max(minWidth, Math.ceil(rect.width) + 20),
      height: Math.max(minHeight, Math.ceil(rect.height) + 20)
    };
  };

  // Effect to auto-resize nodes based on content (only expand, never shrink below base minimum)
  useEffect(() => {
    setNodes(prevNodes => prevNodes.map(node => {
      const textMeasurement = measureText(node.content, node.type);
      const baseMinimum = getBaseMinimumSize(node.type);
      
      const currentWidth = node.size?.width || 128;
      const currentHeight = node.size?.height || 48;
      
      // Auto-expand to fit text, but never shrink below base minimum
      const newWidth = Math.max(baseMinimum.width, textMeasurement.width, currentWidth);
      const newHeight = Math.max(baseMinimum.height, textMeasurement.height, currentHeight);
      
      // Only update if size actually changed
      if (newWidth !== currentWidth || newHeight !== currentHeight) {
        return {
          ...node,
          size: {
            width: newWidth,
            height: newHeight
          }
        };
      }
      
      return node;
    }));
  }, [nodes]);

  // NEW: Autosave effect
  useEffect(() => {
    const autosaveInterval = setInterval(() => {
      if (nodes.length > 0) { // Only autosave if there are nodes
        saveCircuit();
      }
    }, 10000); // Autosave every 10 seconds

    return () => clearInterval(autosaveInterval);
  }, [nodes]); // Re-run effect if nodes change

  // Updated Node Types
  const nodeTypes = [
    { type: 'conclusion-subject' as const, label: 'Conclusion Subject', color: 'bg-purple-50 border-purple-200 text-purple-700', shape: 'rectangle' as const, description: 'The entity or concept the conclusion is about' },
    { type: 'conclusion-predicate' as const, label: 'Conclusion Predicate/Claim', color: 'bg-purple-200 border-purple-400 text-purple-900', shape: 'rectangle' as const, description: 'The specific claim or assertion made about the subject' },
    { type: 'minor-premise' as const, label: 'Minor Premise', color: 'bg-gray-50 border-black text-black', shape: 'rectangle' as const, description: 'Supporting evidence' },
    { type: 'major-premise' as const, label: 'Major Premise', color: 'bg-blue-100 border-blue-300 text-blue-800', shape: 'rectangle' as const, description: 'A broad statement or principle' },
    { type: 'backing-premise' as const, label: 'Backing/Linking Premise', color: 'bg-gray-50 border-gray-300 text-gray-800', shape: 'rectangle' as const, description: 'Provides support for another premise or conclusion' },
    { type: 'assumption' as const, label: 'Assumption/Flaw', color: 'bg-red-100 border-red-300 text-red-800', shape: 'rectangle' as const, description: 'Unstated Premise implied by the author' }, // Updated label and description
    { type: 'counterclaim' as const, label: 'Counterclaim/Concession', color: 'bg-gray-100 border-red-300 text-red-800', shape: 'rectangle' as const, description: 'An opposing argument or point conceded' },
    { type: 'correct-answer' as const, label: 'Correct Answer', color: 'bg-green-200 border-green-400 text-green-800', shape: 'rectangle' as const, description: 'The correct answer choice for the question' }
  ];

  // Helper function to get node dimensions from DOM
  const getNodeDimensions = (nodeId: string) => {
    const nodeElement = nodeRefs.current[nodeId];
    const node = nodes.find(n => n.id === nodeId);
    if (nodeElement) {
      const rect = nodeElement.getBoundingClientRect();
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (canvasRect) {
        return {
          width: node?.size?.width || rect.width,
          height: node?.size?.height || rect.height,
          x: rect.left - canvasRect.left,
          y: rect.top - canvasRect.top
        };
      }
    }
    // Fallback to minimum dimensions
    const config = getNodeTypeConfig(node?.type || 'conclusion-subject'); // Changed default to a valid type
    return {
      width: node?.size?.width || (config.shape === 'ellipse' ? 160 : 128),
      height: node?.size?.height || (config.shape === 'ellipse' ? 80 : 48),
      x: node?.position.x || 0,
      y: node?.position.y || 0
    };
  };

  // Calculate intersection point of line with node boundary
  const getBoundaryIntersectionPoint = (fromNode: DiagramNode, toNode: DiagramNode, isStart: boolean) => {
    const fromDims = getNodeDimensions(fromNode.id);
    const toDims = getNodeDimensions(toNode.id);
    
    const fromCenter = {
      x: fromDims.x + fromDims.width / 2,
      y: fromDims.y + fromDims.height / 2
    };
    
    const toCenter = {
      x: toDims.x + toDims.width / 2,
      y: toDims.y + toDims.height / 2
    };
    
    const targetNode = isStart ? fromNode : toNode;
    const targetDims = isStart ? fromDims : toDims;
    const targetCenter = isStart ? fromCenter : toCenter;
    const otherCenter = isStart ? toCenter : fromCenter;
    
    // Calculate direction vector
    const dx = otherCenter.x - targetCenter.x;
    const dy = otherCenter.y - targetCenter.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) return targetCenter;
    
    // Normalize direction
    const unitX = dx / length;
    const unitY = dy / length;
    
    const config = getNodeTypeConfig(targetNode.type);
    
    if (config.shape === 'ellipse') {
      // For ellipse, calculate intersection with ellipse boundary
      const a = targetDims.width / 2;  // semi-major axis
      const b = targetDims.height / 2; // semi-minor axis
      
      // Parametric intersection with ellipse
      const t = (a * b) / Math.sqrt(b * b * unitX * unitX + a * a * unitY * unitY);
      
      return {
        x: targetCenter.x + t * unitX,
        y: targetCenter.y + t * unitY
      };
    } else {
      // For rectangles (including rounded), find intersection with rectangle boundary
      const halfWidth = targetDims.width / 2;
      const halfHeight = targetDims.height / 2;
      
      // Calculate intersection with rectangle edges
      let intersectionX, intersectionY;
      
      if (Math.abs(unitX) > Math.abs(unitY)) {
        // Intersect with left or right edge
        intersectionX = targetCenter.x + (unitX > 0 ? halfWidth : -halfWidth);
        intersectionY = targetCenter.y + (intersectionX - targetCenter.x) * (unitY / unitX);
        
        // Clamp to rectangle bounds
        if (Math.abs(intersectionY - targetCenter.y) > halfHeight) {
          intersectionY = targetCenter.y + (unitY > 0 ? halfHeight : -halfHeight);
          intersectionX = targetCenter.x + (intersectionY - targetCenter.y) * (unitX / unitY);
        }
      } else {
        // Intersect with top or bottom edge
        intersectionY = targetCenter.y + (unitY > 0 ? halfHeight : -halfHeight);
        intersectionX = targetCenter.x + (intersectionY - targetCenter.y) * (unitX / unitY);
        
        // Clamp to rectangle bounds
        if (Math.abs(intersectionX - targetCenter.x) > halfWidth) {
          intersectionX = targetCenter.x + (unitX > 0 ? halfWidth : -halfWidth);
          intersectionY = targetCenter.y + (intersectionX - targetCenter.x) * (unitX / unitY);
        }
      }
      
      return {
        x: intersectionX,
        y: intersectionY
      };
    }
  };

  const addNode = (x: number, y: number, type: DiagramNode['type']) => {
    let initialContent: string | string[] = '';
    if (type === 'assumption') {
      initialContent = JSON.stringify(['', '']); // Store as JSON string of an array
    }

    const nodeTypeConfig = getNodeTypeConfig(type);
    const baseMinimum = getBaseMinimumSize(type);
    const newNode: DiagramNode = {
      id: `node-${Date.now()}`,
      type: type,
      shape: nodeTypeConfig.shape,
      content: initialContent as string, // Cast to string to match DiagramNode interface
      position: { x, y },
      size: { 
        width: baseMinimum.width, 
        height: baseMinimum.height
      },
      connections: []
    };
    setNodes([...nodes, newNode]);
    setSelectedElement({ type: 'node', id: newNode.id }); // Select new node
  };

  // Modified updateNodeContent to handle assumption node's array content
  const updateNodeContent = (nodeId: string, value: string, contentIndex?: number) => {
    setNodes(nodes.map(node => {
      if (node.id === nodeId) {
        if (node.type === 'assumption' && contentIndex !== undefined) {
          try {
            const currentContentArray: string[] = JSON.parse(node.content);
            currentContentArray[contentIndex] = value;
            return { ...node, content: JSON.stringify(currentContentArray) };
          } catch (e) {
            console.error("Failed to parse assumption node content:", e);
            return node; // Return original node on error
          }
        } else {
          return { ...node, content: value };
        }
      }
      return node;
    }));
  };

  const deleteNode = (nodeId: string) => {
    setNodes(prevNodes => prevNodes.filter(node => node.id !== nodeId && !node.connections.some(conn => conn.targetId === nodeId)));
    setSelectedElement(null); // Clear selection
  };

  const deleteConnection = (fromNodeId: string, toNodeId: string) => {
    setNodes(prevNodes => prevNodes.map(node => {
      if (node.id === fromNodeId) {
        return {
          ...node,
          connections: node.connections.filter(conn => conn.targetId !== toNodeId)
        };
      }
      return node;
    }));
    setSelectedElement(null); // Clear selection
  };

  const handleResizeStart = (e: React.MouseEvent, nodeId: string, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const node = nodes.find(n => n.id === nodeId);
    if (!node || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    setResizingNode({ nodeId, handle });
    setResizeStartData({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      width: node.size?.width || 128,
      height: node.size?.height || 48,
      nodeX: node.position.x,
      nodeY: node.position.y
    });
  };

  const handleResize = useCallback((e: MouseEvent) => {
    if (!resizingNode || !resizeStartData || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    const deltaX = currentX - resizeStartData.x;
    const deltaY = currentY - resizeStartData.y;
    
    // Use base minimum size (not text-based) for manual resizing
    const currentNode = nodes.find(n => n.id === resizingNode.nodeId);
    const baseMinimum = currentNode ? getBaseMinimumSize(currentNode.type) : { width: 120, height: 70 };
    const minWidth = baseMinimum.width;
    const minHeight = baseMinimum.height;
    
    let newWidth = resizeStartData.width;
    let newHeight = resizeStartData.height;
    let newX = resizeStartData.nodeX;
    let newY = resizeStartData.nodeY;
    
    switch (resizingNode.handle) {
      case 'se': // Southeast (bottom-right)
        newWidth = Math.max(minWidth, resizeStartData.width + deltaX);
        newHeight = Math.max(minHeight, resizeStartData.height + deltaY);
        break;
      case 'sw': // Southwest (bottom-left)
        const proposedSwWidth = resizeStartData.width - deltaX;
        if (proposedSwWidth >= minWidth) {
          newWidth = proposedSwWidth;
          newX = resizeStartData.nodeX + deltaX;
        }
        newHeight = Math.max(minHeight, resizeStartData.height + deltaY);
        break;
      case 'ne': // Northeast (top-right)
        newWidth = Math.max(minWidth, resizeStartData.width + deltaX);
        const proposedNeHeight = resizeStartData.height - deltaY;
        if (proposedNeHeight >= minHeight) {
          newHeight = proposedNeHeight;
          newY = resizeStartData.nodeY + deltaY;
        }
        break;
      case 'nw': // Northwest (top-left)
        const proposedNwWidth = resizeStartData.width - deltaX;
        const proposedNwHeight = resizeStartData.height - deltaY;
        if (proposedNwWidth >= minWidth) {
          newWidth = proposedNwWidth;
          newX = resizeStartData.nodeX + deltaX;
        }
        if (proposedNwHeight >= minHeight) {
          newHeight = proposedNwHeight;
          newY = resizeStartData.nodeY + deltaY;
        }
        break;
      case 'n': // North (top)
        const proposedNHeight = resizeStartData.height - deltaY;
        if (proposedNHeight >= minHeight) {
          newHeight = proposedNHeight;
          newY = resizeStartData.nodeY + deltaY;
        }
        break;
      case 's': // South (bottom)
        newHeight = Math.max(minHeight, resizeStartData.height + deltaY);
        break;
      case 'e': // East (right)
        newWidth = Math.max(minWidth, resizeStartData.width + deltaX);
        break;
      case 'w': // West (left)
        const proposedWWidth = resizeStartData.width - deltaX;
        if (proposedWWidth >= minWidth) {
          newWidth = proposedWWidth;
          newX = resizeStartData.nodeX + deltaX;
        }
        break;
    }
    
    setNodes(prevNodes => prevNodes.map(node => 
      node.id === resizingNode.nodeId 
        ? { 
            ...node, 
            size: { width: newWidth, height: newHeight },
            position: { x: Math.max(0, newX), y: Math.max(0, newY) }
          }
        : node
    ));
  }, [resizingNode, resizeStartData, nodes]);

  const handleResizeEnd = useCallback(() => {
    setResizingNode(null);
    setResizeStartData(null);
  }, []);

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent canvas click from deselecting

    if (connectionMode) {
      setConnectionStartNodeId(nodeId);
      const nodeElement = nodeRefs.current[nodeId];
      if (nodeElement && canvasRef.current) {
        const rect = nodeElement.getBoundingClientRect();
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const startX = (rect.left - canvasRect.left) + rect.width / 2;
        const startY = (rect.top - canvasRect.top) + rect.height / 2;
        setTempLineCoords({ x1: startX, y1: startY, x2: startX, y2: startY });
      }
    } else {
      setDraggedNode(nodeId);
      setSelectedElement({ type: 'node', id: nodeId }); // Select node on drag start
      
      const node = nodes.find(n => n.id === nodeId);
      if (node && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setDragOffset({
          x: e.clientX - rect.left - node.position.x,
          y: e.clientY - rect.top - node.position.y
        });
      }
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (draggedNode && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const newX = e.clientX - rect.left - dragOffset.x;
      const newY = e.clientY - rect.top - dragOffset.y;
      
      setNodes(nodes => nodes.map(node =>
        node.id === draggedNode
          ? { ...node, position: { x: Math.max(0, newX), y: Math.max(0, newY) } }
          : node
      ));
    } else if (connectionStartNodeId && tempLineCoords && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setTempLineCoords(prev => ({
        ...prev!,
        x2: e.clientX - rect.left,
        y2: e.clientY - rect.top
      }));
    }
  }, [draggedNode, dragOffset, connectionStartNodeId, tempLineCoords]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (draggedNode) {
      setDraggedNode(null);
    } else if (connectionStartNodeId) {
      const targetElement = e.target as HTMLElement;
      const targetNodeElement = targetElement.closest('.circuit-node');
      if (targetNodeElement) {
        const targetNodeId = targetNodeElement.dataset.nodeId;
        if (targetNodeId && targetNodeId !== connectionStartNodeId) {
          setNodes(nodes => nodes.map(node =>
            node.id === connectionStartNodeId
              ? { ...node, connections: [...node.connections, { targetId: targetNodeId, style: 'solid' }] }
              : node
          ));
        }
      }
      setConnectionStartNodeId(null);
      setTempLineCoords(null);
      setConnectionMode(false);
    }
  }, [draggedNode, connectionStartNodeId, nodes]);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', handleResizeEnd);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleResize);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [handleMouseMove, handleMouseUp, handleResize, handleResizeEnd]);

  // Effect to resize textareas on node changes (for non-assumption nodes)
  useEffect(() => {
    Object.values(textareaRefs.current).forEach(textarea => {
      if (textarea) {
        textarea.style.height = 'auto'; // Reset height to calculate scrollHeight correctly
        textarea.style.height = textarea.scrollHeight + 'px';
      }
    });
  }, [nodes]); // Run when nodes array changes

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (connectionMode || draggedNode) {
      return;
    }
    // Clear selection if clicking on canvas background and not on a node or connection hitbox
    if (canvasRef.current && !(e.target as Element).closest('.circuit-node') && !(e.target as Element).closest('.circuit-connection-hitbox')) {
      setSelectedElement(null);
    }
  };

  const handleDragStart = (e: React.DragEvent, type: DiagramNode['type']) => {
    e.dataTransfer.setData('nodeType', type);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Allow drop
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const nodeType = e.dataTransfer.getData('nodeType') as DiagramNode['type'];
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      addNode(x, y, nodeType);
    }
  };

  const startConnectionMode = () => {
    setConnectionMode(true);
    setConnectionStartNodeId(null);
    setSelectedElement(null); // Clear any existing selection
  };

  const calculateAnalysisScore = () => {
    let score = 0;
    // Check for at least one of the new conclusion types
    const hasConclusion = nodes.some(node => node.type === 'conclusion-subject' || node.type === 'conclusion-predicate');
    const hasPremises = nodes.filter(node => node.type === 'minor-premise' || node.type === 'major-premise' || node.type === 'backing-premise').length >= 2;
    const hasContent = nodes.every(node => {
      if (node.type === 'assumption') {
        try {
          const assumptionContent: string[] = JSON.parse(node.content);
          return assumptionContent.every(part => part.trim().length > 0); // Both parts must have content
        } catch (e) {
          return false; // Invalid JSON means no content
        }
      }
      return node.content.trim().length > 0;
    });
    
    if (hasConclusion) score += 30;
    if (hasPremises) score += 40;
    if (hasContent) score += 30;
    
    setAnalysisScore(score);
    return score;
  };

  const saveCircuit = () => {
    setSaveStatus('saving');
    try {
      const score = calculateAnalysisScore();
      const circuit: Circuit = {
        id: existingCircuit?.id || `circuit-${Date.now()}`, // Use existing ID if available
        questionId: questionData.id,
        diagram: nodes,
        annotations: existingCircuit?.annotations || [], // Preserve existing annotations
        analysisQuality: score,
        createdAt: existingCircuit?.createdAt || new Date()
      };
      onSaveCircuit(circuit);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000); // Reset status after 2 seconds
    } catch (error) {
      console.error("Failed to save circuit:", error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000); // Reset status after 3 seconds
    }
  };

  const getNodeTypeConfig = (type: DiagramNode['type']) => {
    return nodeTypes.find(nt => nt.type === type) || nodeTypes[0];
  };

  const getShapeClasses = (shape: DiagramNode['shape']) => {
    switch (shape) {
      case 'rectangle': return 'rounded-none';
      case 'rounded-rectangle': return 'rounded-2xl';
      case 'ellipse': return 'rounded-full';
      default: return 'rounded-lg';
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>, nodeId: string, contentIndex?: number) => {
    updateNodeContent(nodeId, e.target.value, contentIndex);
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const correctOptionLetter = String.fromCharCode(65 + questionData.correctAnswer);
  const correctOptionContent = questionData.options[questionData.correctAnswer];

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-semibold text-slate-900">Circuit Builder</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-slate-600">
              Analysis Score: <span className="font-semibold text-slate-900">{analysisScore}/100</span>
            </div>
            {saveStatus === 'saving' && (
              <span className="text-sm text-blue-500">Saving...</span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-sm text-green-500">Saved!</span>
            )}
            {saveStatus === 'error' && (
              <span className="text-sm text-red-500">Save Error!</span>
            )}
            <button
              onClick={() => {
                if (selectedElement?.type === 'node') {
                  deleteNode(selectedElement.id);
                } else if (selectedElement?.type === 'connection') {
                  deleteConnection(selectedElement.from, selectedElement.to);
                }
              }}
              disabled={!selectedElement}
              className="px-4 py-2 text-red-600 hover:text-red-900 border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4 mr-2 inline" />
              {selectedElement?.type === 'node' ? 'Delete Node' : selectedElement?.type === 'connection' ? 'Delete Connection' : 'Delete Selected'}
            </button>
            <button
              onClick={() => setNodes([])}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="h-4 w-4 mr-2 inline" />
              Clear All
            </button>
            <button
              onClick={saveCircuit}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Save className="h-4 w-4 mr-2 inline" />
              Save Circuit
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Toolbar (Left Column) */}
        <div className="w-full md:w-48 lg:w-56 bg-white border-b md:border-b-0 md:border-r border-slate-200 p-3 space-y-4 md:space-y-6 overflow-y-auto max-h-64 md:max-h-none">
          <div>
            <h3 className="text-base font-semibold text-slate-900 mb-3">Node Types</h3>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
              {nodeTypes.map(({ type, label, color, description }) => (
                <button
                  key={type}
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, type)}
                  onClick={() => setNewNodeType(type)} // Keep for selection, though drag is primary
                  className={`group p-2 text-left border-2 rounded-lg transition-colors ${
                    newNodeType === type 
                      ? `${color} border-current` 
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="text-sm font-medium">{label}</div>
                  <div className="text-xs opacity-75 hidden group-hover:block">{description}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-slate-900 mb-3">Connections</h3>
            <div className="space-y-3">
              <button
                onClick={startConnectionMode}
                className={`w-full p-2 rounded-lg text-sm font-medium transition-colors ${
                  connectionMode 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {connectionMode ? 'Click & Drag to Connect' : 'Draw Connection'}
              </button>
              
              {connectionMode && (
                <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                  Click a source node, then drag to a target node.
                </div>
              )}
            </div>
          </div>

          {/* Instructions Button */}
          <div>
            <button
              onClick={() => setShowInstructions(true)}
              className="w-full p-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors flex items-center justify-center"
            >
              <Info className="h-4 w-4 mr-2" />
              Instructions
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
          <div
            ref={canvasRef}
            className="w-full h-full bg-white relative cursor-crosshair min-h-96"
            onClick={handleCanvasClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            style={{ 
              backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          >
            {/* Render connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {nodes.map(node => 
                node.connections.map(connection => {
                  const targetNode = nodes.find(n => n.id === connection.targetId);
                  if (!targetNode) return null;
                  
                  // Calculate precise boundary intersection points
                  const startPoint = getBoundaryIntersectionPoint(node, targetNode, true);
                  const endPoint = getBoundaryIntersectionPoint(node, targetNode, false);

                  const isSelectedConnection = selectedElement?.type === 'connection' &&
                                               selectedElement.from === node.id &&
                                               selectedElement.to === connection.targetId;
                  
                  return (
                    <g key={`${node.id}-${connection.targetId}`}>
                      {/* Invisible hitbox for easier clicking */}
                      <line
                        x1={startPoint.x}
                        y1={startPoint.y}
                        x2={endPoint.x}
                        y2={endPoint.y}
                        stroke="transparent"
                        strokeWidth="10" // Large stroke for hit detection
                        className="circuit-connection-hitbox"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent canvas click
                          setSelectedElement({ type: 'connection', from: node.id, to: connection.targetId });
                        }}
                        style={{ cursor: 'pointer', pointerEvents: 'all' }} // Make it clickable
                      />
                      {/* Actual visible line */}
                      <line
                        x1={startPoint.x}
                        y1={startPoint.y}
                        x2={endPoint.x}
                        y2={endPoint.y}
                        stroke={isSelectedConnection ? 'teal' : '#64748b'} // Highlight color
                        strokeWidth="2"
                        markerEnd="url(#arrowhead)"
                        style={{ pointerEvents: 'none' }} // Do not interfere with hitbox
                      />
                    </g>
                  );
                })
              )}
              {tempLineCoords && (
                <line
                  x1={tempLineCoords.x1}
                  y1={tempLineCoords.y1}
                  x2={tempLineCoords.x2}
                  y2={tempLineCoords.y2}
                  stroke="#64748b"
                  strokeWidth="2"
                  strokeDasharray="5 5"
                  markerEnd="url(#arrowhead)"
                />
              )}
              
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="#64748b"
                  />
                </marker>
              </defs>
            </svg>

            {/* Render nodes */}
            {nodes.map((node) => {
              const config = getNodeTypeConfig(node.type);
              const shapeClasses = getShapeClasses(node.shape);
              const isSelectedNode = selectedElement?.type === 'node' && selectedElement.id === node.id;
              
              return (
                <div
                  key={node.id}
                  data-node-id={node.id}
                  ref={(el) => {
                    if (el) {
                      nodeRefs.current[node.id] = el;
                    }
                  }}
                  className={`absolute w-auto h-auto border-2 ${shapeClasses} p-3 cursor-pointer transition-all circuit-node flex flex-col justify-center items-center ${
                    config.color
                  } ${
                    isSelectedNode
                      ? 'ring-2 ring-teal-500' 
                      : ''
                  } ${
                    connectionMode && connectionStartNodeId === node.id
                      ? 'ring-2 ring-orange-500'
                      : ''
                  }`}
                  style={{
                    left: node.position.x,
                    top: node.position.y,
                    width: node.size?.width || (node.type === 'assumption' ? 300 : 128),
                    height: node.size?.height || (node.type === 'assumption' ? 120 : 48),
                    transform: draggedNode === node.id ? 'scale(1.05)' : 'scale(1)'
                  }}
                  onMouseDown={(e) => handleMouseDown(e, node.id)}
                >
                  {/* Resize handles - only show when node is selected and not in connection mode */}
                  {isSelectedNode && !connectionMode && (
                    <>
                      {/* Corner handles */}
                      <div
                        className="absolute w-2 h-2 bg-teal-500 border border-white rounded-full cursor-nw-resize -top-1 -left-1"
                        onMouseDown={(e) => handleResizeStart(e, node.id, 'nw')}
                      />
                      <div
                        className="absolute w-2 h-2 bg-teal-500 border border-white rounded-full cursor-ne-resize -top-1 -right-1"
                        onMouseDown={(e) => handleResizeStart(e, node.id, 'ne')}
                      />
                      <div
                        className="absolute w-2 h-2 bg-teal-500 border border-white rounded-full cursor-sw-resize -bottom-1 -left-1"
                        onMouseDown={(e) => handleResizeStart(e, node.id, 'sw')}
                      />
                      <div
                        className="absolute w-2 h-2 bg-teal-500 border border-white rounded-full cursor-se-resize -bottom-1 -right-1"
                        onMouseDown={(e) => handleResizeStart(e, node.id, 'se')}
                      />
                      
                      {/* Edge handles */}
                      <div
                        className="absolute w-2 h-2 bg-teal-500 border border-white rounded-full cursor-n-resize -top-1 left-1/2 transform -translate-x-1/2"
                        onMouseDown={(e) => handleResizeStart(e, node.id, 'n')}
                      />
                      <div
                        className="absolute w-2 h-2 bg-teal-500 border border-white rounded-full cursor-s-resize -bottom-1 left-1/2 transform -translate-x-1/2"
                        onMouseDown={(e) => handleResizeStart(e, node.id, 's')}
                      />
                      <div
                        className="absolute w-2 h-2 bg-teal-500 border border-white rounded-full cursor-w-resize -left-1 top-1/2 transform -translate-y-1/2"
                        onMouseDown={(e) => handleResizeStart(e, node.id, 'w')}
                      />
                      <div
                        className="absolute w-2 h-2 bg-teal-500 border border-white rounded-full cursor-e-resize -right-1 top-1/2 transform -translate-y-1/2"
                        onMouseDown={(e) => handleResizeStart(e, node.id, 'e')}
                      />
                    </>
                  )}
                  
                  <div className="text-xs font-medium mb-1 break-words">{config.label}</div>
                  {node.type === 'assumption' ? (
                    <div className="text-xs leading-tight flex flex-col items-start w-full"> {/* Removed text-center, added flex-col items-start */}
                      <span>The author assumes that </span>
                      <textarea
                        ref={el => { if (el) textareaRefs.current[node.id + '-part0'] = el; }}
                        className="bg-transparent border-b border-slate-400 outline-none w-full text-slate-900 resize-none overflow-hidden"
                        value={(() => { try { return JSON.parse(node.content)[0]; } catch { return ''; } })()}
                        onChange={(e) => handleTextareaChange(e, node.id, 0)}
                        onMouseDown={(e) => e.stopPropagation()} // Prevent dragging when editing
                        onFocus={() => setSelectedElement({ type: 'node', id: node.id })} // Select node on focus
                        rows={1}
                      />
                      <span> and overlooks the possibility that </span>
                      <textarea
                        ref={el => { if (el) textareaRefs.current[node.id + '-part1'] = el; }}
                        className="bg-transparent border-b border-slate-400 outline-none w-full text-slate-900 resize-none overflow-hidden"
                        value={(() => { try { return JSON.parse(node.content)[1]; } catch { return ''; } })()}
                        onChange={(e) => handleTextareaChange(e, node.id, 1)}
                        onMouseDown={(e) => e.stopPropagation()} // Prevent dragging when editing
                        onFocus={() => setSelectedElement({ type: 'node', id: node.id })} // Select node on focus
                        rows={1}
                      />
                    </div>
                  ) : (
                    <textarea
                      ref={el => { if (el) textareaRefs.current[node.id] = el; }}
                      className="w-full bg-transparent text-xs resize-none outline-none text-center overflow-hidden"
                      value={node.content}
                      onChange={(e) => handleTextareaChange(e, node.id)}
                      onMouseDown={(e) => e.stopPropagation()} // Prevent dragging when editing
                      onFocus={() => setSelectedElement({ type: 'node', id: node.id })} // Select node on focus
                      rows={1} // Start with 1 row and let it grow
                      placeholder="Click to edit"
                    />
                  )}
                </div>
              );
            })}

            {/* Empty state */}
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-slate-400">
                  <Plus className="h-8 md:h-12 w-8 md:w-12 mx-auto mb-4" />
                  <p className="text-lg font-medium">Drag a node type from the left to start building</p>
                  <p className="text-sm">Start building your argument circuit</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md relative">
            <button
              onClick={() => setShowInstructions(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500"
            >
              <Info className="h-5 w-5" />
            </button>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Circuit Builder Instructions</h2>
            <div className="text-slate-700 space-y-3">
              <p>• **Drag node types** from the left panel onto the canvas to add new elements to your circuit.</p>
              <p>• **Drag existing nodes** on the canvas to reposition them as needed.</p>
              <p>• Click the **"Draw Connection"** button, then click and drag from a source node to a target node to create an arrow representing a logical connection.</p>
              <p>• **Click on a node** to select it. Once selected, you can directly edit its content by typing in the text area within the node.</p>
              <p>• **Click on a connection** (the arrow) to select it. The selected connection will be highlighted.</p>
              <p>• Use the **"Delete Selected"** button in the header to remove the currently selected node or connection.</p>
              <p>• Use different node shapes and colors to visually represent the logical structure of the argument.</p>
              <p>• Building higher quality and more comprehensive circuits will earn you more analysis points!</p>
            </div>
            <button
              onClick={() => setShowInstructions(false)}
              className="w-full mt-6 py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Got It!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CircuitBuilder;

