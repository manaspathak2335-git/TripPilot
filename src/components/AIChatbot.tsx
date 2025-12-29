import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { auth, db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

// 1. Import Flight Interface (Matches your Index.tsx)
import { Flight } from '@/data/flights';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// 2. Define Props Interface
interface AIChatbotProps {
  selectedContext?: Flight | null; // Optional flight data
  initialOpen?: boolean;
}

export const AIChatbot = ({ selectedContext, initialOpen }: AIChatbotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "👋 **Captain Gemini here!**\n\nI see what you see. Ask me about:\n- The selected flight status\n- Aviation terms (e.g., \"What is Zulu time?\")\n\nReady for takeoff?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated, user: authUser } = useAuth();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialOpen) setIsOpen(true);
  }, [initialOpen]);

  // Close auth prompt automatically when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated) setShowAuthPrompt(false);
  }, [isAuthenticated]);

  // 3. Helper to format context for the AI
  const getContextString = () => {
    if (!selectedContext) return "User is looking at the main map. No specific flight selected.";
    return `User has selected Flight ${selectedContext.flightNumber} (${selectedContext.airline}). 
            Route: ${selectedContext.origin} to ${selectedContext.destination}. 
            Status: ${selectedContext.status}. 
            Altitude: ${selectedContext.altitude}ft. 
            Speed: ${selectedContext.speed}knots.`;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // 4. Send Context to Backend
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage.content,
          context: getContextString() // <--- Sending the magic context here
        }),
      });

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || "I'm having trouble reaching the control tower.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save query if firebase auth is present; otherwise skip persistent storage
      const firebaseUser = auth?.currentUser;
      if (firebaseUser) {
        await addDoc(collection(db, 'users', firebaseUser.uid, 'queries'), {
          query: userMessage.content,
          response: assistantMessage.content,
          createdAt: serverTimestamp(),
        });
      }

    } catch (error) {
      console.error("Chat Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "⚠️ **Connection Error:** I can't reach the server. Is `main.py` running?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-sky flex items-center justify-center shadow-glow-accent z-50",
          "hover:scale-110 transition-transform",
          isOpen && "hidden"
        )}
      >
        <MessageCircle className="w-6 h-6 text-primary-foreground" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full flex items-center justify-center">
          <Sparkles className="w-2.5 h-2.5 text-success-foreground" />
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed bottom-6 right-6 w-[90vw] sm:w-96 h-[70vh] max-h-[600px] glass-strong rounded-2xl border border-border/50 shadow-elevated z-50 flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-primary/10 to-accent/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-sky flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">Captain Gemini</h3>
                  <p className="text-xs text-success flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                    Online
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-2",
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  )}
                >
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0",
                    message.role === 'user' 
                      ? 'bg-primary/20' 
                      : 'bg-accent/20'
                  )}>
                    {message.role === 'user' 
                      ? <User className="w-4 h-4 text-primary" />
                      : <Bot className="w-4 h-4 text-accent" />
                    }
                  </div>
                  <div className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2",
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-muted/50 rounded-tl-sm'
                  )}>
                    <div 
                      className="text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
                    />
                    <p className={cn(
                      "text-xs mt-1",
                      message.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'
                    )}>
                      {message.timestamp.toLocaleTimeString('en-IN', { 
                        hour: '2-digit', 
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2"
                >
                  <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-accent" />
                  </div>
                  <div className="bg-muted/50 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground rounded-full typing-dot" />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full typing-dot" />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full typing-dot" />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="px-4 py-2 flex gap-2 overflow-x-auto custom-scrollbar">
              {/* Context Aware Quick Actions */}
              {[
                selectedContext ? `Status of ${selectedContext.flightNumber}?` : 'Is my flight delayed?',
                'What is "Crosswind"?',
                'Rights for delayed baggage?'
              ].map((action) => (
                <button
                  key={action}
                  onClick={() => setInput(action)}
                  className="flex-shrink-0 px-3 py-1 text-xs bg-muted/50 hover:bg-muted rounded-full border border-border/50 transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-border/50">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask Captain Gemini..."
                  className="flex-1 bg-muted/50 border-border/50 focus:border-primary/50"
                  disabled={isTyping}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="bg-gradient-sky hover:opacity-90"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {showAuthPrompt && (
              <div className="px-4 pb-4">
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3 flex flex-col gap-3">
                  <div className="font-semibold">To access this feature, kindly login / sign up</div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => { setShowAuthPrompt(false); navigate('/login?next=/map&openChat=1'); }}>
                      Login
                    </Button>
                    <Button onClick={() => { setShowAuthPrompt(false); navigate('/signup?next=/map&openChat=1'); }}>
                      Sign up
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};