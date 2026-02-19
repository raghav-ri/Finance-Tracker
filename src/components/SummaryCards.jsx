const SummaryCards = ({ transactions }) => {
 
  const income = transactions.filter(t => t.type === 'income').reduce((a, b) => a + Number(b.amount), 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((a, b) => a + Number(b.amount), 0);
  const balance = income - expense;

  return (
    <div className="summary-cards">
      {}
      <div
        className="card"
        style={{ borderLeft: '4px solid var(--primary-color)', '--glow': 'rgba(201,168,76,0.08)' }}
      >
        <p>Total Balance</p>
        <h2 style={{ color: 'var(--primary-color)' }}>₹{balance.toLocaleString()}</h2>
      </div>

      {}
      <div
        className="card"
        style={{ borderLeft: '4px solid var(--income-color)', '--glow': 'rgba(74,222,128,0.08)' }}
      >
        <p>Total Income</p>
        <h2 style={{ color: 'var(--income-color)' }}>+₹{income.toLocaleString()}</h2>
      </div>

      {}
      <div
        className="card"
        style={{ borderLeft: '4px solid var(--expense-color)', '--glow': 'rgba(248,113,113,0.08)' }}
      >
        <p>Total Expenses</p>
        <h2 style={{ color: 'var(--expense-color)' }}>-₹{expense.toLocaleString()}</h2>
      </div>
    </div>
  );
};

export default SummaryCards;
