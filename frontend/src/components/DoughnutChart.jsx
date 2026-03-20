import React from 'react';
import { CHART_COLORS } from '../constants/theme';

const DoughnutChart = ({ stats, total }) => {
  const size = 100;
  const strokeWidth = 12;
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  
  const v1 = (stats.notStarted / total) * circumference;
  const v2 = (stats.inProgress / total) * circumference;
  const v3 = (stats.completed / total) * circumference;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90 drop-shadow-2xl">
      <circle cx={center} cy={center} r={radius} fill="none" stroke="#222" strokeWidth={strokeWidth} />
      
      <circle 
        cx={center} cy={center} r={radius} fill="none" 
        stroke={CHART_COLORS.COMPLETED} strokeWidth={strokeWidth}
        strokeDasharray={`${v3} ${circumference}`}
        style={{ transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
      />
      
      <circle 
        cx={center} cy={center} r={radius} fill="none" 
        stroke={CHART_COLORS.IN_PROGRESS} strokeWidth={strokeWidth}
        strokeDasharray={`${v2} ${circumference}`}
        strokeDashoffset={-v3}
        style={{ transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1) 0.3s' }}
      />

      <circle 
        cx={center} cy={center} r={radius} fill="none" 
        stroke={CHART_COLORS.NOT_STARTED} strokeWidth={strokeWidth}
        strokeDasharray={`${v1} ${circumference}`}
        strokeDashoffset={-(v3 + v2)}
        style={{ transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1) 0.6s' }}
      />
    </svg>
  );
};

export default DoughnutChart;
