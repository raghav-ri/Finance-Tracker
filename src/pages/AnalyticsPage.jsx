import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, AreaChart, Area,
} from 'recharts';

const COLORS = {
  income: '#4ADE80',
  expense: '#F87171',
  balance: '#C9A84C',
};

const CAT_COLORS = ['#6C63FF','#F87171','#4ADE80','#FBBF24','#4ECDC4','#F97316','#A78BFA','#34D399'];

// Custom dark tooltip
const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--card-bg)', border: '1px solid var(--border)',
      borderRadius: '10px', padding: '10px 14px', color: 'var(--text-primary)', fontSize: '13px',
    }}>
      {label && <div style={{ color: 'var(--text-muted)', marginBottom: '6px' }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: ₹{Number(p.value).toLocaleString()}
        </div>
      ))}
    </div>
  );
};

const AnalyticsPage = ({ transactions }) => {
  // ── Totals ──
  const totalIncome  = transactions.filter(t => t.type === 'income').reduce((a, b) => a + Number(b.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((a, b) => a + Number(b.amount), 0);
  const balance      = totalIncome - totalExpense;
  const savingsRate  = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  // ── Donut chart: Income vs Expense ──
  const overviewData = [
    { name: 'Income',  value: totalIncome  },
    { name: 'Expense', value: totalExpense },
  ];

  // ── Bar chart: by category ──
  const categoryMap = {};
  transactions.forEach(t => {
    const cat = t.category || 'Uncategorized';
    if (!categoryMap[cat]) categoryMap[cat] = { income: 0, expense: 0 };
    categoryMap[cat][t.type] += Number(t.amount);
  });
  const categoryData = Object.entries(categoryMap).map(([name, vals]) => ({ name, ...vals }));

  // ── Line chart: over time (by date) ──
  const dateMap = {};
  transactions.forEach(t => {
    if (!t.date) return;
    const d = t.date.slice(0, 7); // YYYY-MM
    if (!dateMap[d]) dateMap[d] = { month: d, income: 0, expense: 0 };
    dateMap[d][t.type] += Number(t.amount);
  });
  const timeData = Object.values(dateMap).sort((a, b) => a.month.localeCompare(b.month)).map(d => ({
    ...d,
    balance: d.income - d.expense,
  }));

  // ── Expense breakdown by category (pie) ──
  const expCatMap = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    const cat = t.category || 'Uncategorized';
    expCatMap[cat] = (expCatMap[cat] || 0) + Number(t.amount);
  });
  const expCatData = Object.entries(expCatMap).map(([name, value]) => ({ name, value }));

  const StatChip = ({ label, value, color }) => (
    <div className="stat-chip" style={{ borderColor: color }}>
      <span className="stat-chip-label">{label}</span>
      <span className="stat-chip-value" style={{ color }}>{value}</span>
    </div>
  );

  return (
    <div className="analytics-page container">
      {/* Page header */}
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Visual breakdown of your financial activity</p>
      </div>

      {/* Top stat chips */}
      <div className="stat-chips-row">
        <StatChip label="Total Income"  value={`₹${totalIncome.toLocaleString()}`}  color={COLORS.income}  />
        <StatChip label="Total Expense" value={`₹${totalExpense.toLocaleString()}`} color={COLORS.expense} />
        <StatChip label="Net Balance"   value={`₹${balance.toLocaleString()}`}      color={COLORS.balance} />
        <StatChip label="Savings Rate"  value={`${savingsRate}%`}                   color="#A78BFA"        />
      </div>

      {/* Row 1: Overview donut + Monthly line */}
      <div className="analytics-grid-2">
        {/* Donut */}
        <div className="card chart-card">
          <p className="chart-label">Income vs Expenses</p>
          {transactions.length === 0 ? (
            <div className="chart-empty">No data yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={overviewData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={4} dataKey="value">
                    <Cell fill={COLORS.income} />
                    <Cell fill={COLORS.expense} />
                  </Pie>
                  <Tooltip content={<DarkTooltip />} />
                  <Legend formatter={v => <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </>
          )}
        </div>

        {/* Line chart */}
        <div className="card chart-card">
          <p className="chart-label">Monthly Trend</p>
          {timeData.length === 0 ? (
            <div className="chart-empty">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={timeData}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#4ADE80" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4ADE80" stopOpacity={0}    />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#F87171" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#F87171" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<DarkTooltip />} />
                <Area type="monotone" dataKey="income"  name="Income"  stroke="#4ADE80" fill="url(#incomeGrad)"  strokeWidth={2} dot={{ fill: '#4ADE80', r: 4 }} />
                <Area type="monotone" dataKey="expense" name="Expense" stroke="#F87171" fill="url(#expenseGrad)" strokeWidth={2} dot={{ fill: '#F87171', r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Row 2: Category bar + Expense pie */}
      <div className="analytics-grid-2" style={{ marginTop: '20px' }}>
        {/* Bar by category */}
        <div className="card chart-card">
          <p className="chart-label">Spending by Category</p>
          {categoryData.length === 0 ? (
            <div className="chart-empty">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={categoryData} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<DarkTooltip />} />
                <Bar dataKey="income"  name="Income"  fill="#4ADE80" radius={[6,6,0,0]} />
                <Bar dataKey="expense" name="Expense" fill="#F87171" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Expense breakdown pie */}
        <div className="card chart-card">
          <p className="chart-label">Expense Breakdown</p>
          {expCatData.length === 0 ? (
            <div className="chart-empty">No expense data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={expCatData} cx="50%" cy="50%" outerRadius={90} paddingAngle={3} dataKey="value">
                  {expCatData.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<DarkTooltip />} />
                <Legend formatter={v => <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
