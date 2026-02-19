import { useState, useEffect } from 'react';

const TransactionForm = ({ onSubmit, editData }) => {
  // ── Same logic as original ──
  const [form, setForm] = useState({ title: '', amount: '', category: '', date: '', type: 'expense' });

  useEffect(() => { if (editData) setForm(editData); }, [editData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setForm({ title: '', amount: '', category: '', date: '', type: 'expense' });
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3>{editData ? '✏️ Edit' : '＋ Add'} Transaction</h3>

      {/* Type toggle row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <button
          type="button"
          onClick={() => setForm({ ...form, type: 'income' })}
          style={{
            padding: '10px', borderRadius: '10px', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: '14px', fontWeight: 500,
            border: `1px solid ${form.type === 'income' ? 'var(--income-color)' : 'var(--border)'}`,
            background: form.type === 'income' ? 'rgba(74,222,128,0.1)' : 'var(--card-bg2)',
            color: form.type === 'income' ? 'var(--income-color)' : 'var(--text-muted)',
            transition: 'all 0.2s',
          }}
        >
          📈 Income
        </button>
        <button
          type="button"
          onClick={() => setForm({ ...form, type: 'expense' })}
          style={{
            padding: '10px', borderRadius: '10px', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: '14px', fontWeight: 500,
            border: `1px solid ${form.type === 'expense' ? 'var(--expense-color)' : 'var(--border)'}`,
            background: form.type === 'expense' ? 'rgba(248,113,113,0.1)' : 'var(--card-bg2)',
            color: form.type === 'expense' ? 'var(--expense-color)' : 'var(--text-muted)',
            transition: 'all 0.2s',
          }}
        >
          📉 Expense
        </button>
      </div>

      {/* Hidden select keeps original logic intact */}
      <select
        value={form.type}
        onChange={e => setForm({ ...form, type: e.target.value })}
        style={{ display: 'none' }}
      >
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>

      <input
        type="text"
        placeholder="Title"
        value={form.title}
        onChange={e => setForm({ ...form, title: e.target.value })}
        required
      />
      <input
        type="number"
        placeholder="Amount (₹)"
        value={form.amount}
        onChange={e => setForm({ ...form, amount: e.target.value })}
        required
      />
      <input
        type="text"
        placeholder="Category (e.g. Food, Rent)"
        value={form.category}
        onChange={e => setForm({ ...form, category: e.target.value })}
      />
      <input
        type="date"
        value={form.date}
        onChange={e => setForm({ ...form, date: e.target.value })}
        required
      />

      <button type="submit" className="btn-primary">
        {editData ? 'Save Changes →' : 'Add Transaction →'}
      </button>
    </form>
  );
};

export default TransactionForm;
