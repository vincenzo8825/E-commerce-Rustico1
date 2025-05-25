import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import api from '../../utils/api';

// Colori tema utente
const USER_COLORS = {
  primary: '#8B4513',
  secondary: '#DEB887',
  accent: '#CD853F',
  success: '#228B22',
  warning: '#FFD700',
  info: '#4682B4'
};

const CHART_COLORS = [
  USER_COLORS.primary, 
  USER_COLORS.secondary, 
  USER_COLORS.accent, 
  USER_COLORS.success, 
  USER_COLORS.warning, 
  USER_COLORS.info
];

// Wrapper per gestire caricamento
const UserChartWrapper = ({ title, children, loading, error, className = '' }) => (
  <div className={`user-chart ${className}`}>
    <h4 className="user-chart-title">{title}</h4>
    {loading && <div className="chart-loading">Caricamento dati...</div>}
    {error && <div className="chart-error">Errore: {error}</div>}
    {!loading && !error && children}
  </div>
);

// Grafico ordini utente nel tempo
export const UserOrdersChart = ({ userId, height = 250 }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrdersData = async () => {
      try {
        const response = await api.get(`/user/dashboard/charts/orders${userId ? `?userId=${userId}` : ''}`);
        setData(response.data.data || []);
      } catch {
        setError('Errore nel caricamento dati ordini');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrdersData();
  }, [userId]);

  return (
    <UserChartWrapper title="I Tuoi Ordini" loading={loading} error={error}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: USER_COLORS.primary }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: USER_COLORS.primary }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: `1px solid ${USER_COLORS.primary}`,
              borderRadius: '8px'
            }}
            labelFormatter={(label) => `Mese: ${label}`}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="ordini"
            stackId="1"
            stroke={USER_COLORS.primary}
            fill={USER_COLORS.primary}
            fillOpacity={0.6}
            name="Numero Ordini"
          />
          <Area
            type="monotone"
            dataKey="importo"
            stackId="2"
            stroke={USER_COLORS.success}
            fill={USER_COLORS.success}
            fillOpacity={0.6}
            name="Importo Speso (€)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </UserChartWrapper>
  );
};

// Grafico prodotti più acquistati dall'utente
export const UserTopProductsChart = ({ userId, height = 300 }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const response = await api.get(`/user/dashboard/charts/top-products${userId ? `?userId=${userId}` : ''}`);
        setData(response.data.data || []);
      } catch {
        setError('Errore nel caricamento prodotti preferiti');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTopProducts();
  }, [userId]);

  return (
    <UserChartWrapper title="I Tuoi Prodotti Preferiti" loading={loading} error={error}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            type="number" 
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: USER_COLORS.primary }}
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            tick={{ fontSize: 11 }}
            width={120}
            axisLine={{ stroke: USER_COLORS.primary }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: `1px solid ${USER_COLORS.primary}`,
              borderRadius: '8px'
            }}
            formatter={(value, name) => [
              `${value} ${name === 'quantity' ? 'acquisti' : '€'}`, 
              name === 'quantity' ? 'Quantità' : 'Spesa Totale'
            ]}
          />
          <Legend />
          <Bar 
            dataKey="quantity" 
            fill={USER_COLORS.primary}
            radius={[0, 4, 4, 0]}
            name="Quantità Acquistata"
          />
        </BarChart>
      </ResponsiveContainer>
    </UserChartWrapper>
  );
};

// Grafico distribuzione spesa per categoria
export const UserCategorySpendingChart = ({ userId, height = 250 }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const response = await api.get(`/user/dashboard/charts/category-spending${userId ? `?userId=${userId}` : ''}`);
        setData(response.data.data || []);
      } catch {
        setError('Errore nel caricamento spesa per categoria');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategoryData();
  }, [userId]);

  return (
    <UserChartWrapper title="Spesa per Categoria" loading={loading} error={error}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="amount"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={CHART_COLORS[index % CHART_COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: `1px solid ${USER_COLORS.primary}`,
              borderRadius: '8px'
            }}
            formatter={(value) => [`€${parseFloat(value).toFixed(2)}`, 'Spesa']}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            wrapperStyle={{ fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </UserChartWrapper>
  );
};

// Grafico progressi fedeltà/punti
export const UserLoyaltyChart = ({ userId, height = 200 }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLoyaltyData = async () => {
      try {
        const response = await api.get(`/user/dashboard/charts/loyalty${userId ? `?userId=${userId}` : ''}`);
        setData(response.data.data || []);
      } catch {
        setError('Errore nel caricamento punti fedeltà');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLoyaltyData();
  }, [userId]);

  return (
    <UserChartWrapper title="Crescita Punti Fedeltà" loading={loading} error={error}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: USER_COLORS.primary }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: USER_COLORS.primary }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: `1px solid ${USER_COLORS.primary}`,
              borderRadius: '8px'
            }}
            formatter={(value) => [`${value} punti`, 'Punti Fedeltà']}
          />
          <Line 
            type="monotone" 
            dataKey="points" 
            stroke={USER_COLORS.success}
            strokeWidth={3}
            dot={{ fill: USER_COLORS.success, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: USER_COLORS.success }}
          />
        </LineChart>
      </ResponsiveContainer>
    </UserChartWrapper>
  );
};

// Componente combinato per dashboard utente
export const UserDashboardCharts = ({ userId, layout = 'grid' }) => {
  if (layout === 'grid') {
    return (
      <div className="user-charts-grid">
        <div className="chart-row">
          <div className="chart-col-8">
            <UserOrdersChart userId={userId} height={300} />
          </div>
          <div className="chart-col-4">
            <UserCategorySpendingChart userId={userId} height={300} />
          </div>
        </div>
        
        <div className="chart-row">
          <div className="chart-col-6">
            <UserTopProductsChart userId={userId} height={250} />
          </div>
          <div className="chart-col-6">
            <UserLoyaltyChart userId={userId} height={250} />
          </div>
        </div>
      </div>
    );
  }

  // Layout a colonna singola
  return (
    <div className="user-charts-column">
      <UserOrdersChart userId={userId} />
      <UserTopProductsChart userId={userId} />
      <UserCategorySpendingChart userId={userId} />
      <UserLoyaltyChart userId={userId} />
    </div>
  );
};

// Hook personalizzato per dati chart utente
export const useUserChartsData = (userId) => {
  const [chartData, setChartData] = useState({
    orders: [],
    topProducts: [],
    categorySpending: [],
    loyalty: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllChartsData = async () => {
      try {
        setLoading(true);
        
        const [ordersRes, productsRes, categoryRes, loyaltyRes] = await Promise.all([
          api.get(`/user/dashboard/charts/orders${userId ? `?userId=${userId}` : ''}`),
          api.get(`/user/dashboard/charts/top-products${userId ? `?userId=${userId}` : ''}`),
          api.get(`/user/dashboard/charts/category-spending${userId ? `?userId=${userId}` : ''}`),
          api.get(`/user/dashboard/charts/loyalty${userId ? `?userId=${userId}` : ''}`)
        ]);

        setChartData({
          orders: ordersRes.data.data || [],
          topProducts: productsRes.data.data || [],
          categorySpending: categoryRes.data.data || [],
          loyalty: loyaltyRes.data.data || []
        });
      } catch {
        setError('Errore nel caricamento dei dati');
      } finally {
        setLoading(false);
      }
    };

    fetchAllChartsData();
  }, [userId]);

  return { chartData, loading, error };
};

export default UserDashboardCharts; 