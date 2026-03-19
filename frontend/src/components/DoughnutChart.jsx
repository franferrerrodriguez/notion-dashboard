

const DoughnutChart = ({
  progress,
  stats = { notStarted: 0, inProgress: 0, completed: 0 },
  total = 0,
  label,
}) => {
  const radius = 35;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;

  // Use effective total or 1 to avoid division by zero
  const effectiveTotal = Math.max(
    total,
    ((stats?.notStarted || 0) + (stats?.inProgress || 0) + (stats?.completed || 0)),
    1
  );

  const v1 = ((stats?.notStarted || 0) / effectiveTotal) * circumference;
  const v2 = ((stats?.inProgress || 0) / effectiveTotal) * circumference;
  const v3 = ((stats?.completed || 0) / effectiveTotal) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center animate-in zoom-in duration-700">
      <svg className="w-32 h-32 transform -rotate-90 filter drop-shadow-[0_0_15px_rgba(59,130,246,0.15)]">
        {/* Background track */}
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-black/5 dark:text-white/5"
        />
        
        {/* Segments - Using brighter colors for visibility */}
        {/* Not Started - Amber/Orange for alert/pending */}
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="transparent"
          stroke="#f59e0b" // bg-amber-500
          strokeWidth={strokeWidth}
          strokeDasharray={`${v1} ${circumference}`}
          className="transition-all duration-1000 ease-out"
        />
        
        {/* In Progress - Blue for active */}
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="transparent"
          stroke="#3b82f6" // bg-blue-500
          strokeWidth={strokeWidth}
          strokeDasharray={`${v2} ${circumference}`}
          strokeDashoffset={-v1}
          className="transition-all duration-1000 ease-out"
        />
        
        {/* Completed - Green for success */}
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="transparent"
          stroke="#10b981" // bg-emerald-500
          strokeWidth={strokeWidth}
          strokeDasharray={`${v3} ${circumference}`}
          strokeDashoffset={-(v1 + v2)}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Percentage Center is handled in Dashboard.jsx for more flexibility with i18n */}
    </div>
  );
};

export default DoughnutChart;
