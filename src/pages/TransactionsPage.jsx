import { useState } from 'react';
import TransactionList from '../components/TransactionList';
import TransactionForm from '../components/TransactionForm';
import { db } from '../firebase/config';
import { deleteDoc, doc, addDoc, collection, updateDoc } from 'firebase/firestore';

const TransactionsPage = ({ transactions, user }) => {
  const [search, setSearch]         = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCat, setFilterCat]   = useState('all');
  const [sortBy, setSortBy]         = useState('date-desc');
  const [editingTx, setEditingTx]   = useState(null);
  const [showForm, setShowForm]     = useState(false);
  const [exportMsg, setExportMsg]   = useState('');

  const categories = [...new Set(transactions.map(t => t.category).filter(Boolean))];

  const filtered = transactions
    .filter(t => {
      const matchSearch = t.title?.toLowerCase().includes(search.toLowerCase())
        || t.category?.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === 'all' || t.type === filterType;
      const matchCat  = filterCat === 'all'  || t.category === filterCat;
      return matchSearch && matchType && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === 'date-desc')   return (b.date || '').localeCompare(a.date || '');
      if (sortBy === 'date-asc')    return (a.date || '').localeCompare(b.date || '');
      if (sortBy === 'amount-desc') return Number(b.amount) - Number(a.amount);
      if (sortBy === 'amount-asc')  return Number(a.amount) - Number(b.amount);
      return 0;
    });

  const handleAddOrUpdate = async (data) => {
    if (editingTx) {
      await updateDoc(doc(db, 'transactions', editingTx.id), data);
      setEditingTx(null);
    } else {
      await addDoc(collection(db, 'transactions'), {
        ...data,
        userId: user.uid,
      });
    }
    setShowForm(false);
  };

  const handleEdit   = (tx) => { setEditingTx(tx); setShowForm(true); };
  const handleDelete = (id) => deleteDoc(doc(db, 'transactions', id));

  // ── Export helpers ──────────────────────────────────────────────
  const showToast = (msg) => {
    setExportMsg(msg);
    setTimeout(() => setExportMsg(''), 3000);
  };

  const exportCSV = () => {
    if (!filtered.length) return showToast('No transactions to export.');
    const header = ['Title', 'Type', 'Amount (₹)', 'Category', 'Date'];
    const rows   = filtered.map(t => [
      `"${t.title || ''}"`,
      t.type,
      t.amount,
      `"${t.category || ''}"`,
      t.date || '',
    ]);
    const csv  = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `fintrack-transactions-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`✓ Exported ${filtered.length} transactions as CSV`);
  };

  const exportJSON = () => {
    if (!filtered.length) return showToast('No transactions to export.');
    const data = filtered.map(({ id, userId, ...rest }) => rest);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `fintrack-transactions-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`✓ Exported ${filtered.length} transactions as JSON`);
  };

  const totalIncome  = filtered.filter(t => t.type === 'income').reduce((a, b)  => a + Number(b.amount), 0);
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((a, b) => a + Number(b.amount), 0);

  return (
    <div className="container">

      {/* ── Page header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">{filtered.length} of {transactions.length} records</p>
        </div>
        <button
          className="btn-primary"
          style={{ padding: '12px 24px', borderRadius: '12px' }}
          onClick={() => { setEditingTx(null); setShowForm(o => !o); }}
        >
          {showForm ? '✕ Close' : '＋ Add New'}
        </button>
      </div>

      {/* ── Add / Edit form ── */}
      {showForm && (
        <div style={{ marginBottom: '24px', maxWidth: '480px' }}>
          <TransactionForm onSubmit={handleAddOrUpdate} editData={editingTx} />
        </div>
      )}

      {/* ── Filter bar ── */}
      <div className="filter-bar card">
        <div className="filter-search-wrap">
          <span style={{ color: 'var(--text-muted)' }}>🔍</span>
          <input
            className="search-input"
            placeholder="Search title or category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
          )}
        </div>

        <div className="filter-chips">
          {['all', 'income', 'expense'].map(t => (
            <button key={t}
              className={`filter-chip ${filterType === t ? 'active' : ''}`}
              onClick={() => setFilterType(t)}
            >
              {t === 'all' ? 'All' : t === 'income' ? '📈 Income' : '📉 Expense'}
            </button>
          ))}
        </div>

        <select className="filter-select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="amount-desc">Highest Amount</option>
          <option value="amount-asc">Lowest Amount</option>
        </select>
      </div>

      {/* ── Transaction list ── */}
      <TransactionList transactions={filtered} onDelete={handleDelete} onEdit={handleEdit} />

      {/* ── Data Export Section ── */}
      <div className="export-section card" style={{ marginTop: '32px' }}>
        <div className="export-section-header">
          <div>
            <p className="export-section-label">📦 Data Export</p>
            <p className="export-section-sub">
              {filtered.length} filtered record{filtered.length !== 1 ? 's' : ''} &nbsp;·&nbsp;
              <span style={{ color: 'var(--income-color)' }}>+₹{totalIncome.toLocaleString()}</span>
              &nbsp;income &nbsp;·&nbsp;
              <span style={{ color: 'var(--expense-color)' }}>−₹{totalExpense.toLocaleString()}</span>
              &nbsp;expenses
            </p>
          </div>
          <div className="export-buttons">
            <button className="export-btn export-btn--csv" onClick={exportCSV}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export CSV
            </button>
            <button className="export-btn export-btn--json" onClick={exportJSON}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export JSON
            </button>
          </div>
        </div>

        <div className="export-format-info">
          <div className="export-format-chip">
            <span className="export-format-chip-dot" style={{ background: '#4ADE80' }} />
            <span><strong>CSV</strong> — Open in Excel, Google Sheets, or any spreadsheet app</span>
          </div>
          <div className="export-format-chip">
            <span className="export-format-chip-dot" style={{ background: '#C9A84C' }} />
            <span><strong>JSON</strong> — For developers or importing into other apps</span>
          </div>
        </div>
      </div>

      {/* ── Toast ── */}
      {exportMsg && <div className="export-toast">{exportMsg}</div>}
    </div>
  );
};

export default TransactionsPage;