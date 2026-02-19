import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const Analytics = ({ transactions }) => {
  // ── Same logic as original ──
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const data = [
    { name: 'Income', value: income },
    { name: 'Expense', value: expense },
  ];

  const COLORS = ['#4ADE80', '#F87171'];

  // Custom tooltip to match dark theme
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--border)',
          borderRadius: '10px', padding: '10px 14px',
          color: 'var(--text-primary)', fontSize: '13px',
        }}>
          <strong>{payload[0].name}</strong>: ₹{Number(payload[0].value).toLocaleString()}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card analytics-card" style={{ padding: '20px', marginTop: '20px', height: '320px' }}>
      <p style={{
        fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px',
        color: 'var(--text-muted)', margin: '0 0 16px 0',
      }}>
        Financial Overview
      </p>
      <ResponsiveContainer width="100%" height="88%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Analytics;
