import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProcessedPrepTest, ProcessedSection } from '../App'; // Import ProcessedPrepTest type

interface TimeModeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTimeMode: (testId: string, timeMode: 'regular' | '1.5x' | '2x' | 'custom' | 'untimed', customTimeMinutes?: number, selectedSectionId?: string) => void;
  allProcessedTests: { [key: string]: ProcessedPrepTest }; // New prop for all processed test data
}

type Step = 'selectTest' | 'selectSection' | 'selectTiming';

const TimeModeSelectionModal: React.FC<TimeModeSelectionModalProps> = ({ isOpen, onClose, onSelectTimeMode, allProcessedTests }) => {
  const [currentStep, setCurrentStep] = useState<Step>('selectTest');
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | undefined>(undefined); // undefined for whole test
  const [selectedTimeMode, setSelectedTimeMode] = useState<'regular' | '1.5x' | '2x' | 'custom' | 'untimed'>('regular');
  const [customMinutes, setCustomMinutes] = useState<string>('35');
  const [customError, setCustomError] = useState(false);  
  const [searchTerm, setSearchTerm] = useState('');

console.log('All Processed Tests received by TimeModeSelectionModal:', allProcessedTests);
  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setCurrentStep('selectTest');
      setSelectedTestId(null);
      setSelectedSectionId(undefined);
      setSelectedTimeMode('regular');
      setCustomMinutes(35);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
      if (selectedTimeMode === 'custom') {
        const customVal = parseInt(customMinutes);
        if (isNaN(customVal) || customVal < 1) {
          setCustomError(true);
          return;
        }
      }
    
      if (selectedTestId) {
        onSelectTimeMode(
          selectedTestId,
          selectedTimeMode,
          selectedTimeMode === 'custom' ? parseInt(customMinutes) : undefined,
          selectedSectionId
        );
        onClose();
      }
    };

  const handleBack = () => {
    if (currentStep === 'selectTiming') {
      setCurrentStep('selectSection');
    } else if (currentStep === 'selectSection') {
      setCurrentStep('selectTest');
    }
  };

  const processedTest = selectedTestId ? allProcessedTests[selectedTestId] : undefined;

  // Helper to format section names for display with section type
  const formatSectionDisplayName = (section: ProcessedSection, index: number) => {
    const sectionType = section.name.startsWith('LR') ? 'Logical Reasoning' : 
                       section.name.startsWith('RC') ? 'Reading Comprehension' : 
                       'Unknown';
    return {
      title: `Section ${index + 1}`,
      type: sectionType
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500"
        >
          <X className="h-5 w-5" />
        </button>

        {currentStep !== 'selectTest' && (
          <button
            onClick={handleBack}
            className="absolute top-4 left-4 p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {currentStep === 'selectTest' && (
          <>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Select a PrepTest</h2>
            <input
              type="text"
              placeholder="Search tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />

            <div className="space-y-3">
             {Object.values(allProcessedTests)
              .filter(test => test.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((test) => (
                <button
                  key={test.id}
                  onClick={() => {
                    setSelectedTestId(test.id);
                    setCurrentStep('selectSection');
                  }}
                  className={`w-full p-3 text-left rounded-lg border-2 transition-colors ${
                    selectedTestId === test.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-medium">{test.name}</div>
                  <div className="text-sm text-slate-600">Full PrepTest with {test.sections.length} sections</div>
                </button>
              ))}
            </div>
          </>
        )}

        {currentStep === 'selectSection' && processedTest && (
          <>
            {/* Fixed title with better spacing for navigation buttons */}
            <div className="px-8 mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 text-center leading-tight">
                Select Section for {processedTest.name}
              </h2>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setSelectedSectionId(undefined); // Undefined means whole test
                  setCurrentStep('selectTiming');
                }}
                className={`w-full p-3 text-left rounded-lg border-2 transition-colors ${
                  selectedSectionId === undefined ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-medium">Whole Test</div>
                <div className="text-sm text-slate-600">All {processedTest.sections.length} sections</div>
              </button>

              {processedTest.sections.map((section, index) => {
                const { title, type } = formatSectionDisplayName(section, index);
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      setSelectedSectionId(section.id);
                      setCurrentStep('selectTiming');
                    }}
                    className={`w-full p-3 text-left rounded-lg border-2 transition-colors ${
                      selectedSectionId === section.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{title}</div>
                      <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {type}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {currentStep === 'selectTiming' && (
          <>
            <div className="px-8 mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 text-center">Select Timing</h2>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setSelectedTimeMode('regular')}
                className={`w-full p-3 text-left rounded-lg border-2 transition-colors ${
                  selectedTimeMode === 'regular' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-medium">Regular (35:00)</div>
                <div className="text-sm text-slate-600">Standard LSAT timing</div>
              </button>
              
              <button
                onClick={() => setSelectedTimeMode('1.5x')}
                className={`w-full p-3 text-left rounded-lg border-2 transition-colors ${
                  selectedTimeMode === '1.5x' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-medium">1.5x Time (52:30)</div>
                <div className="text-sm text-slate-600">Extended time accommodation</div>
              </button>
              
              <button
                onClick={() => setSelectedTimeMode('2x')}
                className={`w-full p-3 text-left rounded-lg border-2 transition-colors ${
                  selectedTimeMode === '2x' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-medium">Double Time (70:00)</div>
                <div className="text-sm text-slate-600">Double time accommodation</div>
              </button>
              
              <div className={`p-3 rounded-lg border-2 transition-colors ${
                selectedTimeMode === 'custom' ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
              }`}>
                <div className="font-medium mb-2">Custom Time</div>
                <div className="flex items-center space-x-2">
                 <input
                    type="number"
                    value={customMinutes}
                    onFocus={(e) => {
                      e.target.select();
                      setSelectedTimeMode('custom');
                    }}
                    onChange={(e) => {
                      setCustomMinutes(e.target.value);
                      setCustomError(false); // Clear error as user edits
                    }}
                    className={`w-20 px-2 py-1 border rounded text-sm ${
                      customError ? 'border-red-500' : 'border-slate-300'
                    }`}
                    min="1"
                    max="180"
                  />
                  <span className="text-sm text-slate-600">minutes</span>
                  <button
                    onClick={() => setSelectedTimeMode('custom')}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Set
                  </button>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedTimeMode('untimed')}
                className={`w-full p-3 text-left rounded-lg border-2 transition-colors ${
                  selectedTimeMode === 'untimed' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-medium">Untimed</div>
                <div className="text-sm text-slate-600">No time limit</div>
              </button>
            </div>
            <button
              onClick={handleConfirm}
              className="w-full mt-6 py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Start Test Session
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TimeModeSelectionModal;