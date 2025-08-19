

import React from 'react';

const COLORS = [
  '#FF6F61', '#FFB347', '#FFD700', '#7EC850', '#4FC3F7', '#9575CD',
  '#F06292', '#26C6DA', '#8D6E63', '#FF8A65', '#C0CA33', '#00BFAE',
];

export default function Barra({ data, field }) {
  if (!data || !field || data.length === 0) return <div>No hay datos para graficar</div>;

  // Calcular el valor máximo para escalar las barras
  // Calcular el valor máximo para escalar las barras
  const maxValue = Math.max(...data.map(d => d.value), 1);
  // Calcular el tick más alto como múltiplo de 5 o 10 para mejor visual
  let yTicks = 5;
  let tickStep = Math.ceil(maxValue / (yTicks - 1));
  // Redondear tickStep a múltiplo de 5 o 10 si es posible
  if (tickStep > 10) {
    tickStep = Math.ceil(tickStep / 10) * 10;
  } else if (tickStep > 5) {
    tickStep = Math.ceil(tickStep / 5) * 5;
  }
  const tickValues = Array.from({length: yTicks}, (_, i) => tickStep * (yTicks - 1 - i));
  const barAreaHeight = 220;

  return (
    <div style={{ width: '100%', maxWidth: 700, minHeight: 350, padding: 28, boxSizing: 'border-box', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #0002', margin: '0 auto' }}>
      <div style={{ marginBottom: 18, fontWeight: 700, fontSize: 20, textAlign: 'center', letterSpacing: 0.5 }}>{field}</div>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', height: barAreaHeight + 30, gap: 0 }}>
        {/* Eje Y (ticks) */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: barAreaHeight, width: 44, marginRight: 0, position: 'relative', zIndex: 2 }}>
          {tickValues.map((val, i) => (
            <div key={i} style={{
              fontSize: 13,
              color: '#888',
              textAlign: 'right',
              height: 1,
              position: 'relative',
              top: i === 0 ? 0 : -8,
              userSelect: 'none',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {val}
            </div>
          ))}
        </div>
        {/* Plano y barras */}
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'flex-end', gap: 18, borderLeft: '2px solid #bbb', borderBottom: '2px solid #bbb', height: barAreaHeight, paddingLeft: 8, paddingRight: 8, background: 'linear-gradient(to top, #f8f8fa 80%, transparent 100%)' }}>
          {/* Líneas horizontales del plano */}
          {tickValues.map((val, i) => (
            i === 0 ? null : (
              <div key={i} style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: `${(i / (yTicks - 1)) * 100}%`,
                borderBottom: '1px dashed #bbb3',
                zIndex: 1,
              }} />
            )
          ))}
          {/* Barras */}
          {data.map((d, i) => (
            <div key={d.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: 48, justifyContent: 'flex-start' }}>
              <div
                style={{
                  height: `${(d.value / (tickStep * (yTicks - 1)) ) * (barAreaHeight - 10)}px`,
                  width: 40,
                  background: COLORS[i % COLORS.length],
                  borderRadius: 4,
                  marginBottom: 0,
                  transition: 'height 0.2s',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  gap: 25,
                  boxShadow: '0 2px 8px #0001',
                  position: 'relative',
                  zIndex: 2,
                  border: ((d.value / (tickStep * (yTicks - 1)) ) * (barAreaHeight - 10))=== 0 && '2px solid #111'
                }}
                title={`${d.label}: ${d.value}`}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Leyenda de colores */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 28, justifyContent: 'center' }}>
        {data.map((d, i) => (
          <div key={d.label + '-legend'} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 18, height: 18, background: COLORS[i % COLORS.length], borderRadius: 4, display: 'inline-block', border: '1px solid #bbb' }}></span>
            <span style={{ fontSize: 14 }}>{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
