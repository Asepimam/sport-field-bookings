import { useState } from 'react';
import { Layout, Menu, Typography, Avatar } from 'antd';
import { LayoutDashboard, MapPin, CalendarClock, TrendingUp, LogOut, Menu as MenuIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import OwnerFieldsTab from './OwnerFieldsTab';
import OwnerBookingsTab from './OwnerBookingsTab';
import RevenueTab from './RevenueTab';

const { Sider, Content, Header } = Layout;
const { Title, Text } = Typography;

type TabKey = 'fields' | 'bookings' | 'revenue';

const menuItems = [
  { key: 'fields', icon: <MapPin size={16} />, label: 'Lapangan Saya' },
  { key: 'bookings', icon: <CalendarClock size={16} />, label: 'Booking Masuk' },
  { key: 'revenue', icon: <TrendingUp size={16} />, label: 'Laporan Pendapatan' },
];

export default function OwnerDashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>('fields');
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

  const tabTitles: Record<TabKey, string> = {
    fields: 'Lapangan Saya',
    bookings: 'Booking Masuk',
    revenue: 'Laporan Pendapatan',
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Layout className="min-h-screen">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="light"
        className="shadow-sm border-r border-gray-100"
        style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'auto' }}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <LayoutDashboard size={16} className="text-white" />
            </div>
            {!collapsed && (
              <Text strong className="text-gray-900 truncate">Owner Panel</Text>
            )}
          </div>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[activeTab]}
          items={menuItems}
          onClick={({ key }) => setActiveTab(key as TabKey)}
          className="border-r-0 mt-2"
        />

        {/* User info + logout */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-100 bg-white">
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <Avatar size="small" className="bg-blue-600 flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <div className="min-w-0 flex-1">
                <Text className="text-xs font-medium block truncate">{user?.name}</Text>
                <Text className="text-xs text-gray-400 truncate block">{user?.email}</Text>
              </div>
              <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex justify-center text-gray-400 hover:text-red-500 transition-colors p-1"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </Sider>

      <Layout>
        <Header className="bg-white border-b border-gray-100 px-6 flex items-center gap-3 shadow-sm h-16">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-500 hover:text-gray-700 lg:hidden"
          >
            <MenuIcon size={20} />
          </button>
          <Title level={4} className="!mb-0 !text-gray-900">
            {tabTitles[activeTab]}
          </Title>
        </Header>

        <Content className="p-6 bg-gray-50">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {activeTab === 'fields' && <OwnerFieldsTab />}
            {activeTab === 'bookings' && <OwnerBookingsTab />}
            {activeTab === 'revenue' && <RevenueTab />}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
