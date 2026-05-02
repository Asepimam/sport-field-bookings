import { Button, Card, Form, Input, Typography, Divider } from 'antd';
import { Mail, Lock } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLogin } from '../../hooks/useAuth';
import type { LoginPayload } from '../../api/auth';
import { useEffect } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';

const { Title, Text } = Typography;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthContext();
  const login = useLogin();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  const onFinish = (values: LoginPayload) => {
    login.mutate(values);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold">SF</span>
          </div>
          <Title level={2} className="!mb-1">Selamat Datang</Title>
          <Text className="text-gray-500">Masuk ke akun SportField Anda</Text>
        </div>

        <Card className="shadow-lg border-0 rounded-2xl">
          <Form layout="vertical" onFinish={onFinish} size="large">
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
              rules={[{ required: true, message: 'Password wajib diisi' }]}
            >
              <Input.Password prefix={<Lock size={16} className="text-gray-400" />} placeholder="Password" />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              block
              loading={login.isPending}
              className="h-11 font-medium"
            >
              Masuk
            </Button>
          </Form>

          <Divider>
            <Text className="text-gray-400 text-sm">Belum punya akun?</Text>
          </Divider>

          <Link to="/register">
            <Button block size="large">
              Daftar Sekarang
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
