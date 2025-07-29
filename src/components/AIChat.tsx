import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Lightbulb, AlertCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import { User as UserType, ProcessedQuestion, TestSession, ProcessedPrepTest, Message } from '../App'; // Import Message from App
import { motion } from "framer-motion";

interface AIChatProps {
  user: UserType;
  isChatDisabled?: boolean; // New prop to indicate if chat is disabled
  currentView: 'landing' | 'dashboard' | 'triple-review' | 'circuit-builder' | 'performance' | 'chat';
  currentSession: TestSession | null;
  currentQuestionData: ProcessedQuestion | null; // NEW PROP
  allProcessedTests: { [key: string]: ProcessedPrepTest }; // ADD THIS LINE
  messages: Message[]; // Prop for messages state
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>; // Prop for setMessages function
  isOpen: boolean; // NEW: Prop to indicate if the chat bubble is open
  lastProcessedQuestionIdForChat: { questionId: string, phase: string } | null; // NEW: Lifted state for last processed question ID
  setLastProcessedQuestionIdForChat: React.Dispatch<React.SetStateAction<{ questionId: string, phase: string } | null>>; // NEW: Setter for lifted state
  hasInitialChatWelcomeBeenSent: boolean; // NEW: Lifted state for initial welcome message flag
  setHasInitialChatWelcomeBeenSent: React.Dispatch<React.SetStateAction<boolean>>; // NEW: Setter for lifted state
}

