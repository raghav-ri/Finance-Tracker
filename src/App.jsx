import { useState, useEffect } from 'react';
import { auth, db } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';

import Navbar          from './components/Navbar';
import LoginPage       from './pages/LoginPage';
import Dashboard       from './pages/Dashboard';
import TransactionsPage from './pages/TransactionsPage';
import AnalyticsPage   from './pages/AnalyticsPage';

function App() {
  const [user, setUser]                 = useState(null);
  const [authLoading, setAuthLoading]   = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [activePage, setActivePage]     = useState('dashboard');

  // Listen for auth state changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
      // Clear transactions when user logs out
      if (!u) setTransactions([]);
    });
    return () => unsub();
  }, []);

  // Fetch only the logged-in user's transactions
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),   // ✅ Filter by current user
      orderBy('date', 'desc')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setTransactions(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

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

  if (!user) return <LoginPage />;

  return (
    <div className="app-wrapper">
      <Navbar activePage={activePage} setActivePage={setActivePage} user={user} />

      <main>
        {activePage === 'dashboard'    && <Dashboard     transactions={transactions} setActivePage={setActivePage} user={user} />}
        {activePage === 'transactions' && <TransactionsPage transactions={transactions} user={user} />}
        {activePage === 'analytics'    && <AnalyticsPage transactions={transactions} />}
      </main>
    </div>
  );
}

export default App;
