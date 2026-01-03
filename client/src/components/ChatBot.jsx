'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import ReactMarkdown from "react-markdown";
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X, Send, MessageCircle, Sparkles, Bot, Home, HelpCircle, Search, ArrowRight, ChevronRight, PhoneCall, ChevronDown } from 'lucide-react';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m your eco-assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [mounted, setMounted] = useState(false);
  const [quickReplies] = useState([
    'How do I calculate my footprint?',
    'Show reduction tips',
    'What is CSRD?',
    'Contact support'
  ]);
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'messages' | 'help'
  const [helpQuery, setHelpQuery] = useState('');
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
    // Call new Gemini-backed API
    const userInput = input;
    setInput('');
    ;(async () => {
      try {
        const payload = { question: userInput, context: '' };
        const res = await fetch('/api/ai/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data?.reply) {
          setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
          // Auto-scroll to bottom after response
          setTimeout(() => {
            try { messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' }); } catch {}
          }, 50);
        } else {
          throw new Error(data?.error || 'No reply');
        }
      } catch (err) {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I had trouble responding. Please try again.' }]);
        console.error('Chat error:', err);
      }
    })();
  };

  const content = (
    <div className="relative">
      {/* Chat Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[10020] pointer-events-none">
        <div className="relative pointer-events-auto">
          {/* pulsing glow */}
          {!isOpen && (
            <span className="absolute inset-0 -m-3 rounded-full bg-green-500/20 blur-xl animate-pulse" aria-hidden />
          )}
          <button
            ref={buttonRef}
            onClick={() => setIsOpen(prev => !prev)}
            aria-label={isOpen ? 'Close chat' : 'Open chat'}
            className="relative rounded-full w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400/60 bg-gradient-to-br from-green-600 to-emerald-500 text-white flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isOpen ? (
              <ChevronDown className="h-6 w-6" />
            ) : (
              <MessageCircle className="h-7 w-7" />
            )}
          </button>
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
        }} className="fixed bottom-24 right-4 sm:bottom-28 sm:right-6
          w-[min(95vw,420px)] h-[min(80vh,560px)]
          shadow-xl border border-primary/10 overflow-hidden z-[10000] animate-slide-up
          bg-white rounded-2xl pointer-events-auto">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-3 border-b border-primary/10">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-gradient-to-br from-green-600 to-emerald-500 flex items-center justify-center text-white">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground leading-tight">Eco Assistant</h3>
                  <p className="text-xs text-muted-foreground leading-tight">Typically replies in a few minutes</p>
                </div>
                <div className="ml-auto text-green-600 flex items-center gap-1">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs">AI</span>
                </div>
              </div>
            </div>

            {/* Main content area (tabbed) */}
            <div ref={messagesRef} className="flex-1 overflow-y-auto overscroll-contain touch-pan-y bg-accent/5">
              {activeTab === 'home' && (
                <div className="space-y-3 p-3">
                  {/* Gradient hero */}
                  <div className="rounded-xl p-4 text-white" style={{background:'linear-gradient(180deg,#0f5132 0%, #0d3f27 70%)'}}>
                    <div className="text-2xl font-bold leading-snug">Hi there 👋<br/>How can we help you today?</div>
                  </div>
                  {/* Contact card */}
                  <button className="w-full text-left rounded-xl border bg-white p-3 flex items-center justify-between shadow-sm">
                    <span className="font-medium text-foreground">Contact us</span>
                    <ArrowRight className="h-4 w-4 text-green-600" />
                  </button>
                  {/* CTA card */}
                  <div className="rounded-xl border bg-white p-3 shadow-sm">
                    <div className="font-semibold text-foreground mb-1">Meet our team ✨</div>
                    <p className="text-sm text-muted-foreground mb-3">Talk to one of our experts & start your low‑carbon strategy tomorrow!</p>
                    <button onClick={() => setActiveTab('messages')} className="w-full rounded-lg bg-green-600 text-white py-2 font-semibold flex items-center justify-center gap-2 hover:bg-green-700">
                      <MessageCircle className="h-4 w-4" /> Start a chat
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'messages' && (
                <div className="p-3 space-y-3">
                  <div className="text-sm font-semibold text-foreground px-1">Messages</div>
                  <div className="rounded-xl border bg-white p-3 flex items-center gap-3 shadow-sm">
                    <div className="size-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                      <MessageCircle className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">Hello 👋, welcome to our sustainability platform…</div>
                      <div className="text-xs text-muted-foreground">Just now</div>
                    </div>
                    <span className="size-2 rounded-full bg-red-500" />
                  </div>

                  {/* Conversation preview */}
                  {messages.map((message, index) => (
                    <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[90%] p-3 rounded-2xl ${message.role === 'user' ? 'bg-green-600 text-white ml-3' : 'bg-white border border-primary/10 mr-3'}`}>
                        {message.role === 'assistant' ? (
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        ) : (
                          message.content
                        )}
                      </div>
                    </div>
                  ))}

                  {/* auto-scroll anchor */}
                  <div ref={(el) => { if (el) try { el.scrollIntoView({ behavior: 'smooth' }); } catch {} }} />
                </div>
              )}

              {activeTab === 'help' && (
                <div className="p-3 space-y-3">
                  <div className="relative">
                    <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input value={helpQuery} onChange={(e)=>setHelpQuery(e.target.value)} placeholder="Search for help" className="pl-9" />
                  </div>
                  <div className="text-sm font-semibold text-foreground px-1">Collections</div>
                  {[{title:'Creating Your Carbon Report',count:'63 articles'},{title:'Engage in Sustainable Procurement',count:'15 articles'},{title:"Supplier's Help Center",count:'5 articles'}].map((c)=> (
                    <button key={c.title} className="w-full rounded-xl border bg-white p-3 flex items-center justify-between shadow-sm text-left">
                      <div>
                        <div className="font-medium text-foreground">{c.title}</div>
                        <div className="text-xs text-muted-foreground">{c.count}</div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-green-600" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer: show input (for messages) and tabs always visible */}
            <div className="border-t border-primary/10 bg-white">
              {activeTab === 'messages' && (
                <form onSubmit={handleSubmit} className="p-3">
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Write a message…"
                      className="flex-1 bg-white border-primary/20 focus:ring-0 focus:border-primary/40"
                    />
                    <Button type="submit" size="icon" className="bg-green-600 text-white hover:bg-green-700">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              )}
              <nav className="p-2 border-t border-primary/10">
                <div className="grid grid-cols-3 gap-1">
                  <button className={`flex flex-col items-center justify-center py-2 rounded-lg ${activeTab==='home'?'text-green-700 bg-green-50':'text-muted-foreground hover:bg-accent'}`} onClick={()=>setActiveTab('home')}>
                    <Home className="h-4 w-4" />
                    <span className="text-xs">Home</span>
                  </button>
                  <button className={`flex flex-col items-center justify-center py-2 rounded-lg ${activeTab==='messages'?'text-green-700 bg-green-50':'text-muted-foreground hover:bg-accent'}`} onClick={()=>setActiveTab('messages')}>
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-xs">Messages</span>
                  </button>
                  <button className={`flex flex-col items-center justify-center py-2 rounded-lg ${activeTab==='help'?'text-green-700 bg-green-50':'text-muted-foreground hover:bg-accent'}`} onClick={()=>setActiveTab('help')}>
                    <HelpCircle className="h-4 w-4" />
                    <span className="text-xs">Help</span>
                  </button>
                </div>
              </nav>
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  if (!mounted) return null;
  return createPortal(content, document.body);
};

export default ChatBot;