const AIChat: React.FC<AIChatProps> = ({ user, isChatDisabled = false, currentView, currentSession, currentQuestionData, allProcessedTests, messages, setMessages, isOpen, lastProcessedQuestionIdForChat, setLastProcessedQuestionIdForChat, hasInitialChatWelcomeBeenSent, setHasInitialChatWelcomeBeenSent }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null); // NEW: Ref for the textarea
  // Removed local lastProcessedQuestionId state, now using prop
  // Removed initialMessageSentRef, now using hasInitialChatWelcomeBeenSent prop

  // Initialize Gemini AI
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // NEW: Effect to resize textarea when inputMessage changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height to calculate scrollHeight correctly
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputMessage]);

  // Helper function to get human-readable question reference
  const getQuestionReference = (questionId: string): string => {
    if (!currentSession || !allProcessedTests) return `Question ${questionId}`;

    const test = allProcessedTests[currentSession.testId];
    if (!test) return `Question ${questionId}`;

    for (let sectionIndex = 0; sectionIndex < test.sections.length; sectionIndex++) {
      const section = test.sections[sectionIndex];
      for (let questionIndex = 0; questionIndex < section.questions.length; questionIndex++) {
        if (section.questions[questionIndex].id === questionId) {
          return `Section ${sectionIndex + 1}, Question ${questionIndex + 1}`;
        }
      }
    }
    return `Question ${questionId}`; // Fallback if not found
  };

  // NEW: Effect to manage chat context when currentQuestionData changes or view changes
  useEffect(() => {
    // Only add initial message if messages array is empty AND it hasn't been sent before
    if (messages.length === 0 && !hasInitialChatWelcomeBeenSent) {
      setMessages([
        {
          id: 'initial-load-general',
          type: 'ai',
          content: `Hi ${user.name}! I'm your LSAT analysis assistant. I'm here to help guide your thinking , but I won't give you direct answers.`,
          timestamp: new Date()
        }
      ]);
      setHasInitialChatWelcomeBeenSent(true); // Mark as sent
    }

    // Handle question change within TripleReview, only if chat is open
    const currentContext = currentQuestionData && currentSession
      ? { questionId: currentQuestionData.id, phase: currentSession.phase }
      : null;

    if (isOpen && currentView === 'triple-review' && currentContext) {
      // Check if the context (questionId + phase) has actually changed
      const hasContextChanged = !lastProcessedQuestionIdForChat ||
                                currentContext.questionId !== lastProcessedQuestionIdForChat.questionId ||
                                currentContext.phase !== lastProcessedQuestionIdForChat.phase;

      if (hasContextChanged) {
        const questionRef = getQuestionReference(currentQuestionData.id);

        // Define an array of introductory phrases
        const introPhrases = [
          `I see you've moved on to ${questionRef}. What are your initial thoughts on the passage or question stem?`,
          `Alright, we're now on ${questionRef}. What's standing out to you in the stimulus or question?`,
          `Moving to ${questionRef}. How are you approaching this one?`,
          `New question, ${questionRef}! What's your first impression of the argument presented?`,
          `Let's tackle ${questionRef}. What's the core issue or argument you're seeing here?`
        ];

        // Randomly select one phrase
        const randomPhrase = introPhrases[Math.floor(Math.random() * introPhrases.length)];

        // User moved to a new question within TripleReview or phase changed for same question
        setMessages(prev => [
          ...prev,
          {
            id: `new-question-intro-${Date.now()}`,
            type: 'ai',
            content: randomPhrase, // Use the randomly selected phrase
            timestamp: new Date()
          }
        ]);
        setLastProcessedQuestionIdForChat(currentContext);
      }
    } else if (currentView !== 'triple-review' && lastProcessedQuestionIdForChat !== null) {
      // User navigated away from a question (e.g., to dashboard)
      // Reset lastProcessedQuestionIdForChat to null when not in triple-review
      setLastProcessedQuestionIdForChat(null);
    }
  }, [currentQuestionData, currentView, user.name, currentSession, allProcessedTests, messages.length, isOpen, lastProcessedQuestionIdForChat, setLastProcessedQuestionIdForChat, hasInitialChatWelcomeBeenSent, setHasInitialChatWelcomeBeenSent]); // Dependencies for this effect

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Check if API key is configured
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      setApiError('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
      return;
    }

    setApiError(null);
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Initial history for AI persona setup
      const initialHistory = [
        {
          role: 'user',
          parts: [{ text: `You are a 25 year veteran educator and standardized testing expert. You are an expert on LSAT analysis and are helping students with as they review their practice tests. Your role is to:

1.
2. Guide students' thinking through Socratic questioning
3. Help them understand argument structure (premises, conclusions, assumptions) using a blend of traditional Aristotelian logic, more modern arguemntation theory like the work of Stephen Toulmin, and (on inductive, causal arguments) the Bradford Hill Criteria.
4. Encourage circuit building and visual mapping of logical relationships
5. Focus on developing analytical skills, not just getting correct answers
6. Use encouraging, supportive tone while maintaining academic rigor
7. When students ask for answers, redirect them to think about the logical structure
8. Encourage growth mindset based on the work of Carol Dweck
9. Encourage conceptual understanding over quick solutions
10. Do not provide a full analysis of a question if asked. Inquire with the student and guide them to analyze it on their own, step by step.
11. Keep responses concise and direct at first. Do not give any information about the question itself until the student is stuck.

Use these explanations and definitions to analyze the question the students is working on and to guide the student. Work on these in order and do not skip ahead if a previous step is not complete. Each step should begin with a rpompt to get the student to identify if the next thing is present and what it is without any other hints. If they are stuggling, then begin to dribble in clues:

1. Main Conclusion
Definition: The main point the author is trying to prove.
Form: Often an opinion, prediction, hypothesis, evaluation, or recommendation.
Strategy: Ask: “What is the takeaway? Why did the author say all this?”
Signal Words (optional): therefore, thus, so, hence — but not always present.

2. Qualifier
Definition: Language that limits the scope or certainty of the claim.
Form: Adverbs or phrases like often, usually, in most cases, sometimes.
Strategy: Look within or near the claim for frequency, degree, or quantity indicators.

3. Minor Premises (Evidence)
Definition: Specific facts or observations about the Subject of the Conclusion.
Form: Concrete statements, observable data, examples, testimony.
Strategy: Ask: “What facts does the author give to support the claim?”

4. Major Premise (Warrant)
Definition: A general principle or rule that warrants the predicate of the Conclusion, the thing being claimed.
Form: A rule, definition, or principle that makes the reasoning work.
Strategy: Ask: “Why does this fact support the claim?” or “What assumption connects the two?”

5. Backing/Linking Premise
Definition: Extra support that strenghens the soundness of either the minor or major premise.
Form: Facts or reasoning supporting the rule itself.
Strategy: Ask: “Why should we believe that rule or assumption?”

6. Counterarguments/Concessions and Rebuttals
Counterargument: A potential objection or limitation introduced by the author.
Rebuttal: The author’s response to the counterargument.
Signal Words: though, although, however, but, despite, even though
Strategy: Look for contrast markers or objections acknowledged and dismissed.

7. Assumption / Flaw
Definition: An unstated idea that must be true for the argument to work — it bridges the gap between two parts of the argument or is the one of the missing pieces of the argument (major or minor premise).
Goldilocks Principle: The correct assumption is just strong enough to make the reasoning valid — not overly strong or absolute, and not too weak or vague.` }]
        },
        {
          role: 'model',
          parts: [{ text: 'I understand. I\'m here to guide your LSAT analysis through thoughtful questioning and help you develop strong logical reasoning skills. I won\'t give direct answers, but I\'ll help you think through the problems systematically. What would you like to work on?' }]
        },
      ];

      let dynamicHistory: { role: string; parts: { text: string }[] }[] = [];

      // Add question context if applicable (only for Blind Review or Strategy Review)
      if (currentQuestionData && currentView === 'triple-review' &&
          (currentSession?.phase === 'blind-review' || currentSession?.phase === 'strategy-review')) {
        const questionContext = `The user is currently working on the following LSAT question:\n\n` +
                                `Passage:\n${currentQuestionData.passage}\n\n` +
                                `Question Stem:\n${currentQuestionData.question}\n\n` +
                                `Options:\n${currentQuestionData.options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n')}\n\n` +
                                `Please help guide the user's thinking through analyzing this content, but remember not to give direct answers.`;
        
        dynamicHistory.push({
          role: 'user', // This is a user-like message providing context
          parts: [{ text: questionContext }]
        });
      }

      // Add previous chat messages
      dynamicHistory = dynamicHistory.concat(messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })));

      // Add the current user message
      dynamicHistory.push({
        role: 'user',
        parts: [{ text: inputMessage }]
      });

      // Start a chat session with the full conversation history
      const chat = model.startChat({
        history: initialHistory.concat(dynamicHistory)
      });

      const result = await chat.sendMessage(inputMessage);
      const aiResponse = result.response.text();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      setApiError('Failed to get AI response. Please check your API key and try again.');
      
      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFeedback = (messageId: string, feedback: 'helpful' | 'not-helpful') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, feedback } : msg
    ));
  };

  // Reduced quick prompts to two
 const quickPrompts = [
  //  "How do I identify the conclusion?",
   // "Help me build a circuit for this argument"
  ];

  return (
   <motion.div
  drag
  dragMomentum={false}
  dragElastic={0.2}
  className="h-full flex flex-col bg-slate-50 rounded-2xl border overflow-hidden cursor-move">
      <div className="h-full flex flex-col bg-slate-50 rounded-2xl overflow-hidden"> {/* Adjusted for bubble */}
      {/* Header */}
      <div className="chat-drag-handle bg-purple-100 border-b border-slate-200 px-4 py-1"> {/* Adjusted padding */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-xl">
            <Bot className="h-3 w-3 text-purple-600" /> {/* Adjusted icon size */}
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-900">AI Analysis Assistant</h1> {/* Adjusted font size */}
            <p className="text-xs text-slate-600">Your guide to better logical reasoning</p> {/* Adjusted font size */}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 break-words whitespace-normal"> {/* Adjusted padding and spacing */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}> {/* Adjusted max-width */}
              <div className={`flex items-start space-x-2 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}> {/* Adjusted spacing */}
                <div className={`p-1 rounded-lg ${ // Adjusted padding and border-radius
                  message.type === 'user' 
                    ? 'bg-blue-600' 
                    : 'bg-purple-100'
                }`}>
                  {message.type === 'user' ? (
                    <User className="h-4 w-4 text-white" /> // Adjusted icon size
                  ) : (
                    <Bot className="h-4 w-4 text-purple-600" /> // Adjusted icon size
                  )}
                </div>

                <div className={`rounded-xl p-3 ${ // Adjusted padding and border-radius
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-900'
                }`}>
                  <div className="text-sm leading-relaxed break-words whitespace-normal">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                  
                  <div className={`text-xs mt-1 ${ // Adjusted font size and margin
                    message.type === 'user' ? 'text-blue-100' : 'text-slate-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              {/* Feedback buttons for AI messages */}
              {message.type === 'ai' && (
                <div className="flex items-center space-x-1 mt-1 ml-8"> {/* Adjusted spacing and margin */}
                  <button
                    onClick={() => handleFeedback(message.id, 'helpful')}
                    className={`p-0.5 rounded transition-colors ${ // Adjusted padding
                      message.feedback === 'helpful'
                        ? 'bg-green-100 text-green-600'
                        : 'text-slate-400 hover:text-green-600 hover:bg-green-50'
                    }`}
                  >
                    <ThumbsUp className="h-3 w-3" /> {/* Adjusted icon size */}
                  </button>
                  <button
                    onClick={() => handleFeedback(message.id, 'not-helpful')}
                    className={`p-0.5 rounded transition-colors ${ // Adjusted padding
                      message.feedback === 'not-helpful'
                        ? 'bg-red-100 text-red-600'
                        : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <ThumbsDown className="h-3 w-3" /> {/* Adjusted icon size */}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2"> {/* Adjusted spacing */}
              <div className="p-1 bg-purple-100 rounded-lg"> {/* Adjusted padding and border-radius */}
                <Bot className="h-4 w-4 text-purple-600" /> {/* Adjusted icon size */}
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-3"> {/* Adjusted padding and border-radius */}
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div> {/* Adjusted size */}
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div> {/* Adjusted size */}
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div> {/* Adjusted size */}
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-4 py-2"> {/* Adjusted padding */}
        <div className="flex flex-wrap gap-1.5"> {/* Adjusted gap */}
          {quickPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => setInputMessage(prompt)}
              className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors text-slate-700" // Adjusted padding and font size
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-slate-200 p-4"> {/* Adjusted padding */}
        {apiError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-3 flex items-start space-x-2"> {/* Adjusted padding and margin */}
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" /> {/* Adjusted icon size */}
            <div className="text-xs text-red-800"> {/* Adjusted font size */}
              <strong>API Error:</strong> {apiError}
            </div>
          </div>
        )}

        <div className="flex space-x-3"> {/* Adjusted spacing */}
          <div className="flex-1 relative">
            {/* Changed from input to textarea */}
            <textarea
              ref={textareaRef} // Added ref
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { // Send on Enter, new line on Shift+Enter
                  e.preventDefault(); // Prevent default new line
                  handleSendMessage();
                }
              }}
              placeholder="Ask about argument structure, circuit building, or analysis techniques..."
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 pr-10 text-sm resize-none overflow-hidden min-h-[42px]" // Added resize-none, overflow-hidden, min-h
              disabled={isChatDisabled} // Disable input when chat is disabled
              rows={2} // Start with 1 row
            />
            <Lightbulb className="absolute right-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" /> {/* Adjusted position and icon size */}
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping || isChatDisabled} // Disable button when chat is disabled
            className="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" // Adjusted padding and border-radius
          >
            <Send className="h-4 w-4" /> {/* Adjusted icon size */}
          </button>
        </div>
      </div>
    </div>
</motion.div>
  );
};

export default AIChat;