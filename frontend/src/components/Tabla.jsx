import React from 'react';
import Table from '@mui/joy/Table';


export default function Tabla({ rows, columns }) {
  if (!Array.isArray(rows) || !Array.isArray(columns) || columns.length === 0) {
    return <div>No hay datos para mostrar en la tabla</div>;
  }
  return (
    <Table>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column} style={{ width: '40%', backgroundColor: '#c59d9d' }}>{column}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ix) => (
          <tr key={ix}>
            {columns.map((col) => (
              <td key={col}>{row[col]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
