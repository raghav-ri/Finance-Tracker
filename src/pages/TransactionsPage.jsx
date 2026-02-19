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
      // ✅ Save userId so each transaction belongs to the logged-in user
      await addDoc(collection(db, 'transactions'), {
        ...data,
        userId: user.uid,
      });
    }
    setShowForm(false);
  };

  const handleEdit = (tx) => { setEditingTx(tx); setShowForm(true); };
  const handleDelete = (id) => deleteDoc(doc(db, 'transactions', id));

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">{filtered.length} of {transactions.length} records</p>
        </div>
        <button className="btn-primary" style={{ padding: '12px 24px', borderRadius: '12px' }}
          onClick={() => { setEditingTx(null); setShowForm(o => !o); }}>
          {showForm ? '✕ Close' : '＋ Add New'}
        </button>
      </div>

      {showForm && (
        <div style={{ marginBottom: '24px', maxWidth: '480px' }}>
          <TransactionForm onSubmit={handleAddOrUpdate} editData={editingTx} />
        </div>
      )}

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

        <select
          className="filter-select"
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          className="filter-select"
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="amount-desc">Highest Amount</option>
          <option value="amount-asc">Lowest Amount</option>
        </select>
      </div>

      <TransactionList transactions={filtered} onDelete={handleDelete} onEdit={handleEdit} />
    </div>
  );
};

export default TransactionsPage;
