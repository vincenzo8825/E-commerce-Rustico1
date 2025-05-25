import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, RadialBarChart, RadialBar,
  AreaChart, Area
} from 'recharts';
import api from '../../utils/api';

// Palette colori tema Calabria
const COLORS = {
  primary: '#8B4513',
  secondary: '#DEB887', 
  accent: '#CD853F',
  success: '#228B22',
  warning: '#FFD700',
  danger: '#DC143C',
  info: '#4682B4'
};

const CHART_COLORS = [COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.success, COLORS.warning, COLORS.danger];

// Componente wrapper per gestire caricamento
const ChartWrapper = ({ title, children, loading, error }) => (
  <div className="advanced-chart">
    <h3 className="chart-title">{title}</h3>
    {loading && <div className="chart-loading">Caricamento...</div>}
    {error && <div className="chart-error">Errore: {error}</div>}
    {!loading && !error && children}
  </div>
);

// 1. Grafico crescita utenti
export const UsersGrowthChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/admin/dashboard/charts/users-growth');
        setData(response.data.data);
      } catch {
        setError('Errore nel caricamento dati crescita utenti');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <ChartWrapper title="Crescita Utenti" loading={loading} error={error}>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="nuovi_utenti" 
            stackId="1"
            stroke={COLORS.primary} 
            fill={COLORS.primary} 
            name="Nuovi Utenti"
          />
          <Area 
            type="monotone" 
            dataKey="utenti_attivi" 
            stackId="1"
            stroke={COLORS.secondary} 
            fill={COLORS.secondary} 
            name="Utenti Attivi"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

// 2. Grafico top prodotti
export const TopProductsChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/admin/dashboard/charts/top-products');
        setData(response.data.data);
      } catch {
        setError('Errore nel caricamento top prodotti');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <ChartWrapper title="Top 10 Prodotti" loading={loading} error={error}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={100} />
          <Tooltip />
          <Bar dataKey="vendite" fill={COLORS.primary} name="Vendite" />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

// 3. Grafico vendite vs ordini
export const SalesVsOrdersChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/admin/dashboard/charts/sales-vs-orders');
        setData(response.data.data);
      } catch {
        setError('Errore nel caricamento dati vendite');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <ChartWrapper title="Vendite vs Ordini" loading={loading} error={error}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="ordini" 
            stroke={COLORS.primary} 
            strokeWidth={2}
            name="Numero Ordini"
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="vendite" 
            stroke={COLORS.success} 
            strokeWidth={2}
            name="Vendite (€)"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

// 4. Grafico performance categorie
export const CategoryPerformanceChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/admin/dashboard/charts/category-performance');
        setData(response.data.data);
      } catch {
        setError('Errore nel caricamento performance categorie');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <ChartWrapper title="Performance Categorie" loading={loading} error={error}>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="vendite"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

// 5. Grafico livelli stock
export const StockLevelsChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/admin/dashboard/charts/stock-levels');
        setData(response.data.data);
      } catch {
        setError('Errore nel caricamento livelli stock');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <ChartWrapper title="Livelli Stock" loading={loading} error={error}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="categoria" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="stock_alto" stackId="a" fill={COLORS.success} name="Stock Alto" />
          <Bar dataKey="stock_medio" stackId="a" fill={COLORS.warning} name="Stock Medio" />
          <Bar dataKey="stock_basso" stackId="a" fill={COLORS.danger} name="Stock Basso" />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

// 6. Grafico KPI radiale
export const KPIRadialChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/admin/dashboard/charts/kpi-radial');
        setData(response.data.data);
      } catch {
        setError('Errore nel caricamento KPI');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <ChartWrapper title="KPI Performance" loading={loading} error={error}>
      <ResponsiveContainer width="100%" height={300}>
        <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" data={data}>
          <RadialBar
            minAngle={15}
            label={{ position: 'insideStart', fill: '#fff' }}
            background
            clockwise
            dataKey="value"
          />
          <Legend iconSize={18} />
          <Tooltip />
        </RadialBarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

// Componente principale che raggruppa tutti i grafici
const AdvancedCharts = () => {
  return (
    <div className="advanced-charts-container">
      <div className="charts-grid">
        <div className="chart-row">
          <div className="chart-col-6">
            <UsersGrowthChart />
          </div>
          <div className="chart-col-6">
            <TopProductsChart />
          </div>
        </div>
        
        <div className="chart-row">
          <div className="chart-col-8">
            <SalesVsOrdersChart />
          </div>
          <div className="chart-col-4">
            <CategoryPerformanceChart />
          </div>
        </div>
        
        <div className="chart-row">
          <div className="chart-col-6">
            <StockLevelsChart />
          </div>
          <div className="chart-col-6">
            <KPIRadialChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedCharts; 