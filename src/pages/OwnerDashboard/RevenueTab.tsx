import { useState } from 'react';
import { Card, Col, DatePicker, Result, Row, Spin, Statistic, Typography, Button, Space } from 'antd';
import { TrendingUp, Building2, CalendarDays, DollarSign, Users, Clock } from 'lucide-react';
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import dayjs, { Dayjs } from 'dayjs';
import { useOwnerRevenue, useOwnerRevenueSummary } from '../../hooks/useOwner';
import { formatPrice } from '../../utils/format';
import type { RangePickerProps } from 'antd/es/date-picker';

const { Title, Text } = Typography;  
const { RangePicker } = DatePicker;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function RevenueTab() {
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    dayjs().subtract(30, 'days'),
    dayjs(),
  ]);

  const startDate = dateRange[0]?.format('YYYY-MM-DD');
  const endDate = dateRange[1]?.format('YYYY-MM-DD');

  const { data: revenueData, isLoading, isError } = useOwnerRevenue(startDate, endDate);
  const { data: summaryData } = useOwnerRevenueSummary();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spin size="large" tip="Memuat laporan pendapatan..." />
      </div>
    );
  }

  if (isError || !revenueData) {
    return <Result status="error" title="Gagal memuat laporan pendapatan" />;
  }

  const totalRevenue = (revenueData as any).totalRevenue as number || 0;
  const confirmedRevenue = (revenueData as any).confirmedRevenue as number || 0;
  const pendingRevenue = (revenueData as any).pendingRevenue as number || 0;
  const totalBookings = (revenueData as any).totalBookings as number || 0;
  const confirmedBookings = (revenueData as any).confirmedBookings as number || 0;
  const pendingBookings = (revenueData as any).pendingBookings as number || 0;

  // Mock data for charts (you can replace with real data from API)
  const monthlyData = [
    { month: 'Jan', revenue: 1500000 },
    { month: 'Feb', revenue: 2300000 },
    { month: 'Mar', revenue: 1800000 },
    { month: 'Apr', revenue: 2800000 },
    { month: 'May', revenue: 3200000 },
    { month: 'Jun', revenue: confirmedRevenue },
  ];

  const fieldData = [
    { name: 'Futsal A', value: 1200000 },
    { name: 'Badminton B', value: 800000 },
    { name: 'Basketball C', value: 600000 },
    { name: 'Lainnya', value: 400000 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Title level={5} className="!mb-0">Laporan Pendapatan</Title>
        <Space>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null])}
            format="DD/MM/YYYY"
          />
          <Button type="primary">Export Laporan</Button>
        </Space>
      </div>

      {/* Summary cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-xl border-0 shadow-sm">
            <Statistic
              title={<Text className="text-gray-500">Total Pendapatan</Text>}
              value={totalRevenue}
              formatter={(v) => formatPrice(Number(v))}
              prefix={<DollarSign size={20} className="text-green-500 mr-2" />}
              valueStyle={{ color: '#16a34a', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-xl border-0 shadow-sm">
            <Statistic
              title={<Text className="text-gray-500">Pendapatan Terkonfirmasi</Text>}
              value={confirmedRevenue}
              formatter={(v) => formatPrice(Number(v))}
              prefix={<TrendingUp size={20} className="text-blue-500 mr-2" />}
              valueStyle={{ color: '#2563eb', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-xl border-0 shadow-sm">
            <Statistic
              title={<Text className="text-gray-500">Total Booking</Text>}
              value={totalBookings}
              prefix={<Users size={20} className="text-purple-500 mr-2" />}
              valueStyle={{ color: '#9333ea', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-xl border-0 shadow-sm">
            <Statistic
              title={<Text className="text-gray-500">Booking Pending</Text>}
              value={pendingBookings}
              prefix={<Clock size={20} className="text-orange-500 mr-2" />}
              valueStyle={{ color: '#ea580c', fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card className="rounded-xl shadow-sm">
            <Text strong className="block mb-4">Pendapatan per Bulan</Text>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthlyData}>
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
        </Col>

        <Col xs={24} lg={12}>
          <Card className="rounded-xl shadow-sm">
            <Text strong className="block mb-4">Distribusi Pendapatan per Lapangan</Text>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={fieldData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent! * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {fieldData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatPrice(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Revenue breakdown */}
      <Card className="rounded-xl shadow-sm">
        <Text strong className="block mb-4">Breakdown Pendapatan</Text>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <Text className="text-green-700 font-medium">Pendapatan Terkonfirmasi</Text>
                  <div className="text-sm text-green-600">{confirmedBookings} booking</div>
                </div>
                <Text className="text-green-700 font-bold">{formatPrice(confirmedRevenue)}</Text>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <div>
                  <Text className="text-orange-700 font-medium">Pending Pembayaran</Text>
                  <div className="text-sm text-orange-600">{pendingBookings} booking</div>
                </div>
                <Text className="text-orange-700 font-bold">{formatPrice(pendingRevenue)}</Text>
              </div>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="p-4 bg-blue-50 rounded-lg">
              <Text className="text-blue-700 font-medium block mb-2">Ringkasan Periode</Text>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Periode:</span>
                  <span>{dateRange[0]?.format('DD/MM/YYYY')} - {dateRange[1]?.format('DD/MM/YYYY')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rata-rata per hari:</span>
                  <span>{formatPrice(totalRevenue / (dateRange[1]?.diff(dateRange[0], 'days') || 1))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Konversi booking:</span>
                  <span>{totalBookings > 0 ? Math.round((confirmedBookings / totalBookings) * 100) : 0}%</span>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
