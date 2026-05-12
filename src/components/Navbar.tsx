import { Avatar, Button, Dropdown, Typography } from 'antd';
import { Home, LogIn, LogOut, LayoutDashboard, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useAuth';

const { Text } = Typography;

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, isOwner, logout } = useAuthContext();
  const { data: profile } = useProfile();
  const currentUser = profile ?? user;

  const menuItems = [
    {
      key: 'profile',
      icon: <User size={14} />,
      label: 'Lihat Profil',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'home',
      icon: <Home size={14} />,
      label: 'Home',
      onClick: () => navigate('/'),
    },
    {
      key: 'dashboard',
      icon: <LayoutDashboard size={14} />,
      label: isOwner ? 'Owner Dashboard' : 'Booking Saya',
      onClick: () => navigate(isOwner ? '/owner/dashboard' : '/customer/bookings'),
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogOut size={14} />,
      label: 'Logout',
      danger: true,
      onClick: () => {
        logout();
        navigate('/');
      },
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">SF</span>
          </div>
          <span className="font-bold text-gray-900 text-lg hidden sm:block">SportField</span>
        </Link>

        <nav className="flex items-center gap-3">
          {isAuthenticated ? (
            <Dropdown menu={{ items: menuItems }} placement="bottomRight">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors border border-gray-200">
                <Avatar
                  size="small"
                  icon={<User size={14} />}
                  className="bg-blue-600"
                />
                <Text className="text-sm font-medium text-gray-700 hidden sm:block max-w-[120px] truncate">
                  {currentUser?.name || 'Profil'}
                </Text>
              </button>
            </Dropdown>
          ) : (
            <div className="flex gap-2">
              <Button onClick={() => navigate('/login')} icon={<LogIn size={14} />}>
                Masuk
              </Button>
              <Button type="primary" onClick={() => navigate('/register')}>
                Daftar
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
