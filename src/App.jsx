import { useState, useEffect } from 'react';
import { auth, db } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

import Navbar          from './components/Navbar';
import LoginPage       from './pages/LoginPage';
import Dashboard       from './pages/Dashboard';
import TransactionsPage from './pages/TransactionsPage';
import AnalyticsPage   from './pages/AnalyticsPage';

function App() {
  const [user, setUser]               = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [activePage, setActivePage]   = useState('dashboard');

  // ── Firebase Auth listener ──
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // ── Single Firestore listener shared across all pages ──
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'transactions'), orderBy('date', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setTransactions(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  // ── Loading splash ──
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0A0B0F', flexDirection: 'column', gap: '16px',
      }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', color: '#C9A84C' }}>FinTrack</div>
        <div className="loading-spinner" />
      </div>
    );
  }

  // ── Not logged in → Login page ──
  if (!user) return <LoginPage />;

  // ── Logged in → App shell ──
  return (
    <div className="app-wrapper">
      <Navbar activePage={activePage} setActivePage={setActivePage} user={user} />

      <main>
        {activePage === 'dashboard'    && <Dashboard     transactions={transactions} setActivePage={setActivePage} />}
        {activePage === 'transactions' && <TransactionsPage transactions={transactions} />}
        {activePage === 'analytics'    && <AnalyticsPage transactions={transactions} />}
      </main>
    </div>
  );
}

export default App;
