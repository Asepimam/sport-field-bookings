import { Button, Result, Spin, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { useMyBookings } from '../../hooks/useBookings';
import type { Booking } from '../../api/bookings';
import { formatDate, formatPrice, statusLabel } from '../../utils/format';
import Navbar from '../../components/Navbar';

const { Title, Text } = Typography;

export default function CustomerBookings() {
  const navigate = useNavigate();
  const { data: bookings, isLoading, isError } = useMyBookings();

  const columns: ColumnsType<Booking> = [
    {
      title: 'Lapangan',
      dataIndex: 'fieldName',
      key: 'fieldName',
      render: (name: string, row) => (
        <div>
          <Text strong>{name}</Text>
          <div className="text-xs text-gray-500">{row.fieldLocation}</div>
        </div>
      ),
    },
    {
      title: 'Tanggal',
      dataIndex: 'date',
      key: 'date',
      render: (d: string) => formatDate(d),
    },
    {
      title: 'Jam',
      key: 'time',
      render: (_, row) => `${row.startTime} – ${row.endTime}`,
    },
    {
      title: 'Total',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (p: number) => (
        <Text strong className="text-blue-600">{formatPrice(p)}</Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => (
        <Tag color={statusLabel[s]?.color}>{statusLabel[s]?.label || s}</Tag>
      ),
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, row) =>
        row.status === 'WAITING_PAYMENT' ? (
          <Button
            type="primary"
            size="small"
            onClick={() => navigate(`/payment/${row.id}`)}
          >
            Bayar Sekarang
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <Title level={3} className="!mb-1">Booking Saya</Title>
          <Text className="text-gray-500">Riwayat dan status semua booking Anda</Text>
        </div>

        {isLoading && (
          <div className="flex justify-center py-20">
            <Spin size="large" tip="Memuat booking..." />
          </div>
        )}

        {isError && (
          <Result
            status="error"
            title="Gagal memuat data booking"
            extra={<Button type="primary" onClick={() => window.location.reload()}>Coba Lagi</Button>}
          />
        )}

        {!isLoading && !isError && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <Table
              columns={columns}
              dataSource={bookings}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: 'Belum ada booking' }}
              scroll={{ x: 700 }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
