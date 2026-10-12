import React, { useEffect, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ShieldCheck, Activity, Search, BrainCircuit, AlertCircle, FileText, Sparkles, X, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useReport } from './context/ReportContext';

const STEPS = [
  { id: 1, label: 'Upload complete', desc: 'File received', icon: ShieldCheck },
  { id: 2, label: 'Extracting Biomarkers', desc: 'Scanning values via OCR', icon: Search },
  { id: 3, label: 'Analyzing Health', desc: 'Comparing to medical baselines', icon: Activity },
  { id: 4, label: 'Generating Recommendations', desc: 'Curating AI diet & lifestyle plan', icon: BrainCircuit },
];

const STEP_INTERVAL_MS = 2500;

export default function Processing() {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const { isAnalyzing, analysisResult, analysisError } = useReport();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < STEPS.length) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, STEP_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isAnalyzing && analysisResult) {
      const timer = setTimeout(() => navigate('/recovery'), 800);
      return () => clearTimeout(timer);
    }

    if (!isAnalyzing && analysisError) {
      const timer = setTimeout(() => navigate('/recovery'), 800);
      return () => clearTimeout(timer);
    }
  }, [isAnalyzing, analysisResult, analysisError, navigate]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-teal-50/30 text-slate-800 overflow-hidden font-sans items-center justify-center relative">

      {/* Modern background elements */}
      <div className="absolute top-[-15%] right-[-15%] w-[400px] h-[400px] bg-teal-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-15%] w-[400px] h-[400px] bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Floating geometric pattern */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-50px] right-[-50px] w-20 h-20 border-2 border-teal-200/30 rounded-full" />
        <div className="absolute bottom-[-50px] left-[-50px] w-30 h-30 border-2 border-emerald-200/30 rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 0.95, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-lg bg-white/90 backdrop-blur-2xl border border-slate-200/80 rounded-3xl p-10 shadow-2xl mx-4"
      >
        {/* Header Section */}
        <div className="text-center mb-10 space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
            className="inline-flex items-center justify-center w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 shadow-xl shadow-teal-500/30"
          >
            <BrainCircuit className="w-8 h-8 text-white relative z-10" />
          </motion.div>

          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            AI Medical Engine
          </h2>
          <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">
            Processing your report securely in real-time
          </p>
        </div>

        {/* Step Progress Container */}
        <div className="space-y-4 relative">
          {/* Vertical progress line */}
          <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-gradient-to-b from-teal-200 to-emerald-200 opacity-40 z-0" />

          {STEPS.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            const isPending = step.id > currentStep;
            const Icon = isCompleted ? CheckCircle2 : step.icon;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="relative z-10 flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-50/50 transition-all"
              >
                {/* Visual Line Fill Animation */}
                {index > 0 && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: isCompleted ? "calc(100% - 12px)" : isActive ? "50%" : 0 }}
                    className="absolute left-4.5 top-6 w-0.5 bg-gradient-to-b from-teal-500 to-emerald-500 z-0"
                  />
                )}

                <div className="relative flex-shrink-0">
                  <motion.div
                    initial={{ scale: 0.8, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                      ${isCompleted
                        ? 'bg-teal-500 border-teal-500 text-white shadow-lg shadow-teal-500/20'
                        : isActive
                        ? 'bg-white border-teal-400 text-teal-600 shadow-lg shadow-teal-500/15 ring-2 ring-teal-200'
                        : 'bg-white border-slate-200 text-slate-300 hover:border-slate-300'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${isCompleted ? '' : isActive ? 'animate-pulse' : ''}`} />
                  </motion.div>

                  {/* Active pulse ring animation */}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0.5, scale: 1 }}
                      animate={{ opacity: 0, scale: 1.5 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                      className="absolute inset-0 rounded-full bg-teal-500/20 pointer-events-none"
                    />
                  )}
                </div>

                <div className={`flex-1 pt-1 transition-all duration-300 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
                  <h4 className={`font-bold text-base ${isActive ? 'text-slate-900' : isCompleted ? 'text-teal-700' : 'text-slate-500'}`}>
                    {step.label}
                  </h4>
                  <AnimatePresence mode="popLayout">
                    {(isActive || isCompleted) && (
                      <motion.p
                        initial={{ opacity: 0, height: 0, y: -5 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: 5 }}
                        transition={{ duration: 0.3 }}
                        className={`text-sm mt-1 ${isActive ? 'text-teal-600 font-medium' : 'text-slate-500'}`}
                      >
                        {step.desc}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Error State - Enhanced with modern design */}
        <AnimatePresence>
          {analysisError && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              className="mt-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-rose-800 font-semibold text-sm">Analysis failed</p>
                <p className="text-rose-700 text-sm mt-0.5">{analysisError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-xs text-rose-600 hover:text-rose-500 font-medium underline-offset-2 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Try again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Step {currentStep} of {STEPS.length}</span>
            <span>{Math.round((currentStep / STEPS.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${(currentStep / STEPS.length) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
