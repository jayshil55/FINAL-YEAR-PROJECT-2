import React, { useState, useRef, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Lightbulb, ShieldCheck } from 'lucide-react';
import { useReport } from './context/ReportContext';
import { sendChatMessage } from './api/apiClient';

const PROMPT_SUGGESTIONS = [
  "Explain my blood report summary in detail",
  "What foods should I eat to improve my levels?",
  "What exercise routine is safest for my markers?",
  "Should I re-test my blood panel in 3 months?",
];

export default function Assistant() {
  const { analysisResult, chatHistory, setChatHistory } = useReport();

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: analysisResult
        ? `Hi, I’m NutriCare’s offline report assistant. Your report context is available${analysisResult.disease ? ` (${analysisResult.disease})` : ''}. What would you like to understand?`
        : 'Hi, I’m NutriCare’s offline report assistant. Upload a report to ask about its values and pipeline flags.',
    },
    ...chatHistory.map((item, index) => ({
      id: `history-${index}`,
      sender: item.role === 'user' ? 'user' : 'ai',
      text: item.text,
    })),
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    // Scroll element internally; does not scroll window or push layout headers
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (userText) => {
    const textToSend = typeof userText === 'string' ? userText : input;
    if (!textToSend.trim() || isTyping) return;

    const userMsg = { id: Date.now(), sender: 'user', text: textToSend.trim() };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const reply = await sendChatMessage(textToSend.trim(), analysisResult, chatHistory);

      const aiMsg = { id: Date.now() + 1, sender: 'ai', text: reply };
      setMessages((prev) => [...prev, aiMsg]);

      setChatHistory((prev) => [
        ...prev,
        { role: 'user', text: textToSend.trim() },
        { role: 'model', text: reply },
      ]);
    } catch (err) {
      const errMsg = {
        id: Date.now() + 1,
        sender: 'error',
        text: `Sorry, I couldn't process that right now. ${err.message || 'Please try again.'}`,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-start py-2 sm:py-4">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="nc-surface w-full max-w-5xl h-[min(740px,calc(100dvh-150px))] min-h-[430px] flex flex-col rounded-3xl overflow-hidden"
      >
        {/* Assistant Header */}
        <div className="shrink-0 flex items-center justify-between p-4 sm:p-5 bg-white/80 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white flex items-center justify-center relative shadow-md shadow-teal-500/20 flex-shrink-0">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
                NutriCare assistant <Sparkles className="w-4 h-4 text-emerald-600" />
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate max-w-[200px] sm:max-w-none">
                {analysisResult
                  ? `Report loaded · ${analysisResult.disease || 'Summary available'}`
                  : 'Health and nutrition questions'
                }
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-[#f3f5f0] text-slate-600 rounded-full border border-slate-200 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Local report guidance</span>
          </div>
        </div>

        {/* Scrollable Messages Area */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 custom-scrollbar scroll-smooth min-h-0"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-3 max-w-[92%] sm:max-w-[88%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 rounded-2xl flex items-center justify-center text-xs sm:text-sm font-bold shadow-sm
                  ${msg.sender === 'user' 
                    ? 'bg-slate-900 text-white' 
                    : msg.sender === 'error' ? 'bg-rose-100 text-rose-700' : 'bg-[#e8f3ed] text-teal-800'}
                `}>
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : msg.sender === 'error' ? <ShieldCheck className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className={`p-3.5 sm:p-4 rounded-3xl leading-relaxed text-xs sm:text-sm shadow-sm whitespace-pre-wrap ${
                  msg.sender === 'user' 
                    ? 'bg-[#176d58] text-white rounded-tr-xs font-medium' 
                    : msg.sender === 'error' ? 'bg-rose-50 border border-rose-200 text-rose-800 rounded-tl-xs' : 'bg-[#f5f7f2] border border-slate-200/90 text-slate-800 rounded-tl-xs'
                }`}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex gap-3 max-w-[85%]" role="status" aria-label="NutriCare is preparing a response"
              >
                 <div className="w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 rounded-2xl flex items-center justify-center bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-md shadow-teal-500/20">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3.5 sm:p-4 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm rounded-tl-xs flex items-center gap-1.5 h-10">
                  <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 rounded-full bg-teal-500" />
                  <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 rounded-full bg-teal-500" />
                  <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 rounded-full bg-teal-500" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Suggestion Chips */}
        {messages.length < 5 && (
          <div className="px-4 sm:px-6 pb-2 flex gap-2 overflow-x-auto hide-scrollbar shrink-0">
            {PROMPT_SUGGESTIONS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 border border-slate-200 hover:border-teal-200 text-slate-600 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
              >
                <Lightbulb className="w-3 h-3 text-amber-500" />
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Fixed Input Area at Bottom */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200/80 shrink-0">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
                aria-label="Message the NutriCare assistant"
                placeholder={
                analysisResult
                  ? "Ask about your report, diet plan, or lifestyle..."
                  : "Ask a health or nutrition question..."
              }
              className="w-full bg-slate-50 border border-slate-200/90 text-slate-900 text-xs sm:text-sm rounded-2xl pl-4 sm:pl-5 pr-12 sm:pr-14 py-3 sm:py-3.5 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all placeholder:text-slate-400 shadow-sm"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              aria-label="Send message"
              className="absolute right-2 p-2 sm:p-2.5 rounded-xl bg-[#176d58] hover:bg-[#105b4b] text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
