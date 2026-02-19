const Footer = ({ user }) => {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-inner">

        {/* Brand */}
        <div className="footer-brand">
          <div className="footer-logo">Fin<span>Track</span></div>
          <p className="footer-tagline">Your personal finance command center.<br />Track, analyse, and grow your wealth.</p>
        </div>

        {/* Links */}
        <div className="footer-links-group">
          <p className="footer-links-title">Features</p>
          <ul className="footer-links">
            <li>Dashboard Overview</li>
            <li>Transaction Tracking</li>
            <li>Analytics & Charts</li>
            <li>CSV / JSON Export</li>
          </ul>
        </div>

        <div className="footer-links-group">
          <p className="footer-links-title">Security</p>
          <ul className="footer-links">
            <li>Firebase Authentication</li>
            <li>Per-user Data Isolation</li>
            <li>Firestore Security Rules</li>
            <li>No Data Shared</li>
          </ul>
        </div>

        {/* Status */}
        <div className="footer-links-group">
          <p className="footer-links-title">Status</p>
          <div className="footer-status-chip">
            <span className="footer-status-dot" />
            All systems operational
          </div>
          {user && (
            <p className="footer-user-info">
              Signed in as<br />
              <strong>{user.displayName || user.email}</strong>
            </p>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <span>© {year} FinTrack · Built with React &amp; Firebase</span>
        <span className="footer-bottom-right">
          Your data is private &amp; encrypted
          <span className="footer-lock">🔒</span>
        </span>
      </div>
    </footer>
  );
};

export default Footer;