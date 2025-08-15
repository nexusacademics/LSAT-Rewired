import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  ConnectionMode,
  Panel,
  NodeProps,
  Handle,
  Position,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import { ArrowLeft, Plus, Trash2, Save, RotateCcw, Info } from 'lucide-react';
import 'reactflow/dist/style.css';

// Types matching your original structure
interface DiagramNode {
  id: string;
  type: 'conclusion-subject' | 'conclusion-predicate' | 'minor-premise' | 'major-premise' | 'backing-premise' | 'assumption' | 'counterclaim' | 'correct-answer';
  shape: 'rectangle' | 'rounded-rectangle' | 'ellipse';
  content: string;
  position: { x: number; y: number };
  size?: { width: number; height: number };
  connections: { targetId: string; style: string }[];
}

interface Circuit {
  id: string;
  questionId: string;
  diagram: DiagramNode[];
  annotations: any[];
  analysisQuality: number;
  createdAt: Date;
}

interface ProcessedQuestion {
  id: string;
  correctAnswer: number;
  options: string[];
}

interface TestSession {
  id: string;
   questionFlags?: {
    [questionId: string]: {
      timedSection?: boolean;
      blindReview?: boolean;
      strategyPlanning?: boolean;
    }
  };
}

//New State

// Custom Node Components
const ConclusionSubjectNode = ({ id, data, selected }: NodeProps) => {
  const [content, setContent] = useState(data.content || '');   const [isEditing, setIsEditing] = useState(false); 
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    data.onContentChange?.(id, e.target.value);
    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  return (
    <div className={`px-4 py-3 shadow-md rounded-lg bg-purple-50 border-2 ${
      selected ? 'border-purple-500' : 'border-purple-200'
    } min-w-[120px] min-h-[70px] relative`} 
       style={
    selected
      ? { boxShadow: '0 0 12px 5px rgba(202, 138, 4, 0.8)' }
      : undefined
  }
       data-nodrag={isEditing}>
         {/* Handles on all four sides */}
       <Handle type="target" position={Position.Top} id="top-target" className="w-3 h-3" />
       <Handle type="source" position={Position.Top} id="top-source" className="w-3 h-3" />
      
       <Handle type="target" position={Position.Left} id="left-target" className="w-3 h-3" />
       <Handle type="source" position={Position.Left} id="left-source" className="w-3 h-3" />
      
       <Handle type="target" position={Position.Bottom} id="bottom-target" className="w-3 h-3" />
       <Handle type="source" position={Position.Bottom} id="bottom-source" className="w-3 h-3" />
      
       <Handle type="target" position={Position.Right} id="right-target" className="w-3 h-3" />
       <Handle type="source" position={Position.Right} id="right-source" className="w-3 h-3" />
      <div className="text-xs font-medium mb-2 text-purple-700">Conclusion Subject</div>
      <textarea
        ref={textareaRef}
        className="w-full bg-transparent text-xs resize-none outline-none text-center overflow-hidden text-purple-700"
        value={content}
        onChange={handleContentChange}         
        onFocus={() => setIsEditing(true)}         
        onBlur={() => setIsEditing(false)}
        placeholder="Click to edit"
        rows={1}
      />
    </div>
  );
};

