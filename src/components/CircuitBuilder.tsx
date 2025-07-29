import React from 'react';

const CircuitBuilder = () => {
  return (
    // Main container using CSS Grid with 3 rows
    <div className="h-screen grid grid-rows-[auto_1fr_auto] bg-slate-50">
      
      {/* Header - takes only the space it needs */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
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

      {/* Main content area - takes remaining space and has its own grid */}
      <div className="grid grid-cols-[224px_1fr] overflow-hidden">
        
        {/* Sidebar - fixed width */}
        <div className="bg-white border-r border-slate-200 p-4 space-y-6 overflow-y-auto">
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

        {/* React Flow Canvas - takes remaining width and all available height */}
        <div 
          className="w-full h-full overflow-hidden" 
          ref={reactFlowWrapper}
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
        
            const newNode = {
              id: `node-${Date.now()}`,
              type,
              position,
              data: {
                content: type === 'assumption' ? JSON.stringify(['', '']) : '',
                onContentChange: handleNodeContentChange
              }, 
            };
        
            setNodes((nds) => nds.concat(newNode));
          }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Strict}
            fitView
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

      {/* QuestionTracker - takes only the space it needs */}
      <div className="bg-white shadow-lg border-t border-slate-200 p-2 overflow-x-auto">
        {/* QuestionTracker content would go here */}
        <div className="text-xs text-slate-600 mb-2 flex items-center space-x-6">
          <span className="whitespace-nowrap">
            <strong>Phase:</strong> Timed
          </span>
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Timed</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span>BR</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Strategy</span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2 max-w-full">
          {/* Question buttons would go here */}
          <div className="min-w-[36px] h-9 rounded-full flex items-center justify-center text-sm font-semibold bg-purple-600 ring-2 ring-purple-800 text-white">
            1
          </div>
          <div className="min-w-[36px] h-9 rounded-full flex items-center justify-center text-sm font-semibold bg-blue-500 text-white">
            2
          </div>
          <div className="min-w-[36px] h-9 rounded-full flex items-center justify-center text-sm font-semibold bg-slate-200 text-slate-600">
            3
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

export default CircuitBuilder;