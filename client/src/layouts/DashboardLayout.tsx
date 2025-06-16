import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

const DashboardLayout = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();

  const handleLogout = async () => {
    await logout.mutateAsync();
  };

  // Get initials from email
  const getInitials = (email: string) => {
    return email
      .split('@')[0] // Get the part before @
      .split(/[._-]/) // Split by common separators
      .map(part => part[0]?.toUpperCase()) // Get first letter of each part
      .slice(0, 2) // Take first two
      .join(''); // Join them
  };

  return (
    <div className="min-h-screen bg-cloud-bg">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-ink-light/10">
        <div className="max-w-content mx-auto px-rhythm">
          <div className="h-16 flex items-center justify-between">
            {/* Logo */}
            <Link to="/dashboard" className="text-xl font-bold text-ink-text">
              ClauseIQ
            </Link>

            {/* Navigation Links */}
            <div className="flex-1 flex justify-center">
              <Link
                to="/dashboard"
                className="text-ink-text hover:text-coral-primary text-lg font-medium"
              >
                Contracts
              </Link>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                className="flex items-center space-x-2"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <div className="w-8 h-8 rounded-full bg-ink-light/20 flex items-center justify-center">
                  <span className="text-sm font-medium text-ink-text">
                    {user ? getInitials(user.email) : ''}
                  </span>
                </div>
                <span className="text-ink-text">{user?.email}</span>
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1">
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-ink-text hover:bg-cloud-bg"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-ink-text hover:bg-cloud-bg"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-content mx-auto px-rhythm py-rhythm">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout; 