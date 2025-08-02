import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip,Cell, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
const COLORS = [
  '#FF6F61',
  '#FFB347',
  '#FFD700',
  '#7EC850',
  '#4FC3F7',
  '#9575CD',
  '#F06292', 
  '#26C6DA', 
  '#8D6E63', 
  '#FF8A65', 
  '#C0CA33', 
  '#00BFAE', 
];
export default function Barra({ data, field }) {
  if (!data || !field) return <div>No hay datos para graficar</div>;
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" name={field}>
          {data.map((entry, index) => (
            <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
