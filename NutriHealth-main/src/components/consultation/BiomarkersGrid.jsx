import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, TrendingUp, TrendingDown, AlertCircle, Info, ChevronDown, ChevronUp, Activity } from 'lucide-react';

const getStatusBadge = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'normal') {
    return {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />,
      label: 'Normal',
    };
  }
  if (s === 'high' || s === 'warning') {
    return {
      bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
      icon: <TrendingUp className="w-4 h-4 text-amber-600 flex-shrink-0" />,
      label: 'Elevated',
    };
  }
  if (s === 'low') {
    return {
      bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
      icon: <TrendingDown className="w-4 h-4 text-rose-600 flex-shrink-0" />,
      label: 'Low',
    };
  }
  return {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: <Info className="w-4 h-4 text-slate-500 flex-shrink-0" />,
    label: status || 'Notice',
  };
};

export default function BiomarkersGrid({ bloodParams = [] }) {
  const [filter, setFilter] = useState('all'); // 'all', 'abnormal', 'normal'
  const [isCollapsed, setIsCollapsed] = useState(false);

  const abnormalCount = bloodParams.filter(p => (p.status || '').toLowerCase() !== 'normal').length;
  const normalCount = bloodParams.filter(p => (p.status || '').toLowerCase() === 'normal').length;

  const filteredParams = bloodParams.filter(p => {
    if (filter === 'abnormal') return (p.status || '').toLowerCase() !== 'normal';
    if (filter === 'normal') return (p.status || '').toLowerCase() === 'normal';
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center border border-teal-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Extracted Biomarkers
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600">
                {bloodParams.length} parameters
              </span>
            </h3>
            <p className="text-xs text-slate-500">Full laboratory readings parsed from your uploaded report</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Pills */}
          <div className="flex items-center p-1 bg-slate-100/80 rounded-xl border border-slate-200 text-xs font-medium">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'all' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-800'}`}
            >
              All ({bloodParams.length})
            </button>
            {abnormalCount > 0 && (
              <button
                onClick={() => setFilter('abnormal')}
                className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'abnormal' ? 'bg-amber-500 text-white shadow-sm font-semibold' : 'text-amber-700 hover:bg-amber-50'}`}
              >
                Needs Attention ({abnormalCount})
              </button>
            )}
            <button
              onClick={() => setFilter('normal')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'normal' ? 'bg-emerald-500 text-white shadow-sm font-semibold' : 'text-emerald-700 hover:bg-emerald-50'}`}
            >
              Normal ({normalCount})
            </button>
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors border border-slate-200"
            title={isCollapsed ? "Expand section" : "Collapse section"}
          >
            {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2"
          >
            {filteredParams.length > 0 ? (
              filteredParams.map((item, idx) => {
                const badge = getStatusBadge(item.status);
                return (
                  <motion.div
                    key={item.name || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.04 }}
                    className="group relative flex flex-col p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-teal-500/30 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-slate-600 text-sm font-semibold truncate group-hover:text-slate-900 transition-colors">
                        {item.name || item.label}
                      </span>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold ${badge.bg}`}>
                        {badge.icon}
                        <span>{badge.label}</span>
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                        {item.value}
                      </span>
                      {(item.normalRange || item.range) && (
                        <span className="text-xs text-slate-400 font-medium">
                          Ref: {item.normalRange || item.range}
                        </span>
                      )}
                    </div>

                    {item.explanation && (
                      <p className="text-xs text-slate-600 mt-3 pt-2.5 border-t border-slate-100 leading-relaxed">
                        {item.explanation}
                      </p>
                    )}
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full py-8 text-center text-slate-400 text-sm">
                No parameters match the selected filter.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
