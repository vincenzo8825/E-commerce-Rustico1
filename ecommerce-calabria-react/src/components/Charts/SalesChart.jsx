import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Colori per i grafici
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const SalesChart = ({ data, type = 'line', title, height = 300 }) => {
  const formatCurrency = (value) => `€${parseFloat(value).toFixed(2)}`;
  
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    } catch {
      return dateString;
    }
  };

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tickFormatter={formatDate}
          fontSize={12}
        />
        <YAxis 
          tickFormatter={formatCurrency}
          fontSize={12}
        />
        <Tooltip 
          labelFormatter={(label) => `Data: ${formatDate(label)}`}
          formatter={(value) => [formatCurrency(value), 'Vendite']}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="daily_sales" 
          stroke="#0088FE" 
          strokeWidth={2}
          dot={{ fill: '#0088FE', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6 }}
          name="Vendite Giornaliere"
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          fontSize={12}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          tickFormatter={formatCurrency}
          fontSize={12}
        />
        <Tooltip 
          formatter={(value) => [formatCurrency(value), 'Vendite Totali']}
        />
        <Legend />
        <Bar 
          dataKey="total_sales" 
          fill="#00C49F"
          name="Vendite per Categoria"
        />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="total_sales"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [formatCurrency(value), 'Vendite']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return renderBarChart();
      case 'pie':
        return renderPieChart();
      case 'line':
      default:
        return renderLineChart();
    }
  };

  return (
    <div className="sales-chart">
      {title && (
        <div className="sales-chart__header">
          <h3 className="sales-chart__title">{title}</h3>
        </div>
      )}
      <div className="sales-chart__container">
        {data && data.length > 0 ? (
          renderChart()
        ) : (
          <div className="sales-chart__no-data">
            <p>Nessun dato disponibile per il grafico</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesChart; 