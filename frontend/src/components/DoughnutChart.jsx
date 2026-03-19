

const DoughnutChart = ({
  progress,
  stats = { notStarted: 0, inProgress: 0, completed: 0 },
  total = 100,
  label,
}) => {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;

  // Ensure stats exist to avoid undefined errors during tests
  const s = {
    notStarted: stats?.notStarted || 0,
    inProgress: stats?.inProgress || 0,
    completed: stats?.completed || 0,
  };

  const v1 = (s.notStarted / (total || 1)) * circumference;
  const v2 = (s.inProgress / (total || 1)) * circumference;
  const v3 = (s.completed / (total || 1)) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg className="w-32 h-32 transform -rotate-90">
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="8"
          className="text-notion-border dark:text-white/5"
        />
        {/* Simplified strokes for segments */}
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="transparent"
          stroke="#ef4444" // red
          strokeWidth="8"
          strokeDasharray={`${v1} ${circumference}`}
          className="transition-all duration-1000 ease-out"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="transparent"
          stroke="#3b82f6" // blue
          strokeWidth="8"
          strokeDasharray={`${v2} ${circumference}`}
          strokeDashoffset={-v1}
          className="transition-all duration-1000 ease-out"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="transparent"
          stroke="#22c55e" // green
          strokeWidth="8"
          strokeDasharray={`${v3} ${circumference}`}
          strokeDashoffset={-(v1 + v2)}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-black text-notion-text dark:text-white leading-none">
          {Math.round(Math.min(100, Math.max(0, progress || 0)))}%
        </span>
        {label && (
          <span className="text-[8px] font-black text-notion-text-secondary uppercase tracking-widest mt-1">
            {label}
          </span>
        )}
      </div>
    </div>
  );
};

export default DoughnutChart;
