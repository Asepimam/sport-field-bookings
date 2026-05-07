import { Avatar, Button, Card, Descriptions, Result, Spin, Tag, Typography } from 'antd';
import { ArrowLeft, Home, LayoutDashboard, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks/useAuth';

const { Title, Text } = Typography;

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, role, isOwner } = useAuthContext();
  const { data: profile, isLoading, isError } = useProfile();
  const currentProfile = profile ?? user;
  const currentRole = currentProfile?.role ?? role;

  if (isLoading && !currentProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spin size="large" tip="Memuat profil..." />
      </div>
    );
  }

  if (isError || !currentProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Result
          status="error"
          title="Gagal memuat profil"
          extra={<Button type="primary" onClick={() => window.location.reload()}>Coba Lagi</Button>}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <Button icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>
            Kembali
          </Button>
          <div className="flex gap-2">
            <Button icon={<Home size={16} />} onClick={() => navigate('/')}>
              Home
            </Button>
            <Button
              type="primary"
              icon={<LayoutDashboard size={16} />}
              onClick={() => navigate(isOwner ? '/owner/dashboard' : '/customer/bookings')}
            >
              {isOwner ? 'Owner Dashboard' : 'Booking Saya'}
            </Button>
          </div>
        </div>

        <Card className="rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-8">
            <Avatar
              size={88}
              src={currentProfile.avatar}
              icon={<User size={36} />}
              className="bg-blue-600 flex-shrink-0"
            />
            <div className="min-w-0">
              <Title level={3} className="!mb-1">
                {currentProfile.name}
              </Title>
              <Text className="text-gray-500 block mb-2">{currentProfile.email}</Text>
              <Tag color={currentRole === 'OWNER' ? 'blue' : 'green'}>{currentRole}</Tag>
            </div>
          </div>

          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="ID">{currentProfile.id}</Descriptions.Item>
            <Descriptions.Item label="Nama">{currentProfile.name}</Descriptions.Item>
            <Descriptions.Item label="Email">{currentProfile.email}</Descriptions.Item>
            <Descriptions.Item label="Role">{currentRole}</Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </div>
  );
}
