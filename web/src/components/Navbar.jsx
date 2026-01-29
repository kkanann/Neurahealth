import { Link } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav style={{ padding: '1.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="container">
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
        Nuera<span className="text-gradient">Health</span>
      </div>
      <div style={{ display: 'flex', gap: '2rem' }}>
        <Link to="/" style={{ color: 'var(--color-text-main)', fontWeight: 500 }}>Home</Link>
        {user && (
          <>
            <Link to="/patient" style={{ color: 'var(--color-text-main)', fontWeight: 500 }}>Patient Portal</Link>
            <Link to="/doctor" style={{ color: 'var(--color-text-main)', fontWeight: 500 }}>Doctor Portal</Link>
          </>
        )}
      </div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {user ? (
          <>
            <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{user.email}</span>
            <button onClick={logout} className="btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Logout</button>
          </>
        ) : (
          <Link to="/login" className="btn-primary">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
