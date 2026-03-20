
const ProgressBar = ({ value, color, showText }) => {
  const safeValue = Math.min(100, Math.max(0, value || 0));
  
  return (
    <div className="flex items-center gap-3 min-w-[140px] justify-center">
      {showText && (
        <span className="text-[11px] font-mono min-w-[35px] text-right">
          {safeValue.toFixed(1)}%
        </span>
      )}
      <div className="flex-grow max-w-[100px] h-1.5 bg-[#333] rounded-full overflow-hidden">
        <div 
          className="h-full transition-all duration-1000 ease-out" 
          style={{ width: `${safeValue}%`, background: color }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
