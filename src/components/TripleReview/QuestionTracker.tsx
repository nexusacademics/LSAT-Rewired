import React from 'react';
import QuestionTracker, { QuestionFlags, Session, ProcessedQuestion } from './QuestionTracker'; // Adjust path

const sampleQuestions = [
  { id: '1' },
  { id: '2' },
  { id: '3' },
  { id: '4' },
  { id: '5' },
  { id: '6' },
  { id: '7' },
  { id: '8' },
  { id: '9' },
  { id: '10' },
];

const QuestionTrackerDemo: React.FC = () => {
  const [currentPhase, setCurrentPhase] = React.useState<
    'timed' | 'blindReview' | 'strategyReview' | 'strategyPlanning' | 'archive'
  >('timed');

  const [currentQuestion, setCurrentQuestion] = React.useState(0);

  const [session, setSession] = React.useState<Session>({
    currentQuestionIndex: currentQuestion,
    answeredQuestions: { '1': 'A', '3': 'B', '5': 'C', '8': 'D' },
    phase: currentPhase,
    questionFlags: {
      '2': { timedSection: true },
      '3': { blindReview: true },
      '4': { timedSection: true, blindReview: true },
      '5': { strategyPlanning: true },
      '6': { timedSection: true, strategyPlanning: true },
      '7': { blindReview: true, strategyPlanning: true },
      '8': { timedSection: true, blindReview: true, strategyPlanning: true },
      '10': { timedSection: true },
    },
  });

  // Keep currentQuestionIndex in session synced with currentQuestion state
  React.useEffect(() => {
    setSession((prev) => ({ ...prev, currentQuestionIndex: currentQuestion }));
  }, [currentQuestion]);

  // Keep phase in session synced with currentPhase state
  React.useEffect(() => {
    setSession((prev) => ({ ...prev, phase: currentPhase }));
  }, [currentPhase]);

  // Function to toggle a flag on a question for the current phase
  const toggleFlag = (questionId: string) => {
    setSession((prev) => {
      const prevFlags = prev.questionFlags?.[questionId] || {};

      // Determine which flag corresponds to the current phase
      // Map your phase to QuestionFlags keys
      let flagKey: keyof QuestionFlags | null = null;
      if (prev.phase === 'timed') flagKey = 'timedSection';
      else if (prev.phase === 'blindReview') flagKey = 'blindReview';
      else if (prev.phase === 'strategyPlanning') flagKey = 'strategyPlanning';
      else flagKey = null;

      if (!flagKey) return prev; // No flag to toggle in this phase

      const newFlagValue = !prevFlags[flagKey];

      return {
        ...prev,
        questionFlags: {
          ...prev.questionFlags,
          [questionId]: {
            ...prevFlags,
            [flagKey]: newFlagValue,
          },
        },
      };
    });
  };

  return (
    <div className="p-4 bg-slate-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Multi-Phase Question Tracker</h1>

        {/* Phase controls */}
        <div className="mb-4 p-4 bg-white rounded-lg">
          <h3 className="font-semibold mb-2">Current Phase:</h3>
          <div className="flex space-x-2">
            {(['timed', 'blindReview', 'strategyReview', 'strategyPlanning', 'archive'] as const).map(
              (phase) => (
                <button
                  key={phase}
                  onClick={() => setCurrentPhase(phase)}
                  className={`px-3 py-1 rounded text-sm ${
                    currentPhase === phase ? 'bg-blue-500 text-white' : 'bg-slate-200 hover:bg-slate-300'
                  }`}
                >
                  {phase.charAt(0).toUpperCase() + phase.slice(1)}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Question tracker */}
        <QuestionTracker
          session={session}
          questionsInCurrentSection={sampleQuestions as ProcessedQuestion[]} // Type assertion for demo
          onQuestionJump={setCurrentQuestion}
          onToggleFlag={toggleFlag} // Pass toggleFlag handler
          onExitSession={() => {}}
          onEndSection={() => {}}
          onPreviousQuestion={() => setCurrentQuestion((q) => Math.max(0, q - 1))}
          onNextQuestion={() =>
            setCurrentQuestion((q) => Math.min(sampleQuestions.length - 1, q + 1))
          }
          onSubmitSection={() => {}}
          isLastQuestionOfSection={currentQuestion === sampleQuestions.length - 1}
          isLastSection={false}
        />

        {/* Legend */}
        <div className="mt-4 p-4 bg-white rounded-lg">
          <h3 className="font-semibold mb-2">Flag Legend:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Single Flags:</h4>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-yellow-500"></div>
                  <span>Timed Section Flag</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-orange-500"></div>
                  <span>Blind Review Flag</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-red-500"></div>
                  <span>Strategy Planning Flag</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Multiple Flags (Concentric):</h4>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="relative w-6 h-6">
                    <div className="absolute inset-0 rounded-full bg-orange-500"></div>
                    <div className="absolute inset-[3px] rounded-full bg-yellow-500"></div>
                  </div>
                  <span>Timed + BR</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative w-6 h-6">
                    <div className="absolute inset-0 rounded-full bg-red-500"></div>
                    <div className="absolute inset-[2px] rounded-full bg-orange-500"></div>
                    <div className="absolute inset-[4px] rounded-full bg-yellow-500"></div>
                  </div>
                  <span>All Three Flags</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionTrackerDemo;
