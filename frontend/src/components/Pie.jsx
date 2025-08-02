import React from "react";
import Box from '@mui/joy/Box';
import Chip from '@mui/joy/Chip';

export default function Pie({ data }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <div>No hay datos para graficar</div>;
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);

  const COLORS = [
    "#FF6F61", 
    "#FFB347", 
    "#FFD700", 
    "#7EC850", 
    "#4FC3F7", 
    "#9575CD", 
    "#F06292", 
    "#26C6DA", 
    "#8D6E63", 
    "#FF8A65", 
    "#C0CA33", 
    "#00BFAE", 
    "#E57373", 
    "#BA68C8", 
    "#81C784", 
    "#CE93D8", 
  ];

  let cumulativeAngle = 0;
  const radius = 120;
  const center = 150;
  const segments = [];
  const labels = [];

  const filteredData = data.filter(d => d.value > 0);
  const zeroValues = data.filter(d => d.value ===0);

  filteredData.forEach((d, i) => {
    const value = d.value;
    const percent = value / total;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + percent * 2 * Math.PI;
    cumulativeAngle = endAngle;

    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);

    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

    const pathData = [
      `M ${center} ${center}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      "Z"
    ].join(" ");

    segments.push(
      <path
        key={i}
        d={pathData}
        fill={COLORS[i % COLORS.length]}
        stroke="#fff"
        strokeWidth="2"
      />
    );

    const midAngle = (startAngle + endAngle) / 2;
    const labelRadius = radius * 0.6;
    const lx = center + labelRadius * Math.cos(midAngle);
    const ly = center + labelRadius * Math.sin(midAngle);

    const percentLabel = (percent * 100).toFixed(1);

    if (percent * 100 > 10) {
      labels.push(
        <text
          key={`label-${i}`}
          x={lx}
          y={ly}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="14"
          fill="#222"
          fontWeight="bold"
        >
          {percentLabel}%
        </text>
      );
    }
  });

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
      <svg width={300} height={300}>
        {segments}
        {labels}
      </svg>
      <ul style={{ listStyle: 'none', marginLeft: 24, padding: 0 }}>
        {filteredData.map((d, i) => {
          const percent = total > 0 ? ((d.value / total) * 100).toFixed(1) : "0.0";
          return (
            <li key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <Chip
                variant="solid"
                sx={{
                  backgroundColor: COLORS[i % COLORS.length],
                  color: 'black',
                  fontWeight: 'bold',
                  marginRight: 2,
                  minWidth: 80,
                  justifyContent: 'flex-start',
                }}
              >
                {d.label}
              </Chip>
              <span style={{ color: '#666' }}>{percent}%</span>
            </li>
          );
        })}
        {zeroValues.map((d, i) => {

          return (
            <li key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <Chip
                variant="solid"
                sx={{
                  backgroundColor: '#b4adb7d5',
                  color: 'black',
                  fontWeight: 'bold',
                  marginRight: 2,
                  minWidth: 80,
                  justifyContent: 'flex-start',
                  opacity: 0.5,
                }}
              >
                {d.label}
              </Chip>
              <span style={{ color: '#666' }}>0.0%</span>
            </li>
          );
        })}
      </ul>
    </Box>
  );
}