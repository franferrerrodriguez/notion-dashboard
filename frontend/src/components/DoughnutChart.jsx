const DoughnutChart = ({ data, total }) => {
  const size = 100;
  const strokeWidth = 12;
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  
  if (!total || !data || data.length === 0) {
    return (
      <svg viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#222" strokeWidth={strokeWidth} />
      </svg>
    );
  }

  const segments = data.reduce((acc, segment, index) => {
    const segmentLength = (segment.count / total) * circumference;
    const offset = -acc.accumulated;
    acc.items.push({
      ...segment,
      segmentLength,
      offset,
      index
    });
    acc.accumulated += segmentLength;
    return acc;
  }, { items: [], accumulated: 0 }).items;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90 drop-shadow-2xl">
      {/* Background circle */}
      <circle cx={center} cy={center} r={radius} fill="none" stroke="#222" strokeWidth={strokeWidth} />
      
      {segments.map((segment) => (
        <circle 
          key={segment.name}
          cx={center} cy={center} r={radius} fill="none" 
          stroke={segment.color} strokeWidth={strokeWidth}
          strokeDasharray={`${segment.segmentLength} ${circumference}`}
          strokeDashoffset={segment.offset}
          style={{ 
            transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
            transitionDelay: `${segment.index * 0.05}s`
          }}
        />
      ))}
    </svg>
  );
};

export default DoughnutChart;
