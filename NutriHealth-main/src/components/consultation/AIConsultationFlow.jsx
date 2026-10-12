import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Sparkles, CheckCircle2, User, Stethoscope, AlertTriangle, 
  Utensils, Salad, Egg, Beef, ArrowRight, HeartPulse, FileText, 
  MessageSquare, ShieldCheck, ChevronRight, RefreshCw, Info, Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BiomarkersGrid from './BiomarkersGrid';
import MealPlanCard from './MealPlanCard';
import PDFExportButton from './PDFExportButton';

const DIET_OPTIONS = [
  { id: 'veg', label: 'Vegetarian', icon: <Salad className="w-5 h-5" />, desc: 'Plant-rich meals with legumes, grains, and dairy' },
  { id: 'egg', label: 'Eggetarian', icon: <Egg className="w-5 h-5" />, desc: 'Plant-based diet including egg whites & healthy proteins' },
  { id: 'non-veg', label: 'Non-Vegetarian', icon: <Beef className="w-5 h-5" />, desc: 'Includes lean meats, fish, seafood & poultry' },
];

export default function AIConsultationFlow({ 
  analysisResult, 
  uploadedFile, 
  bloodParams = [],
  nutrients = [],
  allFoodsEat = [],
  foodsAvoid = [],
  lifestyle = [],
  summary = '',
  disease = 'General Analysis',
  confidence = null,
  disclaimer = ''
}) {
  const navigate = useNavigate();

  // Consultation state
  const [underDoctorCare, setUnderDoctorCare] = useState(null); // true | false | null
  const [activeDiet, setActiveDiet] = useState('veg'); // 'veg' | 'egg' | 'non-veg'
  const [currentStep, setCurrentStep] = useState(1); // 1: Intro & Summary, 2: Doctor Care Q, 3: Diet Pref Q, 4: Full Consultation Plan

  const abnormalParams = bloodParams.filter(p => (p.status || '').toLowerCase() !== 'normal');

  const handleDoctorResponse = (underCare) => {
    setUnderDoctorCare(underCare);
    if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleDietSelect = (dietId) => {
    setActiveDiet(dietId);
    if (currentStep === 3) {
      setCurrentStep(4);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pt-2 pb-12">
      
      {/* Consultation Progress Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-teal-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Report overview</h2>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-xs text-slate-500">Explore your report and nutrition context</p>
          </div>
        </div>

        {/* Stepper indicator - Touch scrollable on mobile */}
        <div className="flex items-center gap-2 text-xs font-semibold overflow-x-auto hide-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { step: 1, label: 'Overview' },
            { step: 2, label: 'Care Status' },
            { step: 3, label: 'Diet Preference' },
            { step: 4, label: 'Complete Protocol' }
          ].map((s) => (
            <button
              key={s.step}
              onClick={() => {
                if (s.step <= currentStep) setCurrentStep(s.step);
              }}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                currentStep === s.step
                  ? 'bg-teal-500 text-white shadow-sm'
                  : currentStep > s.step
                  ? 'bg-teal-50 text-teal-700 border border-teal-200'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              <span>{s.step}.</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Main Consultation Feed */}
      <div className="space-y-6">

        {/* ── STEP 1: AI Intro & Summary ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-5 sm:p-8 shadow-xl relative overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-teal-500/25">
              <Bot className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-4 w-full">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    NutriCare offline report assistant
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                  </h3>
                  <span className="text-xs text-slate-500">Local guidance from report values and checks</span>
                </div>
                {confidence && (
                  <span className="text-xs font-bold px-3 py-1 bg-teal-50 text-teal-700 rounded-full border border-teal-200">
                    {confidence} Confidence Match
                  </span>
                )}
              </div>

              {/* AI Speech Bubble */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-800 text-sm sm:text-base leading-relaxed space-y-3">
                  <p className="font-semibold text-teal-900">
                  Your report summary is ready to explore.
                </p>
                <p className="text-slate-600">
                  {summary}
                </p>
                {disease && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-50 border border-teal-200 rounded-xl flex-wrap">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <span className="text-xs font-bold text-teal-900">Primary Health Indicator:</span>
                    <span className="text-xs font-extrabold text-teal-700 uppercase tracking-wider">{disease}</span>
                  </div>
                )}
              </div>

              {/* Findings Breakdown */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  Key Clinical Findings Explained Simply
                </h4>

                {abnormalParams.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {abnormalParams.map((param, idx) => (
                      <div key={idx} className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-slate-900">{param.name}: <span className="text-amber-700">{param.value}</span></p>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{param.explanation || `Value is currently ${param.status}.`}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <p className="text-sm text-emerald-800 font-medium">All measured blood parameters fall within healthy baseline reference ranges!</p>
                  </div>
                )}
              </div>

              {currentStep === 1 && (
                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25 hover:from-teal-400 hover:to-emerald-400 transition-all"
                  >
                    <span>Continue Consultation</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── STEP 2: Doctor Care Question ── */}
        {currentStep >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-5 sm:p-8 shadow-xl relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0 border border-teal-200">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div className="flex-1 space-y-4 w-full">
                <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/60 border border-teal-200/80 text-slate-800 text-sm sm:text-base leading-relaxed">
                  <p className="font-bold text-teal-900 mb-1">
                    🩺 "Before we personalize your nutrition plan: Are you currently under a doctor's care for these findings?"
                  </p>
                  <p className="text-xs text-teal-700">
                    This helps me tailor medical safety guidelines specifically for your situation.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <button
                    onClick={() => handleDoctorResponse(true)}
                    className={`p-4 sm:p-5 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                      underDoctorCare === true
                        ? 'bg-teal-500 text-white border-teal-500 shadow-lg shadow-teal-500/20'
                        : 'bg-white border-slate-200/90 hover:border-teal-400 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${underDoctorCare === true ? 'text-white' : 'text-teal-600'}`} />
                    <div>
                      <h4 className="font-bold text-sm sm:text-base">Yes, I am under a doctor's care</h4>
                      <p className={`text-xs mt-1 ${underDoctorCare === true ? 'text-teal-100' : 'text-slate-500'}`}>
                        Focus on complementary nutritional guidance to support your ongoing medical treatment.
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleDoctorResponse(false)}
                    className={`p-4 sm:p-5 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                      underDoctorCare === false
                        ? 'bg-teal-500 text-white border-teal-500 shadow-lg shadow-teal-500/20'
                        : 'bg-white border-slate-200/90 hover:border-teal-400 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <Info className={`w-5 h-5 flex-shrink-0 mt-0.5 ${underDoctorCare === false ? 'text-white' : 'text-amber-500'}`} />
                    <div>
                      <h4 className="font-bold text-sm sm:text-base">No, I am not under a doctor's care</h4>
                      <p className={`text-xs mt-1 ${underDoctorCare === false ? 'text-teal-100' : 'text-slate-500'}`}>
                        Receive nutritional guidance with recommendations on when to consult a physician.
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: Dietary Preference ── */}
        {currentStep >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-5 sm:p-8 shadow-xl relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 border border-emerald-200">
                <Utensils className="w-6 h-6" />
              </div>
              <div className="flex-1 space-y-4 w-full">
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 text-slate-800 text-sm sm:text-base leading-relaxed">
                  <p className="font-bold text-emerald-950 mb-1">
                    🥗 "What is your primary dietary preference?"
                  </p>
                  <p className="text-xs text-emerald-700">
                    I will customize all nutrient sources, meal ideas, and food swaps to match your exact lifestyle.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  {DIET_OPTIONS.map((diet) => (
                    <button
                      key={diet.id}
                      onClick={() => handleDietSelect(diet.id)}
                      className={`p-4 sm:p-5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                        activeDiet === diet.id
                          ? 'bg-teal-500 text-white border-teal-500 shadow-lg shadow-teal-500/20'
                          : 'bg-white border-slate-200/90 hover:border-teal-400 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-2.5 rounded-xl ${activeDiet === diet.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
                          {diet.icon}
                        </div>
                        {activeDiet === diet.id && (
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-base mb-1">{diet.label}</h4>
                        <p className={`text-xs leading-relaxed ${activeDiet === diet.id ? 'text-teal-100' : 'text-slate-500'}`}>
                          {diet.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── STEP 4: Complete Personalized Protocol ── */}
        {currentStep >= 4 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* AI Confirmation Header */}
            <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-base">Personalized Protocol Ready</h4>
                  <p className="text-xs text-slate-300">Targeted for {disease} • {activeDiet.toUpperCase()} Diet Focus</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                <PDFExportButton 
                  analysisResult={analysisResult} 
                  uploadedFile={uploadedFile} 
                  activeDiet={activeDiet}
                  underDoctorCare={underDoctorCare}
                />
                <button
                  onClick={() => navigate('/assistant')}
                  className="px-4 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25 transition-all flex-1 sm:flex-initial"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Ask Assistant</span>
                </button>
              </div>
            </div>

            {/* Nutrients & Foods Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Nutrients Required */}
              <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200 flex-shrink-0">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Key Nutrients Required</h4>
                    <p className="text-xs text-slate-500">Essential micro & macronutrients</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {nutrients.map((nutrient, idx) => (
                    <span 
                      key={idx} 
                      className="px-3.5 py-1.5 bg-purple-50/80 border border-purple-200/80 text-purple-900 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      {nutrient}
                    </span>
                  ))}
                </div>
              </div>

              {/* Foods to Avoid */}
              <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 flex-shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Foods to Limit or Avoid</h4>
                    <p className="text-xs text-slate-500">Items that exacerbate abnormal markers</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {foodsAvoid.map((food, idx) => (
                    <span 
                      key={idx} 
                      className="px-3.5 py-1.5 bg-rose-50/80 border border-rose-200/80 text-rose-900 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      {food}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Foods to Eat Cards */}
            <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-5 sm:p-8 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 flex-shrink-0">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Recommended Healing Foods</h4>
                    <p className="text-xs text-slate-500">Curated specifically for your {activeDiet.toUpperCase()} diet preference</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                {allFoodsEat.map((food, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl flex flex-col justify-between hover:border-teal-400 transition-all shadow-sm"
                  >
                    <h5 className="font-bold text-slate-900 text-sm mb-1">
                      {typeof food === 'string' ? food : food.name}
                    </h5>
                    {typeof food === 'object' && food.desc && (
                      <p className="text-xs text-slate-600 leading-relaxed">{food.desc}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Structured Meal Plan */}
            <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-5 sm:p-8 shadow-xl">
              <MealPlanCard activeDiet={activeDiet} disease={disease} />
            </div>

            {/* Lifestyle Improvements */}
            {lifestyle.length > 0 && (
              <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-5 sm:p-8 shadow-xl space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-200 flex-shrink-0">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Lifestyle & Daily Habits</h4>
                    <p className="text-xs text-slate-500">Habits to accelerate biomarker recovery</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {lifestyle.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl">
                      <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs md:text-sm text-slate-700 font-medium leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Extracted Biomarkers Detailed Grid */}
            <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-5 sm:p-8 shadow-xl">
              <BiomarkersGrid bloodParams={bloodParams} />
            </div>

            {/* Clinical Disclaimer */}
            <p className="text-center text-xs text-slate-400 pt-4 leading-relaxed max-w-3xl mx-auto">
              {disclaimer || 'This automated analysis is for educational purposes and is not a clinical diagnosis. Always review lab results with a qualified physician.'}
            </p>

          </motion.div>
        )}

      </div>

    </div>
  );
}
