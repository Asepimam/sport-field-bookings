import { Button, Popconfirm, Result, Spin, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CheckCircle } from 'lucide-react';
import { useOwnerBookings, useConfirmBooking } from '../../hooks/useOwner';
import type { Booking } from '../../api/bookings';
import { formatDate, formatPrice, statusLabel } from '../../utils/format';

const { Text } = Typography;

export default function OwnerBookingsTab() {
  const { data: bookings, isLoading, isError } = useOwnerBookings();
  const confirmBooking = useConfirmBooking();

  const columns: ColumnsType<Booking> = [
    {
      title: 'Customer',
      dataIndex: 'customer_email',
      key: 'customer_email',
      render: (n: string) => <Text strong>{n}</Text>,
    },
    {
      title: 'Lapangan',
      dataIndex: 'ground_name',
      key: 'ground_name',
    },
    {
      title: 'Tanggal',
      dataIndex: 'booking_date',
      key: 'booking_date',
      render: (d: string) => formatDate(d),
    },
    {
      title: 'Jam',
      key: 'time',
      render: (_, r) => `${r.start_time} – ${r.end_time}`,
    },
    {
      title: 'Total',
      dataIndex: 'total_price',
      key: 'total_price',
      render: (p: number) => <Text className="text-blue-600 font-medium">{formatPrice(p)}</Text>,
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
        row.status === 'PAID' ? (
          <Popconfirm
            title="Konfirmasi booking ini?"
            onConfirm={() => confirmBooking.mutate(row.id)}
            okText="Ya"
            cancelText="Tidak"
          >
            <Button
              type="primary"
              size="small"
              icon={<CheckCircle size={12} />}
              loading={confirmBooking.isPending}
            >
              Konfirmasi
            </Button>
          </Popconfirm>
        ) : null,
    },
  ];

  if (isError) {
    return <Result status="error" title="Gagal memuat data booking" />;
  }

  return (
    <>
      <Text strong className="text-base block mb-4">Daftar Booking Masuk</Text>
      {isLoading ? (
        <div className="flex justify-center py-12"><Spin /></div>
      ) : (
        <Table
          columns={columns}
          dataSource={bookings ?? []}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'Belum ada booking masuk' }}
          scroll={{ x: 700 }}
        />
      )}
    </>
  );
}
