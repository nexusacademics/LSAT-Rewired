import React, {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import {
  ArrowLeft,
  Save
} from 'lucide-react';
import {
  Circuit,
  DiagramNode,
  ProcessedQuestion,
  SelectedElement,
  TestSession
} from '../../types';

interface CircuitBuilderProps {
  onBack: () => void;
  onSaveCircuit: (circuit: Circuit) => void;
  questionData: ProcessedQuestion;
  session: TestSession;
  existingCircuit: Circuit | undefined;
}

export const CircuitBuilder: React.FC<CircuitBuilderProps> = ({
  onBack,
  onSaveCircuit,
  questionData,
  session,
  existingCircuit
}) => {
  const [nodes, setNodes] = useState<DiagramNode[]>(existingCircuit ? existingCircuit.diagram : []);
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [newNodeType, setNewNodeType] = useState<DiagramNode['type']>('conclusion-subject');
  const [analysisScore, setAnalysisScore] = useState(existingCircuit ? existingCircuit.analysisQuality : 0);
  const [connectionMode, setConnectionMode] = useState(false);
  const [connectionStartNodeId, setConnectionStartNodeId] = useState<string | null>(null);
  const [tempLineCoords, setTempLineCoords] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [resizingNode, setResizingNode] = useState<{ nodeId: string; handle: string } | null>(null);
  const [resizeStartData, setResizeStartData] = useState<{ x: number; y: number; width: number; height: number; nodeX: number; nodeY: number } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<{ [key: string]: HTMLDivElement }>({});
  const textareaRefs = useRef<{ [key: string]: HTMLTextAreaElement }>({});

  // --- AUTOSAVE LOGIC --- //
  const saveCircuit = useCallback(() => {
    setSaveStatus('saving');
    try {
      const circuit: Circuit = {
        id: existingCircuit?.id || `circuit-${Date.now()}`,
        questionId: questionData.id,
        sessionId: session.id,
        diagram: nodes,
        annotations: existingCircuit?.annotations || [],
        analysisQuality: analysisScore,
        createdAt: existingCircuit?.createdAt || new Date()
      };
      onSaveCircuit(circuit);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save circuit:', error);
      setSaveStatus('error');
    }
  }, [nodes, analysisScore, questionData.id, session.id, existingCircuit, onSaveCircuit]);

  useEffect(() => {
    return () => {
      saveCircuit(); // autosave on unmount
    };
  }, [saveCircuit]);

  const handleBack = () => {
    saveCircuit(); // autosave before exit
    onBack();
  };

  return (
    <div className="p-4">
      <div className="flex items-center space-x-4 mb-4">
        <button
          onClick={handleBack}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-semibold text-slate-900">Circuit Builder</h1>
      </div>

      {/* Canvas Area */}
      <div className="relative w-full h-[600px] border bg-white rounded" ref={canvasRef}>
        {/* Add your diagram canvas and interaction logic here */}
      </div>

      {/* Save Controls */}
      <div className="flex items-center justify-end space-x-4 mt-4">
        <button
          onClick={saveCircuit}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          <Save className="h-4 w-4 mr-2 inline" />
          Save Circuit
        </button>
        {saveStatus === 'saving' && <span className="text-slate-500">Saving...</span>}
        {saveStatus === 'saved' && <span className="text-green-600">Saved!</span>}
        {saveStatus === 'error' && <span className="text-red-600">Error saving</span>}
      </div>
    </div>
  );
};
