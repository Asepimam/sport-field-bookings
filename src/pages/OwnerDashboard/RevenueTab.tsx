import { Card, Col, Result, Row, Spin, Statistic, Typography } from 'antd';
import { TrendingUp, Building2, CalendarDays } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { useRevenue } from '../../hooks/useOwner';
import { formatPrice } from '../../utils/format';

const { Title, Text } = Typography;

export default function RevenueTab() {
  const { data, isLoading, isError } = useRevenue();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spin size="large" tip="Memuat laporan pendapatan..." />
      </div>
    );
  }

  if (isError || !data) {
    return <Result status="error" title="Gagal memuat laporan pendapatan" />;
  }

  return (
    <div className="space-y-6">
      <Title level={5} className="!mb-0">Laporan Pendapatan</Title>

      {/* Summary cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="rounded-xl border-0 shadow-sm">
            <Statistic
              title={<Text className="text-gray-500">Total Pendapatan</Text>}
              value={data.totalRevenue}
              formatter={(v) => formatPrice(Number(v))}
              prefix={<TrendingUp size={20} className="text-green-500 mr-2" />}
              valueStyle={{ color: '#16a34a', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="rounded-xl border-0 shadow-sm">
            <Statistic
              title={<Text className="text-gray-500">Lapangan Aktif</Text>}
              value={data.revenueByField.length}
              prefix={<Building2 size={20} className="text-blue-500 mr-2" />}
              valueStyle={{ color: '#2563eb', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="rounded-xl border-0 shadow-sm">
            <Statistic
              title={<Text className="text-gray-500">Periode Data</Text>}
              value={data.revenueByMonth.length}
              suffix="bulan"
              prefix={<CalendarDays size={20} className="text-orange-500 mr-2" />}
              valueStyle={{ color: '#ea580c', fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Monthly revenue chart */}
      <Card className="rounded-xl shadow-sm">
        <Text strong className="block mb-4">Pendapatan per Bulan</Text>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data.revenueByMonth}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => formatPrice(Number(v))} />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ fill: '#2563eb', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Revenue by field chart */}
      <Card className="rounded-xl shadow-sm">
        <Text strong className="block mb-4">Pendapatan per Lapangan</Text>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data.revenueByField}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="fieldName" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => formatPrice(Number(v))} />
            <Bar dataKey="revenue" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
