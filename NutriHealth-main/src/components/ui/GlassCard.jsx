import React from 'react';
import { motion } from 'framer-motion';

export default function GlassCard({ 
  children, 
  className = '', 
  hoverGlow = true,
  animate = true,
  delay = 0,
  ...props 
}) {
  const baseClasses = `
    relative bg-white/80 backdrop-blur-xl border border-slate-200/80 
    rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 
    transition-all duration-300 overflow-hidden
    ${hoverGlow ? 'hover:border-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/10' : ''}
    ${className}
  `;

  if (!animate) {
    return (
      <div className={baseClasses} {...props}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={baseClasses}
      {...props}
    >
      {children}
    </motion.div>
  );
}
