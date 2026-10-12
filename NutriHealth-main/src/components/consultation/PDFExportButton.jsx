import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Printer } from 'lucide-react';

export default function PDFExportButton({ analysisResult, uploadedFile, activeDiet, underDoctorCare }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handlePrint}
      className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-slate-900/10 transition-all border border-slate-700"
    >
      <Download className="w-4 h-4 text-teal-400" />
      <span>Download PDF Report</span>
    </motion.button>
  );
}
