'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X, Send } from 'lucide-react';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m your eco-assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);
  const messagesRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on outside click and ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      const btn = buttonRef.current;
      const panel = panelRef.current;
      if (btn && btn.contains(event.target)) return;
      if (panel && panel.contains(event.target)) return;
      setIsOpen(false);
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    
    // TODO: Integrate with actual AI service
    // For now, just echo a response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Thanks for your message! I\'m still learning to help with eco-friendly advice.' 
      }]);
    }, 1000);

    setInput('');
  };

  const content = (
    <div className="relative">
      {/* Chat Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] pointer-events-none">
        <div className="relative pointer-events-auto">
          <Button
            ref={buttonRef}
            onClick={() => setIsOpen(prev => !prev)}
            className="rounded-full w-24 h-24 sm:w-28 sm:h-28 bg-transparent flex items-center justify-center hover:bg-transparent focus:bg-transparent active:bg-transparent"
            variant="ghost"
            size="icon"
          >
            {isOpen ? (
              <X className="h-12 w-12 sm:h-14 sm:w-14 text-primary" />
            ) : (
              <div className="rounded-full overflow-hidden flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24">
                <Image
                  src="/chatbot_icon.gif"
                  alt="Chat Bot"
                  width={96}
                  height={96}
                  priority
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </Button>
        </div>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <Card ref={panelRef} onWheelCapture={(e) => {
          const list = messagesRef.current;
          if (!list) return;
          e.preventDefault();
          e.stopPropagation();
          list.scrollBy({ top: e.deltaY, behavior: 'auto' });
        }} className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6
          w-[min(95vw,520px)] h-[min(85vh,720px)]
          shadow-xl border border-primary/10 overflow-hidden z-[10000] animate-slide-up
          bg-white rounded-2xl pointer-events-auto">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 text-primary">
              <div className="flex items-center gap-3">
                <Image
                  src="/chatbot_icon.gif"
                  alt="Chat Bot"
                  width={48}
                  height={48}
                  className="rounded-full border border-primary/20"
                />
                <div>
                  <h3 className="font-semibold">Eco Assistant</h3>
                  <p className="text-xs opacity-75">Always here to help</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div ref={messagesRef} className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-contain touch-pan-y">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[90%] p-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-primary/10 text-primary backdrop-blur-sm ml-4'
                        : 'bg-primary/5 backdrop-blur-sm mr-4'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-primary/10">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-white border-primary/10 focus:ring-0 focus:border-primary/10 hover:border-primary/10"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  variant="ghost"
                  className="bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary focus:bg-primary/10 active:bg-primary/10">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </Card>
      )}
    </div>
  );

  if (!mounted) return null;
  return createPortal(content, document.body);
};

export default ChatBot;
