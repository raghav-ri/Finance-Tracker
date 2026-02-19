import { useState } from 'react';
import { db } from '../firebase/config';
import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import SummaryCards from '../components/SummaryCards';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import Analytics from '../components/Analytics';

// Dashboard receives transactions from App (single Firestore listener)
const Dashboard = ({ transactions, setActivePage }) => {
  const [editingTx, setEditingTx] = useState(null);
  const [search, setSearch]       = useState('');

  // ── Same Firebase write logic ──
  const handleAddOrUpdate = async (data) => {
    if (editingTx) {
      await updateDoc(doc(db, 'transactions', editingTx.id), data);
      setEditingTx(null);
    } else {
      await addDoc(collection(db, 'transactions'), data);
    }
  };

  const filtered = transactions.filter(t =>
    t.title?.toLowerCase().includes(search.toLowerCase()) ||
    t.category?.toLowerCase().includes(search.toLowerCase())
  );

  // Recent 5 for quick view
  const recent = filtered.slice(0, 5);

  // Stats
  const totalIncome  = transactions.filter(t => t.type === 'income').reduce((a, b) => a + Number(b.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((a, b) => a + Number(b.amount), 0);

  return (
    <div className="container">
      {/* Greeting */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Here's your financial summary</p>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards transactions={transactions} />

      {/* Main grid */}
      <div className="dashboard-grid">
        {/* Sidebar: form + mini donut */}
        <aside className="sidebar">
          <TransactionForm onSubmit={handleAddOrUpdate} editData={editingTx} />
          <Analytics transactions={transactions} />
        </aside>

        {/* Main: quick stats + recent transactions */}
        <main className="content">
          {/* Quick stats row */}
          <div className="quick-stats-row">
            <div className="quick-stat-card card">
              <span className="quick-stat-icon" style={{ background: 'rgba(74,222,128,0.12)', color: '#4ADE80' }}>📈</span>
              <div>
                <p className="quick-stat-label">Income Transactions</p>
                <p className="quick-stat-val">{transactions.filter(t => t.type === 'income').length}</p>
              </div>
            </div>
            <div className="quick-stat-card card">
              <span className="quick-stat-icon" style={{ background: 'rgba(248,113,113,0.12)', color: '#F87171' }}>📉</span>
              <div>
                <p className="quick-stat-label">Expense Transactions</p>
                <p className="quick-stat-val">{transactions.filter(t => t.type === 'expense').length}</p>
              </div>
            </div>
            <div className="quick-stat-card card">
              <span className="quick-stat-icon" style={{ background: 'rgba(201,168,76,0.12)', color: '#C9A84C' }}>💰</span>
              <div>
                <p className="quick-stat-label">Savings Rate</p>
                <p className="quick-stat-val">
                  {totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="search-wrapper card" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: 'var(--text-muted)' }}>🔍</span>
            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
            />
            {search && (
              <button onClick={() => setSearch('')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
            )}
          </div>

          {/* Recent transactions header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem' }}>
              Recent Transactions
              <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontFamily: 'inherit', fontWeight: 400 }}>
                {' '}({recent.length})
              </span>
            </h2>
            {transactions.length > 5 && (
              <button
                onClick={() => setActivePage('transactions')}
                style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}
              >
                View all →
              </button>
            )}
          </div>

          {/* Transaction List — same onDelete / onEdit */}
          <TransactionList
            transactions={recent}
            onDelete={(id) => deleteDoc(doc(db, 'transactions', id))}
            onEdit={(tx) => setEditingTx(tx)}
          />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
