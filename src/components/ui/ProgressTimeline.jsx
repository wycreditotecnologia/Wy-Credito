import React from 'react';
import { motion } from 'framer-motion';

export default function ProgressTimeline({ steps = [], currentStep = 1 }) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-4">
        {steps.map((label, idx) => {
          const stepNumber = idx + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          return (
            <div key={label} className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0.6 }}
                animate={{ scale: isActive ? 1 : 0.95, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className={
                  `flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ` +
                  (isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : isCompleted
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700')
                }
              >
                <span className={
                  `inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] ` +
                  (isActive
                    ? 'bg-white text-indigo-700'
                    : isCompleted
                      ? 'bg-green-200 text-green-800'
                      : 'bg-gray-200 text-gray-700')
                }>
                  {stepNumber}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </motion.div>
              {idx < steps.length - 1 && (
                <div className="hidden sm:block h-[2px] w-10 rounded bg-gray-200" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}