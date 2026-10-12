import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Leaf, Activity, ChevronRight, Apple, Heart, Flame, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const TIPS_POOL = [
  { id: 1, category: 'Diet', title: 'Add a fiber-rich food', desc: 'Try adding beans, oats, fruit, or vegetables to a meal you already enjoy.', why: 'These foods offer fiber and variety as part of a balanced eating pattern.', icon: Apple, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200' },
  { id: 2, category: 'Exercise', title: 'Make room for movement', desc: 'If it feels comfortable for you, take a short walk or stretch break during the day.', why: 'Small movement breaks can be an approachable way to build more activity into a routine.', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { id: 3, category: 'Lifestyle', title: 'Keep a steady sleep routine', desc: 'Choose a regular wind-down time that works for your schedule.', why: 'A consistent routine can support regular sleep habits.', icon: Heart, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200' },
  { id: 4, category: 'Diet', title: 'Add color to your plate', desc: 'Choose a fruit or vegetable you like and include it with a meal or snack.', why: 'Different fruits and vegetables bring variety to everyday meals.', icon: Leaf, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200' },
  { id: 5, category: 'Lifestyle', title: 'Pause for water', desc: 'Keep water nearby and take a break when you feel thirsty.', why: 'Having water within reach can make it easier to respond to thirst during the day.', icon: Flame, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
];

export default function HealthTips() {
  const tips = TIPS_POOL;
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredTips = activeFilter === 'All' ? tips : tips.filter(t => t.category === activeFilter);

  return (
    <div className="w-full max-w-5xl mx-auto my-auto py-6 sm:py-8 space-y-8 flex flex-col justify-center">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              General health ideas
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Everyday health ideas</h2>
          <p className="text-slate-600 text-sm">A few general ideas for food, movement, and daily routines.</p>
        </div>
        
        <Link to="/assistant" className="px-5 py-3 rounded-xl bg-[#176d58] hover:bg-[#105b4b] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all">Ask about your report <ArrowRight className="w-4 h-4" /></Link>
      </div>

      <p className="-mt-5 text-xs text-slate-600">These ideas are general education and are not generated from your report. Check with a qualified healthcare professional about personal medical questions.</p>

      {/* Filter Tabs */}
      <div className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-1">
        {['All', 'Diet', 'Exercise', 'Lifestyle'].map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === filter 
                ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20' 
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Cards Grid - Occupies viewport height gracefully */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {filteredTips.map((tip, index) => {
            const Icon = tip.icon;
            return (
              <motion.div
                key={`${tip.id}-${index}`}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
                className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-sm flex flex-col justify-between group hover:shadow-md hover:border-teal-500/30 transition-all min-h-[280px]"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-2xl ${tip.bg} ${tip.color} border ${tip.border}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${tip.bg} ${tip.border} ${tip.color}`}>
                      {tip.category}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{tip.title}</h3>
                  <p className="text-slate-600 text-xs leading-relaxed mb-6">{tip.desc}</p>
                </div>
                
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mt-auto">
                  <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    Why this may help <ChevronRight className="w-3 h-3 text-teal-600" />
                  </h4>
                  <p className="text-slate-700 text-xs leading-relaxed font-medium">
                    {tip.why}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {filteredTips.length === 0 && (
         <div className="w-full py-16 flex flex-col items-center justify-center text-slate-400 text-sm">
            <Leaf className="w-10 h-10 mb-3 text-slate-300" />
            <p>No active tips in this category right now.</p>
         </div>
      )}
    </div>
  );
}
