import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { startConversation, sendMessage, submitGrievance } from '../../api';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  isSummary?: boolean;
}

type Phase = 'IDENTITY' | 'GRIEVANCE' | 'CONFIRMATION' | 'SUBMITTED';
type IdStep = 'INIT' | 'NAME' | 'AGE' | 'LOCATION' | 'EMAIL' | 'DONE';

export default function ChatInterface() {
  const [phase, setPhase] = useState<Phase>('IDENTITY');
  const [idStep, setIdStep] = useState<IdStep>('INIT');
  
  const [userData, setUserData] = useState({
    name: '',
    age: '',
    location: '',
    email: '',
    language: 'en'
  });

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  useEffect(() => {
    if (endOfMessagesRef.current) {
      const scrollContainer = endOfMessagesRef.current.parentElement;
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
    
    if (!isTyping && phase !== 'CONFIRMATION' && phase !== 'SUBMITTED') {
      inputRef.current?.focus();
    }
  }, [messages, isTyping, phase]);

  const appendMsg = (sender: 'ai' | 'user', text: string, isSummary = false) => {
    setMessages(prev => [...prev, { id: Date.now().toString() + Math.random(), sender, text, isSummary }]);
  };

  const simulateKernelTyping = async (lines: string[], delayMs = 1500) => {
    setIsTyping(true);
    for (const line of lines) {
      await new Promise(r => setTimeout(r, delayMs));
      appendMsg('ai', line);
    }
    setIsTyping(false);
  };

  // Init sequence
  useEffect(() => {
    let mounted = true;
    const initSequence = async () => {
      setIsTyping(true);
      await new Promise(r => setTimeout(r, 1000));
      if (!mounted) return;
      await simulateKernelTyping([
        "...Whoa.",
        "Someone actually made it through.",
        "Hey. I'm KERNEL.",
        "Before we get into anything serious...",
        "What should I call you?"
      ], 1500);
      if (mounted) setIdStep('NAME');
    };
    initSequence();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startMutation = useMutation({
    mutationFn: startConversation,
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      // We deliberately ignore the backend's default "Session started" generic message to stay in character.
    },
    onError: () => {
      appendMsg('ai', 'Error establishing secure connection.');
      setIsTyping(false);
    }
  });

  const sendMutation = useMutation({
    mutationFn: ({ sid, msg }: { sid: string, msg: string }) => sendMessage(sid, msg),
    onMutate: () => setIsTyping(true),
    onSuccess: (data) => {
      appendMsg('ai', data.message);
      setIsTyping(false);
      if (data.readyToSubmit) {
        setPhase('CONFIRMATION');
        setAnalysisResult(data.analysisResult);
        setIsTyping(true);
        setTimeout(() => {
           setIsTyping(false);
           appendMsg('ai', "Okay.\nI think I've got the picture.\nLet me make sure I understood you correctly.");
           setIsTyping(true);
           setTimeout(() => {
              setIsTyping(false);
              appendMsg('ai', data.analysisResult?.summary || 'No summary provided', true);
              appendMsg('ai', 'Is that right?');
           }, 1500);
        }, 1500);
      }
    },
    onError: () => {
      appendMsg('ai', 'Connection interference. Please repeat that.');
      setIsTyping(false);
    }
  });

  const submitMutation = useMutation({
    mutationFn: submitGrievance,
    onMutate: () => setIsTyping(true),
    onSuccess: () => {
      setIsTyping(false);
    },
    onError: () => {
      setIsTyping(false);
      appendMsg('ai', 'Failed to transmit. Please try again.');
      setPhase('CONFIRMATION'); // Let them retry
    }
  });

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userMsg = inputValue.trim();
    setInputValue('');
    appendMsg('user', userMsg);

    if (phase === 'IDENTITY') {
      if (idStep === 'NAME') {
        setUserData(prev => ({ ...prev, name: userMsg }));
        setIdStep('AGE');
        await simulateKernelTyping([
          `${userMsg}.`,
          "Good to meet you.",
          "How old are you?"
        ], 1200);
      } else if (idStep === 'AGE') {
        setUserData(prev => ({ ...prev, age: userMsg }));
        setIdStep('LOCATION');
        await simulateKernelTyping([
          `${userMsg}.`,
          "Alright. You're definitely young enough to be making questionable decisions.",
          "Not that I'm judging.",
          "Where are you reaching me from?"
        ], 1500);
      } else if (idStep === 'LOCATION') {
        setUserData(prev => ({ ...prev, location: userMsg }));
        setIdStep('EMAIL');
        await simulateKernelTyping([
          `${userMsg}...`,
          "What's the best way to reach you if this channel drops?"
        ], 1200);
      } else if (idStep === 'EMAIL') {
        setUserData(prev => ({ ...prev, email: userMsg }));
        setIdStep('DONE');
        setPhase('GRIEVANCE');
        
        // Start KERNEL transition
        const name = userData.name || userMsg || 'friend';
        await simulateKernelTyping([
          `Alright, ${name}.`,
          "Name, age, location... I've got what I need.",
          "Now forget the formalities.",
          "So...",
          "Tell me what happened."
        ], 1500);
        
        // Connect backend AI in background
        startMutation.mutate('en'); 
      }
    } else if (phase === 'GRIEVANCE') {
       if (sessionId) {
         sendMutation.mutate({ sid: sessionId, msg: userMsg });
       }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleConfirm = (isCorrect: boolean) => {
    if (isCorrect) {
       appendMsg('user', 'YES, SEND IT');
       setPhase('SUBMITTED');
       setIsTyping(true);
       setTimeout(() => {
          setIsTyping(false);
          appendMsg('ai', "Alright.\nSending it.\nYour request is on its way.");
          submitMutation.mutate({
             ...userData,
             age: parseInt(userData.age, 10) || 0,
             grievance: analysisResult?.summary || '',
             sessionId
          });
       }, 1500);
    } else {
       appendMsg('user', 'NOT QUITE');
       setPhase('GRIEVANCE');
       simulateKernelTyping([
          "No problem.",
          "What did I get wrong?"
       ], 1200);
    }
  };

  let placeholder = '';
  let inputType = 'text';

  if (phase === 'IDENTITY') {
     if (idStep === 'NAME') placeholder = 'What should I call you?';
     if (idStep === 'AGE') { placeholder = 'How old are you?'; inputType = 'number'; }
     if (idStep === 'LOCATION') placeholder = 'Where are you reaching me from?';
     if (idStep === 'EMAIL') { placeholder = 'Where can I reach you?'; inputType = 'email'; }
  } else if (phase === 'GRIEVANCE') {
     placeholder = 'Tell KERNEL what happened...';
  }

  const isInputDisabled = isTyping || idStep === 'INIT' || phase === 'SUBMITTED' || phase === 'CONFIRMATION';

  return (
    <div className="relative flex flex-col h-[75vh] min-h-[500px] w-full max-w-4xl mx-auto rounded-xl overflow-hidden bg-kernel-dark/95 shadow-[0_0_50px_rgba(0,255,255,0.05)] border border-kernel-cyan/20">
      
      {/* Background Graphic */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03]">
        <div className="text-[25rem] font-pixel text-kernel-cyan leading-none select-none">K</div>
      </div>

      {/* Chat Timeline */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 z-10 scrollbar-thin scrollbar-thumb-kernel-cyan/30">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} transition-opacity duration-300 opacity-100`}>
            {msg.isSummary ? (
              <div className="w-full max-w-2xl mt-4 mb-2">
                <div className="text-kernel-cyan/50 text-xs tracking-widest mb-2 font-pixel">━━━━━━━━━━━━━━━━━━━━</div>
                <div className="text-kernel-cyan text-sm tracking-widest mb-4 font-pixel">WHAT KERNEL HEARD</div>
                <div className="text-kernel-cyan text-lg leading-relaxed whitespace-pre-wrap pl-4 border-l-2 border-kernel-cyan/50 bg-kernel-cyan/5 p-4 rounded-r-md">
                  {msg.text}
                </div>
                <div className="text-kernel-cyan/50 text-xs tracking-widest mt-4 font-pixel">━━━━━━━━━━━━━━━━━━━━</div>
              </div>
            ) : (
              <div
                className={`max-w-[85%] md:max-w-[70%] ${
                  msg.sender === 'user' 
                    ? 'text-kernel-gray text-right' 
                    : 'text-kernel-cyan text-left'
                }`}
              >
                {msg.sender === 'ai' && (
                   <div className="text-[10px] text-kernel-cyan/50 font-pixel mb-1 tracking-widest">KERNEL</div>
                )}
                <div className={`whitespace-pre-wrap leading-relaxed ${msg.sender === 'ai' ? 'text-lg md:text-xl' : 'text-base opacity-80'}`}>
                  {msg.text}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* Resonance / Typing Indicator */}
        {isTyping && (
          <div className="flex flex-col items-start transition-opacity duration-300 opacity-100">
            <div className="text-[10px] text-kernel-cyan/50 font-pixel mb-1 tracking-widest">KERNEL</div>
            <div className="flex items-center space-x-2 text-kernel-cyan/50">
               <div className="w-1.5 h-1.5 bg-kernel-cyan rounded-full animate-ping"></div>
               <span className="text-sm tracking-widest animate-pulse">resonance...</span>
            </div>
          </div>
        )}

        {/* Confirmation Buttons */}
        {phase === 'CONFIRMATION' && !isTyping && (
          <div className="flex flex-col sm:flex-row gap-4 mt-6 transition-opacity duration-300 opacity-100">
            <button 
              onClick={() => handleConfirm(true)}
              className="px-6 py-3 bg-kernel-cyan/20 border border-kernel-cyan text-kernel-cyan hover:bg-kernel-cyan hover:text-black transition-colors font-pixel text-sm tracking-widest"
            >
              YES, SEND IT
            </button>
            <button 
              onClick={() => handleConfirm(false)}
              className="px-6 py-3 bg-transparent border border-kernel-gray/50 text-kernel-gray hover:bg-kernel-gray/20 hover:text-white transition-colors font-pixel text-sm tracking-widest"
            >
              NOT QUITE
            </button>
          </div>
        )}

        {/* Post-submission State */}
        {phase === 'SUBMITTED' && submitMutation.isSuccess && (
           <div className="w-full text-center mt-12 animate-pulse">
              <div className="text-kernel-cyan font-pixel tracking-widest text-xl mb-2">TRANSMISSION COMPLETE</div>
              <div className="text-kernel-gray text-sm">Please check your secure email channel.</div>
           </div>
        )}

        <div ref={endOfMessagesRef} />
      </div>

      {/* Interactive Input Area */}
      {phase !== 'CONFIRMATION' && phase !== 'SUBMITTED' && (
        <form onSubmit={handleSend} className="p-4 md:p-6 bg-black/40 backdrop-blur-md border-t border-kernel-cyan/20 z-10 transition-all duration-500">
          <div className="relative flex items-center">
            {idStep !== 'INIT' && (
               <div className="absolute left-4 text-kernel-cyan/50 font-pixel text-xs tracking-widest pointer-events-none">
                  {'>'}
               </div>
            )}
            {inputType === 'text' ? (
              <textarea
                ref={inputRef as any}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={isInputDisabled}
                rows={1}
                className="w-full bg-transparent border-none focus:ring-0 text-kernel-cyan placeholder-kernel-cyan/30 px-10 py-3 resize-none outline-none leading-relaxed transition-all disabled:opacity-50"
                style={{ minHeight: '50px', maxHeight: '150px' }}
              />
            ) : (
              <input
                ref={inputRef as any}
                type={inputType}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={isInputDisabled}
                className="w-full bg-transparent border-none focus:ring-0 text-kernel-cyan placeholder-kernel-cyan/30 px-10 py-3 outline-none leading-relaxed transition-all disabled:opacity-50"
                style={{ minHeight: '50px' }}
              />
            )}
            {inputValue.trim() && !isInputDisabled && (
               <button 
                 type="submit"
                 className="absolute right-4 text-kernel-cyan hover:text-white transition-colors font-pixel text-xs tracking-widest"
               >
                 SEND
               </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
