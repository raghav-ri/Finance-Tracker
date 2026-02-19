const TransactionList = ({ transactions, onDelete, onEdit }) => (
  <div className="transaction-list">
    {transactions.length === 0 && (
      <div style={{
        textAlign: 'center', padding: '60px 20px',
        color: 'var(--text-muted)', fontSize: '14px',
      }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
        No transactions found
      </div>
    )}

    {}
    {transactions.map(tx => (
      <div key={tx.id} className={`tx-item ${tx.type}`}>
        {}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
            background: tx.type === 'income' ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
          }}>
            {tx.type === 'income' ? '💰' : '💸'}
          </div>
          <div style={{ minWidth: 0 }}>
            <h4 style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {tx.title}
            </h4>
            <small>{tx.date}{tx.category ? ` · ${tx.category}` : ''}</small>
          </div>
        </div>

        {}
        <div className="tx-right">
          <span className="amount">
            {tx.type === 'income' ? '+' : '-'}₹{Number(tx.amount).toLocaleString()}
          </span>
          <button onClick={() => onEdit(tx)} title="Edit">✏️</button>
          <button onClick={() => onDelete(tx.id)} title="Delete">🗑️</button>
        </div>
      </div>
    ))}
  </div>
);

export default TransactionList;
