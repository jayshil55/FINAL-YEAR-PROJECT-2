import React from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { AlertCircle, FileSearch } from 'lucide-react';
import { useReport } from './context/ReportContext';
import AIConsultationFlow from './components/consultation/AIConsultationFlow';

export default function Results() {
  const navigate = useNavigate();
  const { analysisResult, analysisError, uploadedFile } = useReport();

  // Real analysis data only — reports are never replaced with sample profiles.
  const hasRealData = !!analysisResult
    && typeof analysisResult === 'object'
    && Array.isArray(analysisResult.bloodParameters)
    && analysisResult.bloodParameters.length > 0;

  if (!hasRealData) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-6 py-10">
        {analysisError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl"
          >
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-rose-800 font-semibold text-sm">Analysis could not be completed</p>
              <p className="text-rose-700 text-sm mt-0.5">{analysisError}</p>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center gap-4 p-10 bg-white/70 dark:bg-slate-900/70 backdrop-blur border border-slate-200 dark:border-slate-700 rounded-3xl"
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
            <FileSearch className="w-8 h-8 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              No analysis available yet
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md">
              {analysisError
                ? 'Your report could not be analyzed. Please try uploading it again.'
                : 'Upload a blood report to see your personalized analysis and recommendations.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/upload')}
            className="mt-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-600/25"
          >
            Upload Report
          </button>
        </motion.div>
      </div>
    );
  }

  const bloodParams = analysisResult.bloodParameters;
  const nutrients = Array.isArray(analysisResult.nutrients) ? analysisResult.nutrients : [];
  const allFoodsEat = Array.isArray(analysisResult.foodsToEat) ? analysisResult.foodsToEat : [];
  const foodsAvoid = Array.isArray(analysisResult.foodsToAvoid) ? analysisResult.foodsToAvoid : [];
  const lifestyle = Array.isArray(analysisResult.lifestyle) ? analysisResult.lifestyle : [];
  const disease = analysisResult.disease || 'General wellness review';
  const confidence = analysisResult.confidence || null;

  return (
    <div className="w-full space-y-6">
      {analysisError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl"
        >
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-amber-800 text-sm">
            A partial issue occurred during analysis; results below may be incomplete.
          </p>
        </motion.div>
      )}

      {analysisResult.modelAssessment && (
        <section className="max-w-5xl mx-auto rounded-3xl border border-indigo-200 bg-indigo-50/80 p-6 dark:border-indigo-900 dark:bg-indigo-950/30">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">Local machine learning model</p>
              <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{analysisResult.modelAssessment.status === 'ready' ? 'Model assessment' : 'Model setup needed'}</h3>
            </div>
            {analysisResult.modelAssessment.status === 'ready' && (
              <span className="rounded-xl bg-white px-4 py-2 text-lg font-bold text-indigo-700 shadow-sm dark:bg-slate-900 dark:text-indigo-200">
                {analysisResult.modelAssessment.category}
              </span>
            )}
          </div>
          {analysisResult.modelAssessment.status === 'ready' ? (
            <>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                The model received {analysisResult.modelAssessment.providedFeatureCount} of {analysisResult.modelAssessment.expectedFeatureCount} biomarker features from this report. The report pipeline’s measured values, alerts, and risk checks remain separate.
              </p>
              {analysisResult.modelAssessment.probabilities && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(analysisResult.modelAssessment.probabilities).map(([label, probability]) => (
                    <span key={label} className="rounded-lg border border-indigo-100 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                      {label}: {Math.round(probability * 100)}%
                    </span>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              {analysisResult.modelAssessment.message || 'The existing report pipeline completed, but local model prediction is unavailable.'}
            </p>
          )}
          <p className="mt-4 border-t border-indigo-200 pt-3 text-xs text-slate-500 dark:border-indigo-900 dark:text-slate-400">
            Educational demonstration only. The model is trained on synthetic, rule-derived tiers and is not a diagnostic tool or validated clinical risk score.
          </p>
        </section>
      )}

      {/* Agent Personalized Output */}
      {(analysisResult.agentSummary || analysisResult.healthTips) && (
        <div className="max-w-5xl mx-auto p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-3xl border border-emerald-200 dark:border-emerald-800 shadow-sm mt-6">
          <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mb-3">Personalized AI Agent Insights</h3>
          {analysisResult.agentSummary && (
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">{analysisResult.agentSummary}</p>
          )}
          {analysisResult.diseasePrediction && (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 mb-4 shadow-sm border border-emerald-100 dark:border-emerald-900">
              <h4 className="font-semibold text-emerald-700 dark:text-emerald-300 text-sm mb-1">Risk Indicator</h4>
              <p className="text-sm text-slate-800 dark:text-slate-200">{analysisResult.diseasePrediction.likelyCondition || 'Not specified'} (Confidence: {analysisResult.diseasePrediction.confidence || 'N/A'})</p>
              {Array.isArray(analysisResult.diseasePrediction.indicators) && analysisResult.diseasePrediction.indicators.length > 0 && (
                <ul className="text-xs text-slate-500 dark:text-slate-400 mt-2 list-disc pl-4">
                  {analysisResult.diseasePrediction.indicators.map((ind, i) => <li key={i}>{ind}</li>)}
                </ul>
              )}
            </div>
          )}
          {Array.isArray(analysisResult.healthTips) && analysisResult.healthTips.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-emerald-700 dark:text-emerald-300 text-sm mb-2">Health Tips</h4>
              <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                {analysisResult.healthTips.map((tip, i) => <li key={i}>• {tip}</li>)}
              </ul>
            </div>
          )}
          {analysisResult.disclaimer && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 border-t border-emerald-100 dark:border-emerald-900 pt-3">{analysisResult.disclaimer}</p>
          )}
        </div>
      )}

      {/* AI Consultation Interactive Flow */}
      <AIConsultationFlow
        analysisResult={analysisResult}
        uploadedFile={uploadedFile}
        bloodParams={bloodParams}
        nutrients={nutrients}
        allFoodsEat={allFoodsEat}
        foodsAvoid={foodsAvoid}
        lifestyle={lifestyle}
        summary={analysisResult.summary}
        disease={disease}
        confidence={confidence}
        disclaimer={analysisResult.disclaimer || null}
      />
    </div>
  );
}
