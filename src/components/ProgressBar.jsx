import React from 'react';

const ProgressBar = ({ progress = 0 }) => {
  // Asegurarse que el progreso esté entre 0 y 100
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
      <div
        className="bg-[#3A85F5] h-2.5 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${clampedProgress}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;