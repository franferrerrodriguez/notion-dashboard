import React from 'react';

/**
 * A reusable progress bar component with animated widths.
 * Optimized with React.memo for performance.
 * 
 * @param {Object} props
 * @param {number} props.value - Percentage value (0-100).
 * @param {string} props.color - CSS color code for the filled progress.
 * @param {boolean} props.showText - Whether to display the percentage text.
 * @returns {React.ReactElement}
 */
const ProgressBar = React.memo(({ value, color, showText }) => {
  const safeValue = Math.min(100, Math.max(0, value || 0));
  
  return (
    <div className="flex items-center gap-3 min-w-[140px] justify-center">
      {showText && (
        <span className="text-[11px] font-mono min-w-[35px] text-right">
          {safeValue.toFixed(1)}%
        </span>
      )}
      <div className="h-full grow relative overflow-hidden rounded-full bg-gray-100 dark:bg-white/5 border border-notion-border dark:border-white/5 shadow-inner">
        <div 
          className="h-full transition-all duration-1000 ease-out" 
          style={{ width: `${safeValue}%`, background: color }}
        />
      </div>
    </div>
  );
});

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;
