import { useState } from 'react';
import { Button, Card, Radio, Result, Row, Spin, Tag, Typography } from 'antd';
import { Building2, QrCode, ShieldCheck } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMyBookings } from '../../hooks/useBookings';
import { useConfirmPayment } from '../../hooks/usePayments';
import type { PaymentConfirmPayload } from '../../api/payments';
import { formatDate, formatPrice, statusLabel } from '../../utils/format';
import Navbar from '../../components/Navbar';

const { Title, Text } = Typography;

export default function PaymentPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [method, setMethod] = useState<'BANK_TRANSFER' | 'QRIS'>('BANK_TRANSFER');

  const { data: bookings, isLoading } = useMyBookings();
  const confirmPayment = useConfirmPayment();

  const booking = bookings?.find((b) => b.id === bookingId);

  const handlePay = () => {
    if (!booking) return;
    const payload: PaymentConfirmPayload = { bookingId: booking.id, method };
    confirmPayment.mutate(payload, {
      onSuccess: () => navigate('/customer/bookings'),
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" tip="Memuat detail pembayaran..." />
      </div>
    );
  }

  if (!booking) {
    return (
      <Result
        status="404"
        title="Booking tidak ditemukan"
        extra={<Button type="primary" onClick={() => navigate('/customer/bookings')}>Ke Daftar Booking</Button>}
      />
    );
  }

  const isPaid = booking.status !== 'WAITING_PAYMENT';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <Title level={3} className="!mb-6">Konfirmasi Pembayaran</Title>

        {/* Booking Summary */}
        <Card className="rounded-2xl shadow-sm border border-gray-100 mb-6">
          <Title level={5} className="!mb-4">Ringkasan Booking</Title>
          <div className="space-y-3">
            <Row justify="space-between">
              <Text className="text-gray-500">Lapangan</Text>
              <Text strong>{booking.ground_name}</Text>
            </Row>
            <Row justify="space-between">
              <Text className="text-gray-500">Lokasi</Text>
              <Text>{booking.ground_location}</Text>
            </Row>
            <Row justify="space-between">
              <Text className="text-gray-500">Tanggal</Text>
              <Text>{formatDate(booking.booking_date)}</Text>
            </Row>
            <Row justify="space-between">
              <Text className="text-gray-500">Jam</Text>
              <Text>{booking.start_time} – {booking.end_time}</Text>
            </Row>
            <Row justify="space-between">
              <Text className="text-gray-500">Status</Text>
              <Tag color={statusLabel[booking.status]?.color}>{statusLabel[booking.status]?.label}</Tag>
            </Row>
            <div className="border-t pt-3 mt-2">
              <Row justify="space-between">
                <Text strong className="text-base">Total Pembayaran</Text>
                <Text strong className="text-blue-600 text-xl">{formatPrice(booking.total_price)}</Text>
              </Row>
            </div>
          </div>
        </Card>

        {/* Payment Method */}
        {!isPaid ? (
          <Card className="rounded-2xl shadow-sm border border-gray-100 mb-6">
            <Title level={5} className="!mb-4">Metode Pembayaran</Title>
            <Radio.Group
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full"
            >
              <div className="space-y-3">
                <Radio value="BANK_TRANSFER" className="w-full">
                  <div className="flex items-center gap-3 py-2">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Building2 size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <Text strong className="block">Transfer Bank</Text>
                      <Text className="text-gray-500 text-xs">BCA, Mandiri, BNI, BRI</Text>
                    </div>
                  </div>
                </Radio>
                <Radio value="QRIS" className="w-full">
                  <div className="flex items-center gap-3 py-2">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                      <QrCode size={20} className="text-green-600" />
                    </div>
                    <div>
                      <Text strong className="block">QRIS</Text>
                      <Text className="text-gray-500 text-xs">Scan QR dari semua e-wallet</Text>
                    </div>
                  </div>
                </Radio>
              </div>
            </Radio.Group>
          </Card>
        ) : (
          <Card className="rounded-2xl border-green-200 bg-green-50 mb-6">
            <div className="flex items-center gap-3">
              <ShieldCheck size={24} className="text-green-600" />
              <div>
                <Text strong className="text-green-700 block">Pembayaran Sudah Dikonfirmasi</Text>
                <Text className="text-green-600 text-sm">Booking Anda sedang diproses oleh pemilik lapangan</Text>
              </div>
            </div>
          </Card>
        )}

        <div className="flex gap-3">
          <Button size="large" onClick={() => navigate('/customer/bookings')} className="flex-1">
            Kembali
          </Button>
          {!isPaid && (
            <Button
              type="primary"
              size="large"
              className="flex-1"
              loading={confirmPayment.isPending}
              onClick={handlePay}
            >
              Konfirmasi Pembayaran
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
