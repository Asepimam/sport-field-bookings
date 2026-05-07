import { Button, Card, Form, Input, Select, Typography, Divider } from 'antd';
import { Mail, Lock, Phone, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegister } from '../../hooks/useAuth';
import type { RegisterPayload } from '../../api/auth';
import { useEffect } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';

const { Title, Text } = Typography;

interface RegisterFormValues {
  user_name: string;
  password: string;
  email: string;
  role: 'CUSTOMER' | 'OWNER';
  countryCode: string;
  phone_number: string;
  first_name: string;
  last_name: string;
}

const COUNTRY_CODES = [
  { label: 'ID +62', value: '+62' },
  { label: 'MY +60', value: '+60' },
  { label: 'SG +65', value: '+65' },
];

const normalizePhoneNumber = (countryCode: string, phoneNumber: string) => {
  const countryDigits = countryCode.replace(/\D/g, '');
  const digits = phoneNumber.replace(/\D/g, '');
  const withoutCountryCode = digits.startsWith(countryDigits)
    ? digits.slice(countryDigits.length)
    : digits;
  const normalizedDigits = withoutCountryCode.startsWith('0')
    ? withoutCountryCode.slice(1)
    : withoutCountryCode;

  return `${countryCode}${normalizedDigits}`;
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isOwner } = useAuthContext();
  const register = useRegister();

  useEffect(() => {
    if (!isAuthenticated) return;

    navigate(isOwner ? '/owner/dashboard' : '/', { replace: true });
  }, [isAuthenticated, isOwner, navigate]);

  const onFinish = (values: RegisterFormValues) => {
    const payload: RegisterPayload = {
      user_name: values.user_name,
      password: values.password,
      email: values.email,
      role: values.role,
      phone_number: normalizePhoneNumber(values.countryCode, values.phone_number),
      first_name: values.first_name,
      last_name: values.last_name,
    };

    register.mutate(payload);
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
          <Form
            layout="vertical"
            onFinish={onFinish}
            size="large"
            initialValues={{ countryCode: '+62', role: 'CUSTOMER' }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Form.Item
                name="first_name"
                label="Nama Depan"
                rules={[{ required: true, message: 'Nama depan wajib diisi' }]}
              >
                <Input prefix={<User size={16} className="text-gray-400" />} placeholder="Ucok" />
              </Form.Item>

              <Form.Item
                name="last_name"
                label="Nama Belakang"
                rules={[{ required: true, message: 'Nama belakang wajib diisi' }]}
              >
                <Input placeholder="Indong" />
              </Form.Item>
            </div>

            <Form.Item
              name="user_name"
              label="Username"
              rules={[{ required: true, message: 'Username wajib diisi' }]}
            >
              <Input prefix={<User size={16} className="text-gray-400" />} placeholder="Username Anda" />
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
              name="phone_number"
              label="Nomor Telepon"
              rules={[
                { required: true, message: 'Nomor telepon wajib diisi' },
                {
                  pattern: /^[0-9+\-\s()]+$/,
                  message: 'Nomor telepon hanya boleh berisi angka',
                },
              ]}
            >
              <Input
                prefix={<Phone size={16} className="text-gray-400" />}
                addonBefore={
                  <Form.Item name="countryCode" noStyle>
                    <Select className="w-28" options={COUNTRY_CODES} />
                  </Form.Item>
                }
                placeholder="0877654654362"
              />
            </Form.Item>

            <Form.Item
              name="role"
              label="Daftar Sebagai"
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
