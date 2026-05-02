import { Button, Card, Form, Input, Select, Typography, Divider } from 'antd';
import { Mail, Lock, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegister } from '../../hooks/useAuth';
import type { RegisterPayload } from '../../api/auth';
import { useEffect } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';

const { Title, Text } = Typography;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const register = useRegister();

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const onFinish = (values: RegisterPayload) => {
    register.mutate(values);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold">SF</span>
          </div>
          <Title level={2} className="!mb-1">Buat Akun</Title>
          <Text className="text-gray-500">Daftar dan mulai booking lapangan</Text>
        </div>

        <Card className="shadow-lg border-0 rounded-2xl">
          <Form layout="vertical" onFinish={onFinish} size="large">
            <Form.Item
              name="name"
              label="Nama Lengkap"
              rules={[{ required: true, message: 'Nama wajib diisi' }]}
            >
              <Input prefix={<User size={16} className="text-gray-400" />} placeholder="Nama lengkap Anda" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, type: 'email', message: 'Email tidak valid' }]}
            >
              <Input prefix={<Mail size={16} className="text-gray-400" />} placeholder="nama@email.com" />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, min: 8, message: 'Password minimal 8 karakter' }]}
            >
              <Input.Password prefix={<Lock size={16} className="text-gray-400" />} placeholder="Min. 8 karakter" />
            </Form.Item>

            <Form.Item
              name="role"
              label="Daftar Sebagai"
              initialValue="CUSTOMER"
              rules={[{ required: true }]}
            >
              <Select
                options={[
                  { label: 'Customer (Penyewa Lapangan)', value: 'CUSTOMER' },
                  { label: 'Owner (Pemilik Lapangan)', value: 'OWNER' },
                ]}
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              block
              loading={register.isPending}
              className="h-11 font-medium"
            >
              Daftar
            </Button>
          </Form>

          <Divider>
            <Text className="text-gray-400 text-sm">Sudah punya akun?</Text>
          </Divider>

          <Link to="/login">
            <Button block size="large">
              Masuk
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
