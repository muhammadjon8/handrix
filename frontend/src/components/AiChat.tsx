import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, CheckCircle } from 'lucide-react';
import api from '../Api';
import AddressInput from './AddressInput';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AiChatProps {
  onJobClassified: (jobData: any, location: { lat: number; lng: number; address: string }) => void;
}

export default function AiChat({ onJobClassified }: AiChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I am Handrix AI. Please describe your home repair issue in detail, and let me know exactly what you think needs fixing.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    const newHistory = [...messages, userMessage];
    
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      // The backend expects an array called 'messages' based on its DTO setup
      const response = await api.post('/intake/chat', {
        messages: newHistory.slice(1).map(m => ({ role: m.role, content: m.content })) 
      });

      const aiData = response.data;

      // Add AI's standard response
      setMessages(prev => [...prev, { role: 'assistant', content: aiData.message }]);

      // If Gemini decided it has enough info and triggered the classifying function
      if (aiData.classified_job) {
        if (!location) {
           setMessages(prev => [...prev, { 
             role: 'assistant', 
             content: "I have everything I need about the job! Please select your service address above so I can finalize the quote." 
           }]);
           // We store the job privately until they provide an address
           (window as any).pendingJobData = aiData.classified_job;
        } else {
           // Address is already provided, send it upstream to be quoted/booked
           onJobClassified(aiData.classified_job, location);
        }
      }

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error communicating with the server. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  // If a user selects location AFTER the AI finishes, automatically proceed
  const handleLocationSubmit = (lat: number, lng: number, address: string) => {
    setLocation({ lat, lng, address });
    const pendingJob = (window as any).pendingJobData;
    if (pendingJob) {
      onJobClassified(pendingJob, { lat, lng, address });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col h-[75vh] bg-surface border border-white/5 shadow-2xl rounded-2xl overflow-hidden backdrop-blur-xl">
      
      {/* Header & Location Requirement */}
      <div className="p-4 border-b border-white/10 bg-black/20 flex flex-col gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-accent/20 rounded-lg text-primary-accent">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-display font-semibold text-white tracking-wide">Intake Assistant</h3>
            <p className="text-xs text-gray-400">Powered by Gemini 2.5 Flash</p>
          </div>
        </div>

        <div className="w-full">
          {location ? (
             <div className="flex items-center gap-2 text-sm text-secondary-accent bg-secondary-accent/10 p-2 rounded-md border border-secondary-accent/20">
               <CheckCircle size={16} />
               <span>Service Location Secured: <strong className="text-white">{location.address}</strong></span>
             </div>
          ) : (
            <AddressInput onLocationSelect={handleLocationSubmit} />
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`shrink-0 flex h-8 w-8 rounded-full items-center justify-center ${msg.role === 'user' ? 'bg-secondary-accent text-white' : 'bg-gray-700 text-primary-accent'}`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div 
                  className={`p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-secondary-accent text-white rounded-tr-sm' 
                      : 'bg-black/40 border border-white/5 text-gray-200 rounded-tl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 max-w-[85%]">
             <div className="shrink-0 flex h-8 w-8 rounded-full items-center justify-center bg-gray-700 text-primary-accent">
               <Bot size={16} />
             </div>
             <div className="p-4 rounded-2xl bg-black/40 border border-white/5 rounded-tl-sm flex items-center gap-1">
               <div className="w-2 h-2 rounded-full bg-primary-accent animate-bounce" style={{ animationDelay: '0ms' }} />
               <div className="w-2 h-2 rounded-full bg-primary-accent animate-bounce" style={{ animationDelay: '150ms' }} />
               <div className="w-2 h-2 rounded-full bg-primary-accent animate-bounce" style={{ animationDelay: '300ms' }} />
             </div>
          </motion.div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={sendMessage} className="p-4 bg-black/20 border-t border-white/10 shrink-0">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading || (window as any).pendingJobData}
            placeholder={location ? "Type your message..." : "Please set your location above first..."}
            className="w-full bg-gray-900 border border-white/10 rounded-full py-3 pl-4 pr-12 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-accent focus:ring-1 focus:ring-primary-accent"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || loading || !location || (window as any).pendingJobData}
            className="absolute right-2 p-2 bg-primary-accent text-black rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