const ConclusionPredicateNode = ({ id, data, selected }: NodeProps) => {
  const [content, setContent] = useState(data.content || '');   const [isEditing, setIsEditing] = useState(false); 
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    data.onContentChange?.(id, e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  return (
    <div className={`px-4 py-3 shadow-md rounded-lg bg-purple-200 border-2 ${
      selected ? 'border-purple-600' : 'border-purple-400'
    } min-w-[120px] min-h-[70px] relative`} 
       style={
    selected
      ? { boxShadow: '0 0 12px 5px rgba(202, 138, 4, 0.8)' }
      : undefined}
      data-nodrag={isEditing}
      >
         {/* Handles on all four sides */}
      <Handle type="target" position={Position.Top} id="top-target" className="w-3 h-3" />
       <Handle type="source" position={Position.Top} id="top-source" className="w-3 h-3" />
      
       <Handle type="target" position={Position.Left} id="left-target" className="w-3 h-3" />
       <Handle type="source" position={Position.Left} id="left-source" className="w-3 h-3" />
      
       <Handle type="target" position={Position.Bottom} id="bottom-target" className="w-3 h-3" />
       <Handle type="source" position={Position.Bottom} id="bottom-source" className="w-3 h-3" />
      
       <Handle type="target" position={Position.Right} id="right-target" className="w-3 h-3" />
       <Handle type="source" position={Position.Right} id="right-source" className="w-3 h-3" />
      <div className="text-xs font-medium mb-2 text-purple-900">Conclusion Predicate/Claim</div>
      <textarea
        ref={textareaRef}
        className="w-full bg-transparent text-xs resize-none outline-none text-center overflow-hidden text-purple-900"
        value={content}
         onChange={handleContentChange}         
        onFocus={() => setIsEditing(true)}         
        onBlur={() => setIsEditing(false)}
        placeholder="Click to edit"
        rows={1}
      />
    </div>
  );
};

const MinorPremiseNode = ({ id, data, selected }: NodeProps) => {
  const [content, setContent] = useState(data.content || '');   const [isEditing, setIsEditing] = useState(false); 
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    data.onContentChange?.(id, e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  return (
    <div className={`px-4 py-3 shadow-md rounded-lg bg-gray-50 border-2 ${
      selected ? 'border-gray-600' : 'border-black'
    } min-w-[120px] min-h-[70px] relative`} 
       style={
    selected
      ? { boxShadow: '0 0 12px 5px rgba(202, 138, 4, 0.8)' }
      : undefined}
      data-nodrag={isEditing}
      >
         {/* Handles on all four sides */}
      <Handle type="target" position={Position.Top} id="top-target" className="w-3 h-3" />
       <Handle type="source" position={Position.Top} id="top-source" className="w-3 h-3" />
      
       <Handle type="target" position={Position.Left} id="left-target" className="w-3 h-3" />
       <Handle type="source" position={Position.Left} id="left-source" className="w-3 h-3" />
      
       <Handle type="target" position={Position.Bottom} id="bottom-target" className="w-3 h-3" />
       <Handle type="source" position={Position.Bottom} id="bottom-source" className="w-3 h-3" />
      
       <Handle type="target" position={Position.Right} id="right-target" className="w-3 h-3" />
       <Handle type="source" position={Position.Right} id="right-source" className="w-3 h-3" />
      <div className="text-xs font-medium mb-2 text-black">Minor Premise</div>
      <textarea
        ref={textareaRef}
        className="w-full bg-transparent text-xs resize-none outline-none text-center overflow-hidden text-black"
        value={content}
        onChange={handleContentChange}         
        onFocus={() => setIsEditing(true)}         
        onBlur={() => setIsEditing(false)}
        placeholder="Click to edit"
        rows={1}
      />
    </div>
  );
};

const MajorPremiseNode = ({ id, data, selected }: NodeProps) => {
  const [content, setContent] = useState(data.content || '');   const [isEditing, setIsEditing] = useState(false); 
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    data.onContentChange?.(id, e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  return (
    <div className={`px-4 py-3 shadow-md rounded-lg bg-blue-100 border-2 ${
      selected ? 'border-blue-600' : 'border-blue-300'
    } min-w-[120px] min-h-[70px] relative`} 
       style={
    selected
      ? { boxShadow: '0 0 12px 5px rgba(202, 138, 4, 0.8)' }
      : undefined}
      data-nodrag={isEditing}
      >
         {/* Handles on all four sides */}
     <Handle type="target" position={Position.Top} id="top-target" className="w-3 h-3" />
       <Handle type="source" position={Position.Top} id="top-source" className="w-3 h-3" />
      
       <Handle type="target" position={Position.Left} id="left-target" className="w-3 h-3" />
       <Handle type="source" position={Position.Left} id="left-source" className="w-3 h-3" />
      
       <Handle type="target" position={Position.Bottom} id="bottom-target" className="w-3 h-3" />
       <Handle type="source" position={Position.Bottom} id="bottom-source" className="w-3 h-3" />
      
       <Handle type="target" position={Position.Right} id="right-target" className="w-3 h-3" />
       <Handle type="source" position={Position.Right} id="right-source" className="w-3 h-3" />
      <div className="text-xs font-medium mb-2 text-blue-800">Major Premise</div>
      <textarea
        ref={textareaRef}
        className="w-full bg-transparent text-xs resize-none outline-none text-center overflow-hidden text-blue-800"
        value={content}
        onChange={handleContentChange}         
        onFocus={() => setIsEditing(true)}         
        onBlur={() => setIsEditing(false)}
        placeholder="Click to edit"
        rows={1}
      />
    </div>
  );
};

const BackingPremiseNode = ({ id, data, selected }: NodeProps) => {
  const [content, setContent] = useState(data.content || '');   const [isEditing, setIsEditing] = useState(false); 
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    data.onContentChange?.(id, e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  return (
    <div className={`px-4 py-3 shadow-md rounded-lg bg-gray-50 border-2 ${
      selected ? 'border-gray-600' : 'border-gray-300'
    } min-w-[120px] min-h-[70px] relative`} 
       style={
    selected
      ? { boxShadow: '0 0 12px 5px rgba(202, 138, 4, 0.8)' }
      : undefined}
      data-nodrag={isEditing}
      >
         {/* Handles on all four sides */}
     <Handle type="target" position={Position.Top} id="top-target" className="w-3 h-3" />
       <Handle type="source" position={Position.Top} id="top-source" className="w-3 h-3" />
      
       <Handle type="target" position={Position.Left} id="left-target" className="w-3 h-3" />
       <Handle type="source" position={Position.Left} id="left-source" className="w-3 h-3" />
      
       <Handle type="target" position={Position.Bottom} id="bottom-target" className="w-3 h-3" />
       <Handle type="source" position={Position.Bottom} id="bottom-source" className="w-3 h-3" />
      
       <Handle type="target" position={Position.Right} id="right-target" className="w-3 h-3" />
       <Handle type="source" position={Position.Right} id="right-source" className="w-3 h-3" />
      <div className="text-xs font-medium mb-2 text-gray-800">Backing/Linking Premise</div>
      <textarea
        ref={textareaRef}
        className="w-full bg-transparent text-xs resize-none outline-none text-center overflow-hidden text-gray-800"
        value={content}
         onChange={handleContentChange}         
        onFocus={() => setIsEditing(true)}         
        onBlur={() => setIsEditing(false)}
        placeholder="Click to edit"
        rows={1}
      />
    </div>
  );
};

const AssumptionNode = ({ id, data, selected }: NodeProps) => {
  const [assumptionParts, setAssumptionParts] = useState(() => {
    try {
      return JSON.parse(data.content || '["", ""]');
    } catch {
      return ['', ''];
    }
  });
   const [isEditing, setIsEditing] = useState(false);
  const textareaRef1 = useRef<HTMLTextAreaElement>(null);
  const textareaRef2 = useRef<HTMLTextAreaElement>(null);

  const handlePartChange = (index: number, value: string) => {
    const newParts = [...assumptionParts];
    newParts[index] = value;
    setAssumptionParts(newParts);
    data.onContentChange?.(id, JSON.stringify(newParts));
    
    // Auto-resize textareas
    const textareaRef = index === 0 ? textareaRef1 : textareaRef2;
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  return (
    <div className={`px-4 py-3 shadow-md rounded-lg bg-red-100 border-2 ${
      selected ? 'border-red-600' : 'border-red-300'
    } min-w-[300px] min-h-[120px] relative`} 
       style={
    selected
      ? { boxShadow: '0 0 12px 5px rgba(202, 138, 4, 0.8)' }
      : undefined}
      data-nodrag={isEditing}
      >
         {/* Handles on all four sides */}
     <Handle type="target" position={Position.Top} id="top-target" className="w-3 h-3" />
       <Handle type="source" position={Position.Top} id="top-source" className="w-3 h-3" />
      
       <Handle type="target" position={Position.Left} id="left-target" className="w-3 h-3" />
       <Handle type="source" position={Position.Left} id="left-source" className="w-3 h-3" />
      
       <Handle type="target" position={Position.Bottom} id="bottom-target" className="w-3 h-3" />
       <Handle type="source" position={Position.Bottom} id="bottom-source" className="w-3 h-3" />
      
       <Handle type="target" position={Position.Right} id="right-target" className="w-3 h-3" />
       <Handle type="source" position={Position.Right} id="right-source" className="w-3 h-3" />
      <div className="text-xs font-medium mb-3 text-red-800">Assumption/Flaw</div>
      
      <div className="text-xs leading-relaxed text-red-800 space-y-2">
        <div className="flex flex-col">
          <span className="mb-1">The author assumes that:</span>
          <textarea
            ref={textareaRef1}
            className="bg-red-50 border border-red-300 rounded px-2 py-1 outline-none w-full text-red-900 resize-none min-h-[32px]"
            value={assumptionParts[0]}
            onChange={(e) => handlePartChange(0, e.target.value)}
             onFocus={() => setIsEditing(true)}         
            onBlur={() => setIsEditing(false)}
            placeholder="Enter assumption..."
            style={{ 
              overflow: 'hidden',
              lineHeight: '1.4'
            }}
          />
        </div>
        
        <div className="flex flex-col">
          <span className="mb-1">and overlooks the possibility that:</span>
          <textarea
            ref={textareaRef2}
            className="bg-red-50 border border-red-300 rounded px-2 py-1 outline-none w-full text-red-900 resize-none min-h-[32px]"
            value={assumptionParts[1]}
            onChange={(e) => handlePartChange(1, e.target.value)}
             onFocus={() => setIsEditing(true)}         
            onBlur={() => setIsEditing(false)}
            placeholder="Enter overlooked possibility..."
            style={{ 
              overflow: 'hidden',
              lineHeight: '1.4'
            }}
          />
        </div>
      </div>
    </div>
  );
};

const CounterclaimNode = ({ id, data, selected }: NodeProps) => {
  const [content, setContent] = useState(data.content || '');   const [isEditing, setIsEditing] = useState(false); 
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    data.onContentChange?.(id, e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  return (
    <div className={`px-4 py-3 shadow-md rounded-lg bg-gray-100 border-2 ${
      selected ? 'border-red-600' : 'border-red-300'
    } min-w-[120px] min-h-[70px] relative`} 
       style={
    selected
      ? { boxShadow: '0 0 12px 5px rgba(202, 138, 4, 0.8)' }
      : undefined}
      data-nodrag={isEditing}
      >
          {/* Handles on all four sides */}
     <Handle type="target" position={Position.Top} id="top-target" className="w-3 h-3" />
       <Handle type="source" position={Position.Top} id="top-source" className="w-3 h-3" />
      
       <Handle type="target" position={Position.Left} id="left-target" className="w-3 h-3" />
       <Handle type="source" position={Position.Left} id="left-source" className="w-3 h-3" />
      
       <Handle type="target" position={Position.Bottom} id="bottom-target" className="w-3 h-3" />
       <Handle type="source" position={Position.Bottom} id="bottom-source" className="w-3 h-3" />
      
       <Handle type="target" position={Position.Right} id="right-target" className="w-3 h-3" />
       <Handle type="source" position={Position.Right} id="right-source" className="w-3 h-3" />
      <div className="text-xs font-medium mb-2 text-red-800">Counterclaim/Concession</div>
      <textarea
        ref={textareaRef}
        className="w-full bg-transparent text-xs resize-none outline-none text-center overflow-hidden text-red-800"
        value={content}
         onChange={handleContentChange}         onFocus={() => setIsEditing(true)}         onBlur={() => setIsEditing(false)}
        placeholder="Click to edit"
        rows={1}
      />
    </div>
  );
};

const CorrectAnswerNode = ({ id, data, selected }: NodeProps) => {
  const [content, setContent] = useState(data.content || '');   const [isEditing, setIsEditing] = useState(false); 
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    data.onContentChange?.(id, e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  return (
    <div className={`px-4 py-3 shadow-md rounded-lg bg-green-200 border-2 ${
      selected ? 'border-green-600' : 'border-green-400'
    } min-w-[120px] min-h-[70px] relative`} 
       style={
    selected
      ? { boxShadow: '0 0 12px 5px rgba(202, 138, 4, 0.8)' }
      : undefined}
      data-nodrag={isEditing}
      >
         {/* Handles on all four sides */}
  <Handle type="target" position={Position.Top} id="top-target" className="w-3 h-3" />
       <Handle type="source" position={Position.Top} id="top-source" className="w-3 h-3" />
      
       <Handle type="target" position={Position.Left} id="left-target" className="w-3 h-3" />
       <Handle type="source" position={Position.Left} id="left-source" className="w-3 h-3" />
      
       <Handle type="target" position={Position.Bottom} id="bottom-target" className="w-3 h-3" />
       <Handle type="source" position={Position.Bottom} id="bottom-source" className="w-3 h-3" />
      
       <Handle type="target" position={Position.Right} id="right-target" className="w-3 h-3" />
       <Handle type="source" position={Position.Right} id="right-source" className="w-3 h-3" />
      <div className="text-xs font-medium mb-2 text-green-800">Correct Answer</div>
      <textarea
        ref={textareaRef}
        className="w-full bg-transparent text-xs resize-none outline-none text-center overflow-hidden text-green-800"
        value={content}
         onChange={handleContentChange}         onFocus={() => setIsEditing(true)}         onBlur={() => setIsEditing(false)}
        placeholder="Click to edit"
        rows={1}
      />
    </div>
  );
};

// Define node types for React Flow
const nodeTypes = {
  'conclusion-subject': ConclusionSubjectNode,
  'conclusion-predicate': ConclusionPredicateNode,
  'minor-premise': MinorPremiseNode,
  'major-premise': MajorPremiseNode,
  'backing-premise': BackingPremiseNode,
  'assumption': AssumptionNode,
  'counterclaim': CounterclaimNode,
  'correct-answer': CorrectAnswerNode,
};

// Main Circuit Builder Component
const CircuitBuilderFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeType, setSelectedNodeType] = useState<DiagramNode['type']>('conclusion-subject');
  const [analysisScore, setAnalysisScore] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
   // UseReactFlow gives access to graph state and helpers
  const { getNodes, getEdges, project } = useReactFlow();
 useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Delete') {
      const selectedNodes = getNodes().filter((node) => node.selected);
      const selectedEdges = getEdges().filter((edge) => edge.selected);

      if (selectedNodes.length || selectedEdges.length) {
        event.preventDefault(); // Prevent browser default Backspace nav

        setNodes((nodes) =>
          nodes.filter((node) => !selectedNodes.some((sel) => sel.id === node.id))
        );
        setEdges((edges) =>
          edges.filter((edge) => !selectedEdges.some((sel) => sel.id === edge.id))
        );
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [getNodes, getEdges, setNodes, setEdges]);
  
  const onPaneClick = useCallback(() => {
        setSelectedEdgeIds(new Set());
      }, []);
  const onNodeClick = useCallback(() => {
      setSelectedEdgeIds(new Set());
    }, []);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Node type definitions for the toolbar
  const nodeTypeOptions = [
    { type: 'conclusion-subject' as const, label: 'Conclusion Subject', color: 'bg-purple-50 border-purple-200 text-purple-700', description: 'The entity or concept the conclusion is about' },
    { type: 'conclusion-predicate' as const, label: 'Conclusion Predicate/Claim', color: 'bg-purple-200 border-purple-400 text-purple-900', description: 'The specific claim or assertion made about the subject' },
    { type: 'minor-premise' as const, label: 'Minor Premise', color: 'bg-gray-50 border-black text-black', description: 'Supporting evidence' },
    { type: 'major-premise' as const, label: 'Major Premise', color: 'bg-blue-100 border-blue-300 text-blue-800', description: 'A broad statement or principle' },
    { type: 'backing-premise' as const, label: 'Backing/Linking Premise', color: 'bg-gray-50 border-gray-300 text-gray-800', description: 'Provides support for another premise or conclusion' },
    { type: 'counterclaim' as const, label: 'Counterclaim/Concession', color: 'bg-gray-100 border-red-300 text-red-800', description: 'An opposing argument or point conceded' },
    { type: 'assumption' as const, label: 'Assumption/Flaw', color: 'bg-red-100 border-red-300 text-red-800', description: 'Unstated Premise implied by the author' },
    { type: 'correct-answer' as const, label: 'Correct Answer', color: 'bg-green-200 border-green-400 text-green-800', description: 'The correct answer choice for the question' }
  ];

  // Handle content changes from nodes
  const handleNodeContentChange = useCallback((nodeId: string, content: string) => {
    setNodes(nds => nds.map(node => 
      node.id === nodeId 
        ? { ...node, data: { ...node.data, content } }
        : node
    ));
  }, [setNodes]);

  // Handle edge connections
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<Set<string>>(new Set());
  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.stopPropagation(); // Prevent React Flow canvas deselect
      setSelectedEdgeIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(edge.id)) {
          newSet.delete(edge.id);
        } else {
          newSet.add(edge.id);
        }
        return newSet;
      });
    },
    []
  );
  const styledEdges = edges.map(edge => ({
      ...edge,
      style: selectedEdgeIds.has(edge.id)
        ? {  stroke: '#FFD700', // bright yellow stroke
        strokeWidth: 3,
        filter: 'drop-shadow(0 0 8px #FFD700)', // yellow glow
        transition: 'all 0.3s ease', }
        : edge.style || { stroke: '#64748b', strokeWidth: 2 },
    }));
  const onConnect = useCallback(
    (params: Connection) => {
      const edge: Edge = {
        ...params,
        id: `edge-${params.source}-${params.target}`,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#64748b', strokeWidth: 2 },
      };
      setEdges(eds => addEdge(edge, eds));
    },
    [setEdges]
  );

  // Calculate analysis score
  const calculateAnalysisScore = useCallback(() => {
    let score = 0;
    const hasConclusion = nodes.some(node => 
      node.type === 'conclusion-subject' || node.type === 'conclusion-predicate'
    );
    const hasPremises = nodes.filter(node => 
      node.type === 'minor-premise' || node.type === 'major-premise' || node.type === 'backing-premise'
    ).length >= 2;
    const hasContent = nodes.every(node => {
      if (node.type === 'assumption') {
        try {
          const assumptionContent: string[] = JSON.parse(node.data.content || '["", ""]');
          return assumptionContent.every(part => part.trim().length > 0);
        } catch {
          return false;
        }
      }
      return (node.data.content || '').trim().length > 0;
    });
    
    if (hasConclusion) score += 30;
    if (hasPremises) score += 40;
    if (hasContent) score += 30;
    
    setAnalysisScore(score);
    return score;
  }, [nodes]);

  // Auto-calculate score when nodes change
  useEffect(() => {
    calculateAnalysisScore();
  }, [calculateAnalysisScore]);

  // Save circuit function
  const saveCircuit = useCallback(() => {
    setSaveStatus('saving');
    try {
      const score = calculateAnalysisScore();
      // Here you would typically call your save function
      console.log('Saving circuit with score:', score);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save circuit:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [calculateAnalysisScore]);

  // Delete selected elements
  const deleteSelected = useCallback(() => {
    setNodes(nds => nds.filter(node => !node.selected));
    setEdges(eds => eds.filter(edge => !edge.selected));
  }, [setNodes, setEdges]);

  // Clear all
  const clearAll = useCallback(() => {
    setNodes([]);
    setEdges([]);
  }, [setNodes, setEdges]);

  return (
   <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            
            <h1 className="text-xl font-semibold text-slate-900">Circuit Builder</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-slate-600">
              Analysis Score: <span className="font-semibold text-slate-900">{analysisScore}/100</span>
            </div>
            {saveStatus === 'saving' && <span className="text-sm text-blue-500">Saving...</span>}
            {saveStatus === 'saved' && <span className="text-sm text-green-500">Saved!</span>}
            {saveStatus === 'error' && <span className="text-sm text-red-500">Save Error!</span>}
            <button
              onClick={deleteSelected}
              className="px-4 py-2 text-red-600 hover:text-red-900 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-2 inline" />
              Delete Selected
            </button>
            <button
              onClick={clearAll}
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

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Sidebar */}
        <div className="w-56 bg-white border-r border-slate-200 p-4 space-y-6 overflow-y-auto flex-shrink-0">
          <div>
            <h3 className="text-base font-semibold text-slate-900 mb-3">Node Types</h3>
            <div className="space-y-2">
              {nodeTypeOptions.map(({ type, label, color, description }) => (
                <div
                  key={type}
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData('application/reactflow', type);
                    event.dataTransfer.effectAllowed = 'move';
                  }}
                 className={`group w-full p-2 text-left border-2 rounded-lg cursor-move select-none transition-colors ${color}`}

                >
                  <div className="text-sm font-medium">{label}</div>
                  <div className="text-xs opacity-75 group-hover:block hidden">{description}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-slate-900 mb-3">Instructions</h3>
            <button
              onClick={() => setShowInstructions(true)}
              className="w-full p-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors flex items-center justify-center"
            >
              <Info className="h-4 w-4 mr-2" />
              View Instructions
            </button>
          </div>

          <div className="text-xs text-slate-500 p-2 bg-slate-50 rounded">
            <strong>Usage:</strong><br/>
            1. Select a node type<br/>
            2. Click on canvas to add<br/>
            3. Drag to connect nodes<br/>
            4. Click nodes to edit content
          </div>
        </div>

        {/* React Flow Canvas */}
        <div className="flex-1 min-w-0 relative" ref={reactFlowWrapper}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              if (!reactFlowWrapper.current) return;
          
              const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
              const type = event.dataTransfer.getData('application/reactflow');
              if (!type) return;
          
              const position = project({
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
              });
          
              const newNode: Node = {
                id: `node-${Date.now()}`,
                type,
                position,
                data: {
                  content: type === 'assumption' ? JSON.stringify(['', '']) : '',
                  onContentChange: handleNodeContentChange
                }, 
              };
          
              setNodes((nds) => nds.concat(newNode));
            }}>
          <ReactFlow
            nodes={nodes}
            edges={styledEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onEdgeClick={onEdgeClick}
            connectionMode={ConnectionMode.Loose}
            onPaneClick={onPaneClick}
            onEdgeClick={onEdgeClick}
            onNodeClick={onNodeClick}
            fitView
            defaultViewport={{ x: 0, y: 0, zoom: 1.5 }}
            style={{ height: '100%', width: '100%' }} // Ensure it fills the container

           >
            <Background color="#e2e8f0" gap={20} />
            <Controls position="top-left" />
           
            
            {nodes.length === 0 && (
              <Panel position="center">
                <div className="text-center text-slate-400 bg-white p-8 rounded-lg shadow-sm border border-slate-200">
                  <Plus className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-lg font-medium">Click and drag the elements to the left to start building your circuit</p>
                </div>
              </Panel>
            )}
          </ReactFlow>
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
              ×
            </button>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">React Flow Circuit Builder</h2>
            <div className="text-slate-700 space-y-3 text-sm">
              <p>• **Select a node type** from the left sidebar</p>
              <p>• **Click on the canvas** to add a new node of the selected type</p>
              <p>• **Drag from one node to another** to create connections</p>
              <p>• **Click inside a node** to edit its content directly</p>
              <p>• **Select nodes/edges** and use "Delete Selected" to remove them</p>
              <p>• **Use the minimap and controls** for navigation</p>
              <p>• React Flow provides built-in **zoom, pan, and selection** features</p>
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

// Wrapper component with ReactFlowProvider
const CircuitBuilderWithProvider = () => {
  return (
    <ReactFlowProvider>
      <CircuitBuilderFlow />
    </ReactFlowProvider>
  );
};

export default CircuitBuilderWithProvider;