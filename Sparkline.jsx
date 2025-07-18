import React from 'react';

export default function Sparkline({ data = [] }) {
  if (!data.length) return null;
  const width = 60;
  const height = 16;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} className="inline-block align-middle">
      <polyline
        fill="none"
        stroke="#2563eb"
        strokeWidth="2"
        points={points}
      />
    </svg>
  );
} 